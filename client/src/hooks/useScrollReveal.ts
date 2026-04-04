import { useEffect, useRef } from 'react';

type RevealOptions = {
    threshold?: number;
};

export function useScrollReveal(options: RevealOptions = { threshold: 0.12 }) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rootRef.current) return;

        // Configuration matching initial script.js logic
        const revealMap = [
            { selector: ".feature-box", dir: null },
            { selector: ".card", dir: null },
            { selector: ".contact", dir: null },
            { selector: ".mock-box", dir: "from-right" },
        ];

        // Ensure initially hidden classes are applied correctly before intersection
        revealMap.forEach(({ selector, dir }) => {
            const elements = rootRef.current?.querySelectorAll(selector);
            if (elements) {
               elements.forEach((el: Element) => {
                   el.classList.add("hidden");
                   if (dir) el.classList.add(dir);
               });
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove("hidden", "from-left", "from-right");
                    entry.target.classList.add("show");
                }
            });
        }, options);

        const targetSelectors = ".feature-box, .card, .contact, .mock-box";
        const targetElements = rootRef.current.querySelectorAll(targetSelectors);
        targetElements.forEach((el: Element) => observer.observe(el));

        return () => {
             targetElements.forEach((el: Element) => observer.unobserve(el));
             observer.disconnect();
        };
    }, [options.threshold]);

    return rootRef;
}
