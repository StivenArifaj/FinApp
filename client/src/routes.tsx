import { Routes, Route } from "react-router-dom";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CityMapPage from "@/pages/city-map-page";
import LessonPage from "@/pages/lesson-page";
import GamePage from "@/pages/game-page";
import ShopPage from "@/pages/shop-page";
import ProfilePage from "@/pages/profile-page";
import NotificationsPage from "@/pages/notifications-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "@/lib/protected-route";

export default function AppRoutes() {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-background relative overflow-hidden">
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/city-map" element={<CityMapPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}