export type SiteHomeSettings = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  accent: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustBadges: string[];
};

export type SiteNavLink = {
  label: string;
  href: string;
};

export type SiteSettings = {
  tickerItems: string[];
  footerDescription: string;
  footerLegalText: string;
  footerLegalLinkLabel: string;
  footerLegalLinkHref: string;
  footerSecurityLabel: string;
  home: SiteHomeSettings;
  navigation: {
    brandPrefix: string;
    brandName: string;
    brandAccent: string;
    ctaLabel: string;
    ctaHref: string;
    links: SiteNavLink[];
  };
  seo: {
    siteName: string;
    titleDefault: string;
    titleTemplate: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
  };
};
