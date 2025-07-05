import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimations = () => {
  const animationsInitialized = useRef(false);

  useEffect(() => {
    if (animationsInitialized.current) return;

    const initAnimations = () => {
      animationsInitialized.current = true;

      // Set initial states - only hide elements that should animate in
      gsap.set(
        [
          ".hero-badge",
          ".hero-buttons",
          ".stat-item",
          ".feature-card",
          ".step-item",
          ".section-title",
          ".cta-content",
        ],
        {
          opacity: 0,
          y: 30,
        }
      );

      // Keep hero title and subtitle visible by default
      gsap.set([".hero-title", ".hero-subtitle"], {
        opacity: 1,
        y: 0,
      });

      // Hero section animations - immediate and smooth
      const heroTl = gsap.timeline({ delay: 0.3 });

      heroTl
        .to(".hero-badge", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        })
        .to(
          ".hero-buttons",
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );

      // Stats animation - simple fade in on scroll
      gsap.to(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });

      // Features cards - staggered reveal
      gsap.to(".feature-card", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });

      // Section titles - simple fade in
      gsap.utils.toArray(".section-title").forEach((title) => {
        gsap.to(title as Element, {
          scrollTrigger: {
            trigger: title as Element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      });

      // How it works steps
      gsap.to(".step-item", {
        scrollTrigger: {
          trigger: ".how-it-works-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });

      // CTA section
      gsap.to(".cta-content", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // Navbar background - smooth transition
      gsap.to(".navbar", {
        scrollTrigger: {
          trigger: "body",
          start: "top -50px",
          end: "top -100px",
          scrub: 0.5,
          toggleActions: "play none none reverse",
        },
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(12px)",
        duration: 0.3,
        ease: "none",
      });

      // Refresh ScrollTrigger
      ScrollTrigger.refresh();
    };

    // Initialize animations after a short delay
    const timeoutId = setTimeout(initAnimations, 100);

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.killTweensOf("*");
      animationsInitialized.current = false;
    };
  }, []);
};
