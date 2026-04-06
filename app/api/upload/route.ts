import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const ALLOWED_BUCKETS = ['merchant-logos', 'product-images'] as const;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const file = formData.get('file');
  const bucket = formData.get('bucket');

  if (!(file instanceof File) || typeof bucket !== 'string') {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (!(ALLOWED_BUCKETS as readonly string[]).includes(bucket)) {
    return NextResponse.json({ error: 'invalid_bucket' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const service = createServiceClient();

  const { error: uploadError } = await service.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('[upload] storage error:', uploadError.message);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = service.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
