import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import useTranslation from "../hooks/useTranslation";
import {
  getMyReseller, getResellerData, addResellerWithdrawal,
} from "../utils/store";
import toast from "react-hot-toast";
import {
  MdPeople, MdMonetizationOn, MdAccountBalanceWallet, MdEmojiEvents,
  MdContentCopy, MdShare, MdQrCode, MdWhatsapp, MdClose, MdArrowForward,
  MdPhone, MdCheck, MdHistory,
} from "react-icons/md";

const NIVEAU_COLORS = {
  bronze: "text-amber-700",
  silver: "text-slate-300",
  gold: "text-gold",
  platinum: "text-cyan-400",
};

const NIVEAU_BG = {
  bronze: "bg-amber-700/10 border-amber-700/30",
  silver: "bg-slate-300/10 border-slate-300/30",
  gold: "bg-gold/10 border-gold/30",
  platinum: "bg-cyan-400/10 border-cyan-400/30",
};

const STATUS_BADGE = {
  paid: "bg-success/20 text-success",
  pending: "bg-gold/20 text-gold",
  cancelled: "bg-live/20 text-live",
  completed: "bg-success/20 text-success",
  processing: "bg-blue-500/20 text-blue-400",
  rejected: "bg-live/20 text-live",
};

const OPERATOR_LABELS = {
  orange_money: "Orange Money",
  moov_money: "Moov Money",
  coris_money: "Coris Money",
};

function StatCard({ icon: Icon, label, value, sub, accent = "text-gold" }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-btn bg-white/5 flex items-center justify-center">
          <Icon className={`text-xl ${accent}`} />
        </div>
      </div>
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function NiveauCard({ reseller }) {
  const info = reseller.next_niveau_info;
  const niveau = reseller.niveau;
  return (
    <div className={`card p-4 border ${NIVEAU_BG[niveau] || "border-border"}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider">Niveau</p>
          <p className={`text-xl font-black capitalize ${NIVEAU_COLORS[niveau] || "text-white"}`}>
            {niveau}
          </p>
        </div>
        <MdEmojiEvents className={`text-3xl ${NIVEAU_COLORS[niveau] || "text-white"}`} />
      </div>
      <p className="text-2xl font-black">{reseller.commission_rate}%</p>
      <p className="text-xs text-white/40 mb-3">taux de commission</p>
      {info?.next && (
        <>
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>{info.current_count} clients</span>
            <span>→ {info.next} ({info.needed} de plus)</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${info.progress}%` }}
            />
          </div>
        </>
      )}
      {info && !info.next && (
        <p className="text-xs text-cyan-400 font-semibold">Niveau maximum atteint !</p>
      )}
    </div>
  );
}

