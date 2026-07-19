const P = "fasotv_";
const get = (k) => { try { return JSON.parse(localStorage.getItem(P + k)); } catch { return null; } };
const set = (k, v) => localStorage.setItem(P + k, JSON.stringify(v));

const HLS_TEST = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const pic = (seed) => `https://picsum.photos/seed/${seed}/300/450`;

const DEMO_MOVIES = [
  // ─── Films Burkinabés ────────────────────────────────────────────────────────
  { id: 1, title: "Tilai", title_en: "Tilai (A Question of Honor)", description: "Un homme revient au village pour épouser sa fiancée, mais découvre qu'elle est devenue la femme de son père. Un chef-d'œuvre d'Idrissa Ouédraogo.", description_en: "A man returns to his village to marry his fiancée only to discover she has become his father's wife.", category: "Films Burkinabés", genre: "Drame", year: 1990, rating: 7.8, duration: 81, poster_url: pic("tilai1990"), stream_url: HLS_TEST, source: "local", local_path: "films-burkina/tilai.mp4", is_featured: true, is_burkinabe: true },
  { id: 2, title: "Yaaba", title_en: "Yaaba (Grandmother)", description: "Un jeune garçon se lie d'amitié avec Sana, une vieille femme ostracisée par le village. Un film poétique et humaniste.", description_en: "A young boy befriends an elderly woman considered a witch by the village.", category: "Films Burkinabés", genre: "Drame", year: 1989, rating: 7.5, duration: 90, poster_url: pic("yaaba1989"), stream_url: HLS_TEST, source: "local", local_path: "films-burkina/yaaba.mp4", is_featured: false, is_burkinabe: true },
  { id: 3, title: "Tasuma — Le Feu", title_en: "Tasuma — The Fire", description: "Ancien combattant africain oublié par la France, Tasuma se bat pour sa pension et sa dignité. Drame social puissant.", description_en: "Forgotten African veteran Tasuma fights for his pension and dignity.", category: "Films Burkinabés", genre: "Drame", year: 2003, rating: 7.2, duration: 90, poster_url: pic("tasuma2003"), stream_url: HLS_TEST, source: "local", local_path: "films-burkina/tasuma.mp4", is_featured: true, is_burkinabe: true },
  { id: 4, title: "La Colère des Dieux", title_en: "Anger of the Gods", description: "Une histoire de pouvoir, de jalousie et de vengeance dans un village du Burkina Faso moderne.", description_en: "A story of power, jealousy and revenge in a modern Burkina Faso village.", category: "Films Burkinabés", genre: "Drame", year: 2003, rating: 6.9, duration: 94, poster_url: pic("coleredieux"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: true },
  { id: 5, title: "Kini et Adams", title_en: "Kini & Adams", description: "Deux amis inséparables en Afrique rêvent d'une vie meilleure. Quand Adams trouve du travail en ville, leur amitié est mise à l'épreuve.", description_en: "Two best friends dream of a better life, but success tests their friendship.", category: "Films Burkinabés", genre: "Drame", year: 1997, rating: 7.0, duration: 93, poster_url: pic("kiniadams"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: true },
  // ─── Films Africains ─────────────────────────────────────────────────────────
  { id: 6, title: "Timbuktu", title_en: "Timbuktu", description: "Face aux jihadistes qui ont pris en otage Tombouctou, Kidane et sa famille résistent dans le désert. Palme d'Or Cannes.", description_en: "A cattle herder and his family resist jihadists in occupied Timbuktu.", category: "Films Africains", genre: "Drame", year: 2014, rating: 7.5, duration: 97, poster_url: pic("timbuktu2014"), stream_url: HLS_TEST, is_featured: true, is_burkinabe: false },
  { id: 7, title: "Atlantics", title_en: "Atlantics", description: "À Dakar, des ouvriers partent en mer. Leurs esprits reviennent hanter les vivants. Prix du jury Cannes 2019.", description_en: "In Dakar, the spirits of drowned migrant workers return to haunt the living.", category: "Films Africains", genre: "Fantastique", year: 2019, rating: 6.9, duration: 104, poster_url: pic("atlantics2019"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
  { id: 8, title: "Black Panther", title_en: "Black Panther", description: "T'Challa, roi du Wakanda, affronte des ennemis qui menacent son empire. Le film de super-héros africain le plus populaire.", description_en: "The king of Wakanda faces enemies who threaten his empire and his people.", category: "Films Africains", genre: "Action", year: 2018, rating: 7.3, duration: 134, poster_url: pic("blackpanther2018"), stream_url: HLS_TEST, is_featured: true, is_burkinabe: false },
  { id: 9, title: "The Woman King", title_en: "The Woman King", description: "L'histoire épique des Agojie, les guerrières d'élite du royaume de Dahomey. Basé sur des faits réels.", description_en: "The epic story of the Agojie, the all-female warriors of the Dahomey Kingdom.", category: "Films Africains", genre: "Action", year: 2022, rating: 6.9, duration: 135, poster_url: pic("womanking2022"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
  { id: 10, title: "Lionheart", title_en: "Lionheart", description: "Une femme nigériane tente de sauver l'entreprise familiale face à son oncle conservateur. Comédie dramatique populaire.", description_en: "A Nigerian woman tries to save the family business while dealing with her conservative uncle.", category: "Films Africains", genre: "Comédie", year: 2018, rating: 5.8, duration: 96, poster_url: pic("lionheart2018"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
  // ─── Documentaires ───────────────────────────────────────────────────────────
  { id: 11, title: "Thomas Sankara : L'Homme Intègre", title_en: "Thomas Sankara: The Upright Man", description: "Portrait du président révolutionnaire burkinabé Thomas Sankara, figure panafricaine assassiné en 1987.", description_en: "Portrait of Burkina Faso's revolutionary president Thomas Sankara, pan-African icon.", category: "Documentaires", genre: "Documentaire", year: 2006, rating: 8.1, duration: 86, poster_url: pic("sankara2006"), stream_url: HLS_TEST, is_featured: true, is_burkinabe: true },
  { id: 12, title: "Afrique — Terre de Cinéma", title_en: "Africa — Land of Cinema", description: "Panorama du cinéma africain des origines à aujourd'hui, de l'Afrique de l'Ouest à l'Afrique du Sud.", description_en: "Overview of African cinema from its origins to today across the continent.", category: "Documentaires", genre: "Documentaire", year: 2021, rating: 7.2, duration: 52, poster_url: pic("afriquecinema"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
];

const DEMO_SERIES = [
  // ─── Séries Burkinabées ──────────────────────────────────────────────────────
  { id: 1, title: "Les Combattants de Ouaga", title_en: "The Fighters of Ouaga", description: "Drame suivant des jeunes de Ouagadougou qui luttent pour leurs rêves dans une ville en pleine évolution entre tradition et modernité.", description_en: "Drama following young people in Ouagadougou fighting for their dreams between tradition and modernity.", category: "Séries Burkinabées", genre: "Drame", year: 2022, rating: 7.8, total_seasons: 2, total_episodes: 24, poster_url: pic("combattants"), stream_url: HLS_TEST, is_featured: true, is_burkinabe: true },
  { id: 2, title: "Koom Ya", title_en: "Koom Ya (Water of Life)", description: "Saga familiale burkinabée explorant les tensions entre tradition et modernité à Bobo-Dioulasso sur fond de conflits générationnels.", description_en: "Burkinabé family saga exploring tensions between tradition and modernity in Bobo-Dioulasso.", category: "Séries Burkinabées", genre: "Drame", year: 2021, rating: 7.4, total_seasons: 3, total_episodes: 36, poster_url: pic("koomya"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: true },
  // ─── Séries Africaines ───────────────────────────────────────────────────────
  { id: 3, title: "Blood & Water", title_en: "Blood & Water", description: "Une lycéenne découvre que la star de natation de son école pourrait être sa sœur disparue. Série Netflix Afrique du Sud.", description_en: "A high schooler investigates whether her school's swim star is her long-lost sister.", category: "Séries Africaines", genre: "Thriller", year: 2020, rating: 7.1, total_seasons: 3, total_episodes: 18, poster_url: pic("bloodwater"), stream_url: HLS_TEST, is_featured: true, is_burkinabe: false },
  { id: 4, title: "Jéricho", title_en: "Jericho", description: "Des agents de sécurité d'élite protègent une ville nigériane contre le crime organisé et la corruption. Série d'action haletante.", description_en: "Elite security agents protect a Nigerian city against organized crime and corruption.", category: "Séries Africaines", genre: "Action", year: 2019, rating: 6.8, total_seasons: 2, total_episodes: 16, poster_url: pic("jerichoaf"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
  { id: 5, title: "Jenifa's Diary", title_en: "Jenifa's Diary", description: "Comédie nigériane culte suivant les aventures d'une jeune femme naïve de village devenue citadine à Lagos.", description_en: "Cult Nigerian comedy following a naive village girl navigating life in Lagos.", category: "Séries Africaines", genre: "Comédie", year: 2016, rating: 7.0, total_seasons: 5, total_episodes: 60, poster_url: pic("jenifadiary"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
  // ─── Documentaires ───────────────────────────────────────────────────────────
  { id: 6, title: "Afrique en Séries", title_en: "Africa in Series", description: "Panorama des meilleures productions télévisuelles du continent africain de 2010 à 2023 — Nigeria, Sénégal, Afrique du Sud.", description_en: "Overview of the best African TV productions from 2010 to 2023.", category: "Documentaires", genre: "Documentaire", year: 2023, rating: 6.5, total_seasons: 1, total_episodes: 6, poster_url: pic("afriqueenseries"), stream_url: HLS_TEST, is_featured: false, is_burkinabe: false },
];

const DEMO_RESELLERS = {
  "71000000": {
    phone: "71000000",
    code_parrainage: "FASO-TU01",
    phone_paiement: "+22671000000",
    niveau: "silver",
    commission_rate: 20,
    total_earnings: 72000,
    available_balance: 22000,
    next_niveau_info: { current_count: 12, next: "gold", needed: 19, progress: 32 },
    joined_at: "2026-05-01T08:00:00Z",
  },
};

const DEMO_RESELLER_DATA = {
  "71000000": {
    clients: [
      { id: 1, client_name: "Amadou Kaboré", client_phone: "+22675112233", plan_actif: "Mensuel", has_active_subscription: true, joined_at: "2026-05-15T10:00:00Z" },
      { id: 2, client_name: "Mariama Ouédraogo", client_phone: "+22676223344", plan_actif: "Premium", has_active_subscription: true, joined_at: "2026-05-20T14:00:00Z" },
      { id: 3, client_name: "Ibrahim Traoré", client_phone: "+22677334455", plan_actif: "Hebdomadaire", has_active_subscription: false, joined_at: "2026-06-01T09:00:00Z" },
      { id: 4, client_name: "Fatimata Compaoré", client_phone: "+22678445566", plan_actif: "Mensuel", has_active_subscription: true, joined_at: "2026-06-10T16:00:00Z" },
    ],
    commissions: [
      { id: 1, client_name: "Amadou Kaboré", client_phone: "+22675112233", plan_name: "Mensuel", amount: 700, status: "paid", created_at: "2026-06-15T10:00:00Z" },
      { id: 2, client_name: "Mariama Ouédraogo", client_phone: "+22676223344", plan_name: "Premium", amount: 1500, status: "paid", created_at: "2026-06-20T14:00:00Z" },
      { id: 3, client_name: "Ibrahim Traoré", client_phone: "+22677334455", plan_name: "Hebdomadaire", amount: 200, status: "pending", created_at: "2026-07-01T09:00:00Z" },
      { id: 4, client_name: "Fatimata Compaoré", client_phone: "+22678445566", plan_name: "Mensuel", amount: 700, status: "paid", created_at: "2026-07-10T16:00:00Z" },
    ],
    withdrawals: [
      { id: 1, amount: 5000, method: "orange_money", phone: "+22671000000", status: "completed", requested_at: "2026-06-01T10:00:00Z" },
      { id: 2, amount: 8000, method: "moov_money", phone: "+22671000000", status: "processing", requested_at: "2026-07-01T14:00:00Z" },
    ],
    monthly_stats: [
      { month: "2026-02", total: 5000 },
      { month: "2026-03", total: 8500 },
      { month: "2026-04", total: 12000 },
      { month: "2026-05", total: 15000 },
      { month: "2026-06", total: 18500 },
      { month: "2026-07", total: 13000 },
    ],
  },
};

const DEMO_CLIPS = [
  { id: 1, title: "Ma Lumière", artist: "Floby", category: "Musique Burkinabè", youtube_id: "ZlHEPasZmk0", duration: "4:32", views_count: 12500, likes_count: 890, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-06-10" },
  { id: 2, title: "Destinée", artist: "Freeman", category: "Musique Burkinabè", youtube_id: "LSOdg2G9odc", duration: "5:10", views_count: 9800, likes_count: 650, is_promoted: true, promotion_badge: "TENDANCE", promotion_end_date: "2026-07-30", added_at: "2026-06-15" },
  { id: 3, title: "Femme Africaine", artist: "Smarty", category: "Musique Burkinabè", youtube_id: "y6Sxv-sUYtM", duration: "3:58", views_count: 7200, likes_count: 430, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-06-20" },
  { id: 4, title: "Africa", artist: "Bil Aka Kora", category: "Musique Burkinabè", youtube_id: "NgyZKGAGGRk", duration: "4:15", views_count: 15600, likes_count: 1200, is_promoted: true, promotion_badge: "SPONSORISÉ", promotion_end_date: "2026-07-25", added_at: "2026-06-01" },
  { id: 5, title: "Last Last", artist: "Burna Boy", category: "Musique Africaine", youtube_id: "gw-lZBFKNME", duration: "3:44", views_count: 45000, likes_count: 3200, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-05-20" },
  { id: 6, title: "Essence", artist: "Wizkid ft. Tems", category: "Musique Africaine", youtube_id: "rrrFqBFuMpM", duration: "4:02", views_count: 62000, likes_count: 4800, is_promoted: true, promotion_badge: "TENDANCE", promotion_end_date: "2026-07-28", added_at: "2026-05-15" },
  { id: 7, title: "Jeje", artist: "Diamond Platnumz", category: "Musique Africaine", youtube_id: "AEVa1mJ9PB4", duration: "3:55", views_count: 28000, likes_count: 2100, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-05-10" },
  { id: 8, title: "Tokooos", artist: "Fally Ipupa", category: "Musique Africaine", youtube_id: "mKhCK9tTmpE", duration: "4:20", views_count: 19000, likes_count: 1500, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-05-05" },
  { id: 9, title: "Fall", artist: "Davido", category: "Musique Africaine", youtube_id: "UprtKHHBMqY", duration: "4:12", views_count: 38000, likes_count: 2900, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-04-20" },
  { id: 10, title: "Djadja", artist: "Aya Nakamura", category: "Musique Africaine", youtube_id: "nkulHRFBPqA", duration: "2:58", views_count: 55000, likes_count: 4200, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-04-15" },
  { id: 11, title: "Gospel Compilation BF", artist: "Artistes Gospel Burkina", category: "Gospel", youtube_id: "DpWMVVsO6wE", duration: "18:30", views_count: 8500, likes_count: 720, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-06-25" },
  { id: 12, title: "Sketch Populaire", artist: "Comédie Burkinabè", category: "Comédie", youtube_id: "i_1CWJB5hxc", duration: "12:45", views_count: 22000, likes_count: 1800, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-06-05" },
  { id: 13, title: "Yamba Babouné", artist: "Yamba Babouné", category: "Musique Burkinabè", youtube_id: "BDqXW6Bkpqk", duration: "5:20", views_count: 11000, likes_count: 920, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-06-28" },
  { id: 14, title: "Wend Zanga (Louange en Mooré)", artist: "Gospel Mooré", category: "Contenu Mooré", youtube_id: "DpWMVVsO6wE", duration: "8:45", views_count: 5200, likes_count: 430, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-07-01" },
  { id: 15, title: "Teega Pugsé (Film Mooré)", artist: "Cinéma Mooré BF", category: "Contenu Mooré", youtube_id: "NgyZKGAGGRk", duration: "15:30", views_count: 3800, likes_count: 280, is_promoted: false, promotion_badge: null, promotion_end_date: null, added_at: "2026-07-05" },
];

const DEFAULTS = {
  plans_iptv: [
    { id: 1, slug: "daily", name: "Journalier", price: 200, duration_hours: 24, screens: 1, quality: "HD", features: ["TV Direct HD", "Films et séries", "1 écran"], is_active: true },
    { id: 2, slug: "weekly", name: "Hebdomadaire", price: 1000, duration_hours: 168, screens: 2, quality: "HD", features: ["TV Direct HD", "Films et séries", "2 écrans", "EPG Programme"], is_active: true },
    { id: 3, slug: "monthly", name: "Mensuel", price: 3500, duration_hours: 720, screens: 3, quality: "FHD", features: ["TV Direct FHD", "Films et séries", "3 écrans", "EPG Programme", "VOD illimitée"], is_active: true },
    { id: 4, slug: "premium", name: "Premium", price: 7500, duration_hours: 2160, screens: 5, quality: "4K", features: ["TV Direct 4K", "Films et séries", "5 écrans", "EPG Programme", "VOD illimitée", "Support prioritaire"], is_active: true },
  ],
  plans_vpn: [
    { id: 1, slug: "vpn_daily", name: "VPN 24h", price: 100, duration_hours: 24, bandwidth: "10 Mbps", devices: 1, is_active: true },
    { id: 2, slug: "vpn_weekly", name: "VPN 7 jours", price: 500, duration_hours: 168, bandwidth: "15 Mbps", devices: 2, is_active: true },
    { id: 3, slug: "vpn_monthly", name: "VPN 30 jours", price: 1500, duration_hours: 720, bandwidth: "20 Mbps", devices: 3, is_active: true },
    { id: 4, slug: "vpn_quarterly", name: "VPN 90 jours", price: 3500, duration_hours: 2160, bandwidth: "30 Mbps", devices: 5, is_active: true },
  ],
  plans_promo: [
    { id: 1, slug: "hero_24h", name: "Page d'accueil 24h", display_name: "Hero 24h", price: 5000, duration_hours: 24, placement: "hero", max_active: 3, is_active: true },
    { id: 2, slug: "hero_7d", name: "Page d'accueil 7 jours", display_name: "Hero 7 jours", price: 25000, duration_hours: 168, placement: "hero", max_active: 3, is_active: true },
    { id: 3, slug: "trending_7d", name: "Tendances 7 jours", display_name: "Trending 7j", price: 15000, duration_hours: 168, placement: "trending", max_active: 5, is_active: true },
    { id: 4, slug: "new_7d", name: "Nouveautés 7 jours", display_name: "Nouveautés 7j", price: 10000, duration_hours: 168, placement: "new", max_active: 5, is_active: true },
    { id: 5, slug: "banner_7d", name: "Bannière 7 jours", display_name: "Bannière 7j", price: 30000, duration_hours: 168, placement: "banner", max_active: 2, is_active: true },
    { id: 6, slug: "pack_30d", name: "Pack complet 30 jours", display_name: "Pack 30j", price: 100000, duration_hours: 720, placement: "pack", max_active: 1, is_active: true },
  ],
  movies: DEMO_MOVIES,
  series: DEMO_SERIES,
  clips: DEMO_CLIPS,
  promotions: [],
  vpn_accounts: [],
  resellers: DEMO_RESELLERS,
  reseller_data: DEMO_RESELLER_DATA,
  xtream_config: { url: "", username: "", password: "", connected: false },
  local_server_config: { base_url: "", connected: false },
  settings: { default_quality: "auto", epg_url: "", m3u_url: "", mikrotik_ip: "", mikrotik_port: "8728", mikrotik_user: "admin", mikrotik_pass: "" },
  demo_stats: {
    revenue_iptv_month: 285000,
    revenue_vpn_month: 42500,
    revenue_promo_month: 125000,
    subscribers_iptv: 89,
    subscribers_vpn: 34,
    promos_active: 3,
    resellers_active: 7,
    daily_revenue: [
      { day: "01", iptv: 9500, vpn: 1200, promo: 0 },
      { day: "02", iptv: 7200, vpn: 800, promo: 5000 },
      { day: "03", iptv: 11000, vpn: 1500, promo: 0 },
      { day: "04", iptv: 8800, vpn: 900, promo: 0 },
      { day: "05", iptv: 12500, vpn: 2000, promo: 25000 },
      { day: "06", iptv: 9000, vpn: 1100, promo: 0 },
      { day: "07", iptv: 15200, vpn: 3200, promo: 10000 },
      { day: "08", iptv: 7800, vpn: 800, promo: 0 },
      { day: "09", iptv: 10200, vpn: 1400, promo: 0 },
      { day: "10", iptv: 9600, vpn: 1200, promo: 0 },
    ],
    subscribers_evolution: [
      { month: "Fév", iptv: 45, vpn: 10 },
      { month: "Mar", iptv: 52, vpn: 14 },
      { month: "Avr", iptv: 61, vpn: 19 },
      { month: "Mai", iptv: 70, vpn: 24 },
      { month: "Juin", iptv: 80, vpn: 30 },
      { month: "Juil", iptv: 89, vpn: 34 },
    ],
    top_resellers: [
      { name: "Oumarou Traoré", code: "FASO-OT23", clients: 18, earnings: 54000 },
      { name: "Aïcha Sawadogo", code: "FASO-AS45", clients: 12, earnings: 36000 },
      { name: "Issouf Compaoré", code: "FASO-IC67", clients: 9, earnings: 27000 },
      { name: "Fatimata Ouédraogo", code: "FASO-FO89", clients: 7, earnings: 21000 },
      { name: "Daouda Kaboré", code: "FASO-DK12", clients: 5, earnings: 15000 },
    ],
  },
};

export function initializeData() {
  let initialized = false;
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    if (get(key) === null) {
      set(key, value);
      initialized = true;
    }
  });
  return initialized;
}

export function resetData() {
  Object.keys(DEFAULTS).forEach((key) => set(key, DEFAULTS[key]));
}

// Plans IPTV
export const getPlansIPTV = () => get("plans_iptv") || DEFAULTS.plans_iptv;
export const setPlansIPTV = (plans) => set("plans_iptv", plans);

// Plans VPN
export const getPlansVPN = () => get("plans_vpn") || DEFAULTS.plans_vpn;
export const setPlansVPN = (plans) => set("plans_vpn", plans);

// Plans Promo
export const getPlansPromo = () => get("plans_promo") || DEFAULTS.plans_promo;
export const setPlansPromo = (plans) => set("plans_promo", plans);

// Clips
export const getClips = () => get("clips") || DEMO_CLIPS;
export const setClips = (clips) => set("clips", clips);
export const addClip = (clip) => {
  const clips = getClips();
  const id = Math.max(0, ...clips.map((c) => c.id)) + 1;
  const newClip = { ...clip, id, views_count: 0, likes_count: 0, added_at: new Date().toISOString().split("T")[0] };
  setClips([...clips, newClip]);
  return newClip;
};
export const updateClip = (id, data) => setClips(getClips().map((c) => (c.id === id ? { ...c, ...data } : c)));
export const deleteClip = (id) => setClips(getClips().filter((c) => c.id !== id));
export const incrementViews = (id) => {
  const clips = getClips();
  const clip = clips.find((c) => c.id === id);
  if (clip) updateClip(id, { views_count: (clip.views_count || 0) + 1 });
};
export const toggleLike = (id) => {
  const liked = get("liked_clips") || [];
  const clips = getClips();
  const clip = clips.find((c) => c.id === id);
  if (!clip) return false;
  if (liked.includes(id)) {
    set("liked_clips", liked.filter((x) => x !== id));
    updateClip(id, { likes_count: Math.max(0, (clip.likes_count || 0) - 1) });
    return false;
  } else {
    set("liked_clips", [...liked, id]);
    updateClip(id, { likes_count: (clip.likes_count || 0) + 1 });
    return true;
  }
};
export const isLiked = (id) => (get("liked_clips") || []).includes(id);

// Promotions
export const getPromotions = () => get("promotions") || [];
export const setPromotions = (promos) => set("promotions", promos);
export const addPromotion = (promo) => {
  const promos = getPromotions();
  const id = Math.max(0, ...promos.map((p) => p.id || 0)) + 1;
  const newPromo = { ...promo, id, total_views: 0, total_clicks: 0, created_at: new Date().toISOString(), is_active: true };
  setPromotions([...promos, newPromo]);
  return newPromo;
};
export const getActivePromotions = (placement) =>
  getPromotions().filter((p) => p.is_active && (!placement || p.placement === placement) && new Date(p.end_date) > new Date());

// VPN accounts
export const getVPNAccounts = () => get("vpn_accounts") || [];
export const setVPNAccounts = (accounts) => set("vpn_accounts", accounts);
export const addVPNAccount = (account) => {
  const accounts = getVPNAccounts();
  const id = Math.max(0, ...accounts.map((a) => a.id || 0)) + 1;
  const username = "fvpn_" + Math.random().toString(36).substr(2, 6);
  const password = Math.random().toString(36).substr(2, 8);
  const newAccount = { ...account, id, username, password, created_at: new Date().toISOString() };
  setVPNAccounts([...accounts, newAccount]);
  return newAccount;
};
export const getMyVPNAccount = (userPhone) =>
  getVPNAccounts()
    .filter((a) => a.phone === userPhone)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

// Xtream config
export const getXtreamConfig = () => get("xtream_config") || DEFAULTS.xtream_config;
export const setXtreamConfig = (cfg) => set("xtream_config", cfg);

// Local server config
export const getLocalServerConfig = () => get("local_server_config") || DEFAULTS.local_server_config;
export const setLocalServerConfig = (cfg) => set("local_server_config", cfg);

// Resolve the correct video URL based on content source
export const getVideoUrl = (content) => {
  if (!content) return "";
  const lc = getLocalServerConfig();
  const xc = getXtreamConfig();
  if (content.source === "local" && lc.base_url) {
    return `${lc.base_url.replace(/\/$/, "")}/${content.local_path}`;
  }
  if (content.source === "xtream" && xc.url && content.stream_id) {
    return `${xc.url.replace(/\/$/, "")}/${xc.username}/${xc.password}/${content.stream_id}`;
  }
  return content.stream_url || "";
};

// Settings
export const getSettings = () => get("settings") || DEFAULTS.settings;
export const setSettings = (s) => set("settings", s);

// Demo stats
export const getDemoStats = () => get("demo_stats") || DEFAULTS.demo_stats;

// Movies
export const getMovies = () => get("movies") || DEMO_MOVIES;
export const setMovies = (movies) => set("movies", movies);
export const addMovie = (movie) => {
  const movies = getMovies();
  const id = Math.max(0, ...movies.map((m) => m.id)) + 1;
  const m = { ...movie, id };
  setMovies([...movies, m]);
  return m;
};
export const updateMovie = (id, data) => setMovies(getMovies().map((m) => (m.id === id ? { ...m, ...data } : m)));
export const deleteMovie = (id) => setMovies(getMovies().filter((m) => m.id !== id));

// Series
export const getSeries = () => get("series") || DEMO_SERIES;
export const setSeries = (s) => set("series", s);

// Resellers
export const getResellers = () => get("resellers") || DEMO_RESELLERS;
export const setResellers = (r) => set("resellers", r);

export const getMyReseller = (phone) => {
  if (!phone) return null;
  const p = String(phone).replace(/^\+226/, "");
  return (get("resellers") || DEMO_RESELLERS)[p] || null;
};

export const createReseller = (phone, phone_paiement) => {
  const p = String(phone).replace(/^\+226/, "");
  const code = "FASO-" + Math.random().toString(36).substr(2, 4).toUpperCase();
  const profile = {
    phone: p,
    code_parrainage: code,
    phone_paiement,
    niveau: "bronze",
    commission_rate: 15,
    total_earnings: 0,
    available_balance: 0,
    next_niveau_info: { current_count: 0, next: "silver", needed: 11, progress: 0 },
    joined_at: new Date().toISOString(),
  };
  const resellers = get("resellers") || {};
  resellers[p] = profile;
  set("resellers", resellers);
  const data = get("reseller_data") || {};
  data[p] = { clients: [], commissions: [], withdrawals: [], monthly_stats: [] };
  set("reseller_data", data);
  return profile;
};

export const getResellerData = (phone) => {
  if (!phone) return null;
  const p = String(phone).replace(/^\+226/, "");
  return (get("reseller_data") || DEMO_RESELLER_DATA)[p] || { clients: [], commissions: [], withdrawals: [], monthly_stats: [] };
};

export const addResellerWithdrawal = (phone, withdrawal) => {
  const p = String(phone).replace(/^\+226/, "");
  const all = get("reseller_data") || DEMO_RESELLER_DATA;
  const d = all[p] || { clients: [], commissions: [], withdrawals: [], monthly_stats: [] };
  const id = Math.max(0, ...d.withdrawals.map((w) => w.id || 0)) + 1;
  const w = { ...withdrawal, id, status: "pending", requested_at: new Date().toISOString() };
  d.withdrawals = [...d.withdrawals, w];
  all[p] = d;
  set("reseller_data", all);
  const resellers = get("resellers") || DEMO_RESELLERS;
  if (resellers[p]) {
    resellers[p].available_balance = Math.max(0, (resellers[p].available_balance || 0) - Number(withdrawal.amount));
    set("resellers", resellers);
  }
  return w;
};

// Helpers
export const parseYoutubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

export const thumbUrl = (youtube_id) =>
  `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg`;

export const isAdmin = (user) =>
  user?.phone === "70000000" || user?.phone === "+22670000000" || user?.is_staff === true;

// Favorites
export const getFavorites = () => get("favorites") || [];
export const addFavorite = (item) => {
  const favs = getFavorites();
  if (!favs.find((f) => f.id === item.id && f.type === item.type)) {
    set("favorites", [...favs, { ...item, saved_at: new Date().toISOString() }]);
  }
};
export const removeFavorite = (id, type) =>
  set("favorites", getFavorites().filter((f) => !(f.id === id && f.type === type)));
export const isFavorite = (id, type) =>
  getFavorites().some((f) => f.id === id && f.type === type);
