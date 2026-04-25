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
  companyName: "John's website",
  heroEyebrow: 'Tech solutions and problem solving',
  heroTitle: "Software development and tutoring services",
  heroBody: "A developer with a broad range of experience including web dev and data engineering and teaching. The roles i've been involved with have ranged from a start-up environment to large corporations and an intensive software development bootcamp as a cohort-lead. I'm open to contract work and tutoring up to advanced higher levels. I also offer coaching for real world practical skills in software development if you're interested in actually relevant skills. I'm also an ex top 5000 Dota 2 player(EU server), sitting around 6.5k MMR now which i'd love to coach people on gaining MMR",
  aboutTitle: "Hi, I'm John",
  aboutBody:
    "I don't quite know what i'm doing with my life, I was working in tech but I got really burnt out, I'm trying to change my relationship with coding and tech to be one that's less associated with being very stressed and anxious so let's call this a sabbatical, if you're seeing this website in it's current state then you're probably a friend, if you are looking for coaching/tutoring then please feel free to contact to me.",
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
  logoSrc: '/small_logo_johnfish.png',
  legalLine: "Thanks for checking out my website, here is some other stuff I did for funzies",
}