function CodeParrainageCard({ reseller }) {
  const [showQR, setShowQR] = useState(false);
  const code = reseller.code_parrainage;
  const link = `${window.location.origin}/login?ref=${code}`;

  const copy = () => { navigator.clipboard.writeText(code); toast.success("Code copié !"); };
  const copyLink = () => { navigator.clipboard.writeText(link); toast.success("Lien copié !"); };
  const shareWA = () => {
    const msg = encodeURIComponent(`Abonne-toi à FASO TV avec mon code *${code}* et profite de la TV en direct, films et séries !\n\nLien : ${link}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="card p-5">
      <p className="text-sm text-white/50 mb-3 font-medium">Mon code parrainage</p>
      <div className="flex items-center justify-between bg-bg rounded-btn px-4 py-3 mb-4">
        <span className="text-2xl font-black tracking-widest text-gold">{code}</span>
        <button onClick={copy} className="text-white/40 hover:text-gold transition-colors ml-3">
          <MdContentCopy className="text-xl" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { action: copy, icon: MdContentCopy, label: "Copier code", color: "text-gold" },
          { action: copyLink, icon: MdShare, label: "Copier lien", color: "text-blue-400" },
          { action: () => setShowQR(true), icon: MdQrCode, label: "QR Code", color: "text-purple-400" },
          { action: shareWA, icon: MdWhatsapp, label: "WhatsApp", color: "text-green-500" },
        ].map(({ action, icon: Icon, label, color }) => (
          <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-btn hover:bg-card-hover transition-colors text-xs text-white/60">
            <Icon className={`text-lg ${color}`} />
            {label}
          </button>
        ))}
      </div>
      {showQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
          <div className="bg-surface border border-border rounded-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">QR Code — {code}</p>
              <button onClick={() => setShowQR(false)} className="text-white/40 hover:text-white"><MdClose className="text-xl" /></button>
            </div>
            <div className="bg-white p-4 rounded-btn inline-block">
              <QRCodeSVG value={link} size={200} />
            </div>
            <p className="text-xs text-white/40 mt-3 max-w-xs">
              Faites scanner ce QR code pour que vos clients s'inscrivent avec votre code.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientsTable({ clients }) {
  if (!clients.length) {
    return (
      <div className="text-center py-10 text-white/30">
        <MdPeople className="text-4xl mx-auto mb-2" />
        <p>Aucun client encore. Partagez votre code pour commencer !</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-white/40 text-left">
            <th className="pb-3 pr-4 font-medium">Client</th>
            <th className="pb-3 pr-4 font-medium hidden md:table-cell">Téléphone</th>
            <th className="pb-3 pr-4 font-medium hidden md:table-cell">Inscription</th>
            <th className="pb-3 pr-4 font-medium">Forfait</th>
            <th className="pb-3 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b border-border/50 hover:bg-white/[0.02]">
              <td className="py-3 pr-4 font-medium">{c.client_name || c.client_phone}</td>
              <td className="py-3 pr-4 text-white/50 hidden md:table-cell">{c.client_phone}</td>
              <td className="py-3 pr-4 text-white/50 hidden md:table-cell">
                {format(new Date(c.joined_at), "dd MMM yyyy", { locale: fr })}
              </td>
              <td className="py-3 pr-4 text-white/70">{c.plan_actif || "—"}</td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.has_active_subscription ? "bg-success/20 text-success" : "bg-white/10 text-white/40"}`}>
                  {c.has_active_subscription ? "Actif" : "Expiré"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommissionsTable({ commissions }) {
  if (!commissions.length) {
    return (
      <div className="text-center py-10 text-white/30">
        <MdMonetizationOn className="text-4xl mx-auto mb-2" />
        <p>Aucune commission encore.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-white/40 text-left">
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 pr-4 font-medium">Client</th>
            <th className="pb-3 pr-4 font-medium hidden md:table-cell">Forfait</th>
            <th className="pb-3 pr-4 font-medium">Montant</th>
            <th className="pb-3 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((c) => (
            <tr key={c.id} className="border-b border-border/50 hover:bg-white/[0.02]">
              <td className="py-3 pr-4 text-white/50">
                {format(new Date(c.created_at), "dd MMM", { locale: fr })}
              </td>
              <td className="py-3 pr-4">{c.client_name || c.client_phone}</td>
              <td className="py-3 pr-4 text-white/50 hidden md:table-cell">{c.plan_name}</td>
              <td className="py-3 pr-4 font-bold text-success">+{Number(c.amount).toLocaleString()} FCFA</td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] || ""}`}>
                  {c.status === "paid" ? "Payée" : c.status === "pending" ? "En attente" : "Annulée"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawSection({ reseller, onRefresh }) {
  const [form, setForm] = useState({ amount: "", method: "orange_money", phone: reseller.phone_paiement || "" });
  const [loading, setLoading] = useState(false);
  const { withdrawals } = getResellerData(reseller.phone) || {};
  const [localWithdrawals, setLocalWithdrawals] = useState(withdrawals || []);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) > reseller.available_balance) {
      toast.error("Montant supérieur au solde disponible");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const w = addResellerWithdrawal(reseller.phone, { amount: Number(form.amount), method: form.method, phone: form.phone });
    setLocalWithdrawals((prev) => [w, ...prev]);
    toast.success("Demande de retrait envoyée !");
    setForm((f) => ({ ...f, amount: "" }));
    onRefresh();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-white/50">Solde disponible</p>
            <p className="text-3xl font-black text-gold">{Number(reseller.available_balance).toLocaleString()} FCFA</p>
          </div>
          <MdAccountBalanceWallet className="text-4xl text-gold/30" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Montant (FCFA)</label>
              <input
                type="number"
                min="1000"
                max={reseller.available_balance}
                placeholder="Min. 1 000"
                value={form.amount}
                onChange={setField("amount")}
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Opérateur</label>
              <select value={form.method} onChange={setField("method")} className="input">
                <option value="orange_money">Orange Money</option>
                <option value="moov_money">Moov Money</option>
                <option value="coris_money">Coris Money</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Numéro de réception</label>
            <div className="relative">
              <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="tel"
                placeholder="+226 70 00 00 00"
                value={form.phone}
                onChange={setField("phone")}
                className="input pl-9"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !form.amount || Number(form.amount) < 1000}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Traitement…" : "Demander le retrait"}
          </button>
        </form>
      </div>

      {localWithdrawals.length > 0 && (
        <div className="card p-5">
          <p className="font-semibold mb-3 flex items-center gap-2">
            <MdHistory className="text-white/40" /> Historique des retraits
          </p>
          <div className="space-y-2">
            {localWithdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{Number(w.amount).toLocaleString()} FCFA</p>
                  <p className="text-xs text-white/40">{OPERATOR_LABELS[w.method]} · {w.phone}</p>
                  <p className="text-xs text-white/30">
                    {format(new Date(w.requested_at), "dd MMM yyyy HH:mm", { locale: fr })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[w.status] || ""}`}>
                  {w.status === "pending" ? "En attente" : w.status === "processing" ? "En cours" : w.status === "completed" ? "Complété" : "Rejeté"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthlyChart({ data }) {
  if (!data?.length) return <div className="text-center py-8 text-white/30 text-sm">Aucune donnée.</div>;
  const formatted = data.map((d) => ({
    month: format(parseISO(d.month + "-01"), "MMM yy", { locale: fr }),
    total: d.total,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="month" tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
          formatter={(v) => [`${Number(v).toLocaleString()} FCFA`, "Commissions"]}
        />
        <Bar dataKey="total" fill="#2DD4A8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "clients", label: "Mes clients" },
  { id: "commissions", label: "Commissions" },
  { id: "withdraw", label: "Retrait" },
];

export default function ResellerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [reseller, setReseller] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const phone = user?.phone ? String(user.phone).replace(/^\+226/, "") : null;

  const load = useCallback(() => {
    if (!phone) { setLoading(false); return; }
    const r = getMyReseller(phone);
    const d = getResellerData(phone);
    setReseller(r);
    setData(d);
    setLoading(false);
  }, [phone]);

  useEffect(() => { load(); }, [load]);

  const isReseller = user?.is_reseller || !!reseller;

  if (!isReseller) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-96 text-center">
        <MdMonetizationOn className="text-gold text-5xl mb-4" />
        <h2 className="text-xl font-bold mb-2">Vous n'êtes pas encore revendeur</h2>
        <p className="text-white/40 text-sm mb-6">
          Devenez revendeur FASO TV et gagnez des commissions sur chaque abonnement.
        </p>
        <button onClick={() => navigate("/become-reseller")} className="btn-primary flex items-center gap-2">
          {t("res_devenir")} <MdArrowForward />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-card rounded-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>Profil revendeur introuvable. Contactez l'administration FAEST.</p>
      </div>
    );
  }

  const clients = data?.clients || [];
  const commissions = data?.commissions || [];
  const monthlyStats = data?.monthly_stats || [];
  const activeClients = clients.filter((c) => c.has_active_subscription).length;
  const thisMonthEarnings = commissions
    .filter((c) => c.status === "paid" && new Date(c.created_at).getMonth() === new Date().getMonth())
    .reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black">{t("res_espace")}</h1>
          <p className="text-white/40 text-sm">{reseller.code_parrainage}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${NIVEAU_BG[reseller.niveau] || ""} ${NIVEAU_COLORS[reseller.niveau] || ""}`}>
          {reseller.niveau}
        </span>
      </div>

      <div className="flex gap-1 bg-bg rounded-btn p-1 mb-6 overflow-x-auto">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 min-w-max py-2 px-3 text-sm font-semibold rounded-[8px] transition-all whitespace-nowrap ${
              tab === tb.id ? "bg-gold text-black" : "text-white/50 hover:text-white"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={MdPeople} label={t("res_clients_actifs")} value={activeClients} sub={`${clients.length} au total`} accent="text-blue-400" />
            <StatCard icon={MdMonetizationOn} label={t("res_mois")} value={`${thisMonthEarnings.toLocaleString()} FCFA`} accent="text-success" />
            <StatCard icon={MdAccountBalanceWallet} label={t("res_solde")} value={`${Number(reseller.available_balance).toLocaleString()} FCFA`} accent="text-gold" />
            <NiveauCard reseller={reseller} />
          </div>
          <CodeParrainageCard reseller={reseller} />
          <div className="card p-5">
            <p className="font-semibold mb-4">Commissions — 6 derniers mois</p>
            <MonthlyChart data={monthlyStats} />
          </div>
        </div>
      )}

      {tab === "clients" && (
        <div className="card p-5">
          <p className="font-semibold mb-4">Mes clients ({clients.length})</p>
          <ClientsTable clients={clients} />
        </div>
      )}

      {tab === "commissions" && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Commissions ({commissions.length})</p>
            <p className="text-sm text-success font-bold">
              Total : {Number(reseller.total_earnings).toLocaleString()} FCFA
            </p>
          </div>
          <CommissionsTable commissions={commissions} />
        </div>
      )}

      {tab === "withdraw" && (
        <WithdrawSection reseller={reseller} onRefresh={load} />
      )}
    </div>
  );
}
