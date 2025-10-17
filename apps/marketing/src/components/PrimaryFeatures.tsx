'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { Terminal } from '@/components/Terminal'
import backgroundImage from '@/images/background-features.jpg'

const features = [
  {
    title: 'Instant Deployments, Globally Cached',
    description:
      'Run `godeploy deploy` and get a live, HTTPS-secured URL — optimized and ready for production. Your app is live at https://my-app.godeploy.app in seconds.',
    commands: [
      {
        command: 'cd my-react-app',
        delay: 800,
      },
      {
        command: 'npm run build',
        delay: 1000,
        output:
          'Creating an optimized production build...\nCompiled successfully.\n\n✓ Done in 3.45s',
      },
      {
        command: 'godeploy deploy',
        delay: 1200,
        output:
          '🚀 Deploying your SPA...\n✓ Uploading build files\n✓ Configuring CDN\n✓ Setting up SSL certificate\n\n🎉 Success! Your app is live at:\nhttps://my-react-app.spa.godeploy.app',
      },
    ],
  },
  {
    title: 'Blazing Fast Hosting, Powered by CDN + Nginx',
    description:
      'Global CDN delivery for super low latency. Auto HTTPS + SSL included. Proper cache headers for hashed assets — fast and efficient.',
    commands: [
      {
        command: 'godeploy package --output ./production',
        delay: 1500,
        output:
          '📦 Packaging your SPA for self-hosting\n✓ Creating Docker container\n✓ Configuring Nginx with production settings\n✓ Setting up proper cache headers\n✓ Enabling gzip compression\n✓ Configuring SSL redirects\n\n✅ Package created in ./deploy\n🔍 Includes:\n  - Dockerfile\n  - nginx.conf (optimized for SPAs)\n  - docker-compose.yml\n  - deploy.sh\n\n⚡ PERFORMANCE COMPARISON:\n  Nginx (GoDeploy)           vs    SSR Frameworks\n  ----------------------------------------\n  ✓ 50,000+ req/sec          vs    ✗ Much slower (V8 overhead)\n  ✓ 1-5ms first byte         vs    ✗ 30-70ms typical\n  ✓ 10,000+ connections      vs    ✗ <500 connections\n  ✓ ~10MB memory footprint   vs    ✗ 100-400MB+ memory\n  ✓ Predictable response     vs    ✗ Variable under load\n  ✓ CDN-optimized caching    vs    ✗ Complex SSR caching',
      },
    ],
  },
  {
    title: 'Stay in Your Stack — No Framework Lock-in',
    description:
      'React, Vue, Angular, Svelte, Vanilla — anything that builds to static. No need to rewrite in Next.js or Nuxt. Just build, run, and deploy.',
    commands: [
      {
        command: 'cd my-vue-app',
        delay: 800,
      },
      {
        command: 'npm run build',
        delay: 1000,
        output: 'Build complete. The dist/ directory is ready to be deployed.',
      },
      {
        command: 'godeploy init',
        delay: 1200,
        output:
          '✨ Creating new GoDeploy configuration\n✓ Created spa-config.json with default settings\n\n📋 Configuration:\n  - Source directory: ./dist\n  - SPA mode: enabled (history routing)\n  - Cache settings: optimized for production',
      },
      {
        command: 'godeploy deploy',
        delay: 1500,
        output:
          '🚀 Deploying your Vue SPA...\n✓ Reading configuration from spa-config.json\n✓ Detected Vue.js project\n✓ Optimizing for production\n\n🎉 Success! Your app is live at:\nhttps://my-vue-app.spa.godeploy.app',
      },
      {
        command: 'cd ../my-angular-app && ng build',
        delay: 1800,
        output:
          'Generating browser application bundles...\nOptimizing and minifying...\nCompiled successfully.',
      },
      {
        command: 'godeploy init --force && godeploy deploy',
        delay: 2100,
        output:
          '✨ Creating new GoDeploy configuration\n✓ Overwriting existing spa-config.json\n\n🚀 Deploying your Angular SPA...\n✓ Reading configuration from spa-config.json\n✓ Detected Angular project\n✓ Optimizing for production\n\n🎉 Success! Your app is live at:\nhttps://my-angular-app.spa.godeploy.app',
      },
    ],
  },
  {
    title: 'One Command, Done.',
    description:
      "No AWS setup. No Cloudflare configuration. No CI/CD pipeline. Just deploy and you're done.",
    commands: [
      {
        command: 'godeploy init --config custom-config.json',
        delay: 800,
        output:
          '✨ Creating custom GoDeploy configuration\n✓ Created custom-config.json with default settings\n\n📋 You can customize:\n  - Source directory\n  - SPA routing settings\n  - Cache configuration\n  - Custom Docker settings',
      },
      {
        command: 'godeploy serve',
        delay: 1200,
        output:
          '🚀 Serving your SPA locally with Docker + Nginx\n✓ Starting container on port 8082\n✓ Configuring SPA routing (history mode)\n✓ Setting production-like environment\n\n🌐 Your app is running at: http://localhost:8082\n💡 Test your app exactly as it will run in production',
      },
      {
        command: 'godeploy package && ls -la deploy/',
        delay: 1800,
        output:
          '📦 Packaging your SPA for self-hosting\n✓ Creating deployment package\n✓ Configuring Nginx with production settings\n✓ Package created in ./deploy\n\ntotal 40\ndrwxr-xr-x  5 user  staff   160 Jul 15 14:22 .\ndrwxr-xr-x  8 user  staff   256 Jul 15 14:22 ..\n-rw-r--r--  1 user  staff   652 Jul 15 14:22 Dockerfile\n-rw-r--r--  1 user  staff   427 Jul 15 14:22 docker-compose.yml\n-rwxr-xr-x  1 user  staff   358 Jul 15 14:22 deploy.sh\n-rw-r--r--  1 user  staff  1258 Jul 15 14:22 nginx.conf',
      },
      {
        command: 'godeploy deploy',
        delay: 2200,
        output:
          '🚀 Deploying your SPA to GoDeploy...\n\n✓ No AWS configuration needed\n✓ No Cloudflare setup required\n✓ No CI/CD pipeline to configure\n✓ No DevOps expertise necessary\n\n🎉 Success! Your app is live at:\nhttps://my-app.spa.godeploy.app',
      },
    ],
  },
]

