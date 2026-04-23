import {
  getProductImages,
  getDefaultAlt,
  resolveImageAlt,
  MAX_PRODUCT_IMAGES,
} from '@/lib/product-images'

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
