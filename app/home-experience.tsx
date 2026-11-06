"use client";

import { useRef, useState, type MouseEvent, type SubmitEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import styles from "./home-experience.module.css";
import { lang } from "./lang";
import { INSTAGRAM_LINK, WHATSAPP_NUMBER } from "./constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Language = "es" | "en";
type PlanInterest = "essential" | "pro" | "undecided";

type HomeExperienceProps = {
  initialLanguage?: Language;
};

const showMethodSteps = false;
const chapterImages = ["/img/cintura_cerca.webp", "/img/mano_pelo.webp", "/img/espalda.webp"] as const;

// Same order as the localized workshops; replace the temporary covers when available.
const workshopImages = [
  "/img/workshops/dancer_conditioning.webp",
  "/img/workshops/fuel_your_dance.webp",
  "/img/workshops/the_person_behind.webp",
  "/img/workshops/dancer_toolkit.webp",
  "/img/workshops/artist_journey.webp",
];

function WorkshopCard({
  workshop,
  language,
  image,
}: {
  workshop: (typeof lang)[Language]["education"]["workshops"][number];
  language: Language;
  image: string;
}) {
  const card = useRef<HTMLDetailsElement>(null);
  const expanded = useRef(false);
  const { contextSafe } = useGSAP({ scope: card });

  const setExpanded = (element: HTMLDetailsElement, open: boolean) =>
    contextSafe(() => {
      if (expanded.current === open) return;
      expanded.current = open;
      const region = element.querySelector<HTMLElement>(
        `.${styles.workshopRegion}`,
      );
      const summary = element.querySelector("summary");
      if (!region || !summary) return;

      gsap.killTweensOf(region);
      summary.setAttribute("aria-expanded", String(open));
      region.inert = !open;
      const wasOpen = element.open;

      const finish = () => {
        if (!open) element.open = false;
        gsap.set(region, { clearProps: "height,opacity,overflow" });
        summary.removeAttribute("aria-expanded");
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (open) element.open = true;
        finish();
        return;
      }
      element.open = true;
      if (!wasOpen) gsap.set(region, { height: 0, opacity: 0 });
      gsap.set(region, { overflow: "hidden" });
      gsap.to(region, {
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
        duration: open ? 0.45 : 0.3,
        ease: open ? "power3.out" : "power2.inOut",
        onComplete: finish,
      });
    })();

  return (
    <details
      ref={card}
      className={styles.workshop}
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.preventDefault();
          event.currentTarget.querySelector("summary")?.focus();
          setExpanded(event.currentTarget, false);
        }
      }}
    >
      <summary
        onClick={(event) => {
          event.preventDefault();
          if (card.current) setExpanded(card.current, !expanded.current);
        }}
      >
        <div className={styles.workshopCover}>
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1200px) 34rem, (min-width: 700px) 50vw, 100vw"
          />
        </div>
        <div className={styles.workshopSummaryContent}>
          <div className={styles.workshopPreview}>
            <h3>{workshop.title}</h3>
            <p className={styles.workshopAudience}>{workshop.audience}</p>
          </div>
          <span className={styles.workshopAction}>
            <span className={styles.workshopActionLabel}>
              {language === "es" ? "Ver taller" : "Explore workshop"}
            </span>
            <span aria-hidden="true" className={styles.workshopPlus} />
          </span>
        </div>
      </summary>
      <div className={styles.workshopRegion}>
        <div className={styles.workshopBody}>
          <p>{workshop.description}</p>
          {workshop.details && (
            <p className={styles.workshopDetails}>{workshop.details}</p>
          )}
        </div>
      </div>
    </details>
  );
}

