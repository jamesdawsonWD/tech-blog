import type { Metadata } from "next/types";
import ObfuscatedEmail from "@/components/obfuscated-email";
import "../articles/article-styles.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Penumbra Compliance LTD",
  description: "Privacy policy for Glasgow Bins by Penumbra Compliance LTD.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Effective date: 31 March 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-base leading-relaxed">
          <p>
            Glasgow Bins is a free application provided by{" "}
            <strong>Penumbra Compliance LTD</strong>. This privacy policy
            explains how we handle information when you use our app.
          </p>

          <h2 className="text-xl font-semibold">The short version</h2>
          <p>
            We do not collect, store, or process any personal data. We do not
            track you. We do not use cookies. We do not have accounts, logins, or
            user profiles. There is nothing to delete because there is nothing to
            collect.
          </p>

          <h2 className="text-xl font-semibold">Data collection</h2>
          <p>
            Glasgow Bins does not collect any personal information. We do not
            gather names, email addresses, location data, device identifiers, or
            any other information that could be used to identify you.
          </p>

          <h2 className="text-xl font-semibold">Analytics and tracking</h2>
          <p>
            We do not use any analytics services, tracking pixels, or
            third-party scripts. Your usage of the app is entirely private.
          </p>

          <h2 className="text-xl font-semibold">Cookies</h2>
          <p>
            Glasgow Bins does not use cookies or any other local storage
            mechanisms to track users.
          </p>

          <h2 className="text-xl font-semibold">Third-party services</h2>
          <p>
            The app displays bin collection schedules sourced from publicly
            available Glasgow City Council data. No personal data is sent to any
            third party.
          </p>

          <h2 className="text-xl font-semibold">Donations</h2>
          <p>
            Glasgow Bins is entirely free. We offer an optional &ldquo;donate to
            support&rdquo; button. If you choose to donate, the payment is
            processed by a third-party payment provider and is subject to their
            own privacy policy. We do not receive or store any payment details.
          </p>

          <h2 className="text-xl font-semibold">Children&rsquo;s privacy</h2>
          <p>
            Because we do not collect any data from anyone, we do not knowingly
            collect data from children.
          </p>

          <h2 className="text-xl font-semibold">Changes to this policy</h2>
          <p>
            If we update this policy, we will post the revised version on this
            page with a new effective date.
          </p>

          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            If you have any questions about this privacy policy, you can contact
            us at{" "}
            <ObfuscatedEmail user="hello" domain="jamesdawson.dev" className="underline" />.
          </p>
        </div>
      </main>
    </div>
  );
}
