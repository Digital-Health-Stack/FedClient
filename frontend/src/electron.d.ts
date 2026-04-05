export {};

declare global {
  interface Window {
    electronAPI?: {
      apiBaseUrl: string;
      getApiBaseUrl: () => string;
      wsUrl: () => string;
    };
  }
}
