# GoDeploy Frontend Developers Campaign

## Overview

**Campaign Type**: Landing Page + Signup
**Launch Date**: Immediate (Ready for Customer Acquisition)
**Status**: Active

## Strategic Objectives

- Primary Goal: Convert frontend developers to paid subscribers ($149/year)
- Target Conversion Rate: 10% signup to paid conversion
- Monthly Traffic Target: 5,000 visitors
- Cost per Acquisition Target: $15 (optimized from previous $20)

## Target Audience

### Primary Persona: The Pure Frontend Developer

- Role: Mid to Senior Frontend Developer
- Age Range: 25-40
- Pain Points:
  1. Frustrated with complex deployment processes requiring DevOps knowledge
  2. Tired of framework lock-in (Next.js, Remix) just to deploy a simple SPA
  3. Wants to focus on building UIs, not configuring AWS or CI/CD
  4. Feels deployment overhead is disproportionate to actual app complexity
- Motivations:
  1. Simplify workflow and ship products faster
  2. Maintain independence from full-stack frameworks
  3. Deliver high-performance SPAs without the DevOps overhead
  4. Stay in control of their tech stack choices

## Value Proposition

### Primary Message

Deploy your SPA in seconds — no AWS, no DevOps, no full-stack nonsense.

### Key Benefits

1. **Simplicity**: One command deployment with zero configuration
2. **Freedom**: No framework lock-in, use any SPA technology
3. **Performance**: Global CDN + Nginx for blazing fast hosting
4. **Time Savings**: Eliminates DevOps overhead completely

### Emotional Triggers

1. **Frustration Relief**: End the deployment headaches that steal productive time
2. **Autonomy**: Reclaim control over your tech stack without framework lock-in
3. **Pride**: Ship production-ready apps without needing backend expertise
4. **Nostalgia**: Return to the simpler "golden age of SPAs" while keeping modern benefits

## Product Specifics ()

- **Pricing**: $149/year for unlimited projects (no credit card to get started)
- **Free Tier**: OSS CLI available for self-hosting via `godeploy package`
- **URL Format**: `https://my-app--tenant-123.spa.godeploy.app`
- **Technology**: Go CLI, DigitalOcean Spaces/CDN, Nginx proxy
- **Features**: One-command deploy, HTTPS, CDN, SPA routing support

## Analytics Setup

### Mixpanel Implementation

- [ ] Basic tracking script implemented with token: ebb47f6d4701506aba26200dd42d8f11
- [ ] Core conversion events configured ( Signup)
- [ ] User identification setup
- [ ] Super properties defined
- [ ] A/B testing parameters set for hero messaging
- [ ] Value proposition interaction tracking
- [ ] Pricing tier selection tracking

### Core Events to Track

1. **Page & Session Events**

   - `Page View` - Every page visit with referrer and UTM data
   - `Session Start` - First interaction in new session
   - `Scroll Depth` - Track 25%, 50%, 75%, 100% scroll points

2. **Engagement Events**

   - `Value Prop Interaction` - User engages with specific value proposition
   - `CTA Click` - User clicks on "Join" Or "Sign up" or "Get Started" buttons
   - `Comparison Table View` - User views the GoDeploy vs Vercel/Netlify comparison
   - `Code Snippet View` - User views deployment command examples
   - `Pricing View` - User views pricing section
   - `OSS Option View` - User explores the free self-hosted option

3. **Conversion Events**

   - `Form Start` - User begins filling the signup form
   - `Form Submit` - User submits the signup form
   - `Signup` - Successful registration
   - `Pricing Selection` - User selects a pricing tier
   - `Payment Intent` - User begins payment process
   - `Github Star` - User clicks to star the GitHub repo

4. **Testing & Segmentation**
   - `Campaign View` - User arrives from specific campaign
   - `Experiment Viewed` - User sees A/B test variant
   - `User Identify` - Capture user email/identity
   - `Framework Preference` - Track user's preferred framework

### Key Performance Indicators (KPIs)

1. Primary Metrics
   - Signup to Paid Conversion Rate
   - Cost per Paid Subscriber
   - Customer Lifetime Value (projected at $149/year)
2. Secondary Metrics
   - Value Proposition Engagement Rate
   - CTA Click-through Rate
   - Github Star Rate
   - Pricing Section Engagement

## Budget & ROI Tracking

### Monthly Budget Allocation

- Paid Search (Google/Bing): $2,000
- Social Media (Twitter/LinkedIn): $1,500
- Developer Communities (Dev.to, Hashnode): $1,000
- Content Creation: $1,500
- Total: $6,000

### ROI Metrics

- Customer Lifetime Value (CLV): $298 (2-year average subscription)
- Average Revenue Per User: $149/year
- Sales Cycle Length: 7 days from signup to payment
- ROI Target: 300% (increased from previous 250%)

## Technical Implementation

### Performance Metrics

- Mobile Load Time: < 1.5 seconds
- Desktop Load Time: < 1 second
- Core Web Vitals Status: Pass all metrics

### Dependencies

- Framework: Next.js with Tailwind CSS (Salient template)
- Analytics: Mixpanel
- Third-party Services: GitHub OAuth (for easy signup), Stripe for payments

## Development Notes

This landing page is built using the Salient template, which is a [Tailwind Plus](https://tailwindcss.com/plus) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

### Local Development

To get started with development:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

### Key Sections to Implement

1. Hero section with primary messaging and CTA
2. "Why GoDeploy?" section highlighting pain points
3. "What You'll Get" featuring the command-line simplicity (`godeploy deploy`)
4. CLI commands section showing actual command examples
5. Comparison table vs Vercel/Netlify
6. Pricing section ($149/year vs free OSS option)
7. FAQ section addressing objections
8. Signup form (email + GitHub integration + framework preference)

## Weekly Optimization Checklist

- [ ] Review Mixpanel funnel conversion rates
- [ ] Check value proposition engagement
- [ ] Review A/B test performance
- [ ] Optimize landing page speed
- [ ] Review ad performance by source
- [ ] Track signup to paid conversion rate
- [ ] Update content based on engagement data

## Notes & Updates

- Product is now ready for customer acquisition
- Pricing finalized at $149/year for unlimited projects
- Free OSS CLI option available for self-hosting
- URL format confirmed as `https://my-app--tenant-123.spa.godeploy.app`

---

Last Updated: Current Date
