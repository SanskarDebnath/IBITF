import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { footerPageContent } from "./footerPageContent";
import "./FooterContentPage.css";

export default function FooterContentPage({ pageKey }) {
  const content = footerPageContent[pageKey];

  if (!content) return null;

  return (
    <div className="footer-content-page">
      <section className="footer-content-hero">
        <div className="footer-content-hero__copy">
          <span className="footer-content-badge">{content.badge}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>

          {content.highlights?.length ? (
            <div className="footer-content-highlights">
              {content.highlights.map((highlight) => (
                <span key={highlight} className="footer-content-chip">
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="footer-content-hero__aside">
          <div className="footer-content-hero__card">
            <h2>Need the next step?</h2>
            <p>
              These footer routes now resolve to real pages so buyers and sellers can move through
              the marketplace without dead links.
            </p>
            <Link to={content.cta?.to || "/"} className="footer-content-primary-link">
              <span>{content.cta?.label || "Back to Home"}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content.cards?.length ? (
        <section className="footer-content-card-grid">
          {content.cards.map(({ icon: Icon, title, description }) => (
            <article key={title} className="footer-content-card">
              <div className="footer-content-card__icon">
                <Icon size={20} />
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>
      ) : null}

      {content.sections?.length ? (
        <section className="footer-content-section-grid">
          {content.sections.map((section) => (
            <article key={section.title} className="footer-content-section-card">
              <div className="footer-content-section-card__head">
                <h2>{section.title}</h2>
                <ChevronRight size={18} />
              </div>
              <p>{section.description}</p>
              {section.items?.length ? (
                <ul className="footer-content-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {content.linkGroups?.length ? (
        <section className="footer-content-sitemap">
          {content.linkGroups.map((group) => (
            <article key={group.title} className="footer-content-sitemap__group">
              <h2>{group.title}</h2>
              <div className="footer-content-sitemap__links">
                {group.links.map((link) => (
                  <Link key={link.to} to={link.to} className="footer-content-sitemap__link">
                    <span>{link.label}</span>
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
