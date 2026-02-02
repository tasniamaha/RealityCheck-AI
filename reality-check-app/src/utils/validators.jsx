export const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
  const maxSize = 100 * 1024 * 1024 // 100MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM).'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 100MB.'
    }
  }

  return { valid: true }
}