"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type SubmitEvent,
} from "react";
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

const pillarImages = [
  "/img/cintura_cerca.png",
  "/img/mano_pelo.png",
  "/img/espalda.png",
] as const;

export default function HomeExperience({
  initialLanguage = "es",
}: HomeExperienceProps) {
  const root = useRef<HTMLElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [selectedInterest, setSelectedInterest] =
    useState<PlanInterest>("undecided");
  const [formStatus, setFormStatus] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const text = lang[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: ".story",
                  start: "top top",
                  end: "+=120%",
                  pin: true,
                  scrub: 0.8,
                },
              })
              .to(".story-image", { scale: 1.2 }, 0)
              .to(".story-pole", { yPercent: -4, xPercent: -1 }, 0)
              .to(".story-usa", { yPercent: -3, xPercent: 1 }, 0);
          }

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

          if (desktop) {
            gsap.utils
              .toArray<HTMLElement>(".horizontal-stage")
              .forEach((stage) => {
                if (stage.classList.contains("method-stage")) return;

                const track =
                  stage.querySelector<HTMLElement>(".horizontal-track");
                const scenes = gsap.utils.toArray<HTMLElement>(
                  stage.querySelectorAll(".scene"),
                );

                if (!track || scenes.length < 2) return;

                const horizontalTween = gsap.timeline({
                  scrollTrigger: {
                    trigger: stage,
                    start: "top top",
                    end: () =>
                      `+=${window.innerWidth * (scenes.length - 0.55)}`,
                    pin: true,
                    scrub: 0.7,
                    anticipatePin: 1,
                  },
                });

                horizontalTween
                  .to(track, {
                    xPercent: -((scenes.length - 1) / scenes.length) * 100,
                    ease: "none",
                    duration: scenes.length - 1,
                  })
                  .to({}, { duration: 0.45 });

                scenes.forEach((scene, index) => {
                  gsap.from(scene.querySelector(".scene-image-frame"), {
                    scale: 0.78,
                    rotation: index % 2 === 0 ? -8 : 8,
                    autoAlpha: 0,
                    ease: "power3.out",
                    scrollTrigger: {
                      trigger: scene,
                      containerAnimation: horizontalTween,
                      start: "left 74%",
                      end: "left 42%",
                      scrub: 0.8,
                    },
                  });

                  gsap.to(scene.querySelector(".scene-photo"), {
                    xPercent: index === 1 ? -5 : 5,
                    yPercent: index === 2 ? -3 : 2,
                    scale: 1.02,
                    ease: "none",
                    scrollTrigger: {
                      trigger: scene,
                      containerAnimation: horizontalTween,
                      start: "left 80%",
                      end: "right 24%",
                      scrub: true,
                    },
                  });
                });
              });
          } else {
            gsap.utils
              .toArray<HTMLElement>(".horizontal-stage")
              .forEach((stage) => {
                gsap.from(stage.querySelectorAll(".scene-image-frame"), {
                  y: 36,
                  scale: 0.9,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  stagger: 0.1,
                  scrollTrigger: {
                    trigger: stage,
                    start: "top 72%",
                    once: true,
                  },
                });
              });
          }

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
                scale: 0.94,
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
                  y: -18,
                  scale: 0.92,
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
            .from(".process-motion .processList li", {
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

          gsap.from(".for-you-motion li", {
            xPercent: -8,
            autoAlpha: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".for-you-motion",
              start: "top 72%",
              once: true,
            },
          });

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
        },
      );

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
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    requestAnimationFrame(() => nameInput.current?.focus());
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
          <a href="#contact">{text.nav[3]}</a>
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
            <Image
              src="/img/pose_rosa.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1023px) 85vw, 58vw"
            />
          </div>
          <div className={styles.ring} />
        </div>
        <div className={styles.heroContent}>
          <h1 id="hero-heading" className={styles.heroTitle}>
            {text.heroLines.map((line) => (
              <span className={styles.heroLineWrap} key={line}>
                <span className={`${styles.heroLine} hero-line`}>{line}</span>
              </span>
            ))}
          </h1>
          <div className={`${styles.heroFooter} hero-detail`}>
            <p>{text.intro}</p>
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
              src="/img/bailarina_pole.png"
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

      <section
        id="method"
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
          <p className={styles.methodStageTitle}>
            {text.methodCommitmentTitle}
          </p>
        </div>
        {/* <section
          className={`${styles.horizontalStage} ${styles.methodStage} horizontal-stage method-stage`}
          aria-label={text.methodStageLabel}
        >
          <div
            className={`${styles.horizontalTrack} ${styles.methodTrack} horizontal-track`}
          >
            {text.methodSteps.map((step, index) => (
              <article
                className={`${styles.scene} ${styles.methodScene} scene method-scene`}
                key={step.title}
              >
                <span className={styles.sceneIndex}>{step.number}</span>
                <div className={styles.sceneGraphic} aria-hidden="true">
                  <div
                    className={`${styles.sceneImageFrame} ${styles[`imageFrame${(index % pillarImages.length) + 1}`]} scene-image-frame`}
                  >
                    <Image
                      className="scene-photo"
                      src={pillarImages[index % pillarImages.length]}
                      alt=""
                      fill
                      sizes="(max-width: 1023px) 70vw, 38vw"
                    />
                  </div>
                </div>

              </article>
            ))}
          </div>
        </section> */}
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
      </section>

      <section
        className={`${styles.horizontalStage} horizontal-stage`}
        aria-label={text.practiceLabel}
      >
        <div className={`${styles.horizontalTrack} horizontal-track`}>
          {text.methodSteps.map((pillar, index) => (
            <article className={`${styles.scene} scene`} key={pillar.title}>
              <span className={styles.sceneIndex}>{pillar.number}</span>
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
              <div className={styles.sceneCopy}>
                <h2>{pillar.title}</h2>
                <p className={styles.sceneDetail}>{pillar.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.includes} includes-motion`}
        aria-labelledby="includes-heading"
      >
        <h2 id="includes-heading" className="reveal">
          {text.includesTitle}
        </h2>
        <div className={styles.includeList}>
          {text.includes.map(([title, body]) => (
            <article
              className={`${styles.includeItem} includeItem`}
              key={title}
            >
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
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
                  {hasBundle ? (
                    <div className={styles.bundlePrice}>
                      <div>
                        <p className={styles.bundleEyebrow}>
                          {plan.bundle.eyebrow}
                        </p>
                        <p className={styles.price}>{plan.bundle.price}</p>
                        <p className={`${styles.originalPrice} original-price`}>
                          {plan.bundle.originalPrice}
                        </p>
                      </div>
                      <div className={styles.bundleActions}>
                        <span className={`${styles.planBadge} plan-badge`}>
                          {plan.bundle.discountLabel}
                        </span>
                        <a
                          className={styles.bundleAction}
                          href="#contact"
                          onClick={(event) => choosePlan(event, "pro")}
                        >
                          {plan.bundle.cta}
                          <span aria-hidden="true">↘</span>
                        </a>
                      </div>
                      <p className={styles.bundleBody}>{plan.bundle.body}</p>
                    </div>
                  ) : null}
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
        className={`${styles.process} process-motion`}
        aria-labelledby="process-heading"
      >
        <div className={`${styles.processHeading} reveal`}>
          <h2 id="process-heading">{text.practiceLabel}</h2>
        </div>
        <ol className={`${styles.processList} processList`}>
          {text.process.map(([month, title, body]) => (
            <li key={month}>
              <span>{month}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
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
              onLoad={() => ScrollTrigger.refresh()}
              sizes="(max-width: 1023px) 86vw, 34vw"
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
        id="contact"
        className={`${styles.contact} contact-motion`}
        aria-labelledby="contact-heading"
      >
        <div className={`${styles.contactHeading} reveal`}>
          <h2 id="contact-heading">{text.contactTitle}</h2>
          <p>{text.contactIntro}</p>
          <div className={`${styles.formFigure}`}>
              <Image
                src="/img/bailarina_sentada.png"
                alt=""
                fill
                onLoad={() => ScrollTrigger.refresh()}
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
          <a href="mailto:varelar617@gmail.com">{text.email}</a>
          <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer">
            {text.instagram}
          </a>
        </div>
      </section>

      <footer className={`${styles.footer} footer-motion`}>
        <span>{text.footer}</span>
        <a href="#top">{text.backToTop} ↑</a>
      </footer>
    </main>
  );
}
