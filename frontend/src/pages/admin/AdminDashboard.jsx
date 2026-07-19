import { getDemoStats } from "../../utils/store";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import { MdTrendingUp, MdPeople, MdMonetizationOn, MdCampaign, MdStar, MdEmojiEvents } from "react-icons/md";

function StatCard({ icon: Icon, label, value, accent = "text-gold", sub }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`text-2xl ${accent}`} />
      </div>
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "#161625", border: "1px solid #2A2A40", borderRadius: 8 },
  labelStyle: { color: "#fff" },
};

export default function AdminDashboard() {
  const stats = getDemoStats();
  const total = stats.revenue_iptv_month + stats.revenue_vpn_month + stats.revenue_promo_month;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-white/40 text-sm mt-0.5">Vue d'ensemble de l'activité FASO TV</p>
      </div>

      {/* Revenue total */}
      <div className="card p-6 border-gold/20 bg-gold/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">Revenus totaux ce mois</p>
            <p className="text-4xl font-black text-gold mt-1">{total.toLocaleString()} FCFA</p>
          </div>
          <MdMonetizationOn className="text-5xl text-gold/30" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={MdMonetizationOn} label="Revenus IPTV" value={`${(stats.revenue_iptv_month / 1000).toFixed(0)}k FCFA`} accent="text-gold" />
        <StatCard icon={MdStar} label="Revenus VPN" value={`${(stats.revenue_vpn_month / 1000).toFixed(0)}k FCFA`} accent="text-blue-400" />
        <StatCard icon={MdCampaign} label="Revenus Promos" value={`${(stats.revenue_promo_month / 1000).toFixed(0)}k FCFA`} accent="text-purple-400" />
        <StatCard icon={MdPeople} label="Abonnés IPTV" value={stats.subscribers_iptv} accent="text-success" sub="actifs" />
        <StatCard icon={MdPeople} label="Abonnés VPN" value={stats.subscribers_vpn} accent="text-blue-400" sub="actifs" />
        <StatCard icon={MdEmojiEvents} label="Revendeurs" value={stats.resellers_active} accent="text-amber-400" sub="actifs" />
      </div>

      {/* Daily revenue chart */}
      <div className="card p-5">
        <p className="font-semibold mb-4">Revenus par jour (ce mois)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.daily_revenue} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" />
            <XAxis dataKey="day" tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [`${Number(v).toLocaleString()} FCFA`, name === "iptv" ? "IPTV" : name === "vpn" ? "VPN" : "Promo"]} />
            <Bar dataKey="iptv" fill="#F5A623" radius={[3, 3, 0, 0]} name="iptv" />
            <Bar dataKey="vpn" fill="#3B82F6" radius={[3, 3, 0, 0]} name="vpn" />
            <Bar dataKey="promo" fill="#A855F7" radius={[3, 3, 0, 0]} name="promo" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subscribers evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="font-semibold mb-4 flex items-center gap-2">
            <MdTrendingUp className="text-success" />
            Évolution abonnés (6 mois)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.subscribers_evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A40" />
              <XAxis dataKey="month" tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="iptv" stroke="#F5A623" strokeWidth={2} dot={false} name="IPTV" />
              <Line type="monotone" dataKey="vpn" stroke="#3B82F6" strokeWidth={2} dot={false} name="VPN" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="font-semibold mb-4 flex items-center gap-2">
            <MdEmojiEvents className="text-amber-400" />
            Top 5 revendeurs
          </p>
          <div className="space-y-3">
            {stats.top_resellers.map((r, i) => (
              <div key={r.code} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-white/40">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-white/40">{r.code} · {r.clients} clients</p>
                </div>
                <span className="text-sm font-bold text-success">{r.earnings.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
