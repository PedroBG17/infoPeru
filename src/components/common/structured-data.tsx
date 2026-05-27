// src/components/common/structured-data.tsx
import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface LocalBusinessData {
  subType?: string;
  name: string;
  image?: string;
  telephone?: string;
  streetAddress: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  url: string;
}

interface JobPostingData {
  title: string;
  description: string;
  company: string;
  city: string;
  region: string;
  salaryText?: string;
  type: string;
  jobId: string;
  datePosted: string;
}

interface StructuredDataProps {
  type: 'FAQ' | 'LocalBusiness' | 'Breadcrumb' | 'JobPosting';
  data: FAQItem[] | BreadcrumbItem[] | LocalBusinessData | JobPostingData;
}

/**
 * Componente que inyecta datos estructurados (Schema.org / JSON-LD) de forma segura en Server Components.
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  let jsonLD: any = null;

  if (type === 'FAQ') {
    jsonLD = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': (data as FAQItem[]).map((item) => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer,
        },
      })),
    };
  } else if (type === 'Breadcrumb') {
    jsonLD = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': (data as BreadcrumbItem[]).map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url,
      })),
    };
  } else if (type === 'LocalBusiness') {
    const lb = data as LocalBusinessData;
    jsonLD = {
      '@context': 'https://schema.org',
      '@type': lb.subType || 'LocalBusiness',
      'name': lb.name,
      'image': lb.image || '',
      'telephone': lb.telephone || '',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': lb.streetAddress,
        'addressLocality': lb.city,
        'addressRegion': lb.region,
        'addressCountry': 'PE',
      },
      'url': lb.url,
    };

    if (lb.latitude !== undefined && lb.longitude !== undefined) {
      jsonLD.geo = {
        '@type': 'GeoCoordinates',
        'latitude': lb.latitude,
        'longitude': lb.longitude,
      };
    }
  } else if (type === 'JobPosting') {
    const jp = data as JobPostingData;
    jsonLD = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      'title': jp.title,
      'description': jp.description,
      'datePosted': jp.datePosted,
      'hiringOrganization': {
        '@type': 'Organization',
        'name': jp.company,
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': jp.city,
          'addressRegion': jp.region,
          'addressCountry': 'PE',
        },
      },
      'employmentType': jp.type === 'Full-time' ? 'FULL_TIME' : jp.type === 'Part-time' ? 'PART_TIME' : 'OTHER',
      'identifier': {
        '@type': 'PropertyValue',
        'name': jp.company,
        'value': jp.jobId,
      },
    };

    if (jp.salaryText) {
      jsonLD.baseSalary = {
        '@type': 'MonetaryAmount',
        'currency': 'PEN',
        'value': {
          '@type': 'QuantitativeValue',
          'value': jp.salaryText,
          'unitText': 'MONTH',
        },
      };
    }
  }

  if (!jsonLD) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  );
}

