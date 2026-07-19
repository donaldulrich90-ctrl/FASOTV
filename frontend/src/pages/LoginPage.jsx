import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import { MdTv, MdPhone, MdLock, MdPerson, MdVisibility, MdVisibilityOff, MdCardGiftcard } from "react-icons/md";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: "", name: "", password: "", password2: "", code_parrainage: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setForm((f) => ({ ...f, code_parrainage: ref }));
      setMode("register");
    }
  }, [searchParams]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.phone, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      await authService.register(form.phone, form.name, form.password, form.password2, form.code_parrainage);
      toast.success("Compte créé ! Vous pouvez vous connecter.");
      setMode("login");
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.phone?.[0] || data?.detail || "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <MdTv className="text-gold text-4xl" />
            <span className="text-4xl font-black tracking-tight">
              <span className="text-gold">FASO</span>
              <span className="text-white"> TV</span>
            </span>
          </div>
          <p className="text-white/40 text-sm">FASO ÉQUIPEMENTS STORE — Ouagadougou</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Tabs */}
          <div className="flex mb-8 bg-bg rounded-btn p-1 gap-1">
            {[["login", "Connexion"], ["register", "Inscription"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setMode(v)}
                className={`flex-1 py-2 text-sm font-semibold rounded-[8px] transition-all ${
                  mode === v ? "bg-gold text-black" : "text-white/50 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Numéro de téléphone</label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                  <input
                    type="tel"
                    placeholder="70 00 00 00"
                    value={form.phone}
                    onChange={set("phone")}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Nom complet</label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={set("name")}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Numéro de téléphone</label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                  <input
                    type="tel"
                    placeholder="70 00 00 00"
                    value={form.phone}
                    onChange={set("phone")}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Mot de passe</label>
                <input
                  type="password"
                  placeholder="Min. 6 caractères"
                  value={form.password}
                  onChange={set("password")}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="Répéter le mot de passe"
                  value={form.password2}
                  onChange={set("password2")}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">
                  Code parrainage <span className="text-white/30">(optionnel)</span>
                </label>
                <div className="relative">
                  <MdCardGiftcard className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                  <input
                    type="text"
                    placeholder="FASO-XXXXXX"
                    value={form.code_parrainage}
                    onChange={set("code_parrainage")}
                    className="input pl-10 uppercase"
                    maxLength={12}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
                {loading ? "Création…" : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2024 FASO TV — FASO ÉQUIPEMENTS STORE, Ouagadougou
        </p>
      </div>
    </div>
  );
}
