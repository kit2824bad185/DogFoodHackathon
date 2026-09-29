export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonth: string;
  priceYear: string;
  billedPeriod: string;
  isPopular?: boolean;
  ctaText: string;
  features: { name: string; included: boolean; detail?: string }[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Hacker Pass',
    tagline: 'Ideal for casual coders wanting to participate in open community competitions.',
    priceMonth: '$0',
    priceYear: '$0',
    billedPeriod: 'Free forever',
    ctaText: 'Start Building Free',
    features: [
      { name: 'Access to open community hackathons', included: true },
      { name: 'Public leaderboard viewing', included: true },
      { name: 'Standard judging queue', included: true },
      { name: 'Community Discord access', included: true },
      { name: 'Unlimited submissions to Plus hackathons', included: false },
      { name: '1-on-1 Mentor & Judge Office Hours', included: false },
      { name: 'Verified Digital Certificate of Completion', included: false },
      { name: 'Detailed Z-Score Statistical Scorecard', included: false },
      { name: 'Direct Sponsor & Recruiter Fast-Track', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'Veyra Hackathon PLUS',
    tagline: 'Unlimited access to 500+ premier hackathons, masterclasses, verified credentials, and hiring fast-tracks.',
    priceMonth: '$29',
    priceYear: '$239',
    billedPeriod: 'per month, billed annually (Save 32%)',
    isPopular: true,
    ctaText: 'Start 7-Day Free Trial',
    features: [
      { name: 'Unlimited access to 500+ premier hackathons', included: true, detail: 'Includes $2.5M+ in prize pools' },
      { name: 'Public & private leaderboard analytics', included: true },
      { name: 'Priority judging with verified feedback', included: true },
      { name: 'Full access to 40+ Masterclass tracks', included: true },
      { name: '1-on-1 Judge & Mentor Office Hours', included: true, detail: '2 sessions per hackathon' },
      { name: 'Tamper-proof Cryptographic Certificate', included: true, detail: 'Sharable on LinkedIn & GitHub' },
      { name: 'Detailed Z-Score Statistical Scorecard', included: true, detail: 'Inspect judge bias & rubric percentiles' },
      { name: 'Direct Recruiter & VC Talent Network', included: true, detail: 'Fast-track interviews with sponsor tech leads' },
    ],
  },
  {
    id: 'enterprise',
    name: 'University & Enterprise',
    tagline: 'Empower student clubs, research labs, and engineering organizations with private hackathons.',
    priceMonth: '$99',
    priceYear: '$890',
    billedPeriod: 'per seat / year',
    ctaText: 'Contact Academic Sales',
    features: [
      { name: 'Everything in Hackathon PLUS', included: true },
      { name: 'Host private internal & university hackathons', included: true },
      { name: 'Custom Rubrics & Multi-Round Normalization', included: true },
      { name: 'Single Sign-On (SSO) & SCIM provisioning', included: true },
      { name: 'Dedicated Hackathon Success Manager', included: true },
      { name: 'Custom Sponsor & Employer Branding', included: true },
      { name: 'Exportable JSON / CSV Audit Logs', included: true },
      { name: 'White-label custom portal domain', included: true },
    ],
  },
];
