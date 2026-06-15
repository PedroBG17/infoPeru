// src/config/site.ts

export const siteConfig = {
  name: 'ClavePerú',
  description: 'Portal de trámites, salud, empleo y directorios regionales en todo el Perú.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dataperu.pe',
  ogImage: 'https://dataperu.pe/assets/default-og.png',
  links: {
    twitter: '',
    github: 'https://github.com/PedroBG17/infoPeru',
  },
  mainNav: [
    {
      title: 'Inicio',
      href: '/',
    },
    {
      title: 'Trámites',
      href: '/tramites',
    },
    {
      title: 'Hospitales',
      href: '/hospitales',
    },
    {
      title: 'Bolsa de Empleo',
      href: '/trabajos',
    },
  ],
};

export type SiteConfig = typeof siteConfig;
