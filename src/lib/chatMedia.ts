import imageCompression from 'browser-image-compression';

/** Chat keeps images smaller than the quote form to stay under Worker/JSON limits. */
export const CHAT_MAX_IMAGES = 4;
export const CHAT_MAX_IMAGES_PER_MESSAGE = 3;
export const CHAT_MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const ALLOWED_CHAT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedChatImage(file: File) {
  return ALLOWED_CHAT_IMAGE_TYPES.has(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
}

export async function compressChatPhoto(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.9,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    });
  } catch (err) {
    console.warn('Chat photo compression failed, using original', err);
    return file;
  }
}

export function fileToBase64(file: File): Promise<{ mimeType: 'image/jpeg' | 'image/png' | 'image/webp'; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      const data = comma >= 0 ? result.slice(comma + 1) : result;
      const mimeType: 'image/jpeg' | 'image/png' | 'image/webp' =
        file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg'
          ? file.type
          : 'image/jpeg';
      resolve({ mimeType, data });
    };
    reader.readAsDataURL(file);
  });
}
