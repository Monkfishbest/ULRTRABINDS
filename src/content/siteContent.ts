export interface SiteLink {
  href: string
  label: string
  value: string
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
}

export const siteContent: SiteContent = {
  companyName:`John's website`,
  heroEyebrow: 'hey casper ;)',
  heroTitle: 'this is the hero title',
  heroBody:
    "This is the hero body, ",
  aboutTitle: "I'm John, I don't quite know what i'm doing with my life",
  aboutBody:
    "I was working in tech but I got really burnt out, I'm trying to change my relationship with coding and tech to be one that's less associated with being very stressed and anxious",
  contactLinks: [
    {
      label: 'Email',
      value: 'shetlandjohnmcneill@hotmail.co.uk',
      href: 'mailto:shetlandjohnmcneill@hotmail.co.uk',
    },
    {
      label: 'GitHub',
      value: 'github.com/monkfishbest',
      href: 'https://github.com/monkfishbest',
    },
  ],
  logoAlt: 'a fish jumping out of water with a laptop with some terminal feedback',
  logoSrc: "/public/logo_large_johnfish.png",
  legalLine: "Enjoy your meal, you too! -_-'",
}
