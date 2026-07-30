// Boujee Book investor deck generator. Rebuild: node generate-deck.cjs
const pptxgen = require("pptxgenjs");

const SHOTS = "/Users/tech/workspace/boujee-book/public/screenshots";
const OUT = "/Users/tech/workspace/boujee-book/deck/boujee-book-pitch.pptx";

// Brand
const INK = "1C1A17";
const INK_SOFT = "2A2724";
const GOLD = "D4A843";
const CREAM = "F5F0E8";
const WHITE = "FFFFFF";
const MUTED = "6E675E";
const HEAD = "Cambria";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

// phone screenshot aspect: 780x1688 → w = h * 0.4621
const phoneW = (h) => h * 0.4621;

/** Screenshot with an ink "phone" frame. */
function phone(slide, name, x, y, h) {
  const w = phoneW(h);
  const pad = 0.055;
  slide.addShape("roundRect", {
    x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2,
    fill: { color: INK }, rectRadius: 0.16,
    shadow: { type: "outer", color: "000000", opacity: 0.35, blur: 12, offset: 4, angle: 90 },
  });
  slide.addImage({ path: `${SHOTS}/${name}.png`, x, y, w, h });
  return w;
}

function goldDot(slide, x, y, d, label) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: GOLD } });
  slide.addText(label, {
    x: x - 0.1, y, w: d + 0.2, h: d, align: "center", valign: "middle",
    fontFace: HEAD, fontSize: d >= 0.5 ? 16 : 13, bold: true, color: INK, margin: 0,
  });
}

function footer(slide, n, dark = false) {
  slide.addText(`BOUJEE BOOK™  ·  CONFIDENTIAL`, {
    x: 0.55, y: 7.08, w: 4, h: 0.3, fontFace: BODY, fontSize: 8,
    color: dark ? "8A857D" : "B4AC9F", charSpacing: 2, margin: 0,
  });
  slide.addText(String(n), {
    x: 12.5, y: 7.08, w: 0.3, h: 0.3, fontFace: BODY, fontSize: 8,
    color: dark ? "8A857D" : "B4AC9F", align: "right", margin: 0,
  });
}

// ---------------------------------------------------------------- 1 · Title
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("TRACK THEM · BOOK THEM · LOVE THEM™", {
    x: 0.8, y: 1.7, w: 7.2, h: 0.4, fontFace: BODY, fontSize: 12, color: GOLD, charSpacing: 6, margin: 0,
  });
  s.addText([
    { text: "BOUJEE BOOK", options: { color: WHITE } },
    { text: "™", options: { color: GOLD, fontSize: 20 } },
  ], { x: 0.8, y: 2.1, w: 7.6, h: 1.2, fontFace: HEAD, fontSize: 60, bold: true, charSpacing: 4, margin: 0 });
  s.addText("The Operating System for Personal Care.", {
    x: 0.8, y: 3.35, w: 7.2, h: 0.6, fontFace: HEAD, fontSize: 24, italic: true, color: "D8D2C6", margin: 0,
  });
  s.addText("Book licensed beauty professionals. Watch them arrive like a ride-share.\nZero commission — pros keep 100%.", {
    x: 0.8, y: 4.15, w: 6.6, h: 0.9, fontFace: BODY, fontSize: 14, color: "B8B2A6", margin: 0, lineSpacing: 20,
  });
  s.addText("Pre-Seed  ·  July 2026  ·  help@boujeebook.app", {
    x: 0.8, y: 6.4, w: 6, h: 0.4, fontFace: BODY, fontSize: 12, color: "8A857D", margin: 0,
  });
  phone(s, "tracking", 9.6, 0.75, 6.0);
  s.addNotes("Opening: Boujee Book brings the Uber playbook to the $95B personal-care economy. This is a real screenshot of the working product — live GPS tracking of your barber on the way to you.");
}

