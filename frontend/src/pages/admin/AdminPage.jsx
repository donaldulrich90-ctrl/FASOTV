import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import { PlansIPTVAdmin, PlansVPNAdmin, PlansPromoAdmin } from "./AdminPlans";
import AdminUsers from "./AdminUsers";
import AdminResellers from "./AdminResellers";
import AdminClipsManager from "./AdminClipsManager";
import AdminSettings from "./AdminSettings";
import {
  initializeData,
  getPlansIPTV, setPlansIPTV,
  getPlansVPN, setPlansVPN,
  getPlansPromo, setPlansPromo,
  getClips,
} from "../../utils/store";

export default function AdminPage() {
  const [section, setSection] = useState("dashboard");

  // Plans state (managed here so admin changes persist)
  const [plansIPTV, setPlansIPTVState] = useState([]);
  const [plansVPN, setPlansVPNState] = useState([]);
  const [plansPromo, setPlansPromoState] = useState([]);
  const [clips, setClipsState] = useState([]);

  useEffect(() => {
    initializeData();
    setPlansIPTVState(getPlansIPTV());
    setPlansVPNState(getPlansVPN());
    setPlansPromoState(getPlansPromo());
    setClipsState(getClips());
  }, []);

  const handlePlansIPTV = (updated) => {
    setPlansIPTVState(updated);
    setPlansIPTV(updated);
  };
  const handlePlansVPN = (updated) => {
    setPlansVPNState(updated);
    setPlansVPN(updated);
  };
  const handlePlansPromo = (updated) => {
    setPlansPromoState(updated);
    setPlansPromo(updated);
  };
  const refreshClips = () => setClipsState(getClips());

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <AdminDashboard />;
      case "plans_iptv": return <PlansIPTVAdmin plans={plansIPTV} onChange={handlePlansIPTV} />;
      case "plans_vpn": return <PlansVPNAdmin plans={plansVPN} onChange={handlePlansVPN} />;
      case "plans_promo": return <PlansPromoAdmin plans={plansPromo} onChange={handlePlansPromo} />;
      case "users": return <AdminUsers />;
      case "resellers": return <AdminResellers />;
      case "clips": return <AdminClipsManager clips={clips} onRefresh={refreshClips} />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout section={section} onSection={setSection}>
      {renderSection()}
    </AdminLayout>
  );
}
