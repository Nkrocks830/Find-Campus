/**
 * FINDIT CAMPUS — DEMO DATA LAYER
 * ─────────────────────────────────────────────────────────────────────────────
 * Realistic Indian campus lost-and-found data.
 * All pages use this as fallback when the DB is empty.
 * Replace any item's id with a real DB id — UI stays identical.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const past = (hours) => new Date(Date.now() - hours * 3600000).toISOString()

// ─── Student Profiles ─────────────────────────────────────────────────────────

export const DEMO_PROFILES = [
  { id: 'demo-u-01', name: 'Arjun Sharma',     email: 'arjun.s@college.edu',   dept: 'Computer Science',    year: 3 },
  { id: 'demo-u-02', name: 'Priya Nair',        email: 'priya.n@college.edu',   dept: 'Electronics',         year: 2 },
  { id: 'demo-u-03', name: 'Rahul Verma',       email: 'rahul.v@college.edu',   dept: 'Mechanical',          year: 4 },
  { id: 'demo-u-04', name: 'Sneha Iyer',        email: 'sneha.i@college.edu',   dept: 'Civil Engineering',   year: 1 },
  { id: 'demo-u-05', name: 'Karthik Reddy',     email: 'karthik.r@college.edu', dept: 'Computer Science',    year: 2 },
  { id: 'demo-u-06', name: 'Divya Menon',       email: 'divya.m@college.edu',   dept: 'Biotechnology',       year: 3 },
  { id: 'demo-u-07', name: 'Aditya Kulkarni',   email: 'aditya.k@college.edu',  dept: 'Information Tech',    year: 4 },
  { id: 'demo-u-08', name: 'Meghna Pillai',     email: 'meghna.p@college.edu',  dept: 'Mathematics',         year: 2 },
  { id: 'demo-u-09', name: 'Siddharth Joshi',   email: 'sid.j@college.edu',     dept: 'Physics',             year: 1 },
  { id: 'demo-u-10', name: 'Lakshmi Chandran',  email: 'laks.c@college.edu',    dept: 'Chemistry',           year: 3 },
  { id: 'demo-u-11', name: 'Vivek Anand',       email: 'vivek.a@college.edu',   dept: 'Electrical',          year: 2 },
  { id: 'demo-u-12', name: 'Pooja Desai',       email: 'pooja.d@college.edu',   dept: 'Computer Science',    year: 4 },
]

// ─── Campus Locations ─────────────────────────────────────────────────────────

export const DEMO_LOCATIONS = [
  { name: 'Main Library',              lat: 12.9716, lng: 77.5946, count: 34 },
  { name: 'Student Canteen',           lat: 12.9710, lng: 77.5940, count: 28 },
  { name: 'Auditorium',                lat: 12.9725, lng: 77.5955, count: 22 },
  { name: 'Block C Classrooms',        lat: 12.9715, lng: 77.5948, count: 19 },
  { name: 'Hostel Block A',            lat: 12.9718, lng: 77.5942, count: 16 },
  { name: 'Science Lab Block',         lat: 12.9722, lng: 77.5952, count: 14 },
  { name: 'Main Gate',                 lat: 12.9705, lng: 77.5935, count: 11 },
  { name: 'Sports Ground',             lat: 12.9730, lng: 77.5960, count: 9  },
  { name: 'Admin Block',               lat: 12.9708, lng: 77.5938, count: 7  },
  { name: 'Seminar Hall',              lat: 12.9720, lng: 77.5950, count: 6  },
  { name: 'Mechanical Workshop',       lat: 12.9712, lng: 77.5944, count: 5  },
  { name: 'Computer Science Dept',     lat: 12.9719, lng: 77.5949, count: 4  },
]

// ─── Lost & Found Items ───────────────────────────────────────────────────────

export const DEMO_ITEMS = [
  {
    id: 'demo-item-01',
    user_id: 'demo-u-01',
    type: 'lost',
    title: 'Blue Hydro Flask Water Bottle',
    description: '750ml blue stainless Hydro Flask with a white mountain sticker and a small Hulk sticker near the bottom. My name "Arjun" written inside the cap in permanent marker. Had it at the library study room yesterday evening.',
    category: 'accessories',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    location_name: 'Main Library',
    location_lat: 12.9716, location_lng: 77.5946,
    status: 'active',
    created_at: past(14),
    profiles: DEMO_PROFILES[0],
  },
  {
    id: 'demo-item-02',
    user_id: 'demo-u-02',
    type: 'found',
    title: 'Samsung Galaxy Buds (White)',
    description: 'Found a white Samsung Galaxy Buds case near the auditorium exit after the college fest. The case has a small scratch on the lid. Left earphone has a red dot sticker. Submitted to the front desk.',
    category: 'electronics',
    image_url: null,
    location_name: 'Auditorium',
    location_lat: 12.9725, location_lng: 77.5955,
    status: 'active',
    created_at: past(6),
    profiles: DEMO_PROFILES[1],
  },
  {
    id: 'demo-item-03',
    user_id: 'demo-u-03',
    type: 'lost',
    title: 'Casio fx-991ES Plus Scientific Calculator',
    description: 'Black Casio fx-991ES Plus. My name "Rahul V" is written on the back with a silver marker. The "=" key has a slight discolouration. Last used in Block C for the Mechanics exam on Monday morning.',
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&q=80&w=400',
    location_name: 'Block C Classrooms',
    location_lat: 12.9715, location_lng: 77.5948,
    status: 'active',
    created_at: past(28),
    profiles: DEMO_PROFILES[2],
  },
  {
    id: 'demo-item-04',
    user_id: 'demo-u-04',
    type: 'found',
    title: 'Set of 3 Keys with Eiffel Tower Keychain',
    description: 'Found a bunch of 3 keys on a blue PU leather keychain with a small silver Eiffel Tower charm. Found near the Hostel A gate. Holding it at the security cabin.',
    category: 'keys',
    image_url: null,
    location_name: 'Hostel Block A',
    location_lat: 12.9718, location_lng: 77.5942,
    status: 'active',
    created_at: past(3),
    profiles: DEMO_PROFILES[3],
  },
  {
    id: 'demo-item-05',
    user_id: 'demo-u-05',
    type: 'lost',
    title: 'Purple Hardcover Notebook — Operating Systems',
    description: 'Dark purple B5 hardcover notebook with "OS Notes - Karthik" written on the first page in blue ink. Has sticky tabs on every chapter and doodles of circuits on the back cover. Contains important semester notes.',
    category: 'stationery',
    image_url: 'https://images.unsplash.com/photo-1531346878377-38e55e8cc870?auto=format&fit=crop&q=80&w=400',
    location_name: 'Main Library',
    location_lat: 12.9716, location_lng: 77.5946,
    status: 'active',
    created_at: past(9),
    profiles: DEMO_PROFILES[4],
  },
  {
    id: 'demo-item-06',
    user_id: 'demo-u-06',
    type: 'found',
    title: 'Black-Framed Prescription Glasses',
    description: 'Found rectangular black-frame glasses in a brown faux leather case near the Science Lab Block entrance. The right temple has a tiny white sticker. Please collect with description of lenses or any marking.',
    category: 'accessories',
    image_url: null,
    location_name: 'Science Lab Block',
    location_lat: 12.9722, location_lng: 77.5952,
    status: 'active',
    created_at: past(5),
    profiles: DEMO_PROFILES[5],
  },
  {
    id: 'demo-item-07',
    user_id: 'demo-u-07',
    type: 'lost',
    title: 'Red Puma College Backpack',
    description: 'Medium-sized red Puma backpack with black straps. Has a college ID card pouch on the front pocket (empty now). Contains a laptop sleeve, engineering drawing tools and a tiffin box. Lost somewhere near the canteen.',
    category: 'bag',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
    location_name: 'Student Canteen',
    location_lat: 12.9710, location_lng: 77.5940,
    status: 'active',
    created_at: past(18),
    profiles: DEMO_PROFILES[6],
  },
  {
    id: 'demo-item-08',
    user_id: 'demo-u-08',
    type: 'found',
    title: 'Student ID Card — Meghna Pillai',
    description: 'Found a college student ID card on the sports ground near the pavilion. The card belongs to someone from the Mathematics department. Please contact to collect — also sent to admin block.',
    category: 'documents',
    image_url: null,
    location_name: 'Sports Ground',
    location_lat: 12.9730, location_lng: 77.5960,
    status: 'claimed',
    created_at: past(48),
    profiles: DEMO_PROFILES[7],
  },
  {
    id: 'demo-item-09',
    user_id: 'demo-u-09',
    type: 'lost',
    title: 'Noise ColorFit Pro 4 Smartwatch (Black)',
    description: 'Black Noise ColorFit Pro 4 smartwatch with a silicone strap. The screen has a tiny hairline crack at the top left corner. Last seen during the sports period. Might have slipped off near the 100m track.',
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=400',
    location_name: 'Sports Ground',
    location_lat: 12.9730, location_lng: 77.5960,
    status: 'active',
    created_at: past(36),
    profiles: DEMO_PROFILES[8],
  },
  {
    id: 'demo-item-10',
    user_id: 'demo-u-10',
    type: 'found',
    title: 'Black Compact Umbrella',
    description: 'Black compact folding umbrella with a curved wooden handle found at the main gate security cabin area. Has a faded floral pattern on the inside. No name markings found.',
    category: 'other',
    image_url: null,
    location_name: 'Main Gate',
    location_lat: 12.9705, location_lng: 77.5935,
    status: 'active',
    created_at: past(22),
    profiles: DEMO_PROFILES[9],
  },
  {
    id: 'demo-item-11',
    user_id: 'demo-u-11',
    type: 'lost',
    title: 'Apple AirPods Pro (2nd Gen) with Case',
    description: 'White AirPods Pro 2nd generation with MagSafe charging case. Engraved initials "VA" on the case bottom. Lost after the seminar in the hall. Case has a small teal lanyard attached.',
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=400',
    location_name: 'Seminar Hall',
    location_lat: 12.9720, location_lng: 77.5950,
    status: 'active',
    created_at: past(8),
    profiles: DEMO_PROFILES[10],
  },
  {
    id: 'demo-item-12',
    user_id: 'demo-u-12',
    type: 'found',
    title: 'Engineering Drawing Set (Staedtler)',
    description: 'Found a full Staedtler engineering drawing set in a black zip case near the Mechanical Workshop. Contains compass, mini drafter, 3 French curves and assorted pencils. The owner\'s roll number "21ME045" is written inside.',
    category: 'stationery',
    image_url: null,
    location_name: 'Mechanical Workshop',
    location_lat: 12.9712, location_lng: 77.5944,
    status: 'active',
    created_at: past(12),
    profiles: DEMO_PROFILES[11],
  },
  {
    id: 'demo-item-13',
    user_id: 'demo-u-01',
    type: 'found',
    title: 'Maroon College Blazer (Size M)',
    description: 'Found a college blazer (size M) with the college emblem on the left breast pocket. The inner label says "Aryan" in pen. Left at the canteen on a chair. Handed to the canteen manager.',
    category: 'clothing',
    image_url: null,
    location_name: 'Student Canteen',
    location_lat: 12.9710, location_lng: 77.5940,
    status: 'active',
    created_at: past(2),
    profiles: DEMO_PROFILES[0],
  },
  {
    id: 'demo-item-14',
    user_id: 'demo-u-03',
    type: 'lost',
    title: 'Debit Card (SBI)',
    description: 'Lost my SBI debit card. The card has my name visible on it. Please do not use it — I have hotlisted it already. Just need it physically returned for record purposes. Lost near the admin block ATM.',
    category: 'documents',
    image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=400',
    location_name: 'Admin Block',
    location_lat: 12.9708, location_lng: 77.5938,
    status: 'active',
    created_at: past(45),
    profiles: DEMO_PROFILES[2],
  },
  {
    id: 'demo-item-15',
    user_id: 'demo-u-05',
    type: 'found',
    title: 'HP 15s Laptop Power Adapter',
    description: 'Found a 45W HP laptop charger (blue tip, brick-style) in the CS department lab room 204. Left on the desk. Charger is in good condition. Pick up from the CS dept office.',
    category: 'electronics',
    image_url: null,
    location_name: 'Computer Science Dept',
    location_lat: 12.9719, location_lng: 77.5949,
    status: 'active',
    created_at: past(16),
    profiles: DEMO_PROFILES[4],
  },
]

// ─── AI Match Records ─────────────────────────────────────────────────────────

export const DEMO_MATCHES = [
  {
    id: 'demo-match-01',
    lost_item_id: 'demo-item-03',
    found_item_id: 'demo-item-12', // calculator vs drawing set — low match
    text_score: 0.18,
    image_score: 0,
    total_score: 0.22,
    created_at: past(10),
    lost_items:  DEMO_ITEMS[2],
    found_items: DEMO_ITEMS[11],
  },
  {
    id: 'demo-match-02',
    lost_item_id: 'demo-item-05',
    found_item_id: 'demo-item-13',
    text_score: 0.65,
    image_score: 0,
    total_score: 0.71,
    created_at: past(8),
    lost_items:  DEMO_ITEMS[4],
    found_items: DEMO_ITEMS[12],
  },
  {
    id: 'demo-match-03',
    lost_item_id: 'demo-item-09',
    found_item_id: 'demo-item-02',
    text_score: 0.42,
    image_score: 0,
    total_score: 0.48,
    created_at: past(24),
    lost_items:  DEMO_ITEMS[8],
    found_items: DEMO_ITEMS[1],
  },
  {
    id: 'demo-match-04',
    lost_item_id: 'demo-item-11',
    found_item_id: 'demo-item-02',
    text_score: 0.82,
    image_score: 0,
    total_score: 0.88,
    created_at: past(5),
    lost_items:  DEMO_ITEMS[10],
    found_items: DEMO_ITEMS[1],
  },
  {
    id: 'demo-match-05',
    lost_item_id: 'demo-item-01',
    found_item_id: 'demo-item-10',
    text_score: 0.31,
    image_score: 0,
    total_score: 0.34,
    created_at: past(12),
    lost_items:  DEMO_ITEMS[0],
    found_items: DEMO_ITEMS[9],
  },
]

// ─── Claims ────────────────────────────────────────────────────────────────────

export const DEMO_CLAIMS = [
  {
    id: 'demo-claim-01',
    item_id: 'demo-item-08',
    claimant_id: 'demo-u-08',
    finder_id:   'demo-u-07',
    status:      'verified',
    qr_token:    'FINDIT-DEMO0001-XKTZ92-1751000000000',
    created_at:  past(40),
    verified_at: past(36),
    items: DEMO_ITEMS[7],
  },
  {
    id: 'demo-claim-02',
    item_id: 'demo-item-04',
    claimant_id: 'demo-u-04',
    finder_id:   'demo-u-04',
    status:      'pending',
    qr_token:    null,
    created_at:  past(2),
    items: DEMO_ITEMS[3],
  },
]

// ─── Recent Activity Feed ─────────────────────────────────────────────────────

export const DEMO_ACTIVITY = [
  { icon: '🔍', text: 'Arjun Sharma reported a lost Blue Hydro Flask',        time: past(14), color: '#FCA5A5' },
  { icon: '✅', text: 'Priya Nair found Samsung Galaxy Buds near Auditorium', time: past(6),  color: '#6EE7B7' },
  { icon: '🤝', text: 'Student ID card claimed — match verified by AI',       time: past(40), color: '#818CF8' },
  { icon: '✅', text: 'Sneha Iyer found a Set of Keys at Hostel A',           time: past(3),  color: '#6EE7B7' },
  { icon: '🔍', text: 'Karthik Reddy lost Purple OS Notes Notebook',          time: past(9),  color: '#FCA5A5' },
  { icon: '🤖', text: 'AI found 88% match — AirPods Pro & Galaxy Buds',       time: past(5),  color: '#F59E0B' },
  { icon: '✅', text: 'Vivek Anand found Apple AirPods Pro in Seminar Hall',  time: past(8),  color: '#6EE7B7' },
  { icon: '🔍', text: 'Rahul Verma lost Casio Calculator in Block C',         time: past(28), color: '#FCA5A5' },
  { icon: '🤖', text: 'AI found 71% match — OS Notebook & Blazer report',    time: past(8),  color: '#F59E0B' },
  { icon: '✅', text: 'Pooja Desai found Engineering Drawing Set',            time: past(12), color: '#6EE7B7' },
]

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const DEMO_STATS = {
  total:          247,
  matched:         73,   // percentage
  locations:       18,
  totalItems:     247,
  activeItems:    189,
  claimedItems:    58,
  lostItems:      134,
  foundItems:     113,
  totalUsers:     312,
  avgMatchTime:    '2h 14m',
  successRate:     '73%',
  weeklyGrowth:   '+12%',
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-01',
    type: 'match',
    title: 'New AI Match Found',
    body: 'Your lost item "Blue Hydro Flask" has an 88% match with a found report!',
    read: false,
    created_at: past(1),
    color: '#818CF8',
    icon: '🤖',
  },
  {
    id: 'notif-02',
    type: 'claim',
    title: 'Claim Verified',
    body: 'Your student ID card has been claimed. QR handover code is ready.',
    read: false,
    created_at: past(5),
    color: '#10B981',
    icon: '✅',
  },
  {
    id: 'notif-03',
    type: 'system',
    title: 'Item Marked Active',
    body: 'Your report "Casio Calculator" is now live and being matched.',
    read: true,
    created_at: past(28),
    color: '#F59E0B',
    icon: '📋',
  },
  {
    id: 'notif-04',
    type: 'match',
    title: 'Another Match Found',
    body: 'Your "AirPods Pro" report has a 71% match — check it now!',
    read: true,
    created_at: past(8),
    color: '#818CF8',
    icon: '🤖',
  },
]

// ─── Weekly chart data ────────────────────────────────────────────────────────

export const DEMO_WEEKLY_CHART = [
  { day: 'Mon', lost: 8,  found: 5  },
  { day: 'Tue', lost: 12, found: 9  },
  { day: 'Wed', lost: 6,  found: 11 },
  { day: 'Thu', lost: 15, found: 8  },
  { day: 'Fri', lost: 19, found: 14 },
  { day: 'Sat', lost: 7,  found: 6  },
  { day: 'Sun', lost: 3,  found: 4  },
]

// ─── Category breakdown (for charts) ─────────────────────────────────────────

export const DEMO_CATEGORY_BREAKDOWN = [
  { category: 'Electronics',   count: 72, color: '#818CF8' },
  { category: 'Accessories',   count: 48, color: '#F59E0B' },
  { category: 'Stationery',    count: 36, color: '#10B981' },
  { category: 'Bags',          count: 29, color: '#FB7185' },
  { category: 'Documents',     count: 24, color: '#60A5FA' },
  { category: 'Keys',          count: 21, color: '#34D399' },
  { category: 'Clothing',      count: 17, color: '#A78BFA' },
]

// ─── Top finders leaderboard ──────────────────────────────────────────────────

export const DEMO_LEADERBOARD = [
  { rank: 1, profile: DEMO_PROFILES[1],  foundCount: 9,  claimedHelped: 7, badge: '🥇' },
  { rank: 2, profile: DEMO_PROFILES[3],  foundCount: 7,  claimedHelped: 6, badge: '🥈' },
  { rank: 3, profile: DEMO_PROFILES[9],  foundCount: 6,  claimedHelped: 5, badge: '🥉' },
  { rank: 4, profile: DEMO_PROFILES[11], foundCount: 5,  claimedHelped: 4, badge: '⭐' },
  { rank: 5, profile: DEMO_PROFILES[5],  foundCount: 4,  claimedHelped: 4, badge: '⭐' },
]

// ─── Merge helper: real DB data + demo fallback ────────────────────────────────

/**
 * Returns real data if it has entries, else falls back to demo data.
 * This lets every page work perfectly out of the box.
 */
export const withDemoFallback = (realData, demoData, minLength = 1) => {
  if (Array.isArray(realData) && realData.length >= minLength) return realData
  return demoData
}

export const withDemoStatsFallback = (realStats, field, demoValue) => {
  const val = realStats?.[field]
  return (val !== undefined && val !== null && val !== 0) ? val : demoValue
}