// ---------------------------------------------------------------- 2 · Problem
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText("Personal care still runs on DMs and no-shows.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const rows = [
    ["1", "Discovery is fragmented", "Finding a great barber or lash tech means Instagram archaeology, screenshots, and word of mouth. There is no trusted, licensed marketplace."],
    ["2", "Booking is phone tag", "DMs, missed calls, double-booked slots. Independent pros spend hours a week coordinating instead of working."],
    ["3", "No-shows and blind waits", "Clients don't know if the pro is coming; pros eat the cost when clients ghost. Neither side has visibility after booking."],
    ["4", "Platforms tax the pro", "Existing booking apps charge commissions and fees, squeezing solo professionals who already run on thin margins."],
  ];
  rows.forEach((r, i) => {
    const y = 1.65 + i * 1.32;
    goldDot(s, 0.62, y + 0.06, 0.5, r[0]);
    s.addText(r[1], { x: 1.45, y, w: 4.4, h: 0.62, fontFace: HEAD, fontSize: 19, bold: true, color: INK, margin: 0, valign: "top" });
    s.addText(r[2], { x: 6.1, y, w: 6.6, h: 1.2, fontFace: BODY, fontSize: 13.5, color: MUTED, margin: 0, valign: "top", lineSpacing: 18 });
  });
  footer(s, 2);
  s.addNotes("Frame the pain from both sides: customers can't find/trust/track; professionals lose income to coordination overhead, no-shows, and platform take-rates.");
}

// ---------------------------------------------------------------- 3 · Solution
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  s.addText("One app. Both sides. Ride-share polish.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const h = 4.1;
  const names = ["home", "booking", "tracking"];
  const labels = ["Discover licensed pros", "Book real openings in five taps", "Watch them arrive — live"];
  let x = 0.85;
  names.forEach((n, i) => {
    const w = phone(s, n, x, 1.55, h);
    s.addText(labels[i], { x: x - 0.35, y: 5.85, w: w + 0.7, h: 0.4, align: "center", fontFace: BODY, fontSize: 12.5, bold: true, color: INK, margin: 0 });
    x += w + 0.55;
  });
  const bx = x + 0.25;
  const points = [
    ["Book like a ride", "Real-time availability with server-enforced conflict prevention. Double-booking is impossible."],
    ["Track like a delivery", "Two-way live GPS during active bookings: on my way, arrived, done — with ETA."],
    ["Priced like a friend", "Zero commission. Pros keep 100% of service revenue; the platform runs on memberships."],
  ];
  points.forEach((p, i) => {
    const y = 1.75 + i * 1.55;
    s.addShape("roundRect", { x: bx, y, w: 12.78 - bx, h: 1.32, fill: { color: WHITE }, rectRadius: 0.09, line: { color: "E5DFD2", width: 1 } });
    s.addText(p[0], { x: bx + 0.25, y: y + 0.14, w: 12.3 - bx, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(p[1], { x: bx + 0.25, y: y + 0.52, w: 12.25 - bx, h: 0.72, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, lineSpacing: 15 });
  });
  footer(s, 3);
  s.addNotes("These are live product screenshots, not mockups. The three pillars: booking without phone tag, tracking without blind waits, pricing without commissions.");
}

// ---------------------------------------------------------------- 4 · Differentiator: live tracking
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("No one else lets you watch your stylist arrive.", {
    x: 0.55, y: 0.55, w: 8.3, h: 1.2, fontFace: HEAD, fontSize: 32, bold: true, color: WHITE, margin: 0,
  });
  const feats = [
    ["Two-way live GPS", "Client sees the pro approaching; the pro sees exactly where the house call is. Both opt in per booking."],
    ["Journey statuses", "Confirmed → on my way → arrived → done. Every step notifies the other side instantly."],
    ["Live ETA & distance", "Real map, real position, honest arrival estimate — like every delivery app your users already trust."],
    ["Privacy-first by design", "Location shares only during an active booking and is permanently deleted the moment it ends."],
  ];
  feats.forEach((f, i) => {
    const y = 2.05 + i * 1.22;
    s.addShape("ellipse", { x: 0.62, y: y + 0.03, w: 0.16, h: 0.16, fill: { color: GOLD } });
    s.addText(f[0], { x: 1.0, y: y - 0.08, w: 6.6, h: 0.4, fontFace: HEAD, fontSize: 17, bold: true, color: GOLD, margin: 0 });
    s.addText(f[1], { x: 1.0, y: y + 0.3, w: 7.2, h: 0.75, fontFace: BODY, fontSize: 12.5, color: "C9C3B8", margin: 0, lineSpacing: 16 });
  });
  phone(s, "tracking", 9.55, 0.62, 6.2);
  footer(s, 4, true);
  s.addNotes("This is the wedge feature. Booksy and StyleSeat are calendars; Glamsquad is an agency. None offer consumer-grade live tracking. It converts anxiety (is my pro coming?) into delight, and it's already built.");
}

// ---------------------------------------------------------------- 5 · Product for pros
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText("Pros get a business-in-a-box. Free to run.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const h = 4.55;
  phone(s, "pro-dashboard", 0.95, 1.6, h);
  phone(s, "pro-earnings", 3.35, 1.85, h);
  const bx = 6.15;
  const items = [
    ["Self-serve onboarding", "License capture, service menu, working hours — live and bookable the same day."],
    ["Anti-chaos calendar", "Availability rules enforced server-side; requests expire; one-tap confirm."],
    ["A real client CRM", "Visit history, favorite services, and lifetime value for every client, built automatically."],
    ["Earnings that make sense", "Daily / weekly / monthly revenue, top services, CSV statements for tax time."],
    ["100% of their money", "Zero commission — the platform monetizes memberships, not the pro's labor."],
  ];
  items.forEach((p, i) => {
    const y = 1.62 + i * 1.02;
    goldDot(s, bx, y + 0.02, 0.4, String(i + 1));
    s.addText(p[0], { x: bx + 0.62, y: y - 0.05, w: 6.0, h: 0.38, fontFace: HEAD, fontSize: 15.5, bold: true, color: INK, margin: 0 });
    s.addText(p[1], { x: bx + 0.62, y: y + 0.3, w: 6.35, h: 0.6, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, lineSpacing: 15 });
  });
  footer(s, 5);
  s.addNotes("Supply side is the constraint in every services marketplace. Our pitch to pros is unbeatable: a full booking + CRM + earnings stack, zero take-rate. Screenshots are the live pro dashboard and earnings screens.");
}

// ---------------------------------------------------------------- 6 · Trust & safety
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText("Trust is engineered in, not promised.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const cards = [
    ["License verification", "Pros submit state licenses; an admin trust queue reviews before the verified badge appears."],
    ["Moderation built-in", "Report any profile or conversation; block users; admin queues with audit-logged actions."],
    ["Dispute resolution", "In-app dispute center; human review; resolution recorded and messaged to the customer."],
    ["Hardened platform", "Rate-limited auth, hashed credentials, session controls, security headers, full audit log."],
    ["Data rights, instant", "One-tap data export and account deletion — GDPR / CCPA / App Store compliant."],
    ["Location privacy", "GPS shared only during active bookings, deleted at completion. No ad trackers anywhere."],
  ];
  cards.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.55 + col * 4.18, y = 1.62 + row * 2.55;
    s.addShape("roundRect", { x, y, w: 3.95, h: 2.3, fill: { color: CREAM }, rectRadius: 0.1 });
    s.addShape("ellipse", { x: x + 0.28, y: y + 0.28, w: 0.5, h: 0.5, fill: { color: GOLD } });
    s.addText(String(i + 1), { x: x + 0.18, y: y + 0.28, w: 0.7, h: 0.5, align: "center", valign: "middle", fontFace: HEAD, fontSize: 15, bold: true, color: INK, margin: 0 });
    s.addText(c[0], { x: x + 0.28, y: y + 0.95, w: 3.4, h: 0.4, fontFace: HEAD, fontSize: 15.5, bold: true, color: INK, margin: 0 });
    s.addText(c[1], { x: x + 0.28, y: y + 1.32, w: 3.42, h: 0.9, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0, lineSpacing: 14 });
  });
  footer(s, 6);
  s.addNotes("Trust features are usually a seed-stage promise; here they're shipped: license queue, moderation, disputes, audit logs, data rights. This also clears App Store review requirements (UGC moderation, account deletion).");
}

