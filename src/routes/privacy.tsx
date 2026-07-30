import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/boujee/LegalPage";

// NOTE FOR OPERATORS: written to accurately describe what the product does today.
// Have counsel review before public launch, and update the "Last updated" date on any change.

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — Boujee Book™" },
    { name: "description", content: "How Boujee Book collects, uses, and protects your data." },
  ] }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 30, 2026"
      intro={<>This policy explains what Boujee Book ("we", "us") collects, why, and the controls you have. It applies to our website and apps. The short version: we collect what the marketplace needs to work, we don't sell your personal information, live location is shared only during an active booking and deleted when it ends, and you can export or erase your data yourself from Account settings.</>}
      sections={[
        {
          heading: "Information we collect",
          body: (<>
            <p><b>Account.</b> Name, email address, and a hashed password (we never store your password in readable form).</p>
            <p><b>Profile & marketplace activity.</b> Bookings you make or receive, services, prices, reviews and ratings, favorites, messages with the other side of a booking, and — for professionals — the studio profile you publish (name, craft, city, bio, service menu, working hours, license number you provide for verification).</p>
            <p><b>Live location (optional).</b> If you turn on location sharing during an active booking, we process your device's GPS position to show it to the other participant of that booking. See section 3.</p>
            <p><b>Payments.</b> Payments are being rolled out with Stripe. Card details will be collected directly by Stripe and never touch our servers; we will see transaction metadata (amount, status, last four digits).</p>
            <p><b>Device & logs.</b> Standard technical logs (IP address, browser type, timestamps) used for security — for example rate-limiting sign-in attempts.</p>
          </>),
        },
        {
          heading: "How we use information",
          body: (<>
            <p>To run the marketplace: match customers with professionals, process bookings, deliver messages and notifications, display reviews, calculate professional earnings, and verify professional licenses. To keep the platform safe: fraud prevention, rate limiting, content moderation, and enforcing our Terms. To comply with law and respond to lawful requests.</p>
            <p>We do <b>not</b> sell or share your personal information for advertising, and we do not use third-party advertising trackers.</p>
          </>),
        },
        {
          heading: "Live location data",
          id: "location",
          body: (<>
            <p>Location sharing is off by default and only available while a booking is active (confirmed, on the way, or arrived). When you enable it, your position is visible to exactly one person: the other participant of that booking. Positions update while sharing is on and are stored only as your latest position.</p>
            <p>All location data for a booking is <b>permanently deleted the moment the booking is completed or cancelled</b>, and you can stop sharing at any time with one tap. We never use location data for advertising or profiling.</p>
          </>),
        },
        {
          heading: "How information is shared",
          body: (<>
            <p><b>Between users.</b> Customers and professionals see what the marketplace requires: names, profile details, booking details, messages they exchange, reviews, and — when enabled — live location during an active booking.</p>
            <p><b>Service providers.</b> We use a small set of processors to run the service: hosting and database infrastructure, Stripe (payments, at launch), a transactional email provider (account emails), and identity/background-check providers for professional verification (at launch). Processors act under contract and only on our instructions.</p>
            <p><b>Legal.</b> We may disclose information when required by law, to protect users' safety, or in a business transfer (you'd be notified).</p>
          </>),
        },
        {
          heading: "Retention & deletion",
          body: (<>
            <p>We keep account data while your account is active. Live location data is deleted at booking completion (section 3). Password-reset tokens expire after 15 minutes and are single-use. Security logs are retained briefly for abuse prevention.</p>
            <p><b>Delete your account yourself</b> in the app: Profile → Account settings → Delete my account. Your personal information is erased and your name is removed from historical records; anonymized booking records are retained where required for professionals' financial and tax history.</p>
          </>),
        },
        {
          heading: "Your rights",
          body: (<>
            <p>Regardless of where you live, you can: <b>access and export</b> everything we hold about you (Account settings → Download my data — instant JSON export), <b>correct</b> your details, <b>delete</b> your account, and <b>end all sessions</b> ("Sign out everywhere"). If you're in a jurisdiction with specific privacy rights (GDPR, UK GDPR, state laws), these tools plus the contact below are how you exercise them. We respond to requests at help@boujeebook.app within 30 days.</p>
          </>),
        },
        {
          heading: "California notice",
          id: "ccpa",
          body: (<>
            <p>We do not sell your personal information and have not done so in the preceding 12 months; we do not share it for cross-context behavioral advertising. Categories collected are described in section 1; purposes in section 2. California residents may exercise access, deletion, and correction rights via the in-app tools above or help@boujeebook.app. We do not discriminate against you for exercising your rights. Authorized agents may submit requests by email.</p>
          </>),
        },
        {
          heading: "Cookies",
          body: (<>
            <p>We use a single strictly-necessary cookie: your session (so you stay signed in). It is httpOnly and never used for tracking or advertising. Because we use no analytics or advertising cookies, no cookie consent banner is required.</p>
          </>),
        },
        {
          heading: "Security",
          body: (<>
            <p>Passwords are hashed with scrypt. Sessions are httpOnly cookies with server-side revocation. All privileged administrative actions are recorded in an audit log. Sign-in, password reset, messaging, and booking endpoints are rate-limited. Data in transit is encrypted with TLS in production. No system is perfectly secure — if we learn of a breach affecting your data, we will notify you as required by law. Report security issues to security@boujeebook.app.</p>
          </>),
        },
        {
          heading: "Children",
          body: <p>Boujee Book is for adults. You must be 18 or older to create an account. We do not knowingly collect information from anyone under 18; if you believe a minor has an account, contact us and we will delete it.</p>,
        },
        {
          heading: "Changes & contact",
          body: (<>
            <p>If we materially change this policy, we'll notify you in-app or by email before the change takes effect. Questions and requests: <b>help@boujeebook.app</b> · Boujee Book Technologies, Inc., 68 Jay Street, Brooklyn, NY 11201.</p>
          </>),
        },
      ]}
    />
  );
}
