import { Clock3, Mail, MapPin, Phone, ShieldCheck, Store, UsersRound } from "lucide-react";
import "./ContactPage.css";

const supportCards = [
  {
    icon: Mail,
    title: "Email Support",
    detail: "support@tripureswari.com",
    note: "Best for account help, order questions, and general support."
  },
  {
    icon: Phone,
    title: "Phone Assistance",
    detail: "+91 123 456 7890",
    note: "Useful for urgent order follow-up and seller coordination."
  },
  {
    icon: MapPin,
    title: "Regional Presence",
    detail: "Agartala, Tripura, India",
    note: "Tripureswari is rooted in Tripura's craft and marketplace ecosystem."
  }
];

const contactReasons = [
  {
    icon: UsersRound,
    title: "Buyer Support",
    points: [
      "Order updates and tracking help",
      "Product and listing clarifications",
      "Account or wishlist assistance"
    ]
  },
  {
    icon: Store,
    title: "Seller Support",
    points: [
      "Seller portal and product management",
      "Category creation and order issues",
      "Dashboard, KPI, or settings help"
    ]
  },
  {
    icon: ShieldCheck,
    title: "Platform Assistance",
    points: [
      "Login or access problems",
      "Policy and trust concerns",
      "General marketplace questions"
    ]
  }
];

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero__copy">
          <span className="contact-hero__badge">Support</span>
          <h1>Contact the Tripureswari team.</h1>
          <p>
            Whether you are shopping, tracking an order, or managing a seller account, this page
            gives you one clear place to start.
          </p>
        </div>

        <div className="contact-hero__meta">
          <div className="contact-meta-card">
            <Clock3 size={18} />
            <div>
              <strong>Response Window</strong>
              <span>Usually within 1-2 business days</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-grid">
        {supportCards.map(({ icon: Icon, title, detail, note }) => (
          <article key={title} className="contact-card">
            <div className="contact-card__icon">
              <Icon size={20} />
            </div>
            <h2>{title}</h2>
            <strong>{detail}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <section className="contact-reasons">
        {contactReasons.map(({ icon: Icon, title, points }) => (
          <article key={title} className="contact-reason-card">
            <div className="contact-reason-card__head">
              <div className="contact-card__icon">
                <Icon size={20} />
              </div>
              <h2>{title}</h2>
            </div>
            <ul>
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