// ---------------------------------------------------------------- 7 · Market
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  s.addText("A massive market still booked over DMs.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const stats = [
    ["~$95B", "US personal-care services spend (est.)", "Hair, barbering, nails, skin, lashes, massage — recession-resilient and habitual."],
    ["~1.4M", "US beauty & wellness professionals (est.)", "A majority independent or booth-renting — exactly who a 0% platform serves."],
    ["~$18B", "Serviceable: urban mobile-first bookings (est.)", "Metro clients who already live in Uber, DoorDash, and Instagram."],
  ];
  stats.forEach((t, i) => {
    const x = 0.55 + i * 4.18;
    s.addShape("roundRect", { x, y: 1.75, w: 3.95, h: 3.3, fill: { color: WHITE }, rectRadius: 0.1, line: { color: "E5DFD2", width: 1 } });
    s.addText(t[0], { x: x + 0.3, y: 2.1, w: 3.35, h: 0.9, fontFace: HEAD, fontSize: 44, bold: true, color: GOLD, margin: 0 });
    s.addText(t[1], { x: x + 0.3, y: 3.05, w: 3.35, h: 0.6, fontFace: BODY, fontSize: 13, bold: true, color: INK, margin: 0, lineSpacing: 16 });
    s.addText(t[2], { x: x + 0.3, y: 3.7, w: 3.35, h: 1.2, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, lineSpacing: 15 });
  });
  s.addText("Wedge: launch city-by-city with mobile-capable pros (house calls), where live tracking matters most and word of mouth is strongest.", {
    x: 0.55, y: 5.55, w: 12.2, h: 0.8, fontFace: HEAD, fontSize: 16, italic: true, color: INK, margin: 0, lineSpacing: 22,
  });
  s.addText("Market figures are directional estimates from public industry data; detailed sourcing available in diligence.", {
    x: 0.55, y: 6.5, w: 12.2, h: 0.35, fontFace: BODY, fontSize: 9.5, color: MUTED, margin: 0,
  });
  footer(s, 7);
  s.addNotes("Keep TAM honest: ~$95B US services spend is a widely-cited ballpark; the wedge is urban mobile-first bookings. City-by-city density beats national thinness.");
}

