import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/labo/',
    },
    sitemap: 'https://nicolas-pichard.vercel.app/sitemap.xml',
  };
}
