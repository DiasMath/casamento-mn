const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Faz upload de um Blob para o Cloudinary via unsigned preset.
 * Retorna a URL HTTPS permanente da imagem.
 */
export async function uploadToCloudinary(blob: Blob): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Variáveis de ambiente do Cloudinary não configuradas. " +
        "Verifique VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET no .env",
    );
  }

  const formData = new FormData();
  formData.append("file", blob, "gift-image.jpg");
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        "Erro ao fazer upload da imagem para o Cloudinary",
    );
  }

  const data = await response.json();
  return data.secure_url as string;
}

/**
 * Verifica se uma URL é do Cloudinary.
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.startsWith("https://res.cloudinary.com/");
}
