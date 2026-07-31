import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LangProvider } from "./context/LangContext";
import { AdultPinProvider } from "./context/AdultPinContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LiveTVPage from "./pages/LiveTVPage";
import PlayerPage from "./pages/PlayerPage";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import PlansPage from "./pages/PlansPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import ResellerDashboard from "./pages/ResellerDashboard";
import BecomeResellerPage from "./pages/BecomeResellerPage";
import AdminPage from "./pages/admin/AdminPage";
import ClipsPage from "./pages/ClipsPage";
import RadioPage from "./pages/RadioPage";
import VPNPage from "./pages/VPNPage";
import PromotePage from "./pages/PromotePage";
import { initializeData } from "./utils/store";

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="h-screen bg-bg flex items-center justify-center"><Spinner /></div>;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function Spinner() {
  return (
    <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
  );
}

const TV_UA = /SmartTV|Tizen|Web0S|webOS|AndroidTV|AFT|BRAVIA|HbbTV/i;

function TVSetup() {
  const navigate = useNavigate();
  useEffect(() => {
    if (TV_UA.test(navigator.userAgent)) {
      document.body.classList.add("tv-mode");
    }
    const onKey = (e) => {
      if (e.key === "Backspace" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        navigate(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);
  return null;
}

function AppRoutes() {
  const { isAuth } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <LoginPage />} />
      {/* Admin — own layout, no main Layout wrapper */}
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/live" element={<LiveTVPage />} />
        <Route path="/player/:type/:id" element={<PlayerPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/series" element={<SeriesPage />} />
        <Route path="/series/:id" element={<SeriesDetailPage />} />
        <Route path="/radio" element={<RadioPage />} />
        <Route path="/clips" element={<ClipsPage />} />
        <Route path="/vpn" element={<VPNPage />} />
        <Route path="/promote" element={<PromotePage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/reseller" element={<ResellerDashboard />} />
        <Route path="/become-reseller" element={<BecomeResellerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  initializeData();
  return (
    <LangProvider>
      <AuthProvider>
        <AdultPinProvider>
          <TVSetup />
          <AppRoutes />
        </AdultPinProvider>
      </AuthProvider>
    </LangProvider>
  );
}