// ---------------------------------------------------------------- 8 · Business model
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText("Memberships, not commissions.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const tiers = [
    ["Customer Basic", "$9.99/mo", "Unlimited booking, reviews, reminders"],
    ["Customer Elite", "$29.99/mo", "Priority windows, cancellation protection, rewards"],
    ["Pro Basic", "$9.99/mo", "Calendar, messaging, standard payouts"],
    ["Pro Elite", "$29.99/mo", "Instant payouts, featured placement, higher daily volume"],
  ];
  tiers.forEach((t, i) => {
    const y = 1.6 + i * 1.06;
    s.addShape("roundRect", { x: 0.55, y, w: 5.8, h: 0.9, fill: { color: i % 2 ? INK : CREAM }, rectRadius: 0.08 });
    s.addText(t[0], { x: 0.85, y: y + 0.12, w: 3.0, h: 0.35, fontFace: HEAD, fontSize: 14.5, bold: true, color: i % 2 ? GOLD : INK, margin: 0 });
    s.addText(t[2], { x: 0.85, y: y + 0.46, w: 4.1, h: 0.35, fontFace: BODY, fontSize: 10.5, color: i % 2 ? "C9C3B8" : MUTED, margin: 0 });
    s.addText(t[1], { x: 4.85, y, w: 1.35, h: 0.9, align: "right", valign: "middle", fontFace: HEAD, fontSize: 16, bold: true, color: i % 2 ? WHITE : INK, margin: 0 });
  });
  s.addText("0% take-rate is the supply-acquisition weapon: pros bring their books — and their clients — with them.", {
    x: 0.55, y: 6.05, w: 5.9, h: 0.9, fontFace: HEAD, fontSize: 14, italic: true, color: INK, margin: 0, lineSpacing: 19,
  });
  s.addChart(pres.ChartType.bar, [
    { name: "Membership ARR (illustrative)", labels: ["Year 1", "Year 2", "Year 3"], values: [0.4, 2.1, 6.8] },
  ], {
    x: 6.85, y: 1.55, w: 5.95, h: 4.6, barDir: "col",
    chartColors: [GOLD], showLegend: false,
    showTitle: true, title: "Illustrative membership ARR ($M)", titleFontFace: HEAD, titleFontSize: 14, titleColor: INK,
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontFace: BODY, dataLabelFontSize: 11, dataLabelFormatCode: "$0.0\"M\"",
    catAxisLabelColor: MUTED, catAxisLabelFontFace: BODY, catAxisLabelFontSize: 11,
    valAxisLabelColor: MUTED, valAxisLabelFontFace: BODY, valAxisLabelFontSize: 10, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
  });
  s.addText("Illustrative model, not a forecast — assumes city-by-city rollout with blended ~$14/mo ARPU across the four tiers.", {
    x: 6.85, y: 6.2, w: 5.9, h: 0.45, fontFace: BODY, fontSize: 9.5, color: MUTED, margin: 0, lineSpacing: 12,
  });
  footer(s, 8);
  s.addNotes("Subscription economics: predictable revenue, no take-rate fights, and the 0% commission story recruits supply. The chart is explicitly illustrative — swap with your live numbers post-launch.");
}

