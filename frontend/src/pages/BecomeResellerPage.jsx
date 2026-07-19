import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createReseller } from "../utils/store";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  MdMonetizationOn, MdPhone, MdArrowBack, MdCheck,
  MdPeople, MdTrendingUp, MdAccountBalanceWallet,
} from "react-icons/md";

const BENEFITS = [
  { icon: MdMonetizationOn, label: "Commission jusqu'à 30%", desc: "Sur chaque abonnement de vos clients" },
  { icon: MdPeople, label: "Réseau illimité", desc: "Recrutez autant de clients que vous voulez" },
  { icon: MdTrendingUp, label: "Niveau évolutif", desc: "Bronze → Silver → Gold → Platinum" },
  { icon: MdAccountBalanceWallet, label: "Retrait Mobile Money", desc: "Orange Money, Moov Money, Coris Money" },
];

export default function BecomeResellerPage() {
  const [form, setForm] = useState({ phone_paiement: "", motivation: "" });
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create localStorage profile first (works offline)
      const phone = user?.phone || "";
      createReseller(phone, form.phone_paiement);
      // Try to also register via API (non-blocking)
      try { await api.post("/resellers/register/", form); } catch {}
      await refreshUser();
      toast.success("Félicitations ! Vous êtes maintenant revendeur FASO TV.");
      navigate("/reseller");
    } catch (err) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm"
      >
        <MdArrowBack /> Retour
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
          <MdMonetizationOn className="text-gold text-3xl" />
        </div>
        <h1 className="text-2xl font-black mb-2">Devenez Revendeur FASO TV</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          Recrutez des abonnés et gagnez des commissions sur chaque paiement.
          Retrait direct sur Mobile Money.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {BENEFITS.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="card p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-btn bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Icon className="text-gold text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-white/40 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Niveaux */}
      <div className="card p-4 mb-6">
        <p className="text-sm font-semibold mb-3 text-white/60">Barème des commissions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { level: "Bronze", clients: "0–10", rate: "15%", color: "text-amber-700" },
            { level: "Silver", clients: "11–30", rate: "20%", color: "text-slate-300" },
            { level: "Gold", clients: "31–100", rate: "25%", color: "text-gold" },
            { level: "Platinum", clients: "100+", rate: "30%", color: "text-cyan-400" },
          ].map((n) => (
            <div key={n.level} className="bg-bg rounded-btn p-3 text-center">
              <p className={`font-bold text-sm ${n.color}`}>{n.level}</p>
              <p className="text-white/40 text-xs">{n.clients} clients</p>
              <p className="text-white font-black text-lg">{n.rate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <h2 className="font-bold mb-4">Votre inscription revendeur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">
              Numéro Mobile Money (pour recevoir vos commissions)
            </label>
            <div className="relative">
              <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
              <input
                type="tel"
                placeholder="+226 70 00 00 00"
                value={form.phone_paiement}
                onChange={set("phone_paiement")}
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-1.5 block">
              Motivation / Zone d'activité <span className="text-white/30">(optionnel)</span>
            </label>
            <textarea
              placeholder="Ex: Je suis actif à Ouagadougou secteur 22, je veux proposer FASO TV à mon quartier..."
              value={form.motivation}
              onChange={set("motivation")}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-white/40 bg-card rounded-btn p-3">
            <MdCheck className="text-success flex-shrink-0 mt-0.5" />
            En devenant revendeur, vous acceptez de respecter les conditions de partenariat FAEST.
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Inscription en cours…" : "Devenir revendeur"}
          </button>
        </form>
      </div>
    </div>
  );
}
