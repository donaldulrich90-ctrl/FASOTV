import { useState, useEffect } from "react";
import api from "../../services/api";
import { MdSearch, MdPeople, MdCheck, MdClose } from "react-icons/md";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const FILTER_OPTS = [
  { key: "all", label: "Tous" },
  { key: "active", label: "Actifs" },
  { key: "expired", label: "Expirés" },
  { key: "never", label: "Jamais abonné" },
];

const DEMO_USERS = [
  { id: 1, phone: "70000000", name: "Administrateur", plan_actif: "Premium", date_expiration: "2026-12-31", has_active_subscription: true, is_active: true },
  { id: 2, phone: "71000000", name: "Utilisateur Test", plan_actif: "Mensuel", date_expiration: "2026-07-31", has_active_subscription: true, is_active: true },
  { id: 3, phone: "76543210", name: "Oumarou Traoré", plan_actif: "Hebdomadaire", date_expiration: "2026-07-20", has_active_subscription: true, is_active: true },
  { id: 4, phone: "78901234", name: "Aïcha Sawadogo", plan_actif: null, date_expiration: null, has_active_subscription: false, is_active: true },
  { id: 5, phone: "75678901", name: "Issouf Compaoré", plan_actif: "Journalier", date_expiration: "2026-07-17", has_active_subscription: false, is_active: true },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/accounts/admin/users/")
      .then((r) => setUsers(r.data.results || r.data))
      .catch(() => setUsers(DEMO_USERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || [u.name, u.phone].some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      filter === "all" ||
      (filter === "active" && u.has_active_subscription) ||
      (filter === "expired" && !u.has_active_subscription && u.date_expiration) ||
      (filter === "never" && !u.date_expiration);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Utilisateurs</h2>
        <p className="text-white/40 text-sm">{users.length} utilisateur(s) au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone…"
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1 bg-bg rounded-btn p-1">
          {FILTER_OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => setFilter(o.key)}
              className={`px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all whitespace-nowrap ${
                filter === o.key ? "bg-gold text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            <MdPeople className="text-4xl mx-auto mb-2 opacity-30" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-white/40 text-left">
                  <th className="pb-3 pr-4 font-medium pl-4 py-3">Utilisateur</th>
                  <th className="pb-3 pr-4 font-medium">Téléphone</th>
                  <th className="pb-3 pr-4 font-medium hidden md:table-cell">Forfait actif</th>
                  <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Expiration</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-white/2">
                    <td className="py-3 pr-4 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                          {(u.name || u.phone).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-white/60">{u.phone}</td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      {u.plan_actif ? (
                        <span className="text-gold text-sm">{u.plan_actif}</span>
                      ) : (
                        <span className="text-white/30 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-white/50 text-sm hidden lg:table-cell">
                      {u.date_expiration
                        ? format(new Date(u.date_expiration), "dd MMM yyyy", { locale: fr })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.has_active_subscription
                          ? "bg-success/20 text-success"
                          : u.date_expiration
                          ? "bg-live/20 text-live"
                          : "bg-white/10 text-white/40"
                      }`}>
                        {u.has_active_subscription ? "Actif" : u.date_expiration ? "Expiré" : "Jamais abonné"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