export function PrimaryFeatures() {
  let [tabOrientation, setTabOrientation] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  )

  useEffect(() => {
    let lgMediaQuery = window.matchMedia('(min-width: 1024px)')

    function onMediaQueryChange({ matches }: { matches: boolean }) {
      setTabOrientation(matches ? 'vertical' : 'horizontal')
    }

    onMediaQueryChange(lgMediaQuery)
    lgMediaQuery.addEventListener('change', onMediaQueryChange)

    return () => {
      lgMediaQuery.removeEventListener('change', onMediaQueryChange)
    }
  }, [])

  return (
    <section
      id="features"
      aria-label="Features for running your books"
      className="relative overflow-hidden bg-indigo-600 pt-20 pb-28 sm:py-32"
    >
      <Image
        className="absolute top-1/2 left-1/2 max-w-none translate-x-[-44%] translate-y-[-42%]"
        src={backgroundImage}
        alt=""
        width={2245}
        height={1636}
        unoptimized
      />
      <Container className="relative">
        <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
            ⚡ Why GoDeploy?
          </h2>
          <p className="mt-6 max-w-5xl text-lg tracking-tight text-indigo-100 md:mx-auto md:text-center">
            For every frontend dev who&apos;s thought: &quot;Why do I need
            Next.js or Remix just to ship a React/Vue/Angular app?&quot;,
            &quot;I hate dealing with AWS, Vercel, or Netlify for a simple
            SPA.&quot;, &quot;Why is deployment harder than building the
            app?&quot;
          </p>
          <p className="mt-4 text-lg tracking-tight text-indigo-100">
            <strong>
              GoDeploy solves this. Simple. Fast. No full-stack lock-in.
            </strong>
          </p>
        </div>
        <TabGroup
          className="mt-16 grid grid-cols-1 items-center gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0"
          vertical={tabOrientation === 'vertical'}
        >
          {({ selectedIndex }) => (
            <>
              <div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
                <TabList className="relative z-10 flex gap-x-4 px-4 whitespace-nowrap sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
                  {features.map((feature, featureIndex) => (
                    <div
                      key={feature.title}
                      className={clsx(
                        'group relative rounded-full px-4 py-1 lg:rounded-l-xl lg:rounded-r-none lg:p-6',
                        selectedIndex === featureIndex
                          ? 'bg-white lg:bg-white/10 lg:ring-1 lg:ring-white/10 lg:ring-inset'
                          : 'hover:bg-white/10 lg:hover:bg-white/5',
                      )}
                    >
                      <h3>
                        <Tab
                          className={clsx(
                            'font-display text-lg data-selected:not-data-focus:outline-hidden',
                            selectedIndex === featureIndex
                              ? 'text-indigo-600 lg:text-white'
                              : 'text-indigo-100 hover:text-white lg:text-white',
                          )}
                        >
                          <span className="absolute inset-0 rounded-full lg:rounded-l-xl lg:rounded-r-none" />
                          {feature.title}
                        </Tab>
                      </h3>
                      <p
                        className={clsx(
                          'mt-2 hidden text-sm lg:block',
                          selectedIndex === featureIndex
                            ? 'text-white'
                            : 'text-indigo-100 group-hover:text-white',
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </TabList>
              </div>
              <TabPanels className="lg:col-span-7">
                {features.map((feature, idx) => (
                  <TabPanel key={feature.title} unmount={false}>
                    <div className="relative sm:px-6 lg:hidden">
                      <div className="absolute -inset-x-4 top-[-6.5rem] bottom-[-4.25rem] bg-white/10 ring-1 ring-white/10 ring-inset sm:inset-x-0 sm:rounded-t-xl" />
                      <p className="relative mx-auto max-w-2xl text-base text-white sm:text-center">
                        {feature.description}
                      </p>
                    </div>
                    <div className="mt-10 flex justify-center overflow-hidden sm:w-auto lg:mt-0">
                      <div className="w-full rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm lg:w-2xl">
                        <Terminal
                          commands={feature.commands}
                          title={
                            idx === 0
                              ? 'Deploy in seconds'
                              : idx === 1
                                ? 'Optimized for performance'
                                : idx === 2
                                  ? 'Framework agnostic'
                                  : 'Zero DevOps'
                          }
                          className="mx-auto w-full max-w-3xl shadow-2xl shadow-indigo-900/20"
                        />
                      </div>
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </>
          )}
        </TabGroup>
      </Container>
    </section>
  )
}
