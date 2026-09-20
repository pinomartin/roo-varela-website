import type { MetadataRoute } from "next";
import { absoluteUrl, locales, seo } from "./seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(seo[locale].path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: locale === "es" ? 1 : 0.9,
    alternates: {
      languages: {
        es: absoluteUrl(seo.es.path),
        en: absoluteUrl(seo.en.path),
        "x-default": absoluteUrl(seo.es.path),
      },
    },
  }));
}
