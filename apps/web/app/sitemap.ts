import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://estrichmanager.de'
  const lastModified = new Date()

  // Hauptseiten mit hoher Priorität
  const mainPages = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/funktionen`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/preise`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Wissensbasis-Seiten mit mittlerer Priorität
  const knowledgePages = [
    {
      url: `${baseUrl}/wissen`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wissen/en-13813`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wissen/ce-kennzeichnung`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wissen/dop-erstellung`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wissen/fpc-dokumentation`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wissen/itt-management`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wissen/estrich-arten`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // EN 13892 Prüfnormen Seiten
  const en13892Pages = [
    {
      url: `${baseUrl}/wissen/en-13892-reihe`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wissen/en-13892-2-zementestrich-festigkeit`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wissen/en-13892-2-anhydritestrich-besonderheiten`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wissen/welche-en-13892-pruefung`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wissen/prueffalter-28-tage-en-13892-2`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/kunstharzestrich-en-13892-8-haftzugfestigkeit`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/magnesiaestrich-en-13892-6-oberflaechenhaerte`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Weitere Norm-bezogene Seiten
  const normPages = [
    {
      url: `${baseUrl}/wissen/pruefhaeufigkeiten-en-13813`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wissen/zementestrich-en-13813-pruefpflichten`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/steinholzestrich-en-13813-pruefanforderungen`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/en-13454-2-konsistenz-ausbreitmass-frischmoertel`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/en-13501-1-brandverhalten-estrich`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/en-13872-schwindmass-estrich-bestimmung`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wissen/glossar`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  return [
    ...mainPages,
    ...knowledgePages,
    ...en13892Pages,
    ...normPages,
  ]
}