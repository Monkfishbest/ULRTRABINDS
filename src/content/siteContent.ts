export interface SiteLink {
  href: string
  label: string
  value: string
}

export interface SiteService {
  description: string
  title: string
}

export interface SiteContent {
  aboutBody: string
  aboutTitle: string
  companyName: string
  contactLinks: SiteLink[]
  heroBody: string
  heroEyebrow: string
  heroTitle: string
  legalLine?: string | null
  logoAlt: string
  logoSrc?: string | null
  services: SiteService[]
}

export const siteContent: SiteContent = {
  companyName: 'Your Company Name',
  heroEyebrow: 'Independent contract development',
  heroTitle: 'Build calmer systems, ship faster, and keep complexity under control.',
  heroBody:
    'Practical software delivery for teams that need a senior engineer who can design, implement, and own the details without adding unnecessary process.',
  services: [
    {
      title: 'Product engineering',
      description:
        'Ship user-facing features with clean frontend architecture, thoughtful UX, and maintainable implementation.',
    },
    {
      title: 'Technical cleanup',
      description:
        'Untangle brittle code paths, reduce delivery friction, and simplify systems that have become expensive to change.',
    },
    {
      title: 'Delivery support',
      description:
        'Provide focused contract help on greenfield work, refactors, internal tools, and feature completion.',
    },
  ],
  aboutTitle: 'About',
  aboutBody:
    'This site is designed for a one-person limited company offering hands-on software development. The emphasis is on reliable execution, clear communication, and code that stays understandable after handover.',
  contactLinks: [
    {
      label: 'Email',
      value: 'hello@yourcompany.dev',
      href: 'mailto:hello@yourcompany.dev',
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/your-profile',
      href: 'https://www.linkedin.com/in/your-profile',
    },
    {
      label: 'GitHub',
      value: 'github.com/your-handle',
      href: 'https://github.com/your-handle',
    },
  ],
  logoAlt: 'Company logo placeholder',
  logoSrc: null,
  legalLine: null,
}
