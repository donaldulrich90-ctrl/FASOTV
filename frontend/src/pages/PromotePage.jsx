import { useState, useEffect } from "react";
import {
  getPlansPromo, addPromotion, getPromotions,
  parseYoutubeId, thumbUrl,
} from "../utils/store";
import {
  MdPlayArrow, MdCampaign, MdPhone, MdCheck, MdClose,
  MdVisibility, MdTrendingUp, MdContentCopy, MdShare,
} from "react-icons/md";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const OPERATORS = [
  { key: "orange_money", label: "Orange Money", emoji: "🟠" },
  { key: "moov_money", label: "Moov Money", emoji: "🔵" },
  { key: "coris_money", label: "Coris Money", emoji: "🟢" },
];

const PLACEMENT_LABELS = {
  hero: "Page d'accueil (Hero)",
  trending: "Section Tendances",
  new: "Section Nouveautés",
  banner: "Bannière latérale",
  pack: "Pack complet (toutes sections)",
};

const PLACEMENT_ICONS = { hero: "🏠", trending: "🔥", new: "✨", banner: "📌", pack: "⭐" };

// ─── Promotion Tracker ────────────────────────────────────────────────────────

function PromoTracker({ promo, onClose }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(promo.end_date) - new Date()) / 86400000));
  const shareLink = `${window.location.origin}/promo-track/${promo.id}`;

  const demoViews = Array.from({ length: 7 }, (_, i) => ({
    day: `J${i + 1}`,
    vues: Math.floor(Math.random() * 300) + 50,
  }));

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-card p-6 max-w-lg w-full space-y-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-bold">Suivi de votre promotion</p>
          <button onClick={onClose} className="text-white/40 hover:text-white"><MdClose className="text-xl" /></button>
        </div>

        {/* Clip preview */}
        <div className="flex items-center gap-3">
          <img src={thumbUrl(promo.youtube_id)} alt={promo.title} className="w-20 h-14 object-cover rounded-btn" />
          <div>
            <p className="font-semibold">{promo.title}</p>
            <p className="text-white/40 text-sm">{promo.advertiser_name}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${promo.is_active ? "bg-success/20 text-success" : "bg-white/10 text-white/40"}`}>
              {promo.is_active ? `Actif — ${daysLeft}j restants` : "Expiré"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3 text-center">
            <p className="text-2xl font-black text-gold">{(promo.total_views || 0).toLocaleString()}</p>
            <p className="text-xs text-white/50">Vues totales</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-black text-blue-400">{(promo.total_clicks || 0).toLocaleString()}</p>
            <p className="text-xs text-white/50">Clics</p>
          </div>
        </div>

        {/* Chart */}
        <div>
          <p className="text-sm text-white/50 mb-2">Vues par jour (simulation)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={demoViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" />
              <XAxis dataKey="day" tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff50", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#161625", border: "1px solid #2A2A40", borderRadius: 8 }} labelStyle={{ color: "#fff" }} />
              <Line type="monotone" dataKey="vues" stroke="#F5A623" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button
          onClick={() => { navigator.clipboard.writeText(shareLink); }}
          className="btn-outline w-full flex items-center justify-center gap-2 text-sm py-2"
        >
          <MdContentCopy /> Copier le lien de suivi
        </button>
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(plan)}
      className={`card p-5 cursor-pointer transition-all ${
        selected ? "border-gold bg-gold/5" : "hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xl">{PLACEMENT_ICONS[plan.placement]}</p>
          <h3 className="font-bold mt-1">{plan.name}</h3>
          <p className="text-white/40 text-xs mt-0.5">{PLACEMENT_LABELS[plan.placement]}</p>
        </div>
        {selected && <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0"><MdCheck className="text-black text-sm" /></div>}
      </div>
      <p className="text-2xl font-black text-gold">{Number(plan.price).toLocaleString()} <span className="text-sm font-normal text-white/50">FCFA</span></p>
      <p className="text-xs text-white/40 mt-1">{plan.duration_hours / 24} jour{plan.duration_hours / 24 > 1 ? "s" : ""}</p>
    </div>
  );
}

// ─── Confirmation Page ────────────────────────────────────────────────────────

