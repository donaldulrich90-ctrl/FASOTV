import { useState, useEffect } from "react";
import api from "../../services/api";
import { MdMonetizationOn, MdCheck, MdClose } from "react-icons/md";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DEMO_RESELLERS = [
  { id: 1, name: "Oumarou Traoré", code_parrainage: "FASO-OT23", niveau: "silver", active_clients: 18, total_earnings: 54000, available_balance: 12000 },
  { id: 2, name: "Aïcha Sawadogo", code_parrainage: "FASO-AS45", niveau: "bronze", active_clients: 12, total_earnings: 36000, available_balance: 8500 },
  { id: 3, name: "Issouf Compaoré", code_parrainage: "FASO-IC67", niveau: "bronze", active_clients: 9, total_earnings: 27000, available_balance: 5000 },
  { id: 4, name: "Fatimata Ouédraogo", code_parrainage: "FASO-FO89", niveau: "bronze", active_clients: 7, total_earnings: 21000, available_balance: 3500 },
  { id: 5, name: "Daouda Kaboré", code_parrainage: "FASO-DK12", niveau: "bronze", active_clients: 5, total_earnings: 15000, available_balance: 2000 },
];

const NIVEAU_BADGE = {
  bronze: "bg-amber-700/20 text-amber-600",
  silver: "bg-slate-400/20 text-slate-300",
  gold: "bg-gold/20 text-gold",
  platinum: "bg-cyan-400/20 text-cyan-400",
};

export default function AdminResellers() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/resellers/admin/list/").catch(() => ({ data: DEMO_RESELLERS })),
      api.get("/resellers/admin/withdrawals/").catch(() => ({ data: [] })),
    ]).then(([r, w]) => {
      setResellers(r.data.results || r.data);
      setWithdrawals(w.data.results || w.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleWithdrawal = async (id, action) => {
    try {
      await api.post(`/resellers/admin/withdrawals/${id}/${action}/`);
      const r = await api.get("/resellers/admin/withdrawals/");
      setWithdrawals(r.data.results || r.data);
    } catch {
      setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: action === "approve" ? "completed" : "rejected" } : w));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Revendeurs</h2>
        <p className="text-white/40 text-sm">{resellers.length} revendeur(s) actifs</p>
      </div>

      {/* Resellers list */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-white/40 text-left">
                <th className="pb-3 pr-4 font-medium pl-4 py-3">Revendeur</th>
                <th className="pb-3 pr-4 font-medium">Code</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Niveau</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Clients actifs</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Gains totaux</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Solde</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? DEMO_RESELLERS : resellers).map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-white/2">
                  <td className="py-3 pr-4 pl-4 font-medium">{r.name}</td>
                  <td className="py-3 pr-4 text-gold font-mono text-xs">{r.code_parrainage}</td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${NIVEAU_BADGE[r.niveau] || ""}`}>{r.niveau}</span>
                  </td>
                  <td className="py-3 pr-4 text-white/70 hidden md:table-cell">{r.active_clients}</td>
                  <td className="py-3 pr-4 text-success font-medium hidden lg:table-cell">{Number(r.total_earnings).toLocaleString()} FCFA</td>
                  <td className="py-3 font-medium hidden lg:table-cell">{Number(r.available_balance).toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal requests */}
      {withdrawals.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Demandes de retrait en attente</h3>
          <div className="space-y-3">
            {withdrawals.filter((w) => w.status === "pending").map((w) => (
              <div key={w.id} className="card p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{w.reseller_name || "Revendeur"}</p>
                  <p className="text-white/40 text-sm">{Number(w.amount).toLocaleString()} FCFA · {w.method?.replace("_", " ")} · {w.phone}</p>
                  {w.requested_at && (
                    <p className="text-white/30 text-xs">{format(new Date(w.requested_at), "dd MMM yyyy HH:mm", { locale: fr })}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleWithdrawal(w.id, "approve")} className="flex items-center gap-1 text-success border border-success/30 rounded-btn px-3 py-1.5 text-sm hover:bg-success/10">
                    <MdCheck /> Approuver
                  </button>
                  <button onClick={() => handleWithdrawal(w.id, "reject")} className="flex items-center gap-1 text-live border border-live/30 rounded-btn px-3 py-1.5 text-sm hover:bg-live/10">
                    <MdClose /> Rejeter
                  </button>
                </div>
              </div>
            ))}
            {withdrawals.filter((w) => w.status === "pending").length === 0 && (
              <div className="card p-6 text-center text-white/30 text-sm">
                <MdMonetizationOn className="text-3xl mx-auto mb-2 opacity-30" />
                Aucune demande en attente
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
