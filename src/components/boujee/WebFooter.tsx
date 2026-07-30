import { Link } from "@tanstack/react-router";

export function WebFooter() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-display text-3xl tracking-[0.25em] text-white">BOUJEE BOOK<sup className="text-xs tracking-normal text-gold">™</sup></div>
          <p className="mt-4 text-sm max-w-xs">The Operating System for Personal Care. Track them. Book them. Love them.™</p>
        </div>
        <div>
          <div className="text-white text-xs uppercase tracking-widest mb-4">Product</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/professionals">Professionals</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/app">Mobile App</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white text-xs uppercase tracking-widest mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/investors">Investors</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white text-xs uppercase tracking-widest mb-4">Legal</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/accessibility">Accessibility</Link></li>
            <li><a href="/privacy#ccpa">Do Not Sell or Share My Personal Information</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 px-6 text-center text-xs text-white/40 space-y-1">
        <div>© {new Date().getFullYear()} Boujee Book Technologies, Inc. All rights reserved.</div>
        <div>68 Jay Street, Brooklyn, NY 11201 · help@boujeebook.app · Map data © OpenStreetMap contributors</div>
      </div>
    </footer>
  );
}
