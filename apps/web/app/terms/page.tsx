import type { Metadata } from 'next';
import { LegalArticle } from '@/components/legal-article';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description: 'Terms for using Swell, a consumer wellness app for riding out nicotine cravings. Not a medical treatment.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <main>
      <LegalArticle kicker="Effective 19 September 2026" title="Terms of Use">
        <p>By using Swell you agree to these terms. If you do not agree, do not use the app.</p>
        <h2>What Swell is</h2>
        <p>
          Swell is a wellness tool that helps you ride out nicotine cravings with a short game and a private score.
          It is not a doctor, clinic, or medical device. It does not diagnose, treat, or cure any condition. If you
          need medical help, talk to a qualified clinician.
        </p>
        <h2>Your account</h2>
        <p>
          You must provide accurate sign-in details (phone, email, Google, or Apple). You are responsible for the
          device that stays signed in. Do not share your one-time codes. Optional push reminders are not required
          to use Swell; you can refuse the permission or later disable notifications on the device.
        </p>
        <h2>Acceptable use</h2>
        <ul>
          <li>Use Swell for your own quit journey.</li>
          <li>Do not abuse the OTP or API endpoints, scrape, or reverse the service.</li>
          <li>Do not upload content that is illegal or that you do not have the right to share.</li>
        </ul>
        <h2>The game and stats</h2>
        <p>
          Days clear, money reclaimed, and similar stats are estimates based on what you tell us. They are
          motivational, not a guarantee.
        </p>
        <h2>Availability</h2>
        <p>
          We aim to keep Swell running, but we do not promise uninterrupted service. Features may change as we learn
          what actually helps.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent allowed by law, Swell and its operators are not liable for indirect, incidental, or
          consequential damages, or for health outcomes related to quitting nicotine. Our total liability for any
          claim is limited to the amount you paid us in the 12 months before the claim (currently ₹0 if Swell is
          free).
        </p>
        <h2>Termination</h2>
        <p>
          You can stop using Swell at any time. To delete your account and associated data, email{' '}
          <a href="mailto:nilamadhab47@gmail.com">nilamadhab47@gmail.com</a>. In-app account deletion is not in the
          product yet; until it is, email is the way we honor that request within 30 days. We may suspend accounts
          that abuse the service.
        </p>
        <h2>Contact</h2>
        <p>
          Questions: <a href="mailto:nilamadhab47@gmail.com">nilamadhab47@gmail.com</a>.
        </p>
      </LegalArticle>
    </main>
  );
}
