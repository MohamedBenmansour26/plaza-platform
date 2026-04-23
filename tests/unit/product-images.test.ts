import {
  getProductImages,
  getDefaultAlt,
  resolveImageAlt,
  reorderImages,
  removeImageAt,
  canAddImage,
  validateImagesForPublish,
  MAX_PRODUCT_IMAGES,
} from '@/lib/product-images'

function img(url: string, alt = ''): { url: string; alt: string } {
  return { url, alt }
}

describe('MAX_PRODUCT_IMAGES', () => {
  it('matches the DB check constraint (8)', () => {
    expect(MAX_PRODUCT_IMAGES).toBe(8)
  })
})

describe('getProductImages', () => {
  it('returns images array when non-empty', () => {
    const result = getProductImages({
      images: [
        { url: 'https://cdn/a.jpg', alt: 'Front' },
        { url: 'https://cdn/b.jpg', alt: '' },
      ],
      image_url: 'https://cdn/a.jpg',
    })
    expect(result).toEqual([
      { url: 'https://cdn/a.jpg', alt: 'Front' },
      { url: 'https://cdn/b.jpg', alt: '' },
    ])
  })

  it('falls back to image_url when images array is empty', () => {
    const result = getProductImages({ images: [], image_url: 'https://cdn/legacy.jpg' })
    expect(result).toEqual([{ url: 'https://cdn/legacy.jpg', alt: '' }])
  })

  it('falls back to image_url when images is null/undefined', () => {
    const result = getProductImages({ image_url: 'https://cdn/legacy.jpg' })
    expect(result).toEqual([{ url: 'https://cdn/legacy.jpg', alt: '' }])
  })

  it('returns [] when no images and no image_url', () => {
    expect(getProductImages({})).toEqual([])
    expect(getProductImages({ images: [], image_url: null })).toEqual([])
    expect(getProductImages({ images: null, image_url: '' })).toEqual([])
  })

  it('filters out entries without a url', () => {
    const result = getProductImages({
      // @ts-expect-error — intentional drift payload
      images: [{ url: 'https://cdn/a.jpg', alt: '' }, { alt: 'no-url' }, { url: '', alt: 'empty' }],
    })
    expect(result).toEqual([{ url: 'https://cdn/a.jpg', alt: '' }])
  })
})

describe('getDefaultAlt', () => {
  it('returns "{name} image N" with 1-based index', () => {
    expect(getDefaultAlt('Sneaker Pro', 0)).toBe('Sneaker Pro image 1')
    expect(getDefaultAlt('Sneaker Pro', 2)).toBe('Sneaker Pro image 3')
  })
})

describe('resolveImageAlt', () => {
  it('uses merchant-entered alt when non-blank', () => {
    expect(resolveImageAlt({ alt: 'Hero shot' }, 'Sneaker Pro', 0)).toBe('Hero shot')
  })

  it('falls back to default when alt is blank', () => {
    expect(resolveImageAlt({ alt: '' }, 'Sneaker Pro', 0)).toBe('Sneaker Pro image 1')
  })

  it('falls back to default when alt is whitespace-only', () => {
    expect(resolveImageAlt({ alt: '   ' }, 'Sneaker Pro', 1)).toBe('Sneaker Pro image 2')
  })
})

describe('reorderImages', () => {
  it('moves an image forward (first → last)', () => {
    const input = [img('a'), img('b'), img('c')]
    expect(reorderImages(input, 0, 2)).toEqual([img('b'), img('c'), img('a')])
  })

  it('moves an image backward (last → first)', () => {
    const input = [img('a'), img('b'), img('c')]
    expect(reorderImages(input, 2, 0)).toEqual([img('c'), img('a'), img('b')])
  })

  it('returns a new array (immutability)', () => {
    const input = [img('a'), img('b')]
    const output = reorderImages(input, 0, 1)
    expect(output).not.toBe(input)
    expect(input).toEqual([img('a'), img('b')]) // original untouched
  })

  it('is a no-op when from === to', () => {
    const input = [img('a'), img('b'), img('c')]
    expect(reorderImages(input, 1, 1)).toEqual(input)
  })

  it('clamps out-of-range indexes to a no-op copy', () => {
    const input = [img('a'), img('b')]
    expect(reorderImages(input, -1, 1)).toEqual(input)
    expect(reorderImages(input, 0, 99)).toEqual(input)
  })
})

describe('removeImageAt', () => {
  it('removes the image at the given index', () => {
    const input = [img('a'), img('b'), img('c')]
    expect(removeImageAt(input, 1)).toEqual([img('a'), img('c')])
  })

  it('returns a new array (immutability)', () => {
    const input = [img('a'), img('b')]
    const output = removeImageAt(input, 0)
    expect(output).not.toBe(input)
    expect(input).toEqual([img('a'), img('b')])
  })

  it('is a no-op for out-of-range indexes', () => {
    const input = [img('a')]
    expect(removeImageAt(input, -1)).toEqual(input)
    expect(removeImageAt(input, 5)).toEqual(input)
  })

  it('handles empty array', () => {
    expect(removeImageAt([], 0)).toEqual([])
  })
})

describe('canAddImage', () => {
  it('returns true below the soft cap', () => {
    expect(canAddImage([])).toBe(true)
    expect(canAddImage(Array(MAX_PRODUCT_IMAGES - 1).fill(img('a')))).toBe(true)
  })

  it('returns false at the soft cap', () => {
    expect(canAddImage(Array(MAX_PRODUCT_IMAGES).fill(img('a')))).toBe(false)
  })
})

describe('validateImagesForPublish', () => {
  it('rejects empty arrays with a French reason', () => {
    const result = validateImagesForPublish([])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('Au moins une image est requise pour publier')
    }
  })

  it('accepts a single image', () => {
    expect(validateImagesForPublish([img('a')])).toEqual({ ok: true })
  })

  it('accepts a full gallery', () => {
    const full = Array.from({ length: MAX_PRODUCT_IMAGES }, (_, i) => img(`u${i}`))
    expect(validateImagesForPublish(full)).toEqual({ ok: true })
  })
})
