export type Pro = {
  id: string; name: string; craft: string; city: string;
  rating: number; reviews: number; years: number; price: number; distance: number;
  avatar: string; cover: string; tags: string[]; bio: string; elite?: boolean; verified?: boolean;
  services: { name: string; price: number; mins: number }[];
  portfolio: string[]; certifications: string[];
  mobile: boolean; inShop: boolean;
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop&q=80`;

export const PROS: Pro[] = [
  { id: "amara-cole", name: "Amara Cole", craft: "Hair Stylist", city: "Brooklyn, NY",
    rating: 4.97, reviews: 412, years: 9, price: 140, distance: 1.2, elite: true, verified: true,
    avatar: u("1544005313-94ddf0286df2"), cover: u("1560066984-138dadb4c035"),
    tags: ["Color", "Curls", "Bridal"],
    bio: "Color specialist focused on dimensional brunettes and curl integrity.",
    services: [{ name: "Cut & Style", price: 140, mins: 60 }, { name: "Full Color", price: 280, mins: 150 }, { name: "Balayage", price: 360, mins: 180 }],
    portfolio: [u("1522337360788-8b13dee7a37e"), u("1521146764736-56c929d59c83"), u("1605497788044-5a32c7078486"), u("1503951914875-452162b0f3f1")],
    certifications: ["NY Cosmetology License", "Redken Certified"], mobile: true, inShop: true },
  { id: "marcus-vega", name: "Marcus Vega", craft: "Barber", city: "Los Angeles, CA",
    rating: 4.95, reviews: 638, years: 12, price: 75, distance: 0.6, elite: true, verified: true,
    avatar: u("1507081323647-4d250478b919"), cover: u("1599351431202-1e0f0137899a"),
    tags: ["Fades", "Beards", "Hot Towel"],
    bio: "Precision fades and traditional straight-razor shaves.",
    services: [{ name: "Signature Cut", price: 75, mins: 45 }, { name: "Skin Fade + Beard", price: 110, mins: 60 }, { name: "Hot Towel Shave", price: 65, mins: 30 }],
    portfolio: [u("1622286342621-4bd786c2447c"), u("1503951914875-452162b0f3f1"), u("1599351431202-1e0f0137899a"), u("1605497788044-5a32c7078486")],
    certifications: ["CA Barber License"], mobile: false, inShop: true },
  { id: "saiko-tanaka", name: "Saiko Tanaka", craft: "Nail Technician", city: "San Francisco, CA",
    rating: 4.99, reviews: 281, years: 6, price: 95, distance: 2.4, verified: true,
    avatar: u("1580489944761-15a19d654956"), cover: u("1604654894610-df63bc536371"),
    tags: ["Gel-X", "Nail Art"],
    bio: "Japanese spa-style mani with custom hand-painted art.",
    services: [{ name: "Gel-X Full Set", price: 95, mins: 75 }, { name: "Spa Pedicure", price: 75, mins: 60 }],
    portfolio: [u("1604654894610-df63bc536371"), u("1632345031435-8727f6897d53"), u("1599948128020-9a44505b58a3"), u("1610992015732-2449b76344bc")],
    certifications: ["CA Nail Tech License"], mobile: true, inShop: true },
  { id: "leila-okafor", name: "Leila Okafor", craft: "Makeup Artist", city: "Atlanta, GA",
    rating: 4.98, reviews: 327, years: 8, price: 220, distance: 3.1, elite: true, verified: true,
    avatar: u("1531746020798-e6953c6e8e04"), cover: u("1487412947147-5cebf100ffc2"),
    tags: ["Bridal", "Editorial"],
    bio: "Editorial-grade makeup with a soft-glam signature.",
    services: [{ name: "Soft Glam", price: 220, mins: 75 }, { name: "Bridal Day-of", price: 650, mins: 180 }],
    portfolio: [u("1487412947147-5cebf100ffc2"), u("1503236823255-94609f598e71"), u("1522337360788-8b13dee7a37e"), u("1503951914875-452162b0f3f1")],
    certifications: ["MAC Pro"], mobile: true, inShop: false },
  { id: "rio-fernandez", name: "Rio Fernandez", craft: "Lash Technician", city: "Miami, FL",
    rating: 4.96, reviews: 519, years: 5, price: 180, distance: 1.8, verified: true,
    avatar: u("1494790108377-be9c29b29330"), cover: u("1583241800698-9c2e09f7c9d3"),
    tags: ["Volume", "Hybrid"],
    bio: "Lightweight Russian volume sets that last.",
    services: [{ name: "Classic Set", price: 180, mins: 120 }, { name: "Volume Set", price: 260, mins: 150 }, { name: "Fill (2 wk)", price: 95, mins: 60 }],
    portfolio: [u("1583241800698-9c2e09f7c9d3"), u("1487412947147-5cebf100ffc2"), u("1531746020798-e6953c6e8e04"), u("1503236823255-94609f598e71")],
    certifications: ["FL Cosmetology"], mobile: false, inShop: true },
  { id: "noah-bennett", name: "Noah Bennett", craft: "Massage Therapist", city: "Austin, TX",
    rating: 4.94, reviews: 203, years: 11, price: 160, distance: 4.2, verified: true,
    avatar: u("1535713875002-d1d0cf377fde"), cover: u("1544161515-4ab6ce6db874"),
    tags: ["Deep Tissue", "Sports"],
    bio: "Sports + deep tissue. Travels with heated table.",
    services: [{ name: "60 min Deep Tissue", price: 160, mins: 60 }, { name: "90 min Sports", price: 230, mins: 90 }],
    portfolio: [u("1544161515-4ab6ce6db874"), u("1540555700478-4be289fbecef"), u("1591343395082-e120087004b4"), u("1559599101-f09722fb4948")],
    certifications: ["NCBTMB", "TX LMT"], mobile: true, inShop: true },
];

export const CATEGORIES = [
  { key: "barber", label: "Barbers", emoji: "💈" },
  { key: "hair", label: "Hair", emoji: "💇" },
  { key: "nails", label: "Nails", emoji: "💅" },
  { key: "makeup", label: "Makeup", emoji: "💄" },
  { key: "lash", label: "Lashes", emoji: "👁️" },
  { key: "skin", label: "Skin", emoji: "✨" },
  { key: "massage", label: "Massage", emoji: "🌿" },
  { key: "brows", label: "Brows", emoji: "🪞" },
];

export const TRENDING = [
  { name: "Skin Fade", from: 55, img: u("1599351431202-1e0f0137899a"), tag: "Trending" },
  { name: "Soft Glam", from: 180, img: u("1487412947147-5cebf100ffc2"), tag: "Hot" },
  { name: "Gel-X Almond", from: 85, img: u("1604654894610-df63bc536371"), tag: "New" },
  { name: "Volume Lashes", from: 220, img: u("1583241800698-9c2e09f7c9d3"), tag: "Trending" },
  { name: "Balayage", from: 240, img: u("1522337360788-8b13dee7a37e"), tag: "Loved" },
  { name: "Deep Tissue", from: 140, img: u("1544161515-4ab6ce6db874"), tag: "New" },
];

export const UPCOMING = [
  { id: "a1", pro: PROS[0], service: "Cut & Style", when: "Today · 4:30 PM", mins: 60, status: "Confirmed" },
  { id: "a2", pro: PROS[2], service: "Gel-X Full Set", when: "Fri · 11:00 AM", mins: 75, status: "Confirmed" },
];

export const PAST = [
  { id: "p1", pro: PROS[1], service: "Signature Cut", when: "Jun 12", paid: 75, rated: 5 },
  { id: "p2", pro: PROS[4], service: "Volume Set", when: "Jun 03", paid: 260, rated: 5 },
  { id: "p3", pro: PROS[3], service: "Soft Glam", when: "May 22", paid: 220, rated: 4 },
];

export const RECENT = [
  { id: "r1", type: "Booked", pro: PROS[1], note: "Signature Cut · tomorrow", at: "2m ago" },
  { id: "r2", type: "Reviewed", pro: PROS[4], note: "Left a 5★ review", at: "1h ago" },
  { id: "r3", type: "Favorited", pro: PROS[3], note: "Saved to favorites", at: "Yesterday" },
  { id: "r4", type: "Paid", pro: PROS[2], note: "$95 · Gel-X Full Set", at: "2d ago" },
];

export const FAVORITES = [PROS[0], PROS[2], PROS[4], PROS[1]];

// PROFESSIONAL APP DATA
export const PRO_ME = PROS[1]; // Marcus Vega
export const PRO_TODAY = [
  { id: "t1", time: "10:00", client: "Devon Hayes", service: "Skin Fade + Beard", mins: 60, price: 110, status: "Confirmed" },
  { id: "t2", time: "11:30", client: "Aiden Cho", service: "Signature Cut", mins: 45, price: 75, status: "Confirmed" },
  { id: "t3", time: "13:00", client: "Marcus Tate", service: "Hot Towel Shave", mins: 30, price: 65, status: "Pending" },
  { id: "t4", time: "14:30", client: "Jamal Brooks", service: "Signature Cut", mins: 45, price: 75, status: "Confirmed" },
  { id: "t5", time: "16:00", client: "Owen Park", service: "Skin Fade + Beard", mins: 60, price: 110, status: "Confirmed" },
];
export const PRO_EARNINGS = {
  today: 435, week: 2640, month: 11280, payout: 1820,
  weekly: [320, 410, 280, 560, 480, 590, 0],
  topServices: [
    { name: "Skin Fade + Beard", revenue: 4180, bookings: 38 },
    { name: "Signature Cut", revenue: 3300, bookings: 44 },
    { name: "Hot Towel Shave", revenue: 1820, bookings: 28 },
  ],
};
export const PRO_CLIENTS = [
  { id: "c1", name: "Devon Hayes", visits: 14, last: "Today", spend: 1540, fav: "Skin Fade + Beard", note: "Likes a tight 1.5 fade, no neck design." },
  { id: "c2", name: "Aiden Cho", visits: 9, last: "2w ago", spend: 675, fav: "Signature Cut", note: "Allergic to talcum. Prefers no aftershave." },
  { id: "c3", name: "Marcus Tate", visits: 22, last: "3d ago", spend: 1980, fav: "Hot Towel Shave", note: "Weekly Wed 1pm regular." },
  { id: "c4", name: "Jamal Brooks", visits: 6, last: "1m ago", spend: 450, fav: "Signature Cut", note: "Wants more length on top." },
  { id: "c5", name: "Owen Park", visits: 18, last: "1w ago", spend: 1840, fav: "Skin Fade + Beard", note: "Beard oil upsell loves it." },
];

// ADMIN DATA
export const ADMIN_KPI = {
  gmv: 4_280_000, take: 642_000, mrr: 184_000, users: 128_400, pros: 6_240, bookings: 38_120,
};
export const PENDING_PROS = [
  { id: "ap1", name: "Selena Ortiz", craft: "Lash Tech", city: "Phoenix, AZ", submitted: "12m ago", license: "AZ-COS-882144", status: "License Verify" },
  { id: "ap2", name: "Theo Morgan", craft: "Barber", city: "Seattle, WA", submitted: "1h ago", license: "WA-BARB-44912", status: "Background Check" },
  { id: "ap3", name: "Yui Nakamura", craft: "Esthetician", city: "Honolulu, HI", submitted: "3h ago", license: "HI-EST-22118", status: "License Verify" },
  { id: "ap4", name: "Priya Shah", craft: "Makeup Artist", city: "Chicago, IL", submitted: "Yesterday", license: "—", status: "Portfolio Review" },
];
export const DISPUTES = [
  { id: "d1", booking: "BK-92841", customer: "K. Patel", pro: "M. Vega", amount: 110, reason: "Service quality", opened: "2h ago", priority: "High" },
  { id: "d2", booking: "BK-92410", customer: "R. Nguyen", pro: "S. Tanaka", amount: 95, reason: "No-show pro", opened: "1d ago", priority: "Critical" },
  { id: "d3", booking: "BK-91984", customer: "J. Adler", pro: "L. Okafor", amount: 220, reason: "Late arrival", opened: "3d ago", priority: "Low" },
];

// INVESTOR DATA
export const INVESTOR = {
  arr: 22_080_000, growth: 18.4, ltv: 412, cac: 38, margin: 71, churn: 2.1,
  cities: 142, tam: 480_000_000_000,
  mrrSeries: [42, 58, 71, 89, 102, 118, 129, 141, 156, 168, 179, 184],
  gmvSeries: [120, 168, 210, 260, 305, 360, 405, 460, 520, 580, 640, 712],
  rev: [
    { name: "Take rate (15%)", v: 64 },
    { name: "Elite subscription", v: 22 },
    { name: "Pro SaaS ($49/mo)", v: 11 },
    { name: "Ads & promotions", v: 3 },
  ],
  rounds: [
    { name: "Pre-seed", date: "2023", amount: 1.2, valuation: 8 },
    { name: "Seed", date: "2024", amount: 6.5, valuation: 42 },
    { name: "Series A", date: "2025", amount: 22, valuation: 180 },
  ],
};
