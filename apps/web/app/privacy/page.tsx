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
            <strong>Account:</strong> phone number and/or email, name if you give it, and (on iOS) Sign in with Apple
            identifiers if you choose that option.
          </li>
          <li>
            <strong>Quit profile:</strong> habit (cigarettes, vape, or both), why you want to quit, typical daily
            amount, cost, and when you started.
          </li>
          <li>
            <strong>Craving logs:</strong> wins, duration, the game you played, and optional text notes you choose to
            save.
          </li>
          <li>
            <strong>Notifications:</strong> if you allow alerts, an Expo push token for this device, plus optional
            platform and timezone so we can send at a reasonable hour.
          </li>
          <li>
            <strong>Device & security:</strong> access/refresh tokens, and basic technical logs needed to run the
            service.
          </li>
        </ul>
        <h2>How we use it</h2>
        <p>
          To create your account, send one-time passcodes, keep score of cravings you beat, compute days clear /
          money reclaimed, and (if you opted in) send one or two short reminder notifications a day. Reminder copy
          may be personalized with your name, days clear, and quit reason. We do not use your notes for ads. Swell
          is not a medical device and does not give medical advice.
        </p>
        <h2>Who we share with</h2>
        <p>
          Processors that help us run Swell: hosting (Railway), database (Neon), SMS one-time codes (Twilio), email
          one-time codes (SendGrid), push delivery (Expo), optional reminder wording (Anthropic), and Apple if you use
          Sign in with Apple on iOS. They only get what they need to perform that job.
        </p>
        <h2>Retention</h2>
        <p>
          We keep your account and logs while the account is active. Push tokens stay until you sign out, disable
          notifications, or delete the account. You can delete your account in the app (Settings → Delete account),
          or email <a href="mailto:nilamadhab47@gmail.com">nilamadhab47@gmail.com</a>. We will complete deletion
          within 30 days, except where we must keep a record for legal or security reasons.
        </p>
        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may request access, correction, or deletion of your personal data, and
          withdraw consent for optional notes or notifications. Email us and we will help.
        </p>
        <h2>Children</h2>
        <p>Swell is not directed at children under 16.</p>
        <h2>Changes</h2>
        <p>If this policy changes in a meaningful way, we will update this page and the effective date.</p>
      </LegalArticle>
    </main>
  );
}
