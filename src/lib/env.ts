function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:4000/api',
  facebookAppId: process.env.FB_APP_ID,
  isDev: process.env.NODE_ENV === 'development',
} as const;

export function getServerApiBaseUrl(): string {
  return required('API_BASE_URL', process.env.API_BASE_URL);
}
