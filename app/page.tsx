import HomeExperience from "./home-experience";
import { serviceJsonLd } from "./seo";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd("es")) }}
      />
      <HomeExperience initialLanguage="es" />
    </>
  );
}
