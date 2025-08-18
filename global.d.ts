declare global {
  interface Window {
    api: {
      selectAndIndexVault: () => Promise<string[]>;
    };
  }
}

export {};