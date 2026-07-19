import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPlansVPN, getMyVPNAccount, addVPNAccount, isAdmin, getMyReseller } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import {
  MdVpnKey, MdCheck, MdPhone, MdClose, MdContentCopy,
  MdWhatsapp, MdExpandMore, MdExpandLess, MdStar,
  MdRouter, MdLock, MdSignalWifi4Bar, MdOpenInNew,
} from "react-icons/md";
import toast from "react-hot-toast";

const OPERATORS = [
  { key: "orange_money", label: "Orange Money", emoji: "🟠" },
  { key: "moov_money", label: "Moov Money", emoji: "🔵" },
  { key: "coris_money", label: "Coris Money", emoji: "🟢" },
];

const VPN_SERVER = "fasovpn.duckdns.org";
const VPN_SECRET = "FasoVPN2026!";

// ─── Guide de connexion ───────────────────────────────────────────────────────

const GUIDES = [
  {
    os: "Android",
    icon: "🤖",
    steps: [
      "Ouvrez les Paramètres de votre téléphone",
      "Allez dans Connexions > Plus de paramètres de connexion > VPN",
      "Appuyez sur ⊕ pour ajouter un VPN",
      "Type : L2TP/IPSec PSK",
      `Nom de serveur : ${VPN_SERVER}`,
      `Clé pré-partagée (PSK) : ${VPN_SECRET}`,
      "Entrez votre nom d'utilisateur et mot de passe",
      "Appuyez sur Enregistrer puis Connecter",
    ],
  },
  {
    os: "iPhone / iPad",
    icon: "🍎",
    steps: [
      "Allez dans Réglages > Général > VPN et gestion de l'appareil",
      "Appuyez sur VPN > Ajouter une configuration VPN",
      "Type : L2TP",
      `Serveur : ${VPN_SERVER}`,
      `Secret : ${VPN_SECRET}`,
      "Entrez votre identifiant et mot de passe",
      "Appuyez sur Terminé puis activez le commutateur VPN",
    ],
  },
  {
    os: "Windows",
    icon: "🪟",
    steps: [
      "Allez dans Paramètres > Réseau et Internet > VPN",
      "Cliquez sur Ajouter un VPN",
      `Fournisseur VPN : Windows (intégré)`,
      `Nom de la connexion : FASO VPN`,
      `Nom ou adresse du serveur : ${VPN_SERVER}`,
      "Type VPN : L2TP/IPsec avec clé pré-partagée",
      `Clé pré-partagée : ${VPN_SECRET}`,
      "Entrez votre nom d'utilisateur et mot de passe, puis Enregistrer",
    ],
  },
  {
    os: "macOS",
    icon: "🍏",
    steps: [
      "Ouvrez Préférences Système > Réseau",
      "Cliquez sur + pour ajouter une interface",
      "Interface : VPN, Type VPN : L2TP via IPSec",
      `Adresse du serveur : ${VPN_SERVER}`,
      "Cliquez sur Réglages d'authentification",
      `Clé partagée : ${VPN_SECRET}`,
      "Entrez votre nom d'utilisateur et mot de passe, puis Connecter",
    ],
  },
];

function GuideAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      {GUIDES.map((guide) => (
        <div key={guide.os} className="card overflow-hidden">
          <button
            onClick={() => setOpen(open === guide.os ? null : guide.os)}
            className="w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{guide.icon}</span>
              <span className="font-semibold">{guide.os}</span>
            </div>
            {open === guide.os ? <MdExpandLess className="text-white/40" /> : <MdExpandMore className="text-white/40" />}
          </button>
          {open === guide.os && (
            <div className="px-4 pb-4 border-t border-border">
              <ol className="space-y-2 mt-3">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                    <span className="text-white/70">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── VPN Plan Card ────────────────────────────────────────────────────────────

function VPNPlanCard({ plan, onSelect, isActive }) {
  const isPopular = plan.slug === "vpn_monthly";
  return (
    <div className={`card p-5 relative flex flex-col ${isPopular ? "border-blue-500/40 bg-blue-500/5" : ""}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          ⭐ POPULAIRE
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-lg">{plan.name}</h3>
        <p className="text-white/40 text-sm">
          {plan.duration_hours < 48 ? `${plan.duration_hours}h` : `${Math.round(plan.duration_hours / 24)} jours`}
        </p>
      </div>
      <p className="text-3xl font-black text-blue-400 mb-1">{Number(plan.price).toLocaleString()} <span className="text-sm font-normal text-white/50">FCFA</span></p>
      <ul className="space-y-1.5 flex-1 mb-5 mt-4">
        {[`${plan.bandwidth}`, `${plan.devices} appareil${plan.devices > 1 ? "s" : ""}`, "Chiffré SSL/IPSec", "Support 24/7"].map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/70">
            <MdCheck className="text-blue-400 flex-shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-btn font-semibold transition-all ${
          isActive ? "bg-success/20 text-success border border-success/40 cursor-default" : isPopular ? "bg-blue-600 text-white hover:bg-blue-500" : "btn-outline"
        }`}
        disabled={isActive}
      >
        {isActive ? "✓ Abonnement actif" : "Choisir ce plan"}
      </button>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function VPNPaymentModal({ plan, userPhone, onClose, onSuccess }) {
  const [method, setMethod] = useState("orange_money");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + plan.duration_hours);
    addVPNAccount({
      phone: userPhone,
      plan_name: plan.name,
      plan_slug: plan.slug,
      plan_price: plan.price,
      payment_method: method,
      payment_phone: phone,
      ref_code: refCode,
      end_date: endDate.toISOString(),
      is_active: true,
    });
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-card p-6 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-lg">Payer {Number(plan.price).toLocaleString()} FCFA</h2>
            <p className="text-white/50 text-sm">{plan.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><MdClose className="text-xl" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Opérateur</label>
            <div className="grid grid-cols-3 gap-2">
              {OPERATORS.map((op) => (
                <button
                  key={op.key}
                  type="button"
                  onClick={() => setMethod(op.key)}
                  className={`p-3 rounded-btn border text-center transition-all ${method === op.key ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-border text-white/60 hover:border-white/20"}`}
                >
                  <div className="text-2xl mb-1">{op.emoji}</div>
                  <p className="text-xs font-medium leading-tight">{op.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
            <input type="tel" placeholder="+226 70 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" required />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Code parrainage (optionnel)</label>
            <input placeholder="ex: FASO-AB12" value={refCode} onChange={(e) => setRefCode(e.target.value)} className="input" />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white font-semibold w-full py-3 rounded-btn hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement…</> : `Payer ${Number(plan.price).toLocaleString()} FCFA`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── My VPN Section ───────────────────────────────────────────────────────────

function MyVPNSection({ account }) {
  const isActive = account.is_active && new Date(account.end_date) > new Date();
  const daysLeft = Math.max(0, Math.ceil((new Date(account.end_date) - new Date()) / 86400000));

  const credentials = {
    Serveur: VPN_SERVER,
    Type: "L2TP/IPSec",
    Secret: VPN_SECRET,
    Username: account.username,
    Password: account.password,
  };

  const copyAll = () => {
    const text = Object.entries(credentials).map(([k, v]) => `${k} : ${v}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Identifiants copiés !");
  };

  const shareWA = () => {
    const text = encodeURIComponent(
      `🔒 Mes identifiants FASO VPN\n\n${Object.entries(credentials).map(([k, v]) => `${k} : ${v}`).join("\n")}\n\n📱 Guide de connexion dans l'app FASO TV`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copy = (val) => { navigator.clipboard.writeText(val); toast.success("Copié !"); };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status */}
      <div className={`card p-5 border ${isActive ? "border-success/30 bg-success/5" : "border-live/30 bg-live/5"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">Statut VPN</p>
            <p className={`text-xl font-black ${isActive ? "text-success" : "text-live"}`}>
              {isActive ? `Actif — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}` : "Expiré"}
            </p>
            <p className="text-white/40 text-xs mt-1">{account.plan_name}</p>
          </div>
          <MdVpnKey className={`text-4xl ${isActive ? "text-success/30" : "text-live/30"}`} />
        </div>
        {isActive && (
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: `${Math.min(100, (daysLeft / (account.plan_name?.includes("90") ? 90 : account.plan_name?.includes("30") ? 30 : account.plan_name?.includes("7") ? 7 : 1)) * 100)}%` }} />
          </div>
        )}
      </div>

      {/* Credentials */}
      <div className="card p-5">
        <p className="font-semibold mb-4">Vos identifiants VPN</p>
        <div className="space-y-3">
          {Object.entries(credentials).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between bg-bg rounded-btn px-4 py-2.5">
              <div>
                <p className="text-xs text-white/40">{label}</p>
                <p className="font-mono font-medium">{value}</p>
              </div>
              <button onClick={() => copy(value)} className="text-white/30 hover:text-gold transition-colors ml-2">
                <MdContentCopy className="text-lg" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={copyAll} className="flex-1 btn-outline text-sm py-2 flex items-center justify-center gap-2">
            <MdContentCopy /> Tout copier
          </button>
          <button onClick={shareWA} className="flex-1 border border-green-500/30 text-green-400 rounded-btn text-sm py-2 flex items-center justify-center gap-2 hover:bg-green-500/10 transition-colors">
            <MdWhatsapp /> WhatsApp
          </button>
        </div>
      </div>

      {/* Guide */}
      <div>
        <p className="font-semibold mb-3">Guide de connexion</p>
        <GuideAccordion />
      </div>
    </div>
  );
}

// ─── Bundle Cards ─────────────────────────────────────────────────────────────

function BundleSection({ onSelectBundle }) {
  const bundles = [
    { name: "IPTV Mensuel + VPN 30j", price: 4500, original: 5000, saving: 500 },
    { name: "IPTV Premium + VPN 90j", price: 10000, original: 11000, saving: 1000 },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">🎁 Offres Bundle IPTV + VPN</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((b) => (
          <div key={b.name} className="card p-5 border-gold/20 bg-gold/5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold">{b.name}</h3>
                <p className="text-white/40 text-xs mt-0.5">Économisez {b.saving.toLocaleString()} FCFA</p>
              </div>
              <span className="bg-live/20 text-live text-xs font-bold px-2 py-0.5 rounded-badge">-{Math.round((b.saving / b.original) * 100)}%</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-2xl font-black text-gold">{b.price.toLocaleString()} FCFA</p>
              <p className="text-white/30 text-sm line-through">{b.original.toLocaleString()}</p>
            </div>
            <button onClick={() => onSelectBundle(b)} className="btn-primary w-full text-sm py-2">
              Choisir ce bundle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Antennes VPN (Mode 2 — Admin/Gold+) ─────────────────────────────────────

const ANTENNES = [
  { label: "Antenne Nord Ouaga", ip: "10.147.17.186", type: "Ubiquiti NanoStation M5", status: "online" },
  { label: "Antenne Centre Ouaga", ip: "10.147.17.11", type: "Ubiquiti AirGrid M5", status: "online" },
  { label: "Antenne Sud Ouaga", ip: "10.147.17.180", type: "Ubiquiti Rocket M5", status: "degraded" },
];

const OPENVPN_SERVER = "faestouaga.duckdns.org";
const OPENVPN_PORT = "1194";

function AntennesVPNSection() {
  const { t } = useTranslation();
  const [openAntenne, setOpenAntenne] = useState(null);

  const copy = (val) => { navigator.clipboard.writeText(val); toast.success("Copié !"); };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero antennes */}
      <div className="card p-5 border-purple-500/30 bg-purple-500/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-btn bg-purple-500/20 flex items-center justify-center">
            <MdRouter className="text-purple-400 text-xl" />
          </div>
          <div>
            <h3 className="font-bold">{t("vpn_antennes")}</h3>
            <p className="text-white/50 text-xs">{t("vpn_antennes_sub")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {["🔒 OpenVPN 1194 UDP/TCP", "🌐 Tunneling Ubiquiti", "⚡ Accès SSH & Winbox"].map((f) => (
            <span key={f} className="bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full px-3 py-1">{f}</span>
          ))}
        </div>
      </div>

      {/* OpenVPN Config */}
      <div className="card p-5">
        <p className="font-semibold mb-4 flex items-center gap-2">
          <MdLock className="text-purple-400" /> {t("vpn_protocoles")}
        </p>
        <div className="space-y-3">
          {[
            { label: "Serveur OpenVPN", value: OPENVPN_SERVER },
            { label: "Port UDP", value: OPENVPN_PORT + " (UDP)" },
            { label: "Port TCP", value: OPENVPN_PORT + " (TCP)" },
            { label: "Protocole", value: "OpenVPN TLS 1.3" },
            { label: "Certificat", value: "ca.crt + client.ovpn (télécharger)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between bg-bg rounded-btn px-4 py-2.5">
              <div>
                <p className="text-xs text-white/40">{label}</p>
                <p className="font-mono text-sm font-medium">{value}</p>
              </div>
              <button onClick={() => copy(value)} className="text-white/30 hover:text-purple-400 transition-colors ml-2">
                <MdContentCopy className="text-lg" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.info("Fichier .ovpn disponible auprès de l'admin FAEST")}
          className="mt-4 w-full border border-purple-500/30 text-purple-400 rounded-btn py-2.5 text-sm font-semibold hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-2"
        >
          <MdOpenInNew /> Télécharger le fichier .ovpn
        </button>
      </div>

      {/* Antennes status */}
      <div className="card p-5">
        <p className="font-semibold mb-4 flex items-center gap-2">
          <MdSignalWifi4Bar className="text-purple-400" /> Antennes réseau FAEST
        </p>
        <div className="space-y-2">
          {ANTENNES.map((a) => (
            <div key={a.ip} className="overflow-hidden">
              <button
                onClick={() => setOpenAntenne(openAntenne === a.ip ? null : a.ip)}
                className="w-full flex items-center justify-between p-4 bg-bg rounded-btn hover:bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${a.status === "online" ? "bg-success animate-pulse" : "bg-gold animate-pulse"}`} />
                  <div className="text-left">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-white/40">{a.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${a.status === "online" ? "text-success" : "text-gold"}`}>
                    {a.status === "online" ? "En ligne" : "Dégradé"}
                  </span>
                  {openAntenne === a.ip ? <MdExpandLess className="text-white/40" /> : <MdExpandMore className="text-white/40" />}
                </div>
              </button>
              {openAntenne === a.ip && (
                <div className="px-4 pb-4 border-t border-border bg-bg/50">
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">IP antenne</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{a.ip}</span>
                        <button onClick={() => copy(a.ip)} className="text-white/30 hover:text-purple-400"><MdContentCopy className="text-sm" /></button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toast.info(`SSH : ssh ubnt@${a.ip}`)} className="flex-1 text-xs border border-border text-white/60 rounded-btn py-2 hover:border-purple-500/30 hover:text-purple-400 transition-colors">
                        SSH
                      </button>
                      <button onClick={() => toast.info(`Winbox : connectez-vous avec ${a.ip}`)} className="flex-1 text-xs border border-border text-white/60 rounded-btn py-2 hover:border-purple-500/30 hover:text-purple-400 transition-colors">
                        Winbox
                      </button>
                      <button onClick={() => window.open(`http://${a.ip}`, "_blank")} className="flex-1 text-xs border border-border text-white/60 rounded-btn py-2 hover:border-purple-500/30 hover:text-purple-400 transition-colors">
                        Web UI
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VPNPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const admin = isAdmin(user);
  const phone = String(user?.phone || "").replace(/^\+226/, "");
  const myReseller = getMyReseller(phone);
  const canAccessAntennes = admin || ["gold", "platinum"].includes(myReseller?.niveau);
  const [plans, setPlans] = useState([]);
  const [myAccount, setMyAccount] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [tab, setTab] = useState("plans"); // plans | myvpn | antennes

  const refresh = () => {
    setPlans(getPlansVPN());
    if (user?.phone) setMyAccount(getMyVPNAccount(user.phone));
  };

  useEffect(() => { refresh(); }, [user?.phone]);

  const handleSuccess = () => {
    setSelectedPlan(null);
    refresh();
    setTab("myvpn");
    toast.success("VPN activé ! Accédez à vos identifiants ci-dessous.");
  };

  const hasActive = myAccount && myAccount.is_active && new Date(myAccount.end_date) > new Date();

  return (
    <div className="animate-fade-in">
      {selectedPlan && (
        <VPNPaymentModal
          plan={selectedPlan}
          userPhone={user?.phone}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="p-4 md:p-6 space-y-6">
        {/* Hero */}
        <div className="relative rounded-card overflow-hidden bg-gradient-to-r from-blue-900/60 to-[#0a1628] p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <MdVpnKey className="text-blue-400 text-2xl" />
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">FASO VPN</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">Internet libre et sécurisé</h1>
            <p className="text-white/60 text-lg mb-6">Naviguez sans limites depuis le Burkina Faso</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {["🔒 Chiffré", "🌍 Accès mondial", "⚡ Ultra rapide", "📱 Tous appareils"].map((f) => (
                <span key={f} className="bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-full px-4 py-1.5">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-bg rounded-btn p-1 overflow-x-auto">
          {[
            { id: "plans", label: t("vpn_forfaits") },
            ...(myAccount ? [{ id: "myvpn", label: t("vpn_mon") }] : []),
            ...(canAccessAntennes ? [{ id: "antennes", label: t("vpn_antennes") }] : []),
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 min-w-max py-2 px-4 rounded-[8px] text-sm font-semibold transition-all whitespace-nowrap ${tab === tb.id ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"}`}
            >
              {tb.label}
              {tb.id === "myvpn" && hasActive && <span className="ml-2 w-2 h-2 rounded-full bg-success inline-block" />}
            </button>
          ))}
        </div>

        {(!myAccount || tab === "plans") && (
          <>
            <div>
              <h2 className="text-lg font-bold mb-1">Choisissez votre forfait</h2>
              <p className="text-white/40 text-sm mb-4">Accès immédiat après paiement Mobile Money</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {plans.filter((p) => p.is_active).map((plan) => (
                  <VPNPlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={setSelectedPlan}
                    isActive={hasActive && myAccount?.plan_slug === plan.slug}
                  />
                ))}
              </div>
            </div>
            <BundleSection onSelectBundle={(b) => toast.info(`Pour le bundle "${b.name}", contactez-nous sur WhatsApp.`)} />
          </>
        )}

        {myAccount && tab === "myvpn" && (
          <MyVPNSection account={myAccount} />
        )}

        {canAccessAntennes && tab === "antennes" && (
          <AntennesVPNSection />
        )}
      </div>
    </div>
  );
}