// ---------------------------------------------------------------- 9 · Competition
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText("Calendars, agencies, and DMs — nobody owns the full loop.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 30, bold: true, color: INK, margin: 0,
  });
  const cols = ["", "Boujee Book", "Booksy / StyleSeat", "Glamsquad", "Instagram DMs"];
  const rows = [
    ["Two-way live GPS tracking", "YES", "—", "—", "—"],
    ["Commission on pro revenue", "0%", "Fees + charges", "Agency margin", "0%"],
    ["License verification", "YES", "Partial", "In-house staff", "—"],
    ["Real-time availability", "YES", "YES", "YES", "—"],
    ["Both-sides consumer app", "YES", "Pro-first", "Client-first", "—"],
    ["Disputes & moderation", "YES", "Basic", "Internal", "—"],
  ];
  const colX = [0.55, 4.35, 6.65, 8.95, 11.0];
  const colW = [3.7, 2.2, 2.2, 1.95, 1.8];
  // Layer order matters: zebra stripes, then the highlight column, then all text.
  rows.forEach((_, i) => {
    if (i % 2 === 0) {
      const y = 2.35 + i * 0.75;
      s.addShape("rect", { x: 0.45, y: y - 0.06, w: 12.45, h: 0.62, fill: { color: "F7F3EB" } });
    }
  });
  s.addShape("roundRect", { x: 4.25, y: 1.5, w: 2.25, h: 5.35, fill: { color: INK }, rectRadius: 0.1 });
  cols.forEach((c, i) => {
    if (!c) return;
    s.addText(c, { x: colX[i], y: 1.6, w: colW[i], h: 0.6, fontFace: HEAD, fontSize: i === 1 ? 14 : 12, bold: true, color: i === 1 ? GOLD : INK, margin: 0, valign: "middle" });
  });
  rows.forEach((r, i) => {
    const y = 2.35 + i * 0.75;
    s.addText(r[0], { x: colX[0], y, w: colW[0], h: 0.5, fontFace: BODY, fontSize: 12, color: INK, margin: 0, valign: "middle" });
    for (let c = 1; c < 5; c++) {
      s.addText(r[c], {
        x: colX[c], y, w: colW[c], h: 0.5, fontFace: BODY, fontSize: 12,
        bold: c === 1, color: c === 1 ? GOLD : MUTED, margin: 0, valign: "middle",
      });
    }
  });
  footer(s, 9);
  s.addNotes("Booksy/StyleSeat are pro-side calendars with fees; Glamsquad is a managed agency (thin margins, limited supply); DMs are free but chaotic. The full loop — discovery, booking, tracking, trust, zero commission — is unclaimed.");
}

// ---------------------------------------------------------------- 10 · Where we are
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  s.addText("The product isn't a promise. It's built.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const done = [
    "Three shipped surfaces: customer app, pro studio, admin console",
    "Live two-way GPS tracking with journey statuses and ETA",
    "Availability engine — double-booking is impossible",
    "Self-serve pro onboarding with license verification queue",
    "Messaging, reviews, favorites, notifications — all live",
    "Disputes, reporting, blocking, audit-logged moderation",
    "Security hardening: rate limits, session controls, headers",
    "Data export & account deletion (App Store / GDPR ready)",
  ];
  done.forEach((d, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.55 + col * 4.6, y = 1.7 + row * 1.08;
    s.addShape("ellipse", { x, y: y + 0.05, w: 0.3, h: 0.3, fill: { color: GOLD } });
    s.addText("✓", { x: x - 0.06, y: y + 0.05, w: 0.42, h: 0.3, align: "center", valign: "middle", fontFace: BODY, fontSize: 12, bold: true, color: INK, margin: 0 });
    s.addText(d, { x: x + 0.45, y, w: 4.05, h: 0.95, fontFace: BODY, fontSize: 12.5, color: INK, margin: 0, valign: "top", lineSpacing: 16 });
  });
  phone(s, "search", 10.15, 1.55, 4.6);
  s.addText("Next 60 days: Stripe payments + payouts, media uploads, production deploy, first-city pro recruitment.", {
    x: 0.55, y: 6.25, w: 9.0, h: 0.7, fontFace: HEAD, fontSize: 15, italic: true, color: INK, margin: 0, lineSpacing: 20,
  });
  footer(s, 10);
  s.addNotes("Traction slide for a pre-launch company = execution velocity. The entire platform in this deck is functional today; remaining launch work is integrations (Stripe, storage, email), not product invention.");
}

