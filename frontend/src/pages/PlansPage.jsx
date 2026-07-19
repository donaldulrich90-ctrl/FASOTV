import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MdStar, MdCheck, MdPhone, MdClose, MdWhatsapp } from "react-icons/md";

const OPERATOR_ICONS = {
  orange_money: { label: "Orange Money", color: "bg-orange-500", emoji: "🟠" },
  moov_money: { label: "Moov Money", color: "bg-blue-600", emoji: "🔵" },
  coris_money: { label: "Coris Money", color: "bg-green-600", emoji: "🟢" },
};

function PaymentModal({ plan, onClose, onSuccess }) {
  const [method, setMethod] = useState("orange_money");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | pending | done

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/subscriptions/payments/initiate/", {
        plan_slug: plan.slug,
        method,
        phone,
      });

      if (data.stub_mode) {
        // En mode dev — confirmer automatiquement le stub
        await api.post(`/subscriptions/payments/confirm-stub/${data.transaction_id}/`);
        toast.success("Paiement simulé — abonnement activé !");
        onSuccess();
        return;
      }

      setStep("pending");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-card p-6 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-lg">Payer {plan.price.toLocaleString()} FCFA</h2>
            <p className="text-white/50 text-sm">{plan.name} — {plan.duration_label}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <MdClose className="text-xl" />
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Opérateur Mobile Money</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(OPERATOR_ICONS).map(([key, op]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`p-3 rounded-btn border text-center transition-all ${
                      method === key
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border bg-card text-white/60 hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl mb-1">{op.emoji}</div>
                    <p className="text-xs font-medium leading-tight">{op.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Numéro Mobile Money</label>
              <div className="relative">
                <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                <input
                  type="tel"
                  placeholder="+226 70 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="bg-card rounded-btn p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-white/50">Forfait</span>
                <span>{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Durée</span>
                <span>{plan.duration_label}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-1 mt-1">
                <span>Total</span>
                <span className="text-gold">{plan.price.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Traitement en cours…" : `Payer ${plan.price.toLocaleString()} FCFA`}
            </button>

            <p className="text-xs text-white/30 text-center">
              Paiement sécurisé via Mobile Money Burkina Faso
            </p>
          </form>
        )}

        {step === "pending" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
            <p className="font-semibold">En attente de confirmation</p>
            <p className="text-white/50 text-sm">
              Veuillez confirmer le paiement de {plan.price.toLocaleString()} FCFA
              sur votre téléphone ({phone})
            </p>
            <p className="text-xs text-white/30">
              L'abonnement sera activé automatiquement après confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, onSelect, isCurrentPlan }) {
  const isPremium = plan.slug === "premium";
  return (
    <div className={`card p-6 flex flex-col relative ${isPremium ? "border-premium/40 bg-premium/5" : ""}`}>
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-premium text-white text-xs font-bold px-3 py-1 rounded-full">
          ⭐ POPULAIRE
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-lg">{plan.name}</h3>
        <p className="text-white/40 text-sm">{plan.duration_label}</p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-black text-gold">{plan.price.toLocaleString()}</span>
        <span className="text-white/50 text-sm ml-1">FCFA</span>
      </div>
      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <MdCheck className="text-success flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-btn font-semibold transition-all ${
          isCurrentPlan
            ? "bg-success/20 text-success border border-success/40 cursor-default"
            : isPremium
            ? "bg-premium text-white hover:bg-premium/90"
            : "btn-primary"
        }`}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "✓ Abonnement actif" : "Choisir ce forfait"}
      </button>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    api.get("/subscriptions/plans/")
      .then((r) => setPlans(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSuccess = async () => {
    setSelectedPlan(null);
    await refreshUser();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MdStar className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">Forfaits FASO TV</h1>
        </div>
        <p className="text-white/50 text-sm">Payez par Mobile Money — Orange Money, Moov Money, Coris Money</p>
      </div>

      {user?.has_active_subscription && (
        <div className="card p-4 border-success/30 bg-success/5 text-center">
          <p className="text-success font-semibold">Abonnement actif : {user.plan_actif}</p>
          <p className="text-white/40 text-sm mt-1">
            Expire le {new Date(user.date_expiration).toLocaleDateString("fr-FR")}
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-card rounded-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={setSelectedPlan}
              isCurrentPlan={user?.plan_actif === plan.name && user?.has_active_subscription}
            />
          ))}
        </div>
      )}

      <div className="card p-4 text-center">
        <p className="text-white/50 text-sm">
          Besoin d'aide ? Contactez-nous sur WhatsApp
        </p>
        <a
          href="https://wa.me/22600000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 text-success hover:underline text-sm font-medium"
        >
          <MdWhatsapp className="text-xl" />
          WhatsApp FAEST
        </a>
      </div>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
