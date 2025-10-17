'use client'

import { useState } from 'react'
import { Container } from '@/components/Container'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const faqs = [
  {
    question: 'What frameworks are supported?',
    answer:
      'Any app that outputs static assets: React, Vue, Svelte, Angular, Vanilla JS, Gatsby, Astro, 11ty, and more.',
  },
  {
    question: 'Can I sign up using the CLI?',
    answer:
      'Yes. Install the CLI, then run:\n\n• godeploy auth sign-up\n• godeploy init\n• npm run build\n• godeploy deploy',
  },
  {
    question: 'Do you support SSR or Next.js server features?',
    answer:
      'No. GoDeploy is purpose-built for SPAs and static exports — simple, fast, and globally cached.',
  },
  {
    question: 'Do you charge for bandwidth?',
    answer:
      'No. We never bill for bandwidth on static sites — global CDN + HTTPS are included on all plans.',
  },
  {
    question: 'What is the upload limit?',
    answer:
      'Each project deployment can be up to 100 MB (compressed build output).',
  },
  {
    question: 'How is storage calculated?',
    answer:
      'By the total size of deploys and previews retained across your projects. Free keeps the last 5 deploys per project; Pro includes more storage and longer retention.',
  },
  {
    question: 'How do custom domains and HTTPS work?',
    answer:
      'Add your domain and point DNS to us. We automatically provision and renew HTTPS certificates.',
  },
  {
    question: 'Can I add team members?',
    answer:
      'Yes — Pro includes team members so you can invite users to your team. Fair use applies; see the Terms of Service for details (invites intended for your organization, not reselling access).',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Yes — start free with 3 projects, 1 custom domain, GoDeploy subdomains, and global CDN + HTTPS (no bandwidth fees). Each project supports 100 MB uploads, with 2 GB total storage and retention of the last 5 deploys per project.',
  },
]

function FaqItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-slate-200 py-6">
      <button
        className="flex w-full items-start justify-between text-left"
        onClick={onClick}
      >
        <span className="text-base leading-7 font-semibold text-slate-900">
          {question}
        </span>
        <span className="ml-6 flex h-7 items-center">
          <ChevronDownIcon
            className={clsx(
              'h-6 w-6 transform text-slate-600 transition duration-200',
              isOpen ? 'rotate-180' : '',
            )}
          />
        </span>
      </button>
      {isOpen && (
        <div className="mt-2 pr-12">
          <p className="text-base leading-7 whitespace-pre-line text-slate-600">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export function Faqs() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <Container>
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base leading-7 font-semibold text-green-500">
            FAQ
          </h2>
          <p
            id="faq-heading"
            className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          >
            Frequently asked questions
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Everything you need to know about deploying SPAs with GoDeploy.
          </p>
        </div>

        <div className="mt-20">
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={index === openIndex}
                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-base leading-7 text-slate-700">
            Ready to deploy?{' '}
            <a
              href="https://auth.godeploy.app"
              className="font-semibold text-green-500 hover:text-green-600"
            >
              Create your free account.
            </a>
          </p>
        </div>
      </div>
    </Container>
  )
}
