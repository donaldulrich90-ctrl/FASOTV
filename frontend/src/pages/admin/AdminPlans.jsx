import { useState } from "react";
import toast from "react-hot-toast";
import { MdEdit, MdDelete, MdAdd, MdCheck, MdClose, MdDragHandle } from "react-icons/md";

const QUALITY_OPTIONS = ["SD", "HD", "FHD", "4K"];

function FeatureEditor({ features, onChange }) {
  const add = () => onChange([...features, "Nouvelle fonctionnalité"]);
  const remove = (i) => onChange(features.filter((_, idx) => idx !== i));
  const update = (i, v) => onChange(features.map((f, idx) => (idx === i ? v : f)));

  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={f}
            onChange={(e) => update(i, e.target.value)}
            className="input flex-1 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="px-2 text-live/60 hover:text-live"
          >
            <MdClose />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs text-gold hover:text-gold-dark flex items-center gap-1"
      >
        <MdAdd className="text-sm" /> Ajouter une feature
      </button>
    </div>
  );
}

function PlanRowIPTV({ plan, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...plan });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = () => {
    onSave({ ...form, price: Number(form.price), duration_hours: Number(form.duration_hours), screens: Number(form.screens) });
    setEditing(false);
    toast.success("Forfait mis à jour");
  };

  const cancel = () => { setForm({ ...plan }); setEditing(false); };

  if (!editing) {
    return (
      <tr className="border-b border-border/50 hover:bg-white/2 group">
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${plan.is_active ? "bg-success" : "bg-white/20"}`} />
            <span className="font-medium">{plan.name}</span>
          </div>
        </td>
        <td className="py-3 pr-4 text-gold font-bold">{Number(plan.price).toLocaleString()} FCFA</td>
        <td className="py-3 pr-4 text-white/60 text-sm">{plan.duration_hours}h</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden md:table-cell">{plan.screens} écran(s)</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden lg:table-cell">{plan.quality}</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden lg:table-cell">{plan.features?.length} features</td>
        <td className="py-3">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="text-gold hover:text-gold-dark">
              <MdEdit className="text-lg" />
            </button>
            <button onClick={() => onDelete(plan.id)} className="text-live/60 hover:text-live">
              <MdDelete className="text-lg" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border bg-gold/5">
      <td colSpan={7} className="py-4 px-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Nom</label>
            <input value={form.name} onChange={set("name")} className="input py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Prix (FCFA)</label>
            <input type="number" value={form.price} onChange={set("price")} className="input py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Durée (heures)</label>
            <input type="number" value={form.duration_hours} onChange={set("duration_hours")} className="input py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Écrans</label>
            <input type="number" min="1" max="10" value={form.screens} onChange={set("screens")} className="input py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Qualité max</label>
            <select value={form.quality} onChange={set("quality")} className="input py-2 text-sm">
              {QUALITY_OPTIONS.map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="accent-gold" />
              <span className="text-sm">Actif</span>
            </label>
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs text-white/50 mb-2 block">Features</label>
          <FeatureEditor features={form.features || []} onChange={(f) => setForm((prev) => ({ ...prev, features: f }))} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
            <MdCheck /> Sauvegarder
          </button>
          <button onClick={cancel} className="btn-outline py-2 px-4 text-sm">Annuler</button>
        </div>
      </td>
    </tr>
  );
}

function PlanRowVPN({ plan, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...plan });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const save = () => {
    onSave({ ...form, price: Number(form.price), duration_hours: Number(form.duration_hours), devices: Number(form.devices) });
    setEditing(false);
    toast.success("Forfait VPN mis à jour");
  };
  const cancel = () => { setForm({ ...plan }); setEditing(false); };

  if (!editing) {
    return (
      <tr className="border-b border-border/50 hover:bg-white/2 group">
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${plan.is_active ? "bg-success" : "bg-white/20"}`} />
            <span className="font-medium">{plan.name}</span>
          </div>
        </td>
        <td className="py-3 pr-4 text-blue-400 font-bold">{Number(plan.price).toLocaleString()} FCFA</td>
        <td className="py-3 pr-4 text-white/60 text-sm">{plan.duration_hours}h</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden md:table-cell">{plan.bandwidth}</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden lg:table-cell">{plan.devices} appareil(s)</td>
        <td className="py-3">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="text-gold hover:text-gold-dark"><MdEdit className="text-lg" /></button>
            <button onClick={() => onDelete(plan.id)} className="text-live/60 hover:text-live"><MdDelete className="text-lg" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border bg-blue-500/5">
      <td colSpan={6} className="py-4 px-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div><label className="text-xs text-white/50 mb-1 block">Nom</label><input value={form.name} onChange={set("name")} className="input py-2 text-sm" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Prix (FCFA)</label><input type="number" value={form.price} onChange={set("price")} className="input py-2 text-sm" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Durée (heures)</label><input type="number" value={form.duration_hours} onChange={set("duration_hours")} className="input py-2 text-sm" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Bande passante</label><input value={form.bandwidth} onChange={set("bandwidth")} placeholder="ex: 20 Mbps" className="input py-2 text-sm" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Appareils</label><input type="number" min="1" value={form.devices} onChange={set("devices")} className="input py-2 text-sm" /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="accent-gold" />
          <span className="text-sm">Actif</span>
        </label>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary py-2 px-4 text-sm flex items-center gap-1"><MdCheck /> Sauvegarder</button>
          <button onClick={cancel} className="btn-outline py-2 px-4 text-sm">Annuler</button>
        </div>
      </td>
    </tr>
  );
}

