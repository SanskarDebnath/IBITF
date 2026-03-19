import {
  Accessibility,
  BadgeCheck,
  BriefcaseBusiness,
  Cookie,
  HandHeart,
  Handshake,
  HelpCircle,
  Leaf,
  Megaphone,
  PackageCheck,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Undo2,
  UsersRound
} from "lucide-react";

export const footerPageRoutes = [
  { path: "/artisans", pageKey: "artisans" },
  { path: "/sustainability", pageKey: "sustainability" },
  { path: "/press", pageKey: "press" },
  { path: "/careers", pageKey: "careers" },
  { path: "/faq", pageKey: "faq" },
  { path: "/shipping", pageKey: "shipping" },
  { path: "/returns", pageKey: "returns" },
  { path: "/size-guide", pageKey: "sizeGuide" },
  { path: "/privacy", pageKey: "privacy" },
  { path: "/terms", pageKey: "terms" },
  { path: "/cookies", pageKey: "cookies" },
  { path: "/accessibility", pageKey: "accessibility" },
  { path: "/sitemap", pageKey: "sitemap" },
  { path: "/affiliate", pageKey: "affiliate" },
  { path: "/wholesale", pageKey: "wholesale" }
];

export const footerPageContent = {
  artisans: {
    badge: "About",
    title: "Meet the Artisans",
    intro:
      "Tripureswari works with craft communities that carry forward bamboo, cane, wood, and textile traditions across Tripura.",
    highlights: ["Verified craft partners", "Community-first sourcing", "Fair compensation"],
    cards: [
      {
        icon: HandHeart,
        title: "Craft With Identity",
        description:
          "Each collection starts with a real artisan network, not a bulk anonymous supply chain."
      },
      {
        icon: UsersRound,
        title: "Community Partnerships",
        description:
          "We coordinate with self-help groups, craft clusters, and small workshops across the state."
      },
      {
        icon: BadgeCheck,
        title: "Quality Review",
        description:
          "Products are screened for workmanship, finish, and marketplace readiness before listing."
      }
    ],
    sections: [
      {
        title: "How We Work Together",
        description:
          "Our seller and artisan model is built around traceability, practical support, and long-term collaboration.",
        items: [
          "Product onboarding and catalog support for craft makers.",
          "Guidance on pricing, packaging, and order readiness.",
          "Marketplace visibility for heritage and handcrafted products."
        ]
      },
      {
        title: "Why It Matters",
        description:
          "The goal is not only to sell products, but to preserve techniques, stories, and livelihoods that are hard to replace.",
        items: [
          "Traditional methods remain visible to new buyers.",
          "You shop from a marketplace rooted in regional identity.",
          "Craft communities gain repeatable digital demand."
        ]
      }
    ],
    cta: {
      label: "Browse Handcrafted Products",
      to: "/products"
    }
  },
  sustainability: {
    badge: "About",
    title: "Sustainability",
    intro:
      "We focus on materials and workflows that respect local craft systems, responsible sourcing, and low-waste production patterns.",
    highlights: ["Natural materials", "Small-batch production", "Long-life products"],
    cards: [
      {
        icon: Leaf,
        title: "Material Focus",
        description:
          "Bamboo, cane, wood, and textile-led products are prioritized for durability and lower material waste."
      },
      {
        icon: Sparkles,
        title: "Small Batch Craft",
        description:
          "Many products are made in limited runs instead of mass inventory cycles, reducing excess production."
      },
      {
        icon: ShieldCheck,
        title: "Practical Standards",
        description:
          "We encourage clear seller information, transparent stock levels, and manageable fulfillment expectations."
      }
    ],
    sections: [
      {
        title: "What Sustainability Means Here",
        description:
          "For us, sustainability includes both environmental choices and the continuity of viable artisan work.",
        items: [
          "Support materials that are familiar to local craft traditions.",
          "Promote products made to last rather than single-use novelty items.",
          "Keep the marketplace readable so buyers understand what they are purchasing."
        ]
      }
    ],
    cta: {
      label: "Explore Sustainable Categories",
      to: "/products"
    }
  },
  press: {
    badge: "About",
    title: "Press & Media",
    intro:
      "Tripureswari shares updates on artisan stories, product launches, marketplace growth, and regional craft visibility.",
    highlights: ["Press inquiries", "Brand background", "Marketplace updates"],
    cards: [
      {
        icon: Megaphone,
        title: "Media Requests",
        description:
          "For interviews, platform background, or feature requests, our team can help route the right information."
      },
      {
        icon: ShoppingBag,
        title: "Brand Story",
        description:
          "The platform exists to connect Tripura's heritage craft economy with modern digital commerce."
      },
      {
        icon: Store,
        title: "Marketplace Milestones",
        description:
          "Coverage can include new collections, seller onboarding, and product category expansion."
      }
    ],
    sections: [
      {
        title: "What You Can Request",
        description:
          "We can provide background information, visual references, and a concise summary of the marketplace mission.",
        items: [
          "Brand overview and marketplace narrative.",
          "Product and category highlights.",
          "Seller and artisan ecosystem information."
        ]
      }
    ],
    cta: {
      label: "Contact Media Team",
      to: "/contact"
    }
  },
  careers: {
    badge: "About",
    title: "Careers",
    intro:
      "We are building a marketplace around heritage commerce, seller tools, buyer trust, and clearer digital access for artisan products.",
    highlights: ["Product thinking", "Marketplace operations", "Craft commerce"],
    cards: [
      {
        icon: BriefcaseBusiness,
        title: "Marketplace Roles",
        description:
          "Work across catalog operations, seller onboarding, customer experience, and product systems."
      },
      {
        icon: Store,
        title: "Mission-Led Work",
        description:
          "The work combines practical commerce with cultural continuity and better craft visibility."
      },
      {
        icon: UsersRound,
        title: "Cross-Functional Teams",
        description:
          "Design, operations, engineering, and craft partnerships need to move together."
      }
    ],
    sections: [
      {
        title: "Who Might Fit",
        description:
          "We value people who can work clearly in early-stage systems and improve the experience for both buyers and sellers.",
        items: [
          "Product-minded operators and support teams.",
          "People comfortable building structure from ambiguity.",
          "Candidates interested in commerce with regional identity."
        ]
      }
    ],
    cta: {
      label: "Get In Touch",
      to: "/contact"
    }
  },
  faq: {
    badge: "Help",
    title: "Frequently Asked Questions",
    intro:
      "Quick answers for shopping, shipping, seller operations, account access, and order management.",
    highlights: ["Buyer support", "Seller help", "Order guidance"],
    cards: [
      {
        icon: HelpCircle,
        title: "Orders",
        description: "Track placed orders, open order details, and review current status updates."
      },
      {
        icon: Truck,
        title: "Shipping",
        description: "Delivery timelines depend on seller readiness, stock, and shipment processing."
      },
      {
        icon: ShieldCheck,
        title: "Accounts",
        description: "Buyer and seller roles use protected login and verified account flows."
      }
    ],
    sections: [
      {
        title: "Common Questions",
        description: "A few of the most common platform questions are listed below.",
        items: [
          "How do I track an order after checkout? Open My Orders and use Track Order.",
          "How do sellers add products and categories? Use the seller portal Add menu.",
          "Where do I update account information? Use My Account for buyers or Settings for sellers."
        ]
      }
    ],
    cta: {
      label: "Contact Support",
      to: "/contact"
    }
  },
  shipping: {
    badge: "Help",
    title: "Shipping Information",
    intro:
      "Order delivery depends on product availability, packaging readiness, seller processing, and courier movement.",
    highlights: ["Estimated delivery", "Order status flow", "Address guidance"],
    cards: [
      {
        icon: Truck,
        title: "Processing Window",
        description:
          "Orders usually move from placed to processing before shipment updates become visible."
      },
      {
        icon: PackageCheck,
        title: "Address Accuracy",
        description:
          "Accurate shipping information helps avoid delays and failed delivery attempts."
      },
      {
        icon: ShoppingBag,
        title: "Order Review",
        description: "Buyers can revisit order details anytime from the My Orders dashboard."
      }
    ],
    sections: [
      {
        title: "Before You Place an Order",
        description:
          "Check product stock, delivery notes, and payment confirmation carefully before checkout.",
        items: [
          "Verify your delivery address before paying.",
          "Use My Orders for status and timeline updates.",
          "Reach support if a shipment stalls unusually long."
        ]
      }
    ],
    cta: {
      label: "Go to My Orders",
      to: "/account/orders"
    }
  },
  returns: {
    badge: "Help",
    title: "Returns & Exchanges",
    intro:
      "Return and exchange handling depends on the current order state, item condition, and seller processing workflow.",
    highlights: ["Order-status dependent", "Condition review", "Support-assisted"],
    cards: [
      {
        icon: Undo2,
        title: "Return Review",
        description:
          "Requested returns are reviewed against order state and the item's delivery condition."
      },
      {
        icon: ShieldCheck,
        title: "Clear Communication",
        description:
          "Keep product images, order details, and issue notes ready when contacting support."
      },
      {
        icon: Truck,
        title: "Exchange Handling",
        description:
          "Replacement or exchange outcomes depend on stock availability and seller confirmation."
      }
    ],
    sections: [
      {
        title: "Best Practice",
        description:
          "If there is a product issue, open the order first, note the status, and contact support with the order number.",
        items: [
          "Mention the exact order ID and item affected.",
          "Describe the issue clearly and attach photos when possible.",
          "Check whether the order is still placed, shipped, or already delivered."
        ]
      }
    ],
    cta: {
      label: "Contact Support",
      to: "/contact"
    }
  },
  sizeGuide: {
    badge: "Help",
    title: "Size Guide",
    intro:
      "Handcrafted products can vary slightly in dimensions. Always review the product page before ordering.",
    highlights: ["Handmade variation", "Product page dimensions", "Fit and placement planning"],
    cards: [
      {
        icon: Ruler,
        title: "Measure First",
        description:
          "Compare listed dimensions with your space, gift packaging, or intended use before checkout."
      },
      {
        icon: PackageCheck,
        title: "Expect Small Variation",
        description:
          "Handmade items may have minor natural variation compared with factory-perfect sizing."
      },
      {
        icon: ShoppingBag,
        title: "Read Product Details",
        description:
          "Use the product information section and seller details before finalizing the order."
      }
    ],
    sections: [
      {
        title: "How to Use This Guide",
        description:
          "Think about where the product will sit, how it will be used, and whether a handmade tolerance is acceptable.",
        items: [
          "Measure shelf, table, wall, or storage space beforehand.",
          "Review product description and specifications on the listing.",
          "Contact support if a listing needs clearer dimension guidance."
        ]
      }
    ],
    cta: {
      label: "Browse Products",
      to: "/products"
    }
  },
  privacy: {
    badge: "Legal",
    title: "Privacy Policy",
    intro:
      "This page summarizes how the marketplace handles account, order, and session information at a practical level.",
    highlights: ["Account data", "Order records", "Session handling"],
    cards: [
      {
        icon: ShieldCheck,
        title: "Account Data",
        description:
          "Basic profile and login information is used to authenticate users and personalize access."
      },
      {
        icon: ShoppingBag,
        title: "Transaction Data",
        description:
          "Orders, carts, and wishlist data support the core shopping and seller workflows."
      },
      {
        icon: Cookie,
        title: "Session State",
        description:
          "Session and token storage help keep buyers and sellers signed in securely."
      }
    ],
    sections: [
      {
        title: "Practical Summary",
        description:
          "We only surface the data needed to operate the storefront, buyer account pages, and seller portal features.",
        items: [
          "Authentication supports buyer and seller access control.",
          "Order data is used for account history, dashboards, and tracking views.",
          "Contact information is used for support and account-related communication."
        ]
      }
    ],
    cta: {
      label: "Contact Us",
      to: "/contact"
    }
  },
  terms: {
    badge: "Legal",
    title: "Terms of Service",
    intro:
      "These terms explain the practical expectations for buyers, sellers, orders, and marketplace usage.",
    highlights: ["Buyer conduct", "Seller conduct", "Marketplace usage"],
    cards: [
      {
        icon: ShoppingBag,
        title: "Buyer Use",
        description:
          "Buyers are expected to provide accurate details, valid payment information, and responsible order activity."
      },
      {
        icon: Store,
        title: "Seller Use",
        description:
          "Sellers are responsible for truthful listings, accurate stock, and timely order handling."
      },
      {
        icon: ShieldCheck,
        title: "Platform Use",
        description:
          "The marketplace may restrict misuse, abusive activity, or attempts to bypass system rules."
      }
    ],
    sections: [
      {
        title: "Core Principles",
        description:
          "The platform works best when listings, orders, and communication remain clear and verifiable.",
        items: [
          "Keep account information accurate.",
          "Use the platform in good faith.",
          "Respect seller and buyer workflows built into the marketplace."
        ]
      }
    ],
    cta: {
      label: "Read Privacy Summary",
      to: "/privacy"
    }
  },
  cookies: {
    badge: "Legal",
    title: "Cookie Policy",
    intro:
      "Cookies and related storage help the site remember session state, preferences, and essential interface behavior.",
    highlights: ["Essential sessions", "Preferences", "Interface continuity"],
    cards: [
      {
        icon: Cookie,
        title: "Session Continuity",
        description:
          "Authentication and role-based access rely on stored session state and secure refresh flows."
      },
      {
        icon: Sparkles,
        title: "Experience Preferences",
        description:
          "Theme choices and lightweight local preferences improve continuity between visits."
      },
      {
        icon: ShieldCheck,
        title: "Functional Use",
        description:
          "Storage is used for necessary storefront interactions, not decorative complexity."
      }
    ],
    sections: [
      {
        title: "Why This Exists",
        description:
          "Without basic browser storage, sign-in persistence, theme toggles, and order flow continuity would break more often.",
        items: [
          "Access tokens and refresh flows support authenticated features.",
          "Local preferences keep the interface more usable.",
          "Buyer-side convenience features can rely on browser storage."
        ]
      }
    ],
    cta: {
      label: "Back to Home",
      to: "/"
    }
  },
  accessibility: {
    badge: "Legal",
    title: "Accessibility",
    intro:
      "We aim to keep the storefront, account pages, and seller portal readable, keyboard-friendly, and understandable across devices.",
    highlights: ["Responsive layouts", "Readable interfaces", "Practical navigation"],
    cards: [
      {
        icon: Accessibility,
        title: "Readable Layouts",
        description:
          "Pages are designed to remain usable on both desktop and mobile screen sizes."
      },
      {
        icon: ShieldCheck,
        title: "Clear States",
        description:
          "Loading, errors, disabled actions, and status changes should be visible and understandable."
      },
      {
        icon: HelpCircle,
        title: "Continuous Improvement",
        description:
          "We adjust interfaces when navigation or interaction patterns are unclear or brittle."
      }
    ],
    sections: [
      {
        title: "Where Accessibility Matters Most",
        description:
          "Key commerce moments should remain understandable for as many users as possible.",
        items: [
          "Authentication and account access.",
          "Catalog browsing and product detail reading.",
          "Buyer order management and seller portal workflows."
        ]
      }
    ],
    cta: {
      label: "Report an Issue",
      to: "/contact"
    }
  },
  sitemap: {
    badge: "Footer",
    title: "Sitemap",
    intro:
      "A quick map of the main storefront, buyer, seller, support, and policy destinations currently available in the app.",
    highlights: ["Storefront routes", "Account routes", "Footer pages"],
    linkGroups: [
      {
        title: "Storefront",
        links: [
          { label: "Home", to: "/" },
          { label: "All Products", to: "/products" },
          { label: "About", to: "/about" },
          { label: "Contact", to: "/contact" }
        ]
      },
      {
        title: "Buyer",
        links: [
          { label: "Login", to: "/auth/login" },
          { label: "Sign Up", to: "/auth/signup" },
          { label: "My Orders", to: "/account/orders" },
          { label: "Wishlist", to: "/account/wishlist" }
        ]
      },
      {
        title: "Seller",
        links: [
          { label: "Seller Signup", to: "/auth/signup?role=seller" },
          { label: "Seller Dashboard", to: "/seller/dashboard" },
          { label: "Seller KPI", to: "/seller/kpis" },
          { label: "Seller Settings", to: "/seller/settings" }
        ]
      },
      {
        title: "Support & Policy",
        links: [
          { label: "FAQ", to: "/faq" },
          { label: "Shipping Info", to: "/shipping" },
          { label: "Privacy Policy", to: "/privacy" },
          { label: "Terms of Service", to: "/terms" }
        ]
      }
    ],
    cta: {
      label: "Open Catalog",
      to: "/products"
    }
  },
  affiliate: {
    badge: "Footer",
    title: "Affiliate Program",
    intro:
      "We are shaping a marketplace-led referral channel for partners who want to support artisan products and ethical commerce.",
    highlights: ["Referral interest", "Craft storytelling", "Marketplace partnerships"],
    cards: [
      {
        icon: Handshake,
        title: "Potential Partnerships",
        description:
          "Affiliates may include creators, craft advocates, regional promoters, and aligned commerce partners."
      },
      {
        icon: Megaphone,
        title: "Story-Led Promotion",
        description:
          "The strongest affiliate content explains the craft, not just the transaction."
      },
      {
        icon: ShoppingBag,
        title: "Marketplace Focus",
        description:
          "Programs should direct attention toward real products, seller value, and buyer trust."
      }
    ],
    sections: [
      {
        title: "Interested in Collaborating?",
        description:
          "If you want to discuss affiliate or campaign opportunities, contact the team with your audience profile and proposal.",
        items: [
          "Share your channel type and approximate reach.",
          "Mention the product categories you want to promote.",
          "Include your preferred partnership format."
        ]
      }
    ],
    cta: {
      label: "Contact Partnerships",
      to: "/contact"
    }
  },
  wholesale: {
    badge: "Footer",
    title: "Wholesale Inquiries",
    intro:
      "Tripureswari can support larger purchase conversations for institutions, gifting programs, curated retail, and bulk craft sourcing.",
    highlights: ["Bulk orders", "Corporate gifting", "Retail partnerships"],
    cards: [
      {
        icon: Store,
        title: "Retail Supply",
        description:
          "Independent stores and curated retail concepts can explore grouped product sourcing."
      },
      {
        icon: ShoppingBag,
        title: "Bulk Gifting",
        description:
          "Corporate, seasonal, and event gifting requests can be handled through a dedicated conversation."
      },
      {
        icon: PackageCheck,
        title: "Category Planning",
        description:
          "Tell us whether you need decor, gifts, kitchen items, textiles, or mixed assortments."
      }
    ],
    sections: [
      {
        title: "What to Include",
        description:
          "A useful inquiry should clearly describe scale, timing, and product intent.",
        items: [
          "Approximate quantity and delivery timeline.",
          "Preferred categories or example products.",
          "Delivery region and packaging expectations."
        ]
      }
    ],
    cta: {
      label: "Start a Wholesale Conversation",
      to: "/contact"
    }
  }
};
