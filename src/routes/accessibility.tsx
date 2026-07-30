import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/boujee/LegalPage";

export const Route = createFileRoute("/accessibility")({
  head: () => ({ meta: [
    { title: "Accessibility — Boujee Book™" },
    { name: "description", content: "Boujee Book's accessibility commitment." },
  ] }),
  component: Accessibility,
});

function Accessibility() {
  return (
    <LegalPage
      title="Accessibility"
      updated="July 30, 2026"
      intro={<>Beauty and wellness are for everyone, and so is Boujee Book. We build toward WCAG 2.1 AA across our website and apps.</>}
      sections={[
        {
          heading: "What we do",
          body: (<>
            <p>Semantic HTML and landmark structure; labelled controls on interactive elements (including icon-only buttons); keyboard-reachable flows for sign-in, search, booking, and messaging; visible focus and reduced reliance on color alone; text alternatives on meaningful images; support for browser and OS text scaling.</p>
          </>),
        },
        {
          heading: "Known limitations",
          body: (<>
            <p>The live tracking map is inherently visual; the same information (status, ETA, and distance) is always presented as text alongside it. Some third-party content (professional portfolio photos) may lack complete descriptions. We review accessibility with each release and are actively closing gaps.</p>
          </>),
        },
        {
          heading: "Tell us what's not working",
          body: (<>
            <p>If anything on Boujee Book is hard to use with assistive technology, email <b>access@boujeebook.app</b>. Include the page and the technology you're using; we prioritize accessibility reports and aim to respond within two business days.</p>
          </>),
        },
      ]}
    />
  );
}
