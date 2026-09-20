import type { MetadataRoute } from "next";
import { absoluteUrl, locales, seo } from "./seo";

const lastModified = new Date("2026-09-21");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...locales.map((locale) => ({
      url: absoluteUrl(seo[locale].path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: locale === "es" ? 1 : 0.9,
      alternates: {
        languages: {
          es: absoluteUrl(seo.es.path),
          en: absoluteUrl(seo.en.path),
          "x-default": absoluteUrl(seo.es.path),
        },
      },
    })),
    {
      url: absoluteUrl("/pricing.md"),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: absoluteUrl("/llms.txt"),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];
}