function WorkshopCarousel({ language }: { language: Language }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { contextSafe } = useGSAP({ scope: viewport });
  const workshops = lang[language].education.workshops;

  const goTo = (index: number) => contextSafe(() => {
    const element = viewport.current;
    if (!element) return;
    gsap.killTweensOf(element);
    const target = index * element.clientWidth;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.scrollLeft = target;
      return;
    }
    element.style.scrollSnapType = "none";
    const restoreSnap = () => { element.style.scrollSnapType = ""; };
    gsap.to(element, {
      scrollLeft: target,
      duration: 0.65,
      ease: "power3.inOut",
      onComplete: restoreSnap,
      onInterrupt: restoreSnap,
    });
  })();

  return (
    <div className={styles.workshopCarousel} role="region" aria-roledescription={language === "es" ? "carrusel" : "carousel"} aria-label={language === "es" ? "Talleres" : "Workshops"}>
      <div
        ref={viewport}
        className={styles.workshopList}
        onScroll={(event) => {
          const element = event.currentTarget;
          if (element.clientWidth) setActive(Math.round(element.scrollLeft / element.clientWidth));
        }}
        onPointerDown={() => { if (viewport.current) gsap.killTweensOf(viewport.current); }}
      >
        {workshops.map((workshop, index) => (
          <WorkshopCard key={workshop.title} workshop={workshop} language={language} image={workshopImages[index]} />
        ))}
      </div>
      <div className={styles.workshopDots} aria-label={language === "es" ? "Elegir taller" : "Choose a workshop"}>
        {workshops.map((workshop, index) => (
          <button
            key={workshop.title}
            type="button"
            className={styles.workshopDot}
            aria-label={`${language === "es" ? "Ir al taller" : "Go to workshop"} ${index + 1}: ${workshop.title}`}
            aria-current={active === index ? "true" : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomeExperience({
  initialLanguage = "es",
}: HomeExperienceProps) {
  const root = useRef<HTMLElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const language = initialLanguage;
  const [selectedInterest, setSelectedInterest] =
    useState<PlanInterest>("undecided");
  const [formStatus, setFormStatus] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const text = lang[language];

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap.from(".method-title-word", {
            y: 24,
            autoAlpha: 0,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".method-title-reveal",
              start: "top 85%",
              end: "top 25%",
              scrub: 0.8,
            },
          });
        },
        root,
      );

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
            .from(
              ".hero-detail",
              { y: 28, autoAlpha: 0, duration: 0.6 },
              "-=0.55",
            )
            .from(
              ".hero-orbit",
              { scale: 0.86, x: 36, autoAlpha: 0, duration: 0.9 },
              "<",
            );

          gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
            if (element.classList.contains("story-image")) return;
            gsap.from(element, {
              y: 42,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 82%", once: true },
            });
          });

          gsap
            .timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: {
                trigger: ".story-image",
                start: "top 78%",
                once: true,
              },
            })
            .from(".story-pole", {
              clipPath: "inset(0 0 100% 0)",
              x: -42,
              y: 52,
              scale: 0.9,
              rotation: -6,
              autoAlpha: 0,
              duration: 0.95,
            })
            .from(
              ".story-usa",
              {
                clipPath: "inset(0 0 100% 0)",
                x: 38,
                y: 44,
                scale: 0.9,
                rotation: 5,
                autoAlpha: 0,
                duration: 0.95,
              },
              "-=0.42",
            )
            .from(
              ".story-photo",
              { scale: 1.12, yPercent: 8, duration: 1.05 },
              "<0.04",
            );

          if (desktop) {
            gsap
              .timeline({
                defaults: { duration: 0.86, ease: "power3.out" },
                scrollTrigger: {
                  trigger: ".method-motion",
                  start: "top 72%",
                  once: true,
                },
              })
              .from(".method-constellation span", {
                scale: 0,
                rotation: -45,
                autoAlpha: 0,
                stagger: { amount: 0.28, from: "random" },
              })
              .from(
                ".method-intro-body",
                { clipPath: "inset(0 0 100% 0)", y: 18, autoAlpha: 0 },
                "<0.12",
              );

            gsap.to(".method-constellation", {
              yPercent: desktop ? -10 : -4,
              ease: "none",
              scrollTrigger: {
                trigger: ".method-motion",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            });

            // if (desktop) {
            //   gsap.utils
            //     .toArray<HTMLElement>(".horizontal-stage")
            //     .forEach((stage) => {
            //       if (stage.classList.contains("method-stage")) return;

            //       const track =
            //         stage.querySelector<HTMLElement>(".horizontal-track");
            //       const scenes = gsap.utils.toArray<HTMLElement>(
            //         stage.querySelectorAll(".scene"),
            //       );

            //       if (!track || scenes.length < 2) return;

            //       const horizontalTween = gsap.timeline({
            //         scrollTrigger: {
            //           trigger: stage,
            //           start: "top top",
            //           end: () =>
            //             `+=${window.innerWidth * (scenes.length - 0.55)}`,
            //           pin: true,
            //           scrub: 0.7,
            //           anticipatePin: 1,
            //         },
            //       });

            //       horizontalTween
            //         .to(track, {
            //           xPercent: -((scenes.length - 1) / scenes.length) * 100,
            //           ease: "none",
            //           duration: scenes.length - 1,
            //         })
            //         .to({}, { duration: 0.45 });

            //       scenes.forEach((scene, index) => {
            //         gsap
            //           .timeline({
            //             defaults: { duration: 0.8, ease: "power3.out" },
            //             scrollTrigger: index === 0
            //               ? { trigger: stage, start: "top 80%", once: true }
            //               : {
            //                   trigger: scene,
            //                   containerAnimation: horizontalTween,
            //                   start: "left 75%",
            //                   once: true,
            //                 },
            //           })
            //           .from(scene.querySelector(".scene-index"), {
            //             y: 45,
            //             autoAlpha: 0,
            //           })
            //           .from(scene.querySelector(".scene-copy"), {
            //             y: 48,
            //             autoAlpha: 0,
            //             clipPath: "inset(0 0 100% 0)",
            //           }, "<0.15");

            //         gsap.from(scene.querySelector(".scene-image-frame"), {
            //           scale: 0.78,
            //           rotation: index % 2 === 0 ? -8 : 8,
            //           autoAlpha: 0,
            //           ease: "power3.out",
            //           scrollTrigger: {
            //             trigger: scene,
            //             containerAnimation: horizontalTween,
            //             start: "left 74%",
            //             end: "left 42%",
            //             scrub: 0.8,
            //           },
            //         });

            //         gsap.to(scene.querySelector(".scene-photo"), {
            //           xPercent: index === 1 ? -5 : 5,
            //           yPercent: index === 2 ? -3 : 2,
            //           scale: 1.02,
            //           ease: "none",
            //           scrollTrigger: {
            //             trigger: scene,
            //             containerAnimation: horizontalTween,
            //             start: "left 80%",
            //             end: "right 24%",
            //             scrub: true,
            //           },
            //         });
            //       });
            //     });
            // } else {
            //   gsap.utils
            //     .toArray<HTMLElement>(".horizontal-stage")
            //     .forEach((stage) => {
            //       gsap.from(stage.querySelectorAll(".scene-image-frame"), {
            //         y: 36,
            //         scale: 0.9,
            //         autoAlpha: 0,
            //         duration: 0.8,
            //         ease: "power3.out",
            //         stagger: 0.1,
            //         scrollTrigger: {
            //           trigger: stage,
            //           start: "top 72%",
            //           once: true,
            //         },
            //       });
            //     });
            // }

            gsap
              .timeline({
                defaults: { duration: 0.72, ease: "power3.out" },
                scrollTrigger: {
                  trigger: ".method-commitment-note",
                  start: "top 78%",
                  once: true,
                },
              })
              .from(".method-note-word", {
                yPercent: 105,
                autoAlpha: 0,
                filter: "blur(10px)",
                stagger: { each: 0.018, from: "start" },
              })
              .from(
                ".method-commitment-note",
                { letterSpacing: "0.025em", duration: 1.1 },
                0,
              );

            const includeCards = gsap.utils.toArray<HTMLElement>(
              ".includes-motion .includeItem",
            );

            if (desktop) {
              includeCards.forEach((card, index) => {
                gsap.from(card, {
                  y: 72,
                  rotation: index % 2 === 0 ? -3 : 3,
                  autoAlpha: 0,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: card,
                    start: "top 88%",
                    end: "top 50%",
                    scrub: 0.75,
                  },
                });

                if (index < includeCards.length - 1) {
                  gsap.to(card, {
                    autoAlpha: 0.72,
                    ease: "none",
                    scrollTrigger: {
                      trigger: includeCards[index + 1],
                      start: "top 72%",
                      end: "top 38%",
                      scrub: true,
                    },
                  });
                }
              });
            }

            gsap
              .timeline({
                defaults: { duration: 0.62, ease: "power3.out" },
                scrollTrigger: {
                  trigger: ".plans-motion",
                  start: "top 68%",
                  once: true,
                },
              })
              .from(".plans-motion .plan", {
                y: 24,
                autoAlpha: 0,
                stagger: 0.08,
                duration: 0.68,
              })
              .from(
                ".plans-motion .plan-badge",
                { scale: 0.86, autoAlpha: 0, duration: 0.42 },
                "-=0.22",
              )
              .from(
                ".plans-motion .featured-plan .original-price",
                { x: 18, autoAlpha: 0, duration: 0.42 },
                "<0.08",
              )
              .from(
                ".plans-motion .plan li",
                { x: 14, autoAlpha: 0, stagger: 0.035, duration: 0.45 },
                "<0.04",
              );

            gsap
              .timeline({
                defaults: { duration: 0.68, ease: "power3.out" },
                scrollTrigger: {
                  trigger: ".process-motion",
                  start: "top 70%",
                  once: true,
                },
              })
              .from(".process-motion li", {
                xPercent: 10,
                autoAlpha: 0,
                stagger: 0.14,
              });

            gsap
              .timeline({
                defaults: { duration: 0.9, ease: "power3.out" },
                scrollTrigger: {
                  trigger: ".roo-motion",
                  start: "top 72%",
                  once: true,
                },
              })
              .fromTo(
                ".roo-motion .rooFigure",
                { clipPath: "inset(0 100% 0 0)", x: -80, autoAlpha: 0 },
                { clipPath: "inset(0 0% 0 0)", x: 0, autoAlpha: 1 },
              )
              .fromTo(
                ".roo-motion .rooCopy",
                { x: 80, autoAlpha: 0 },
                { x: 0, autoAlpha: 1 },
                "<",
              )
              .fromTo(
                ".roo-motion .rooPhoto",
                { scale: 1.08 },
                { scale: 1, duration: 1.05 },
                "<",
              );

            gsap
              .timeline({
                defaults: { duration: 0.6, ease: "power3.out" },
                scrollTrigger: {
                  trigger: ".contact-motion",
                  start: "top 72%",
                  once: true,
                },
              })
              .from(".contact-motion .contactForm > *", {
                y: 24,
                autoAlpha: 0,
                stagger: 0.08,
              })
              .from(
                ".contact-motion .directContact > *",
                { y: 18, autoAlpha: 0, stagger: 0.07 },
                "<0.24",
              );

            gsap.from(".footer-motion > *", {
              y: 18,
              autoAlpha: 0,
              duration: 0.55,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ".footer-motion",
                start: "top 96%",
                once: true,
              },
            });

            requestAnimationFrame(() => ScrollTrigger.refresh());
          }
        },
      );

      media.add(
        "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cleanups: (() => void)[] = [];
          root.current?.querySelectorAll<HTMLElement>("[data-book-stage]").forEach((stage) => {
            const track = stage.querySelector<HTMLElement>("[data-book-track]");
            if (!track) return;
            let animation: gsap.Context | undefined;
            let frame = 0;
            const observer = new ResizeObserver(() => schedule());
            const checkFit = () => {
              stage.dataset.bookActive = "true";
              if (track.scrollHeight > window.innerHeight + 1) {
                observer.disconnect();
                animation?.revert();
                animation = undefined;
                delete stage.dataset.bookActive;
              } else if (!animation) {
                const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);
                animation = gsap.context(() => {
                  gsap.to(track, {
                    x: () => -distance(),
                    ease: "none",
                    scrollTrigger: {
                      trigger: stage,
                      start: "top top",
                      end: () => `+=${distance()}`,
                      pin: true,
                      scrub: true,
                      invalidateOnRefresh: true,
                      anticipatePin: 1,
                    },
                  });
                });
                observer.observe(track);
              }
              ScrollTrigger.refresh();
            };
            const schedule = () => {
              cancelAnimationFrame(frame);
              frame = requestAnimationFrame(checkFit);
            };
            window.addEventListener("resize", schedule);
            document.fonts.addEventListener("loadingdone", schedule);
            checkFit();
            cleanups.push(() => {
              window.removeEventListener("resize", schedule);
              document.fonts.removeEventListener("loadingdone", schedule);
              cancelAnimationFrame(frame);
              observer.disconnect();
              animation?.revert();
              delete stage.dataset.bookActive;
            });
          });
          ScrollTrigger.refresh();
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );

      media.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray<HTMLElement>(".horizontal-stage .scene")
            .forEach((scene) => {
              const image = scene.querySelector(".scene-image-frame");
              const copy = scene.querySelector(".scene-copy");
              gsap.from(image, {
                scale: 0.88,
                rotation: -6,
                autoAlpha: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: { trigger: image, start: "top 85%", once: true },
              });
              gsap.from(copy, {
                y: 32,
                autoAlpha: 0,
                clipPath: "inset(0 0 100% 0)",
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: { trigger: copy, start: "top 90%", once: true },
              });
            });
        },
      );

      media.add(
        "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          const stage = root.current?.querySelector<HTMLElement>("[data-includes-stage]");
          const track = stage?.querySelector<HTMLElement>("[data-includes-track]");
          if (!stage || !track) return;
          const panels = Array.from(track.children) as HTMLElement[];
          let animation: gsap.Context | undefined;
          let frame = 0;

          const setup = () => {
            animation?.revert();
            animation = undefined;
            stage.dataset.includesActive = "true";
            if (track.scrollHeight > window.innerHeight + 1) {
              delete stage.dataset.includesActive;
            } else {
              animation = gsap.context(() => {
                gsap.set(panels[1], { opacity: 0 });
                gsap.set(panels.slice(2), { xPercent: 100 });
                const secondEntries = panels.slice(1).map((panel) =>
                  Array.from(panel.children[1].children),
                );
                gsap.set(secondEntries.flat(), { opacity: 0 });
                const timeline = gsap.timeline({
                  defaults: { ease: "none" },
                  scrollTrigger: {
                    trigger: stage,
                    start: "top top",
                    end: () => `+=${window.innerHeight * (panels.length + secondEntries.length)}`,
                    pin: true,
                    scrub: true,
                    anticipatePin: 1,
                  },
                });
                panels.slice(1).forEach((panel, index) => {
                  timeline.to({}, { duration: 1 });
                  if (index === 0) {
                    timeline.to(panel, { opacity: 1, duration: 0.35 });
                    timeline.set(panels[index], { opacity: 0 });
                  } else {
                    timeline.to(panels[index], { xPercent: -100, duration: 0.7 });
                    timeline.to(panel, { xPercent: 0, duration: 0.7 }, "<");
                  }
                  timeline.to({}, { duration: 1 });
                  timeline.to(secondEntries[index], { opacity: 1, duration: 0.35 });
                });
                timeline.to({}, { duration: 1 });
              });
            }
            ScrollTrigger.sort();
            ScrollTrigger.refresh();
          };
          const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(setup);
          };
          window.addEventListener("resize", schedule);
          document.fonts.addEventListener("loadingdone", schedule);
          setup();
          return () => {
            window.removeEventListener("resize", schedule);
            document.fonts.removeEventListener("loadingdone", schedule);
            cancelAnimationFrame(frame);
            animation?.revert();
            delete stage.dataset.includesActive;
          };
        },
      );

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const carousel = root.current?.querySelector<HTMLElement>(`.${styles.workshopCarousel}`);
        if (carousel) {
          gsap.from(carousel, {
            y: 24,
            scale: 0.97,
            opacity: 0.7,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: carousel, start: "top 80%", once: true },
          });
        }

        gsap.utils
          .toArray<HTMLElement>(".for-you-motion li")
          .forEach((item) => {
            gsap.from(item, {
              x: -24,
              autoAlpha: 0,
              duration: 0.65,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 90%", once: true },
            });
          });

        gsap.to(".hero-overlay", {
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#top",
            start: "top top",
            endTrigger: "#main-content",
            end: "top top",
            scrub: 0.4,
          },
        });
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [language], revertOnUpdate: true },
  );

  function submitContact(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const goal = String(formData.get("goal") ?? "").trim();
    const interest =
      text.interests[String(formData.get("interest")) as PlanInterest];
    const message = text.message(name, goal, interest);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    setWhatsAppUrl(url);
    setFormStatus(opened ? text.formStatus : text.formFallbackStatus);
  }

  function choosePlan(
    event: MouseEvent<HTMLAnchorElement>,
    interest: PlanInterest,
  ) {
    event.preventDefault();
    setSelectedInterest(interest);
    nameInput.current?.focus({ preventScroll: true });
    nameInput.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
  }

  function scrollToPageTop(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <main ref={root} className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        {text.skip}
      </a>
      <div className={styles.announcement}>{text.announce}</div>

      <header className={styles.header}>
        <a
          className={styles.wordmark}
          href="#top"
          aria-label="Dancer Method home"
        >
          DANCER <span>METHOD</span>
        </a>
        <nav className={styles.navigation} aria-label={text.navigationLabel}>
          <a href="#method">{text.nav[0]}</a>
          <a href="#plans">{text.nav[1]}</a>
          <a href="#roo">{text.nav[2]}</a>
          <a className={styles.educationLink} href="#education">
            {text.nav[4]}
          </a>
          <a href="#contact">{text.nav[3]}</a>
        </nav>
        <a
          className={styles.languageButton}
          href={language === "es" ? "/en" : "/es"}
          aria-label={`Switch language to ${text.language}`}
        >
          {text.language}
        </a>
      </header>

      <section id="top" className={styles.hero} aria-labelledby="hero-heading">
        <div
          className={`${styles.heroOverlay} hero-overlay`}
          aria-hidden="true"
        />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroGeometry} aria-hidden="true">
          <svg className={styles.heroTriangles} viewBox="0 0 100 100" fill="none">
            <path d="M50 4 97 92H3L50 4Z" />
            <path d="M50 19 84.5 84H15.5L50 19Z" />
          </svg>
          <div className={`${styles.orbit} hero-orbit`}>
            <Image
              src="/img/pose_rosa.webp"
              alt=""
              fill
              preload
              sizes="(max-width: 1023px) 85vw, 58vw"
            />
          </div>
        </div>
        <div className={styles.heroContent}>
          <h1 id="hero-heading" className={styles.heroTitle}>
            <span className={styles.heroLineWrap}>
              <span className={`${styles.heroLine} hero-line`}>
                <span>DANCER</span>
                <span className={styles.heroAccent}>METHOD</span>
              </span>
            </span>
            <span className={styles.heroLineWrap}>
              <span
                className={`${styles.heroLine} ${styles.heroSignature} hero-line`}
              >
                <span className={styles.heroBy}>{text.heroBy}</span>
                <span>ROO</span>
                <span className={styles.heroAccent}>VARELA</span>
              </span>
            </span>
          </h1>
          <div className={`${styles.heroFooter} hero-detail`}>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#method">
                {text.primary}
                <span aria-hidden="true">↘</span>
              </a>
              <a className={styles.secondaryAction} href="#plans">
                {text.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="main-content"
        className={styles.story}
        aria-labelledby="story-heading"
      >
        <div className={`${styles.storyCopy} reveal`}>
          <h2 id="story-heading">{text.storyTitle}</h2>
          {text.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div
          className={`${styles.signal} story-image reveal`}
          aria-hidden="true"
        >
          <div
            className={`${styles.storyFigure} ${styles.storyPole} story-pole`}
          >
            <Image
              className="story-photo"
              src="/img/bailarina_pole.webp"
              alt=""
              fill
              sizes="(max-width: 640px) 54vw, (max-width: 1023px) 50vw, 28vw"
            />
          </div>
          <div className={`${styles.storyFigure} ${styles.storyUsa} story-usa`}>
            <Image
              className="story-photo"
              src="/img/bailarina_frente_bw.webp"
              alt=""
              fill
              quality={90}
              sizes="(max-width: 640px) 90vw, (max-width: 1023px) 78vw, 48vw"
            />
          </div>
        </div>
      </section>

      {showMethodSteps && <section id="method" className={styles.bookStage} data-book-stage aria-label={text.methodStageLabel}>
        <div className={styles.bookTrack} data-book-track>
          {text.methodSteps.map((chapter, index) => (
            <article className={styles.bookPage} key={chapter.title}>
              <div className={styles.bookPageCopy}>
                <span className={styles.bookFolio}>{chapter.number}</span>
                <h2>{chapter.title}</h2>
                <p>{chapter.detail}</p>
              </div>
              <div className={styles.bookPhoto} aria-hidden="true">
                <Image src={chapterImages[index]} alt="" fill sizes="(max-width: 1023px) 100vw, 50vw" />
              </div>
            </article>
          ))}
        </div>
      </section>}

      <section
        id={showMethodSteps ? undefined : "method"}
        className={`${styles.methodIntro} method-motion`}
        aria-labelledby="method-heading"
      >
        <div
          className={`${styles.methodConstellation} method-constellation`}
          aria-hidden="true"
        >
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className={`${styles.methodIntroCopy} reveal`}>
          <h2 id="method-heading">{text.methodTitle}</h2>
          <p className="method-intro-body">{text.methodBody}</p>
          <p
            className={`${styles.methodStageTitle} method-title-reveal`}
            aria-label={text.methodCommitmentTitle}
          >
            {text.methodCommitmentTitle.split(" ").map((word, index) => (
              <span key={`${word}-${index}`} aria-hidden="true">
                <span className={styles.methodTitleWord + " method-title-word"}>
                  {word}
                </span>{" "}
              </span>
            ))}
          </p>
        </div>
        <p
          className={`${styles.methodCommitmentNote} method-commitment-note`}
          aria-label={text.methodCommitmentNote}
        >
          <span aria-hidden="true">
            {text.methodCommitmentNote.split(" ").map((word, index) => (
              <span className="method-note-word" key={`${word}-${index}`}>
                {word}
              </span>
            ))}
          </span>
        </p>
        <ol
          className={`${styles.processList} process-motion`}
          aria-label={text.practiceLabel}
        >
          {text.process.map(([month, title, body, bodyDetail]) => (
            <li key={month}>
              <span>{month}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              {bodyDetail && <p>{bodyDetail}</p>}
            </li>
          ))}
        </ol>
      </section>

      {/* <section
        className={`${styles.horizontalStage} horizontal-stage`}
        aria-label={text.practiceLabel}
      >
        <div className={`${styles.horizontalTrack} horizontal-track`}>
          {text.methodSteps.map((pillar, index) => (
            <article className={`${styles.scene} scene`} key={pillar.title}>
              <span className={`${styles.sceneIndex} scene-index`}>{pillar.number}</span>
              <div className={styles.sceneGraphic} aria-hidden="true">
                <div
                  className={`${styles.sceneImageFrame} ${styles[`imageFrame${index + 1}`]} scene-image-frame`}
                >
                  <Image
                    className="scene-photo"
                    src={pillarImages[index]}
                    alt=""
                    fill
                    sizes="(max-width: 1023px) 70vw, 38vw"
                  />
                </div>
              </div>
              <div className={`${styles.sceneCopy} scene-copy`}>
                <h2>{pillar.title}</h2>
                <p className={styles.sceneDetail}>{pillar.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section> */}

      <section
        className={`${styles.includes} ${styles.bookStage}`}
        data-includes-stage
        aria-labelledby="includes-heading"
      >
        <div className={`${styles.includeList} ${styles.bookTrack}`} data-includes-track>
          <div className={styles.includesCover}>
            <h2 id="includes-heading">{text.includesTitle}</h2>
          </div>
          {[0, 2].map((start) => (
            <div className={styles.includePage} key={start}>
              {text.includes.slice(start, start + 2).map(([title, body], index) => (
                <article className={styles.includeEntry} key={title}>
                  <span className={styles.bookFolio} aria-hidden="true">0{start + index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section
        id="plans"
        className={`${styles.plans} plans-motion`}
        aria-labelledby="plans-heading"
      >
        <div className={`${styles.plansHeading} reveal`}>
          <h2 id="plans-heading">{text.plansTitle}</h2>
          <p>{text.plansIntro}</p>
        </div>
        <div className={styles.planGrid}>
          {text.plans.map((plan) => {
            const isPro = plan.name === "PRO";
            const hasBundle = "bundle" in plan;
            const planInterest = isPro ? "pro" : "essential";

            return (
              <article
                className={`${styles.plan} ${isPro ? styles.featuredPlan : styles.supportPlan} ${isPro ? "featured-plan" : "support-plan"} plan`}
                key={plan.name}
              >
                <div>
                  <div className={styles.planTitleRow}>
                    <div>
                      <p className={styles.planRole}>{plan.role}</p>
                      <h3>{plan.name}</h3>
                    </div>
                    {isPro ? (
                      <span className={`${styles.planBadge} plan-badge`}>
                        {text.planBadge}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.planPriceLine}>
                    <span>{text.planMonthlyLabel}</span>
                    <p className={styles.price}>{plan.price}</p>
                  </div>
                  <p className={styles.planSubtitle}>{plan.subtitle}</p>
                  <p className={styles.planBody}>{plan.body}</p>
                </div>
                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  className={
                    isPro ? styles.planPrimaryAction : styles.planAction
                  }
                  href="#contact"
                  onClick={(event) => choosePlan(event, planInterest)}
                >
                  {plan.cta}
                  <span aria-hidden="true">↘</span>
                </a>
                {hasBundle ? (
                  <div className={styles.bundlePrice}>
                    <div>
                      <p className={styles.bundleEyebrow}>{plan.bundle.eyebrow}</p>
                      <p className={styles.price}>{plan.bundle.price}</p>
                      <p className={`${styles.originalPrice} original-price`}>
                        {plan.bundle.originalPrice}
                      </p>
                    </div>
                    <span className={`${styles.planBadge} plan-badge`}>
                      {plan.bundle.discountLabel}
                    </span>
                    <p className={styles.bundleBody}>{plan.bundle.body}</p>
                    <a
                      className={styles.bundleAction}
                      href="#contact"
                      onClick={(event) => choosePlan(event, "pro")}
                    >
                      {plan.bundle.cta}
                      <span aria-hidden="true">↘</span>
                    </a>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        <div className={`${styles.planGuide} reveal`}>
          <p>{text.interestHint}</p>
          <a
            className={styles.planAction}
            href="#contact"
            onClick={(event) => choosePlan(event, "undecided")}
          >
            {text.interests.undecided}
            <span aria-hidden="true">↘</span>
          </a>
        </div>
      </section>

      <section
        id="roo"
        className={`${styles.roo} roo-motion`}
        aria-labelledby="roo-heading"
      >
        <div className={`${styles.rooPortrait} rooPortrait`} aria-hidden="true">
          <div className={`${styles.rooFigure} rooFigure`}>
            <Image
              className="rooPhoto"
              src="/img/pensativa.webp"
              alt=""
              fill
              sizes="(max-width: 1023px) 86vw, 34vw"
              loading="eager"
            />
          </div>
        </div>
        <div className={`${styles.rooCopy} rooCopy`}>
          <h2 id="roo-heading">{text.rooTitle}</h2>
          {text.rooBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <strong>{text.rooClosing}</strong>
        </div>
      </section>

      <section
        className={`${styles.forYou} for-you-motion`}
        aria-labelledby="for-you-heading"
      >
        <h2 id="for-you-heading" className="reveal">
          {text.forYouTitle}
        </h2>
        <ul>
          {text.forYou.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        id="education"
        className={styles.education}
        aria-labelledby="education-heading"
      >
        <div className={styles.educationIntro}>
          <h2 id="education-heading">{text.education.title}</h2>
          <div>
            <p>{text.education.intro}</p>
            <p className={styles.educationFormat}>{text.education.format}</p>
          </div>
        </div>
        <WorkshopCarousel language={language} />
        <div className={styles.educationTailored}>
          <h3>{text.education.tailoredTitle}</h3>
          <div>
            <p>{text.education.tailoredBody}</p>
            <a
              className={styles.primaryAction}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text.education.message)}`}
              target="_blank"
              rel="noreferrer"
            >
              {text.education.cta}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className={`${styles.contact} contact-motion`}
        aria-labelledby="contact-heading"
      >
        <div className={`${styles.contactHeading} reveal`}>
          <h2 id="contact-heading">{text.contactTitle}</h2>
          <p>{text.contactIntro}</p>
          <div className={`${styles.formFigure}`}>
            <Image
              src="/img/bailarina_sentada.webp"
              alt=""
              fill
              sizes="(max-width: 1023px) 86vw, 28rem"
            />
          </div>
        </div>
        <form
          className={`${styles.contactForm} contactForm reveal`}
          onSubmit={submitContact}
        >
          <label className={styles.fieldGroup}>
            <span>1 · {text.name}</span>
            <input ref={nameInput} name="name" required autoComplete="name" />
          </label>
          <label className={styles.fieldGroup}>
            <span>2 · {text.goal}</span>
            <textarea
              name="goal"
              required
              rows={4}
              aria-describedby="goal-hint"
            />
            <small id="goal-hint">{text.goalHint}</small>
          </label>
          <label className={styles.fieldGroup}>
            <span>3 · {text.interest}</span>
            <select
              name="interest"
              value={selectedInterest}
              onChange={(event) =>
                setSelectedInterest(event.currentTarget.value as PlanInterest)
              }
              aria-describedby="interest-hint"
            >
              <option value="essential">{text.interests.essential}</option>
              <option value="pro">{text.interests.pro}</option>
              <option value="undecided">{text.interests.undecided}</option>
            </select>
            <span className={styles.selectedInterest} aria-hidden="true">{text.interests[selectedInterest]}</span>
            <small id="interest-hint">{text.interestHint}</small>
          </label>
          <button className={styles.primaryAction} type="submit">
            {text.submit}
            <span aria-hidden="true">↗</span>
          </button>
          <p className={styles.formHint}>{text.formHint}</p>
          <p className={styles.formStatus} aria-live="polite">
            {formStatus}
          </p>
          {whatsAppUrl ? (
            <a
              className={styles.formFallback}
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              {text.formFallbackAction}
            </a>
          ) : null}
        </form>
        <div className={`${styles.directContact} directContact reveal`}>
          <p>{text.directContact}</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            {text.whatsapp}
          </a>
          <a href="mailto:dancermethodbyroo@gmail.com">{text.email}</a>
          <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer">
            {text.instagram}
          </a>
        </div>
      </section>

      <footer className={`${styles.footer} footer-motion`}>
        <span>{text.footer}</span>
        <a href="https://app.clickfix.work" target="_blank" rel="noreferrer">
          {text.developedBy} ClickFix
        </a>
        <a href="#top" onClick={scrollToPageTop}>
          {text.backToTop} ↑
        </a>
      </footer>
    </main>
  );
}
