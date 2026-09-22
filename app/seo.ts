import type { Metadata } from "next";

type Locale = "es" | "en";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://roodancermethod.com";
const siteUrl = new URL(SITE_URL);
const locales = ["es", "en"] as const;

const seo = {
  es: {
    title: "Roo Varela | Dancer Method para bailarines",
    description:
      "Entrenamiento para bailarines, fuerza, nutrición y coaching online con Roo Varela, personal trainer y bailarina profesional.",
    path: "/es",
    ogLocale: "es_ES",
  },
  en: {
    title: "Roo Varela | Dancer Method for dancers",
    description:
      "Dance conditioning, strength training, nutrition, and online coaching by Roo Varela, personal trainer and professional dancer.",
    path: "/en",
    ogLocale: "en_US",
  },
} satisfies Record<
  Locale,
  { title: string; description: string; path: string; ogLocale: string }
>;

const ogImage = "/img/pose_rosa.png";

function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

function localeMetadata(locale: Locale): Metadata {
  const data = seo[locale];

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: data.path,
      languages: {
        es: seo.es.path,
        en: seo.en.path,
        "x-default": seo.es.path,
      },
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.path,
      siteName: "Roo Varela · Dancer Method",
      locale: data.ogLocale,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [ogImage],
    },
  };
}

function serviceJsonLd(locale: Locale) {
  const isSpanish = locale === "es";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/#website")}`,
        name: "Roo Varela · Dancer Method",
        url: absoluteUrl(seo[locale].path),
        inLanguage: locale,
      },
      {
        "@type": "Person",
        "@id": `${absoluteUrl("/#roo")}`,
        name: "Roo Varela",
        jobTitle: isSpanish
          ? "Entrenadora personal y bailarina profesional"
          : "Personal trainer and professional dancer",
        description: isSpanish
          ? "Roo Varela es entrenadora personal y bailarina profesional, creadora de Dancer Method."
          : "Roo Varela is a personal trainer and professional dancer, creator of Dancer Method.",
        sameAs: ["https://instagram.com/tufitnessroovarela"],
      },
      {
        "@type": "Service",
        "@id": `${absoluteUrl(seo[locale].path)}#service`,
        name: "Dancer Method",
        description: seo[locale].description,
        url: absoluteUrl(seo[locale].path),
        provider: { "@id": `${absoluteUrl("/#roo")}` },
        serviceType: isSpanish
          ? "Entrenamiento para bailarines, preparación física, fuerza, nutrición y coaching online"
          : "Dance conditioning, strength training, nutrition, and online coaching for dancers",
        audience: {
          "@type": "Audience",
          audienceType: isSpanish
            ? "Bailarines amateurs, semiprofesionales y profesionales"
            : "Amateur, semi-professional, and professional dancers",
        },
        areaServed: "Online",
        offers: [
          {
            "@type": "Offer",
            name: "Essential",
            url: `${absoluteUrl(seo[locale].path)}#plans`,
            price: "39",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Pro",
            url: `${absoluteUrl(seo[locale].path)}#plans`,
            price: "79",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Pro 3-month promotion",
            url: `${absoluteUrl(seo[locale].path)}#plans`,
            price: "200",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        ],
      },
    ],
  };
}

export { absoluteUrl, localeMetadata, locales, seo, serviceJsonLd, siteUrl };
export type { Locale };
