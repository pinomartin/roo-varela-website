"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./home-experience.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Language = "es" | "en";

const copy = {
  es: {
    nav: ["Método", "Práctica", "Archivo"],
    announce: "PROTOTIPO DE EXPERIENCIA — CONTENIDO EN DESARROLLO",
    hero: "HACÉ QUE EL MOVIMIENTO IMPORTE.",
    intro:
      "Una homepage cinética construida para convertirse en la experiencia digital de Dancer Method.",
    primary: "Explorar la práctica",
    secondary: "Ver el sistema",
    storyTitle: "El cuerpo no es un proyecto. Es tu instrumento.",
    storyBody:
      "Esta primera versión prioriza ritmo, escala y navegación. Las imágenes, vídeos y contenido final de Ro reemplazarán estos módulos sin alterar la coreografía.",
    archiveTitle: "Una práctica tiene muchas capas.",
    archiveBody:
      "Cada bloque es un espacio reservado para una historia, un recurso o una prueba real de la propuesta de Ro.",
    finalTitle: "La próxima escena empieza con vos.",
    finalAction: "Iniciar solicitud",
    placeholder: "Placeholder de contenido",
    language: "EN",
  },
  en: {
    nav: ["Method", "Practice", "Archive"],
    announce: "EXPERIENCE PROTOTYPE — CONTENT IN PROGRESS",
    hero: "MAKE MOVEMENT MATTER.",
    intro:
      "A kinetic homepage built to become Dancer Method’s digital experience.",
    primary: "Explore the practice",
    secondary: "View the system",
    storyTitle: "Your body is not a project. It is your instrument.",
    storyBody:
      "This first version prioritizes rhythm, scale, and navigation. Ro’s final images, videos, and content will replace these modules without changing the choreography.",
    archiveTitle: "A practice has many layers.",
    archiveBody:
      "Each block reserves space for a story, a resource, or real evidence of Ro’s offer.",
    finalTitle: "Your next scene starts here.",
    finalAction: "Start a request",
    placeholder: "Content placeholder",
    language: "ES",
  },
} as const;

const scenes = [
  { number: "I", title: "MOVE", detail: "Forma, ritmo y presencia." },
  { number: "II", title: "FUEL", detail: "Energía para acompañar tu práctica." },
  { number: "III", title: "RESET", detail: "Pausa, registro y continuidad." },
  { number: "IV", title: "BEGIN", detail: "Un lugar para empezar con intención." },
];

export default function HomeExperience() {
  const root = useRef<HTMLElement>(null);
  const [language, setLanguage] = useState<Language>("es");
  const text = copy[language];

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reducedMotion } = context.conditions as {
            desktop: boolean;
            reducedMotion: boolean;
          };

          if (reducedMotion) return;

          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(".hero-line", { yPercent: 120, duration: 1.1, stagger: 0.12 })
            .from(".hero-detail", { y: 28, autoAlpha: 0, duration: 0.6 }, "-=0.55")
            .from(".hero-orbit", { scale: 0.7, rotation: -28, autoAlpha: 0, duration: 0.9 }, "<");

          gsap.to(".hero-orbit", {
            rotation: 360,
            duration: 22,
            ease: "none",
            repeat: -1,
          });

          gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
            gsap.from(element, {
              y: 42,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 82%",
                once: true,
              },
            });
          });

          if (desktop) {
            gsap.to(".horizontal-track", {
              xPercent: -75,
              ease: "none",
              scrollTrigger: {
                trigger: ".horizontal-stage",
                start: "top top",
                end: () => `+=${window.innerWidth * 2.7}`,
                pin: true,
                scrub: 0.7,
                anticipatePin: 1,
              },
            });
          }

          requestAnimationFrame(() => ScrollTrigger.refresh());
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <div className={styles.announcement}>{text.announce}</div>

      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Dancer Method home">
          DANCER <span>METHOD</span>
        </a>
        <nav className={styles.navigation} aria-label="Primary navigation">
          <a href="#story">{text.nav[0]}</a>
          <a href="#practice">{text.nav[1]}</a>
          <a href="#archive">{text.nav[2]}</a>
        </nav>
        <button
          className={styles.languageButton}
          type="button"
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          aria-label={`Switch language to ${text.language}`}
        >
          {text.language}
        </button>
      </header>

      <section id="top" className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroGeometry} aria-hidden="true">
          <div className={`${styles.orbit} hero-orbit`}>
            <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="130" cy="130" r="92" stroke="currentColor" strokeWidth="2" />
              <path d="M130 18V242M18 130H242" stroke="currentColor" strokeWidth="2" />
              <path d="M46 46L214 214M214 46L46 214" stroke="currentColor" strokeWidth="2" />
              <circle cx="130" cy="130" r="18" fill="currentColor" />
            </svg>
          </div>
          <div className={styles.ring} />
        </div>
        <div className={styles.heroContent}>
          <p className={`${styles.heroMeta} hero-detail`}>DANCER METHOD / 001</p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            {text.hero.split(" ").map((word, index) => (
              <span className={styles.heroLineWrap} key={word}>
                <span className={`${styles.heroLine} hero-line`}>
                  {word}
                  {index < text.hero.split(" ").length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>
          <div className={`${styles.heroFooter} hero-detail`}>
            <p>{text.intro}</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#practice">
                {text.primary}
                <span aria-hidden="true">↘</span>
              </a>
              <a className={styles.secondaryAction} href="#story">
                {text.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className={styles.story} aria-labelledby="story-heading">
        <div className={`${styles.sectionMark} reveal`}>01 / THE POINT</div>
        <div className={`${styles.storyCopy} reveal`}>
          <h2 id="story-heading">{text.storyTitle}</h2>
          <p>{text.storyBody}</p>
        </div>
        <div className={`${styles.signal} reveal`} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section id="practice" className={`${styles.horizontalStage} horizontal-stage`} aria-label="Practice scenes">
        <div className={`${styles.horizontalTrack} horizontal-track`}>
          {scenes.map((scene, index) => (
            <article className={styles.scene} key={scene.title}>
              <span className={styles.sceneIndex}>{scene.number}</span>
              <div className={styles.sceneGraphic} aria-hidden="true">
                <div className={`${styles.sceneShape} ${styles[`shape${index + 1}`]}`} />
              </div>
              <div className={styles.sceneCopy}>
                <p>SCENE {String(index + 1).padStart(2, "0")}</p>
                <h2>{scene.title}</h2>
                <span>{scene.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="archive" className={styles.archive} aria-labelledby="archive-heading">
        <div className={`${styles.archiveHeading} reveal`}>
          <h2 id="archive-heading">{text.archiveTitle}</h2>
          <p>{text.archiveBody}</p>
        </div>
        <div className={styles.archiveGrid}>
          {[
            "[ VIDEO / RITUAL DE MOVIMIENTO ]",
            "[ FOTO / EL CUERPO EN PRÁCTICA ]",
            "[ NOTA / ACOMPAÑAR SIN RIGIDEZ ]",
            "[ VIDEO / DETRÁS DEL MÉTODO ]",
          ].map((item, index) => (
            <article className={`${styles.archiveItem} reveal`} key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.archiveMedia} aria-hidden="true">
                <div className={styles.archivePattern} />
              </div>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="request-heading">
        <div className={styles.finalOrb} aria-hidden="true" />
        <p className={styles.finalKicker}>{text.placeholder}</p>
        <h2 id="request-heading">{text.finalTitle}</h2>
        <a className={styles.finalAction} href="#top">
          {text.finalAction} <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <span>DANCER METHOD — EXPERIENCE PROTOTYPE</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
