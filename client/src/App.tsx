// client/src/App.tsx
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CityMapPage from "@/pages/city-map-page";
import LessonPage from "@/pages/lesson-page";
import GamePage from "@/pages/game-page";
import ShopPage from "@/pages/shop-page";
import ProfilePage from "@/pages/profile-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import AchievementsPage from "@/pages/achievements-page"; // Import the new AchievementsPage
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/city-map" component={CityMapPage} />
      <ProtectedRoute path="/lesson/:id" component={LessonPage} />
      {/* Assuming GamePage also needs protection */}
      <ProtectedRoute path="/game/:id" component={GamePage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      {/* Add the protected route for the LeaderboardPage */}
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      {/* Add the protected route for the AchievementsPage */}
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <Route path="/auth" component={AuthPage} />
      {/* Fallback route for Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    // The max-w-md and mx-auto classes center the app and limit its width,
    // which is suitable for a mobile-first design within a browser.
    // h-screen ensures it takes the full height of the viewport.
    // flex flex-col makes it a flex container with vertical direction.
    // bg-light and relative overflow-hidden are for styling.
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-100 relative overflow-hidden"> {/* Used gray-100 for consistency */}
      <Router />
      <Toaster /> {/* Assuming Toaster component is for displaying toasts */}
    </div>
  );
}

export default App;