function ConfirmationPage({ promo, onTrack, onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-5 animate-slide-up max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
        <MdCheck className="text-success text-4xl" />
      </div>
      <h2 className="text-2xl font-black">Promotion lancée !</h2>
      <p className="text-white/50">Votre contenu est maintenant visible par <span className="text-gold font-bold">12 000+ abonnés</span> FASO TV !</p>

      <div className="card p-4 w-full text-left space-y-2 text-sm">
        <p className="font-semibold text-white/70 mb-2">Récapitulatif</p>
        <div className="flex justify-between"><span className="text-white/40">Contenu</span><span>{promo.title}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Plan</span><span>{promo.plan_name}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Placement</span><span>{PLACEMENT_LABELS[promo.placement]}</span></div>
        <div className="flex justify-between font-bold border-t border-border pt-2 mt-1"><span>Montant payé</span><span className="text-gold">{Number(promo.plan_price).toLocaleString()} FCFA</span></div>
      </div>

      <div className="flex flex-col w-full gap-2">
        <button onClick={onTrack} className="btn-primary flex items-center justify-center gap-2">
          <MdTrendingUp /> Voir mes statistiques
        </button>
        <button onClick={onNew} className="btn-outline">
          Créer une autre promotion
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PromotePage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState("plans"); // plans | form | payment | done
  const [form, setForm] = useState({
    youtube_url: "", youtube_id: "", title: "", description: "",
    advertiser_name: "", advertiser_phone: "",
    payment_method: "orange_money", payment_phone: "",
  });
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [donePromo, setDonePromo] = useState(null);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => { setPlans(getPlansPromo().filter((p) => p.is_active)); }, []);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUrl = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, youtube_url: val }));
    const id = parseYoutubeId(val);
    setForm((f) => ({ ...f, youtube_url: val, youtube_id: id || "" }));
    setPreview(!!id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.youtube_id) { alert("URL YouTube invalide"); return; }
    if (!selectedPlan) { alert("Choisissez un plan"); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500)); // simulate payment

    const endDate = new Date();
    endDate.setHours(endDate.getHours() + selectedPlan.duration_hours);

    const promo = addPromotion({
      ...form,
      thumbnail: thumbUrl(form.youtube_id),
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      plan_price: selectedPlan.price,
      placement: selectedPlan.placement,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      payment_status: "paid",
    });

    setDonePromo(promo);
    setStep("done");
    setSubmitting(false);
  };

  if (step === "done" && donePromo) {
    return (
      <div className="p-4 md:p-6">
        {showTracker && <PromoTracker promo={donePromo} onClose={() => setShowTracker(false)} />}
        <ConfirmationPage
          promo={donePromo}
          onTrack={() => setShowTracker(true)}
          onNew={() => { setStep("plans"); setForm({ youtube_url: "", youtube_id: "", title: "", description: "", advertiser_name: "", advertiser_phone: "", payment_method: "orange_money", payment_phone: "" }); setSelectedPlan(null); setDonePromo(null); }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-card overflow-hidden bg-gradient-to-r from-purple-900/50 to-[#1a0a2e] p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <MdCampaign className="text-purple-400 text-2xl" />
            <span className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Promotion</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Faites découvrir votre contenu<br />à <span className="text-gold">12 000+ abonnés</span> FASO TV
          </h1>
          <p className="text-white/60 text-lg mb-6">Artistes, entreprises, événements — boostez votre visibilité</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-white/10 rounded-full px-4 py-2">👥 12 000+ abonnés</span>
            <span className="bg-white/10 rounded-full px-4 py-2">👁️ 50 000+ vues/mois</span>
            <span className="bg-white/10 rounded-full px-4 py-2">🇧🇫 100% audience locale</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-bold mb-4">Comment ça marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: "1", icon: "▶️", title: "Collez votre lien YouTube", desc: "URL YouTube de votre clip ou publicité" },
            { n: "2", icon: "📌", title: "Choisissez le placement", desc: "Hero, Tendances, Nouveautés ou Bannière" },
            { n: "3", icon: "💳", title: "Payez via Mobile Money", desc: "Orange, Moov ou Coris Money. En ligne immédiatement." },
          ].map((item) => (
            <div key={item.n} className="card p-5">
              <div className="w-10 h-10 rounded-full bg-gold/20 text-gold font-black text-xl flex items-center justify-center mb-3">{item.n}</div>
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-white/50 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-bold mb-2">Choisissez votre plan</h2>
        <p className="text-white/40 text-sm mb-4">Prix modifiables par l'administrateur</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} selected={selectedPlan?.id === plan.id} onSelect={setSelectedPlan} />
          ))}
        </div>
      </div>

      {/* Form */}
      {selectedPlan && (
        <div className="card p-6 space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Votre contenu</h2>
            <span className="text-gold font-bold text-sm">{selectedPlan.name} — {Number(selectedPlan.price).toLocaleString()} FCFA</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* YouTube URL */}
            <div>
              <label className="text-sm text-white/50 mb-1.5 block">URL YouTube *</label>
              <input value={form.youtube_url} onChange={handleUrl} placeholder="https://youtube.com/watch?v=..." className="input" required />
              {preview && form.youtube_id && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={thumbUrl(form.youtube_id)} alt="preview" className="w-24 h-14 object-cover rounded-btn" onError={(e) => e.target.style.display = "none"} />
                  <span className="text-xs text-success">✓ ID : {form.youtube_id}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Titre *</label>
                <input value={form.title} onChange={setF("title")} placeholder="Titre du clip ou de la pub" className="input" required />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Description courte</label>
                <input value={form.description} onChange={setF("description")} placeholder="Courte description" className="input" />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Nom de l'annonceur *</label>
                <input value={form.advertiser_name} onChange={setF("advertiser_name")} placeholder="Votre nom ou nom d'entreprise" className="input" required />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Téléphone *</label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input value={form.advertiser_phone} onChange={setF("advertiser_phone")} placeholder="+226 70 00 00 00" className="input pl-10" required />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Paiement Mobile Money</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {OPERATORS.map((op) => (
                  <button
                    key={op.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, payment_method: op.key }))}
                    className={`p-3 rounded-btn border text-center transition-all ${
                      form.payment_method === op.key ? "border-gold bg-gold/10 text-gold" : "border-border text-white/60 hover:border-white/20"
                    }`}
                  >
                    <div className="text-xl mb-1">{op.emoji}</div>
                    <p className="text-xs font-medium leading-tight">{op.label}</p>
                  </button>
                ))}
              </div>
              <div className="relative">
                <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input value={form.payment_phone} onChange={setF("payment_phone")} placeholder="Numéro de paiement Mobile Money" className="input pl-10" required />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-card rounded-btn p-4 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-white/50">Plan</span><span>{selectedPlan.name}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Placement</span><span>{PLACEMENT_LABELS[selectedPlan.placement]}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Durée</span><span>{selectedPlan.duration_hours / 24} jour(s)</span></div>
              <div className="flex justify-between font-black border-t border-border pt-2 mt-1 text-base">
                <span>Total</span>
                <span className="text-gold">{Number(selectedPlan.price).toLocaleString()} FCFA</span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Traitement…</>
              ) : (
                <>Publier ma promotion — {Number(selectedPlan.price).toLocaleString()} FCFA</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
