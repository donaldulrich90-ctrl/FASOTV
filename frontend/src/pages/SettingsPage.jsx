import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdultPin } from "../context/AdultPinContext";
import { authService } from "../services/authService";
import api from "../services/api";
import toast from "react-hot-toast";
import useTranslation from "../hooks/useTranslation";
import PinPad from "../components/PinPad";
import {
  MdSettings, MdPerson, MdLock, MdTv, MdLink, MdLogout,
  MdSave, MdVisibility, MdVisibilityOff, MdSync,
  MdShield, MdLockOpen, MdClose,
} from "react-icons/md";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold flex items-center gap-2 text-gold">
        <Icon className="text-lg" />{title}
      </h2>
      {children}
    </div>
  );
}

// PIN modal — mode: "create" | "change_current" | "disable" | "unlock"
function PinModal({ mode, onClose, onDone, t }) {
  const [step, setStep] = useState(mode);
  const [savedCurrent, setSavedCurrent] = useState("");
  const [savedNew, setSavedNew] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { unlock } = useAdultPin();

  const submit = async (fn) => {
    setBusy(true);
    setError("");
    try { await fn(); onDone(); }
    catch (e) {
      const code = e.response?.data?.code;
      if (code === "locked") {
        setError(t("parental_pin_locked").replace("{n}", e.response.data.wait_minutes ?? 15));
      } else if (code === "parental_pin_weak") {
        setError(t("parental_pin_weak"));
      } else {
        const n = e.response?.data?.attempts_remaining;
        setError(n != null ? t("parental_pin_wrong").replace("{n}", n) : t("msg_error"));
      }
    }
    finally { setBusy(false); }
  };

  const handlePin = (pin) => {
    setError("");
    if (step === "create") { setSavedNew(pin); setStep("confirm"); return; }
    if (step === "confirm") {
      if (pin !== savedNew) { setError(t("parental_pin_mismatch")); return; }
      submit(() => api.post("/accounts/adult-pin/set/", { pin }));
      return;
    }
    if (step === "change_current") { setSavedCurrent(pin); setStep("change_new"); return; }
    if (step === "change_new") { setSavedNew(pin); setStep("change_confirm"); return; }
    if (step === "change_confirm") {
      if (pin !== savedNew) { setError(t("parental_pin_mismatch")); return; }
      submit(() => api.post("/accounts/adult-pin/set/", { pin, current_pin: savedCurrent }));
      return;
    }
    if (step === "disable") {
      submit(() => api.post("/accounts/adult-pin/disable/", { pin }));
      return;
    }
    if (step === "unlock") {
      submit(async () => {
        await api.post("/accounts/adult-pin/verify/", { pin });
        unlock();
      });
      return;
    }
  };

  const titles = {
    create: t("parental_pin_create"),
    confirm: t("parental_pin_confirm"),
    change_current: t("parental_enter_current"),
    change_new: t("parental_pin_create"),
    change_confirm: t("parental_pin_confirm"),
    disable: t("parental_enter_current"),
    unlock: t("parental_pin_enter"),
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-card shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">{titles[step]}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <MdClose className="text-xl" />
          </button>
        </div>
        <PinPad onComplete={handlePin} disabled={busy} error={error} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { isUnlocked, lock } = useAdultPin();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Xtream form
  const [xtreamUrl, setXtreamUrl] = useState(localStorage.getItem("xtream_url") || "");
  const [xtreamUser, setXtreamUser] = useState(localStorage.getItem("xtream_user") || "");
  const [xtreamPass, setXtreamPass] = useState(localStorage.getItem("xtream_pass") || "");
  const [m3uUrl, setM3uUrl] = useState(localStorage.getItem("m3u_url") || "");
  const [syncingXtream, setSyncingXtream] = useState(false);

  // PIN modal
  const [pinModal, setPinModal] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile({ name, email });
      await refreshUser();
      toast.success(t("msg_success"));
    } catch {
      toast.error(t("msg_error"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await authService.changePassword(oldPwd, newPwd);
      toast.success(t("msg_success"));
      setOldPwd(""); setNewPwd("");
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || t("msg_error"));
    } finally {
      setSavingPwd(false);
    }
  };

  const saveXtream = () => {
    localStorage.setItem("xtream_url", xtreamUrl);
    localStorage.setItem("xtream_user", xtreamUser);
    localStorage.setItem("xtream_pass", xtreamPass);
    localStorage.setItem("m3u_url", m3uUrl);
    toast.success(t("msg_success"));
  };

  const syncXtream = async () => {
    setSyncingXtream(true);
    try {
      const { data } = await api.post("/xtream/sync/", {
        server_url: xtreamUrl, username: xtreamUser, password: xtreamPass,
      });
      toast.success(`Sync : ${data.synced.live} ${t("live_channels_list")}, ${data.synced.vod} ${t("nav_movies")}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || t("msg_error"));
    } finally {
      setSyncingXtream(false);
    }
  };

  const importM3U = async () => {
    if (!m3uUrl) return;
    try {
      const { data } = await api.post("/m3u/import/url/", { url: m3uUrl });
      toast.success(`${data.imported} ${t("live_channels_list")}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || t("msg_error"));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pinModalDone = () => {
    setPinModal(null);
    refreshUser();
    toast.success(t("msg_success"));
  };

  const adultEnabled = user?.adult_enabled;
  const pinSet = user?.adult_pin_set;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <MdSettings className="text-gold text-2xl" />
        <h1 className="text-2xl font-bold">{t("settings_title")}</h1>
      </div>

      {/* Profile */}
      <Section title={t("nav_account")} icon={MdPerson}>
        <div className="text-sm text-white/40 mb-2">
          {t("auth_phone")} : <span className="text-white">{user?.phone}</span>
        </div>
        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">{t("msg_name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder={t("msg_name")} />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">{t("msg_email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="email@exemple.com" />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            <MdSave />{savingProfile ? t("label_loading") : t("btn_save")}
          </button>
        </form>
      </Section>

      {/* Password */}
      <Section title={t("auth_password")} icon={MdLock}>
        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">{t("vpn_password")}</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                className="input pr-10"
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">{t("auth_password")}</label>
            <input
              type={showPwd ? "text" : "password"}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="input"
              placeholder="Min. 6"
            />
          </div>
          <button type="submit" disabled={savingPwd || !oldPwd || !newPwd} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <MdLock />{savingPwd ? t("label_loading") : t("auth_password")}
          </button>
        </form>
      </Section>

      {/* Parental Control */}
      <Section title={t("parental_title")} icon={MdShield}>
        {!adultEnabled ? (
          <div className="space-y-3">
            <p className="text-sm text-white/60">{t("parental_enable")}</p>
            <button
              onClick={() => setPinModal("create")}
              className="btn-primary flex items-center gap-2"
            >
              <MdLock />{t("parental_pin_create")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {isUnlocked ? (
                <span className="text-success flex items-center gap-1.5">
                  <MdLockOpen className="text-base" />{t("parental_session_active")}
                </span>
              ) : (
                <span className="text-white/50 flex items-center gap-1.5">
                  <MdLock className="text-base" />{t("parental_pin_enter")}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {isUnlocked && (
                <button onClick={lock} className="btn-outline flex items-center gap-2 text-sm text-live/70 border-live/30 hover:text-live hover:border-live">
                  <MdLock />{t("parental_lock_now")}
                </button>
              )}
              <button onClick={() => setPinModal("change_current")} className="btn-outline flex items-center gap-2 text-sm">
                <MdLock />{t("parental_pin_change")}
              </button>
              <button
                onClick={() => setPinModal("disable")}
                className="btn-outline flex items-center gap-2 text-sm text-live/70 border-live/30 hover:text-live hover:border-live"
              >
                <MdShield />{t("parental_disable")}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Xtream / M3U — admin uniquement */}
      {(user?.is_staff || user?.is_superuser) && (
        <Section title={t("live_xtream")} icon={MdTv}>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-white/60 mb-1 block">{t("vpn_server")} Xtream</label>
              <input value={xtreamUrl} onChange={(e) => setXtreamUrl(e.target.value)} className="input" placeholder="http://panel.exemple.com:8080" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-white/60 mb-1 block">{t("vpn_username")}</label>
                <input value={xtreamUser} onChange={(e) => setXtreamUser(e.target.value)} className="input" placeholder="username" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">{t("vpn_password")}</label>
                <input type="password" value={xtreamPass} onChange={(e) => setXtreamPass(e.target.value)} className="input" placeholder="••••••" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block flex items-center gap-2">
                <MdLink className="text-base" />URL M3U / M3U8
              </label>
              <input value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} className="input" placeholder="http://…/playlist.m3u" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={saveXtream} className="btn-primary flex items-center gap-2 text-sm">
                <MdSave />{t("btn_save")}
              </button>
              <button
                onClick={syncXtream}
                disabled={syncingXtream || !xtreamUrl}
                className="btn-outline flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <MdSync className={syncingXtream ? "animate-spin" : ""} />
                {syncingXtream ? t("label_loading") : t("live_xtream")}
              </button>
              <button
                onClick={importM3U}
                disabled={!m3uUrl}
                className="btn-outline flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <MdLink />M3U
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* Logout */}
      <div className="card p-4 border-live/20">
        <button onClick={handleLogout} className="flex items-center gap-3 text-live hover:text-live/80 transition-colors w-full">
          <MdLogout className="text-xl" />
          <span className="font-medium">{t("nav_logout")}</span>
        </button>
      </div>

      {/* PIN modal */}
      {pinModal && (
        <PinModal
          mode={pinModal}
          onClose={() => setPinModal(null)}
          onDone={pinModalDone}
          t={t}
        />
      )}
    </div>
  );
}
