import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/boujee/LegalPage";

// NOTE FOR OPERATORS: written to match actual product behavior (24h cancellation, $10 late fee,
// license verification, dispute process). Counsel review required before public launch.

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — Boujee Book™" },
    { name: "description", content: "The agreement that governs your use of Boujee Book." },
  ] }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 30, 2026"
      intro={<>These Terms govern your use of Boujee Book, a marketplace that connects customers with independent beauty and wellness professionals. By creating an account you agree to them. Please also read our Privacy Policy.</>}
      sections={[
        {
          heading: "Eligibility & accounts",
          body: (<>
            <p>You must be at least 18 and able to form a binding contract. Keep your credentials confidential — you're responsible for activity on your account. One account per person; don't impersonate anyone. We may suspend accounts that violate these Terms; suspended accounts lose access immediately.</p>
          </>),
        },
        {
          heading: "Boujee Book is a marketplace",
          body: (<>
            <p>Professionals on Boujee Book are <b>independent businesses, not our employees or agents</b>. They set their own prices, services, working hours, and locations, and are solely responsible for performing services, holding the required licenses and insurance, and paying their own taxes. We provide the platform — discovery, booking, messaging, payments, and trust tooling — but we are not a party to the service agreement between a customer and a professional.</p>
          </>),
        },
        {
          heading: "Professional requirements",
          body: (<>
            <p>To offer services you must: hold a valid state license for your craft where required and submit it for verification (the verified badge appears after our review); provide accurate business information; comply with applicable health, sanitation, and cosmetology regulations in your state — including rules on where licensed services may legally be performed; and honor the Boujee Book Sanitation Standard you agree to at onboarding. Background screening is required for professionals offering mobile (in-home) services once screening launches. Misrepresenting licensure is grounds for immediate removal.</p>
          </>),
        },
        {
          heading: "Bookings, cancellations & no-shows",
          body: (<>
            <p>A booking request is confirmed when the professional accepts it. Unconfirmed requests expire automatically at the appointment time. <b>Customers may cancel free of charge up to 24 hours before the appointment</b>; later cancellations may incur a $10 late-cancellation fee once payments launch. Professionals who repeatedly no-show are removed from the platform. Either side can cancel through the app; the other side is notified immediately.</p>
          </>),
        },
        {
          heading: "Payments & fees",
          body: (<>
            <p>Until online payments launch, customers pay professionals directly at the time of service. Once Stripe payments launch: prices shown at booking are charged on confirmation, professionals receive payouts through Stripe Connect, and platform fees will be disclosed before you commit. Boujee Book runs on memberships — professionals keep 100% of their service revenue.</p>
          </>),
        },
        {
          heading: "Live location sharing",
          body: (<>
            <p>Location sharing is optional, off by default, and available only during an active booking. By enabling it you consent to sharing your live position with the other participant of that booking until you stop sharing or the booking ends. Location data is deleted when the booking completes or cancels. Don't use location features while driving in a way that violates traffic law.</p>
          </>),
        },
        {
          heading: "Content & conduct",
          body: (<>
            <p>You're responsible for content you post (reviews, messages, photos, profiles). Don't post anything unlawful, harassing, discriminatory, deceptive, or infringing; don't spam; don't attempt to move bookings off-platform to evade safety features; don't scrape or reverse-engineer the service; don't circumvent rate limits or security. We may remove content and act on reports — every profile and conversation has a report control, you can block other users, and our team reviews reports promptly. Reviews must reflect a genuine booking experience.</p>
          </>),
        },
        {
          heading: "Disputes",
          body: (<>
            <p>If something goes wrong with a booking, open a dispute in the app (Trust & Safety → Dispute center) — our team responds and records a resolution. Disputes between you and a professional about the service itself remain between you and the professional, but we'll assist in good faith and may issue refunds or credits at our discretion once payments launch.</p>
          </>),
        },
        {
          heading: "Disclaimers",
          body: (<>
            <p>The service is provided "as is". We verify professional licenses as described, but we do not guarantee the quality, safety, legality, or outcome of any service performed by an independent professional. Estimated arrival times are approximations. To the fullest extent permitted by law, we disclaim implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          </>),
        },
        {
          heading: "Limitation of liability",
          body: (<>
            <p>To the maximum extent permitted by law, Boujee Book's total liability arising out of these Terms or the service will not exceed the greater of $100 or the amounts you paid us in the 12 months before the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages, or for the acts or omissions of independent professionals or customers. Some jurisdictions don't allow certain limitations, so parts of this section may not apply to you.</p>
          </>),
        },
        {
          heading: "Termination",
          body: (<>
            <p>You can delete your account at any time in Account settings. We may suspend or terminate accounts that violate these Terms, create risk for other users, or are required to be terminated by law. Sections that by their nature should survive (content licenses, disclaimers, liability limits, disputes) survive termination.</p>
          </>),
        },
        {
          heading: "Governing law & changes",
          body: (<>
            <p>These Terms are governed by the laws of the State of New York, without regard to conflict-of-law rules. If we make material changes, we'll notify you in-app or by email before they take effect; continued use after that constitutes acceptance. If any provision is found unenforceable, the rest remain in effect. Contact: <b>help@boujeebook.app</b> · Boujee Book Technologies, Inc., 68 Jay Street, Brooklyn, NY 11201.</p>
          </>),
        },
      ]}
    />
  );
}
