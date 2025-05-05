import { Link } from "wouter";

interface BottomNavProps {
  active: "home" | "city-map" | "shop" | "profile";
}

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bg-white flex justify-around shadow-md">
      <Link href="/">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "home" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-home-5-fill text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/city-map">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "city-map" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-map-pin-line text-xl"></i>
          <span className="text-xs mt-1">City</span>
        </a>
      </Link>
      <Link href="/shop">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "shop" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-store-2-line text-xl"></i>
          <span className="text-xs mt-1">Shop</span>
        </a>
      </Link>
      <Link href="/profile">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "profile" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </a>
      </Link>
    </nav>
  );
}
