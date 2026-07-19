import { useState } from "react";
import toast from "react-hot-toast";
import { getXtreamConfig, setXtreamConfig, getSettings, setSettings, getLocalServerConfig, setLocalServerConfig } from "../../utils/store";
import { MdCheck, MdSignalCellularAlt, MdWifi, MdSettings, MdRouter, MdFolderOpen, MdStorage } from "react-icons/md";

export default function AdminSettings() {
  const [xtream, setXtream] = useState(getXtreamConfig());
  const [settings, setSettingsState] = useState(getSettings());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [localServer, setLocalServer] = useState(getLocalServerConfig());
  const [testingLocal, setTestingLocal] = useState(false);
  const [localTestResult, setLocalTestResult] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const setX = (k) => (e) => setXtream((x) => ({ ...x, [k]: e.target.value }));
  const setS = (k) => (e) => setSettingsState((s) => ({ ...s, [k]: e.target.value }));

  const saveXtream = () => {
    setXtreamConfig(xtream);
    toast.success("Configuration Xtream sauvegardée");
  };

  const saveSettings = () => {
    setSettings(settings);
    toast.success("Paramètres sauvegardés");
  };

  const saveLocalServer = () => {
    setLocalServerConfig(localServer);
    toast.success("Serveur média local sauvegardé");
  };

  const testLocalServer = async () => {
    if (!localServer.base_url) {
      toast.error("Renseignez l'URL du serveur local");
      return;
    }
    setTestingLocal(true);
    setLocalTestResult(null);
    try {
      const url = `${localServer.base_url.replace(/\/$/, "")}/`;
      const resp = await fetch(url, { mode: "cors", signal: AbortSignal.timeout(5000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const updated = { ...localServer, connected: true };
      setLocalServer(updated);
      setLocalServerConfig(updated);
      setLocalTestResult({ ok: true, msg: "Serveur média local accessible ✓" });
      toast.success("Serveur local connecté !");
    } catch (err) {
      const updated = { ...localServer, connected: false };
      setLocalServer(updated);
      setLocalServerConfig(updated);
      const msg = err.name === "AbortError" ? "Délai dépassé (5s)" : err.message;
      setLocalTestResult({ ok: false, msg: `Inaccessible — ${msg} (vérifiez CORS nginx)` });
      toast.error("Serveur local inaccessible");
    } finally {
      setTestingLocal(false);
    }
  };

  const scanLocalServer = async () => {
    if (!localServer.base_url) {
      toast.error("Renseignez l'URL du serveur local");
      return;
    }
    setScanResult(null);
    const folders = ["films-burkina", "clips-burkina", "series-burkina"];
    const results = [];
    for (const folder of folders) {
      try {
        const url = `${localServer.base_url.replace(/\/$/, "")}/${folder}/`;
        const resp = await fetch(url, { mode: "cors", signal: AbortSignal.timeout(5000) });
        if (!resp.ok) { results.push({ folder, count: 0, error: `HTTP ${resp.status}` }); continue; }
        const data = await resp.json();
        const files = Array.isArray(data) ? data.filter((f) => f.type === "file") : [];
        results.push({ folder, count: files.length });
      } catch {
        results.push({ folder, count: 0, error: "Inaccessible" });
      }
    }
    setScanResult(results);
  };

  const testXtream = async () => {
    if (!xtream.url || !xtream.username || !xtream.password) {
      toast.error("Renseignez l'URL, l'identifiant et le mot de passe");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const url = `${xtream.url.replace(/\/$/, "")}/player_api.php?username=${xtream.username}&password=${xtream.password}&action=get_live_categories`;
      const resp = await fetch(url, { mode: "cors" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error("Réponse inattendue");
      const updated = { ...xtream, connected: true };
      setXtream(updated);
      setXtreamConfig(updated);
      setTestResult({ ok: true, msg: `Connexion réussie — ${data.length} catégorie(s) live` });
      toast.success("Serveur Xtream connecté !");
    } catch (err) {
      const updated = { ...xtream, connected: false };
      setXtream(updated);
      setXtreamConfig(updated);
      setTestResult({ ok: false, msg: err.message });
      toast.error("Connexion échouée — " + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Paramètres serveur</h2>
        <p className="text-white/40 text-sm">Configuration Xtream Codes, M3U, EPG et MikroTik</p>
      </div>

      {/* Xtream Codes */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdWifi className="text-gold text-xl" />
            <p className="font-semibold">Serveur Xtream Codes</p>
          </div>
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            xtream.connected ? "bg-success/20 text-success" : "bg-white/10 text-white/40"
          }`}>
            <MdSignalCellularAlt className="text-sm" />
            {xtream.connected ? "Connecté" : "Non connecté"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-xs text-white/50 mb-1 block">URL serveur</label>
            <input value={xtream.url} onChange={setX("url")} placeholder="http://panel.iptv.com:8080" className="input" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Username</label>
            <input value={xtream.username} onChange={setX("username")} placeholder="votre_username" className="input" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Password</label>
            <input type="password" value={xtream.password} onChange={setX("password")} placeholder="••••••••" className="input" />
          </div>
        </div>

        {testResult && (
          <div className={`flex items-center gap-2 p-3 rounded-btn text-sm ${
            testResult.ok ? "bg-success/10 text-success border border-success/20" : "bg-live/10 text-live border border-live/20"
          }`}>
            {testResult.ok ? <MdCheck /> : <MdSignalCellularAlt />}
            {testResult.msg}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={testXtream} disabled={testing} className="btn-outline text-sm py-2 flex items-center gap-2">
            {testing ? <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin" /> : <MdSignalCellularAlt />}
            {testing ? "Test en cours…" : "Tester la connexion"}
          </button>
          <button onClick={saveXtream} className="btn-primary text-sm py-2">Sauvegarder</button>
        </div>
      </div>

      {/* M3U & EPG */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MdSettings className="text-blue-400 text-xl" />
          <p className="font-semibold">M3U / EPG</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">URL Playlist M3U</label>
            <input value={settings.m3u_url} onChange={setS("m3u_url")} placeholder="http://…/playlist.m3u" className="input" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">URL EPG (XMLTV)</label>
            <input value={settings.epg_url} onChange={setS("epg_url")} placeholder="http://…/epg.xml" className="input" />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Qualité vidéo par défaut</label>
          <select value={settings.default_quality} onChange={setS("default_quality")} className="input max-w-xs">
            <option value="auto">Auto</option>
            <option value="sd">SD</option>
            <option value="hd">HD</option>
            <option value="fhd">FHD</option>
          </select>
        </div>

        <button onClick={saveSettings} className="btn-primary text-sm py-2">Sauvegarder les paramètres</button>
      </div>

      {/* Local Media Server */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdStorage className="text-purple-400 text-xl" />
            <p className="font-semibold">Serveur Média Local</p>
          </div>
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            localServer.connected ? "bg-success/20 text-success" : "bg-white/10 text-white/40"
          }`}>
            <MdSignalCellularAlt className="text-sm" />
            {localServer.connected ? "Connecté" : "Non connecté"}
          </span>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">URL du serveur nginx local</label>
          <input
            value={localServer.base_url}
            onChange={(e) => setLocalServer((s) => ({ ...s, base_url: e.target.value }))}
            placeholder="http://192.168.1.100:8080"
            className="input"
          />
          <p className="text-xs text-white/30 mt-1">
            Dossiers attendus : /films-burkina/ · /clips-burkina/ · /series-burkina/
            — configurez <code>autoindex on; autoindex_format json;</code> dans nginx
          </p>
        </div>

        {localTestResult && (
          <div className={`flex items-center gap-2 p-3 rounded-btn text-sm ${
            localTestResult.ok ? "bg-success/10 text-success border border-success/20" : "bg-live/10 text-live border border-live/20"
          }`}>
            {localTestResult.ok ? <MdCheck /> : <MdSignalCellularAlt />}
            {localTestResult.msg}
          </div>
        )}

        {scanResult && (
          <div className="bg-bg rounded-btn p-3 space-y-1">
            <p className="text-xs text-white/50 mb-2 font-medium">Résultat du scan :</p>
            {scanResult.map((r) => (
              <div key={r.folder} className="flex items-center justify-between text-sm">
                <span className="text-white/70 font-mono text-xs">/{r.folder}/</span>
                {r.error
                  ? <span className="text-live text-xs">{r.error}</span>
                  : <span className="text-success text-xs">{r.count} fichier(s)</span>
                }
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button onClick={testLocalServer} disabled={testingLocal} className="btn-outline text-sm py-2 flex items-center gap-2">
            {testingLocal ? <div className="w-4 h-4 border border-white/20 border-t-white rounded-full animate-spin" /> : <MdSignalCellularAlt />}
            {testingLocal ? "Test…" : "Tester"}
          </button>
          <button onClick={scanLocalServer} className="btn-outline text-sm py-2 flex items-center gap-2">
            <MdFolderOpen /> Scanner les dossiers
          </button>
          <button onClick={saveLocalServer} className="btn-primary text-sm py-2">Sauvegarder</button>
        </div>
      </div>

      {/* MikroTik */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MdRouter className="text-orange-400 text-xl" />
          <p className="font-semibold">MikroTik RouterOS</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">IP</label>
            <input value={settings.mikrotik_ip || ""} onChange={setS("mikrotik_ip")} placeholder="192.168.88.1" className="input" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Port API</label>
            <input value={settings.mikrotik_port || "8728"} onChange={setS("mikrotik_port")} placeholder="8728" className="input" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Username</label>
            <input value={settings.mikrotik_user || ""} onChange={setS("mikrotik_user")} placeholder="admin" className="input" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Password</label>
            <input type="password" value={settings.mikrotik_pass || ""} onChange={setS("mikrotik_pass")} placeholder="••••" className="input" />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.info("Test MikroTik nécessite un accès backend RouterOS — connexion directe impossible depuis le navigateur.")}
            className="btn-outline text-sm py-2 flex items-center gap-2"
          >
            <MdRouter className="text-sm" /> Tester la connexion
          </button>
          <button onClick={saveSettings} className="btn-primary text-sm py-2">Sauvegarder MikroTik</button>
        </div>
      </div>
    </div>
  );
}
