import getEnv from "~/lib/get-env";

export function formatWalletImage(imagePath: string): string {
  const env = getEnv();
  const isExternalImage = imagePath.startsWith("http") || imagePath.startsWith("https");
  const baseUrl = env.WALLET_BASE_URL;

  if (isExternalImage) {
    return imagePath;
  }

  return `${baseUrl}/${imagePath}`;
}
