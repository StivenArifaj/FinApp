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
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/city-map" component={CityMapPage} />
      <ProtectedRoute path="/lesson/:id" component={LessonPage} />
      <ProtectedRoute path="/game/:id" component={GamePage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-light relative overflow-hidden">
      <Router />
      <Toaster />
    </div>
  );
}

export default App;