function PlanRowPromo({ plan, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...plan });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const save = () => {
    onSave({ ...form, price: Number(form.price), duration_hours: Number(form.duration_hours), max_active: Number(form.max_active) });
    setEditing(false);
    toast.success("Tarif promo mis à jour");
  };
  const cancel = () => { setForm({ ...plan }); setEditing(false); };

  if (!editing) {
    return (
      <tr className="border-b border-border/50 hover:bg-white/2 group">
        <td className="py-3 pr-4"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${plan.is_active ? "bg-success" : "bg-white/20"}`} /><span className="font-medium">{plan.name}</span></div></td>
        <td className="py-3 pr-4 text-purple-400 font-bold">{Number(plan.price).toLocaleString()} FCFA</td>
        <td className="py-3 pr-4 text-white/60 text-sm">{plan.duration_hours}h</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden md:table-cell capitalize">{plan.placement}</td>
        <td className="py-3 pr-4 text-white/60 text-sm hidden lg:table-cell">{plan.max_active} max</td>
        <td className="py-3"><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="text-gold hover:text-gold-dark"><MdEdit className="text-lg" /></button>
          <button onClick={() => onDelete(plan.id)} className="text-live/60 hover:text-live"><MdDelete className="text-lg" /></button>
        </div></td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border bg-purple-500/5">
      <td colSpan={6} className="py-4 px-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div><label className="text-xs text-white/50 mb-1 block">Nom</label><input value={form.name} onChange={set("name")} className="input py-2 text-sm" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Prix (FCFA)</label><input type="number" value={form.price} onChange={set("price")} className="input py-2 text-sm" /></div>
          <div><label className="text-xs text-white/50 mb-1 block">Durée (heures)</label><input type="number" value={form.duration_hours} onChange={set("duration_hours")} className="input py-2 text-sm" /></div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Placement</label>
            <select value={form.placement} onChange={set("placement")} className="input py-2 text-sm">
              {["hero","trending","new","banner","pack"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-white/50 mb-1 block">Max actifs</label><input type="number" min="1" value={form.max_active} onChange={set("max_active")} className="input py-2 text-sm" /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className="accent-gold" />
          <span className="text-sm">Actif</span>
        </label>
        <div className="flex gap-2">
          <button onClick={save} className="btn-primary py-2 px-4 text-sm flex items-center gap-1"><MdCheck /> Sauvegarder</button>
          <button onClick={cancel} className="btn-outline py-2 px-4 text-sm">Annuler</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Generic plan table wrapper ─────────────────────────────────────────────

function newIPTV() { return { id: Date.now(), slug: "new_plan_" + Date.now(), name: "Nouveau forfait", price: 0, duration_hours: 24, screens: 1, quality: "HD", features: [], is_active: true }; }
function newVPN() { return { id: Date.now(), slug: "vpn_new_" + Date.now(), name: "Nouveau VPN", price: 0, duration_hours: 24, bandwidth: "10 Mbps", devices: 1, is_active: true }; }
function newPromo() { return { id: Date.now(), slug: "promo_new_" + Date.now(), name: "Nouveau tarif", display_name: "", price: 0, duration_hours: 24, placement: "hero", max_active: 3, is_active: true }; }

export function PlansIPTVAdmin({ plans, onChange }) {
  const save = (updated) => onChange(plans.map((p) => (p.id === updated.id ? updated : p)));
  const del = (id) => {
    if (!confirm("Supprimer ce forfait ?")) return;
    onChange(plans.filter((p) => p.id !== id));
    toast.success("Forfait supprimé");
  };
  const add = () => onChange([...plans, newIPTV()]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Forfaits IPTV</h2>
          <p className="text-white/40 text-sm">Modifier les prix et paramètres des abonnements</p>
        </div>
        <button onClick={add} className="btn-primary flex items-center gap-2 text-sm py-2">
          <MdAdd /> Ajouter
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-white/40 text-left">
                <th className="pb-3 pr-4 font-medium pl-4 py-3">Forfait</th>
                <th className="pb-3 pr-4 font-medium">Prix</th>
                <th className="pb-3 pr-4 font-medium">Durée</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Écrans</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Qualité</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Features</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <PlanRowIPTV key={plan.id} plan={plan} onSave={save} onDelete={del} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PlansVPNAdmin({ plans, onChange }) {
  const save = (updated) => onChange(plans.map((p) => (p.id === updated.id ? updated : p)));
  const del = (id) => { if (!confirm("Supprimer ce forfait VPN ?")) return; onChange(plans.filter((p) => p.id !== id)); toast.success("Supprimé"); };
  const add = () => onChange([...plans, newVPN()]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Forfaits VPN</h2>
          <p className="text-white/40 text-sm">Gestion des plans FASO VPN</p>
        </div>
        <button onClick={add} className="btn-primary flex items-center gap-2 text-sm py-2"><MdAdd /> Ajouter</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-white/40 text-left">
                <th className="pb-3 pr-4 font-medium pl-4 py-3">Forfait</th>
                <th className="pb-3 pr-4 font-medium">Prix</th>
                <th className="pb-3 pr-4 font-medium">Durée</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Bande passante</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Appareils</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => <PlanRowVPN key={plan.id} plan={plan} onSave={save} onDelete={del} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PlansPromoAdmin({ plans, onChange }) {
  const save = (updated) => onChange(plans.map((p) => (p.id === updated.id ? updated : p)));
  const del = (id) => { if (!confirm("Supprimer ce tarif promo ?")) return; onChange(plans.filter((p) => p.id !== id)); toast.success("Supprimé"); };
  const add = () => onChange([...plans, newPromo()]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Tarifs Promotion</h2>
          <p className="text-white/40 text-sm">Plans pour artistes et annonceurs</p>
        </div>
        <button onClick={add} className="btn-primary flex items-center gap-2 text-sm py-2"><MdAdd /> Ajouter</button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-white/40 text-left">
                <th className="pb-3 pr-4 font-medium pl-4 py-3">Tarif</th>
                <th className="pb-3 pr-4 font-medium">Prix</th>
                <th className="pb-3 pr-4 font-medium">Durée</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Placement</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Max actifs</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => <PlanRowPromo key={plan.id} plan={plan} onSave={save} onDelete={del} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
