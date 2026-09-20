import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeExperience from "../home-experience";
import { localeMetadata, locales, serviceJsonLd, type Locale } from "../seo";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) return {};

  return localeMetadata(locale);
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(locale)) }}
      />
      <HomeExperience initialLanguage={locale} />
    </>
  );
}
