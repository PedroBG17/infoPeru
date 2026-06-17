// src/lib/seo.ts
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  slug: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
}

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://info-peru.vercel.app';

/**
 * Helper unificado para generar metadatos avanzados de SEO en Next.js (App Router).
 * Maneja canonicals absolutos, OpenGraph, Twitter Cards y directivas de rastreo de indexación.
 */
export function getMetadata({
  title,
  description,
  slug,
  noIndex = false,
  ogImage = '/assets/default-og.png',
  ogType = 'website',
}: SEOProps): Metadata {
  const url = `${DEFAULT_SITE_URL}${slug.startsWith('/') ? slug : `/${slug}`}`;

  return {
    title: `${title} | ClavePerú`,
    description,
    metadataBase: new URL(DEFAULT_SITE_URL),
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title: `${title} | ClavePerú`,
      description,
      url,
      siteName: 'ClavePerú',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${DEFAULT_SITE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'es_PE',
      type: ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ClavePerú`,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${DEFAULT_SITE_URL}${ogImage}`],
    },
  };
}
