/**
 * Client-side Image Compression & AVIF Converter Utility
 * Compresses receipt image size to 70% quality (0.7) and converts format to .avif
 */
export async function compressAndConvertToAvif(file: File, quality = 0.7): Promise<File> {
  // If file is not an image (e.g. PDF), return original file
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0);

      // Attempt to export as AVIF at 70% quality (0.7)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to JPEG 70% if browser canvas does not support AVIF export
            canvas.toBlob(
              (fallbackBlob) => {
                if (!fallbackBlob) return resolve(file);
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const fallbackFile = new File([fallbackBlob], `${baseName}-compressed.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(fallbackFile);
              },
              'image/jpeg',
              quality
            );
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const avifFileName = `${baseName}-compressed.avif`;
          const avifFile = new File([blob], avifFileName, {
            type: blob.type || 'image/avif',
            lastModified: Date.now(),
          });
          resolve(avifFile);
        },
        'image/avif',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original file on error
    };

    img.src = objectUrl;
  });
}
