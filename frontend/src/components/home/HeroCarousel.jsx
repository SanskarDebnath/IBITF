import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function HeroCarousel({ slides = [], intervalMs = 3500 }) {
    const safeSlides = useMemo(() => (Array.isArray(slides) ? slides : []), [slides]);
    const [index, setIndex] = useState(0);

    const hasSlides = safeSlides.length > 0;

    useEffect(() => {
        if (!hasSlides) return;

        const id = setInterval(() => {
            setIndex((prev) => (prev + 1) % safeSlides.length);
        }, intervalMs);

        return () => clearInterval(id);
    }, [hasSlides, intervalMs, safeSlides.length]);

    if (!hasSlides) return null;

    const active = safeSlides[index];

    const goPrev = () => setIndex((prev) => (prev - 1 + safeSlides.length) % safeSlides.length);
    const goNext = () => setIndex((prev) => (prev + 1) % safeSlides.length);

    return (
        <section className="hero" aria-label="Promotional banners">
            <div className="hero__media">
                <img src={active.image} alt={active.title} className="hero__img" />

                <div className="hero__overlay">
                    <h2 className="hero__title">{active.title}</h2>
                    <p className="hero__subtitle">{active.subtitle}</p>

                    <div className="hero__actions">
                        <Link to={active.ctaLink} className="hero__cta">
                            {active.ctaText}
                        </Link>

                        <div className="hero__nav">
                            <button type="button" onClick={goPrev} aria-label="Previous banner">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button type="button" onClick={goNext} aria-label="Next banner">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className="hero__dots" role="tablist" aria-label="Banner selector">
                        {safeSlides.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={i === index ? "hero__dot hero__dot--active" : "hero__dot"}
                                onClick={() => setIndex(i)}
                                aria-label={`Go to banner ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