// ---------------------------------------------------------------- 11 · Roadmap
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText("Roadmap to a category brand.", {
    x: 0.55, y: 0.5, w: 12.2, h: 0.75, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0,
  });
  const phases = [
    ["NOW", "Launch", "Web launch city #1 · Stripe payments & Connect payouts · pro recruitment engine"],
    ["Q4 2026", "Mobile", "iOS + Android apps (App Store / Play) · push notifications · memberships live"],
    ["H1 2027", "Density", "Cities 2–5 · background checks & insurance partners · referral loops"],
    ["H2 2027", "Moat", "AI concierge booking · dynamic pricing tools for pros · B2B (salon suites, hotels)"],
  ];
  s.addShape("line", { x: 1.05, y: 2.2, w: 10.9, h: 0, line: { color: "E5DFD2", width: 2 } });
  phases.forEach((p, i) => {
    const x = 0.75 + i * 3.05;
    s.addShape("ellipse", { x: x + 0.95, y: 2.02, w: 0.36, h: 0.36, fill: { color: i === 0 ? GOLD : WHITE }, line: { color: GOLD, width: 2 } });
    s.addText(p[0], { x, y: 2.6, w: 2.7, h: 0.4, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 2, margin: 0, align: "center" });
    s.addText(p[1], { x, y: 3.0, w: 2.7, h: 0.5, fontFace: HEAD, fontSize: 20, bold: true, color: INK, margin: 0, align: "center" });
    s.addText(p[2], { x: x + 0.1, y: 3.6, w: 2.5, h: 1.7, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, align: "center", lineSpacing: 16 });
  });
  s.addText("Every phase compounds the same flywheel: more verified pros → better selection → more clients → fuller books → more pros.", {
    x: 1.3, y: 5.9, w: 10.7, h: 0.8, fontFace: HEAD, fontSize: 15, italic: true, color: INK, margin: 0, align: "center", lineSpacing: 21,
  });
  footer(s, 11);
  s.addNotes("Sequence: prove one city, go mobile for retention, then density and moat features. The Capacitor path reuses the shipped codebase for the app stores.");
}

// ---------------------------------------------------------------- 12 · Ask
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("The Ask", { x: 0.8, y: 0.7, w: 6, h: 0.5, fontFace: BODY, fontSize: 13, color: GOLD, charSpacing: 5, margin: 0 });
  s.addText("Raising $1.5M pre-seed.", {
    x: 0.8, y: 1.15, w: 8.4, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: WHITE, margin: 0,
  });
  s.addText("18 months of runway to launch, reach paid-membership revenue, and make city #1 undeniable.", {
    x: 0.8, y: 2.15, w: 7.3, h: 0.7, fontFace: BODY, fontSize: 14, color: "C9C3B8", margin: 0, lineSpacing: 19,
  });
  const funds = [
    ["40%", "Product & mobile", "Stripe rails, iOS/Android apps, uploads, realtime"],
    ["25%", "Supply", "Recruit and verify the first 500 professionals"],
    ["20%", "Growth", "City-level launch marketing and referral loops"],
    ["15%", "Trust & ops", "Verification, background checks, support"],
  ];
  funds.forEach((f, i) => {
    const x = 0.8 + i * 2.95;
    s.addShape("roundRect", { x, y: 3.15, w: 2.7, h: 2.35, fill: { color: INK_SOFT }, rectRadius: 0.1, line: { color: "3A362F", width: 1 } });
    s.addText(f[0], { x: x + 0.25, y: 3.35, w: 2.2, h: 0.65, fontFace: HEAD, fontSize: 30, bold: true, color: GOLD, margin: 0 });
    s.addText(f[1], { x: x + 0.25, y: 4.05, w: 2.2, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, margin: 0 });
    s.addText(f[2], { x: x + 0.25, y: 4.45, w: 2.25, h: 0.95, fontFace: BODY, fontSize: 10.5, color: "B8B2A6", margin: 0, lineSpacing: 14 });
  });
  s.addText([
    { text: "BOUJEE BOOK", options: { color: WHITE, bold: true } },
    { text: "™  ·  Track Them · Book Them · Love Them™  ·  help@boujeebook.app", options: { color: "8A857D" } },
  ], { x: 0.8, y: 6.35, w: 11.5, h: 0.4, fontFace: BODY, fontSize: 12, charSpacing: 1, margin: 0 });
  s.addNotes("Adjust the raise amount and allocation to your actual plan before sending — the structure is what matters: integrations + supply + one-city proof. Close on the demo: the product works today.");
}

pres.writeFile({ fileName: OUT }).then(() => console.log("written", OUT));
