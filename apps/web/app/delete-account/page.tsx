import type { Metadata } from 'next';
import { LegalArticle } from '@/components/legal-article';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Delete your Swell account',
  description:
    'How to delete your Swell account and associated data from the quit-smoking app.',
  path: '/delete-account',
});

export default function DeleteAccountPage() {
  return (
    <main>
      <LegalArticle kicker="Swell account deletion" title="Delete your account and data">
        <p>
          Swell is operated by NSENTEC. You can remove your account and the personal data we store for it using
          either method below.
        </p>
        <h2>Delete in the app (recommended)</h2>
        <ol>
          <li>Open the <strong>Swell</strong> app and sign in.</li>
          <li>Go to <strong>Settings</strong> (bottom navigation).</li>
          <li>Tap <strong>Delete account</strong> and confirm twice.</li>
        </ol>
        <p>
          Deletion is permanent. You will be signed out immediately and cannot recover the account.
        </p>
        <h2>Delete by email</h2>
        <p>
          If you cannot use the app, email{' '}
          <a href="mailto:nilamadhab47@gmail.com">nilamadhab47@gmail.com</a> from the address tied to your
          account (or include the phone number you used to sign in). We will verify the request and complete
          deletion within <strong>30 days</strong>.
        </p>
        <h2>What we delete</h2>
        <p>When your account is deleted, we remove or anonymize, as applicable:</p>
        <ul>
          <li>Your sign-in identifiers (phone, email, and linked sign-in methods)</li>
          <li>Your quit profile (name, quit reason, habit details, and related settings)</li>
          <li>Craving logs (wins, games played, duration, and optional text notes)</li>
          <li>Push notification tokens for your devices</li>
          <li>Active sessions and refresh tokens</li>
        </ul>
        <h2>What we may keep</h2>
        <p>
          We may retain minimal records for legal, security, or fraud-prevention purposes (for example, audit logs
          without your craving content) only as long as required by law. We do not use deleted account data for
          advertising.
        </p>
        <p>
          See our <a href="/privacy">Privacy Policy</a> for more detail.
        </p>
      </LegalArticle>
    </main>
  );
}
