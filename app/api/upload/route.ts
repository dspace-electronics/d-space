import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // 1. File size limit enforcement (5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit. Please upload an optimized component image.' },
        { status: 400 }
      );
    }

    // 2. MIME type & extension whitelist enforcement
    const fileExt = (file.name.split('.').pop() || '').toLowerCase();
    const mimeType = file.type || 'image/jpeg';

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(fileExt)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only JPEG, PNG, WEBP, and GIF images are permitted.' },
        { status: 400 }
      );
    }

    // 3. Sanitized secure file path
    const sanitizedExt = fileExt.replace(/[^a-z0-9]/g, '');
    const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${sanitizedExt}`;
    const filePath = `catalog/${fileName}`;

    // 4. If Supabase Storage is configured, upload directly to S3-compatible Supabase Storage bucket
    if (isSupabaseConfigured()) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
          .from('dspace-products')
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('dspace-products')
            .getPublicUrl(filePath);

          if (publicData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicData.publicUrl,
              fileName,
              storageType: 'supabase_s3',
            });
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload error, falling back to base64 data URL:', storageErr);
      }
    }

    // 5. Fallback: Base64 data URL with sanitized MIME type
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName,
      storageType: 'data_url',
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}

