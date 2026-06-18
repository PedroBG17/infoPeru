export const adsConfig = {
  adsense: {
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-2881186920154851',
    enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED
      ? process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true'
      : process.env.NODE_ENV === 'production',
  },
};
