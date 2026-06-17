import { prisma } from '@/lib/db';
import type { SiteSettings } from '@/types/site-settings';

export const SITE_SETTINGS_KEY = 'global';

export const defaultSiteSettings: SiteSettings = {
  tickerItems: [
    'Talara anuncia obras viales para el 2025',
    'RENIEC amplía horario de atención en Piura hasta las 8pm',
    'EsSalud Piura abre convocatoria para médicos especialistas',
    'Precio del petróleo en Talara sube 3% esta semana',
    'Sunat simplifica declaración mensual para MYPES',
  ],
  footerDescription:
    'Portal de noticias regionales, guías oficiales de trámites y directorios públicos de salud en el norte peruano.',
  footerLegalText:
    'Esta es una plataforma informativa independiente. No representamos a entidades gubernamentales. Ante dudas oficiales, dirígete a',
  footerLegalLinkLabel: 'Gob.pe',
  footerLegalLinkHref: 'https://www.gob.pe',
  footerSecurityLabel: 'Plataforma Segura SSL',
  home: {
    eyebrow: 'Portal de Información Pública Regional del Perú',
    titleLine1: 'Noticias, Trámites',
    titleLine2: 'y Salud en un',
    accent: 'Solo Lugar',
    description:
      'Mantente al día con las últimas noticias del acontecer nacional, guías completas del TUPA, directorios médicos integrados del MINSA / EsSalud y oportunidades de empleo regional.',
    primaryCtaLabel: 'Buscar Trámites',
    primaryCtaHref: '/tramites',
    secondaryCtaLabel: 'Ver Hospitales por Ciudad',
    secondaryCtaHref: '/hospitales',
    trustBadges: ['Información Confiable', 'Actualizada Diariamente', 'Acceso Gratuito'],
  },
  navigation: {
    brandPrefix: 'CLAVE',
    brandName: 'Perú',
    brandAccent: '',
    ctaLabel: 'Buscador de Trámites',
    ctaHref: '/tramites',
    links: [
      { label: 'INICIO', href: '/' },
      { label: 'TRÁMITES', href: '/tramites' },
      { label: 'HOSPITALES', href: '/hospitales' },
      { label: 'BOLSA DE EMPLEO', href: '/trabajos' },
    ],
  },
  seo: {
    siteName: 'ClavePerú',
    titleDefault: 'ClavePerú | Portal Informativo Regional y Trámites',
    titleTemplate: '%s | ClavePerú',
    description: 'Portal de trámites, noticias locales del norte peruano, salud y bolsa de empleo.',
    keywords: [
      'claveperu',
      'trámites perú',
      'noticias piura',
      'noticias talara',
      'hospitales minsa',
      'essalud',
      'convocatorias de trabajo',
      'tupa perú',
    ],
    ogTitle: 'ClavePerú - Portal Informativo',
    ogDescription:
      'Noticias locales, guías de trámites del Estado y consejos de salud para el norte del Perú.',
    ogImage: 'https://info-peru.vercel.app/assets/default-og.png',
    twitterTitle: 'ClavePerú',
    twitterDescription: 'Portal informativo de trámites y actualidad regional del Perú.',
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readNavLinks(value: unknown, fallback: SiteSettings['navigation']['links']) {
  if (!Array.isArray(value)) return fallback;

  const links = value
    .map((item) => {
      if (!isRecord(item)) return null;
      const label = readString(item.label, '');
      const href = readString(item.href, '');
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((item): item is SiteSettings['navigation']['links'][number] => Boolean(item));

  return links.length > 0 ? links : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const list = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  return list.length > 0 ? list : fallback;
}

export function mergeSiteSettings(value: unknown): SiteSettings {
  if (!isRecord(value)) return defaultSiteSettings;

  const home = isRecord(value.home) ? value.home : {};
  const navigation = isRecord(value.navigation) ? value.navigation : {};

  return {
    tickerItems: readStringArray(value.tickerItems, defaultSiteSettings.tickerItems),
    footerDescription: readString(value.footerDescription, defaultSiteSettings.footerDescription),
    footerLegalText: readString(value.footerLegalText, defaultSiteSettings.footerLegalText),
    footerLegalLinkLabel: readString(value.footerLegalLinkLabel, defaultSiteSettings.footerLegalLinkLabel),
    footerLegalLinkHref: readString(value.footerLegalLinkHref, defaultSiteSettings.footerLegalLinkHref),
    footerSecurityLabel: readString(value.footerSecurityLabel, defaultSiteSettings.footerSecurityLabel),
    home: {
      eyebrow: readString(home.eyebrow, defaultSiteSettings.home.eyebrow),
      titleLine1: readString(home.titleLine1, defaultSiteSettings.home.titleLine1),
      titleLine2: readString(home.titleLine2, defaultSiteSettings.home.titleLine2),
      accent: readString(home.accent, defaultSiteSettings.home.accent),
      description: readString(home.description, defaultSiteSettings.home.description),
      primaryCtaLabel: readString(home.primaryCtaLabel, defaultSiteSettings.home.primaryCtaLabel),
      primaryCtaHref: readString(home.primaryCtaHref, defaultSiteSettings.home.primaryCtaHref),
      secondaryCtaLabel: readString(home.secondaryCtaLabel, defaultSiteSettings.home.secondaryCtaLabel),
      secondaryCtaHref: readString(home.secondaryCtaHref, defaultSiteSettings.home.secondaryCtaHref),
      trustBadges: readStringArray(home.trustBadges, defaultSiteSettings.home.trustBadges),
    },
    navigation: {
      brandPrefix: readString(navigation.brandPrefix, defaultSiteSettings.navigation.brandPrefix),
      brandName: readString(navigation.brandName, defaultSiteSettings.navigation.brandName),
      brandAccent: readString(navigation.brandAccent, defaultSiteSettings.navigation.brandAccent),
      ctaLabel: readString(navigation.ctaLabel, defaultSiteSettings.navigation.ctaLabel),
      ctaHref: readString(navigation.ctaHref, defaultSiteSettings.navigation.ctaHref),
      links: readNavLinks(navigation.links, defaultSiteSettings.navigation.links),
    },
    seo: {
      siteName: readString(isRecord(value.seo) ? value.seo.siteName : undefined, defaultSiteSettings.seo.siteName),
      titleDefault: readString(isRecord(value.seo) ? value.seo.titleDefault : undefined, defaultSiteSettings.seo.titleDefault),
      titleTemplate: readString(isRecord(value.seo) ? value.seo.titleTemplate : undefined, defaultSiteSettings.seo.titleTemplate),
      description: readString(isRecord(value.seo) ? value.seo.description : undefined, defaultSiteSettings.seo.description),
      keywords: readStringArray(isRecord(value.seo) ? value.seo.keywords : undefined, defaultSiteSettings.seo.keywords),
      ogTitle: readString(isRecord(value.seo) ? value.seo.ogTitle : undefined, defaultSiteSettings.seo.ogTitle),
      ogDescription: readString(isRecord(value.seo) ? value.seo.ogDescription : undefined, defaultSiteSettings.seo.ogDescription),
      ogImage: readString(isRecord(value.seo) ? value.seo.ogImage : undefined, defaultSiteSettings.seo.ogImage),
      twitterTitle: readString(isRecord(value.seo) ? value.seo.twitterTitle : undefined, defaultSiteSettings.seo.twitterTitle),
      twitterDescription: readString(isRecord(value.seo) ? value.seo.twitterDescription : undefined, defaultSiteSettings.seo.twitterDescription),
    },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const record = await prisma.siteSetting.findUnique({
      where: { key: SITE_SETTINGS_KEY },
      select: { value: true },
    });

    return mergeSiteSettings(record?.value);
  } catch (error) {
    console.warn('[SITE_SETTINGS_FALLBACK]', error);
    return defaultSiteSettings;
  }
}
