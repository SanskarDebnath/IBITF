export const MAX_PRODUCT_IMAGE_BYTES = 3 * 1024 * 1024;

export function validateProductImage(file) {
  if (!file) {
    return "Please select an image file";
  }

  if (!file.type.startsWith("image/")) {
    return "Only image files are allowed";
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return "Image must be 3 MB or smaller";
  }

  return "";
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.readAsDataURL(file);
  });
}
