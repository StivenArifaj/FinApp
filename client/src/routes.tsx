// client/src/routes.tsx
import { Routes, Route } from "react-router-dom";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CityMapPage from "@/pages/city-map-page";
import LessonPage from "@/pages/lesson-page";
import GamePage from "@/pages/game-page"; // Assuming GamePage exists
import ShopPage from "@/pages/shop-page"; // Assuming ShopPage exists
import ProfilePage from "@/pages/profile-page"; // Assuming ProfilePage exists
import NotificationsPage from "@/pages/notifications-page"; // Assuming NotificationsPage exists
import SettingsPage from "@/pages/settings-page"; // Assuming SettingsPage exists
import LeaderboardPage from "@/pages/leaderboard-page"; // Import the LeaderboardPage
import AchievementsPage from "@/pages/achievements-page"; // Import the AchievementsPage
import NotFound from "@/pages/not-found"; // Assuming NotFound page exists
import { ProtectedRoute } from "./lib/protected-route";

export default function AppRoutes() {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-background relative overflow-hidden">
      <Routes>
        {/* Public route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes wrapped by ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/city-map" element={<CityMapPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Add the protected routes for the new pages */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
