import type { Metadata } from 'next';
import { LegalArticle } from '@/components/legal-article';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How Swell collects, uses, and deletes account and craving data. We do not sell your data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main>
      <LegalArticle kicker="Effective 19 September 2026" title="Privacy Policy">
        <p>
          Swell (“we”, “us”) is a craving-support app for people quitting smoking or vaping. This policy explains
          what we collect, why, and how you can ask us to delete it. We do not sell your data.
        </p>
        <h2>Who we are</h2>
        <p>
          Operator: NSENTEC / Swell. Contact:{' '}
          <a href="mailto:nilamadhab47@gmail.com">nilamadhab47@gmail.com</a>.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account:</strong> phone number and/or email, name if you give it, and sign-in identifiers from
            Google or Apple.
          </li>
          <li>
            <strong>Quit profile:</strong> habit (cigarettes, vape, or both), why you want to quit, typical daily
            amount, cost, and when you started.
          </li>
          <li>
            <strong>Craving logs:</strong> wins, duration, optional notes, and optional voice recordings / transcripts
            you choose to save.
          </li>
          <li>
            <strong>Device & security:</strong> access/refresh tokens, and basic technical logs needed to run the
            service.
          </li>
        </ul>
        <h2>How we use it</h2>
        <p>
          To create your account, send one-time passcodes, keep score of cravings you beat, compute days clear /
          money reclaimed, and improve reliability. We do not use your notes or recordings for ads. Swell is not a
          medical device and does not give medical advice.
        </p>
        <h2>Who we share with</h2>
        <p>
          Processors that help us run Swell: hosting (Railway), database (Neon), SMS one-time codes (Twilio), email
          one-time codes (SendGrid), Google and Apple if you sign in with them. They only get what they need to
          perform that job.
        </p>
        <h2>Retention</h2>
        <p>
          We keep your account and logs while the account is active. You can ask us to delete your account and
          associated data at <a href="mailto:nilamadhab47@gmail.com">nilamadhab47@gmail.com</a>. We will complete deletion
          within 30 days, except where we must keep a record for legal or security reasons.
        </p>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may request access, correction, or deletion of your personal data, and
          withdraw consent for optional notes or voice. Email us and we will help.
        </p>
        <h2>Children</h2>
        <p>Swell is not directed at children under 16.</p>
        <h2>Changes</h2>
        <p>If this policy changes in a meaningful way, we will update this page and the effective date.</p>
      </LegalArticle>
    </main>
  );
}
