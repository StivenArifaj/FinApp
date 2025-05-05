import { useAuth } from "@/hooks/use-auth";

export default function UserHeader() {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <span className="text-primary font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <h2 className="font-bold text-dark">{user?.username || 'User'}</h2>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-yellow-600 mr-2">
              <i className="ri-star-fill mr-1"></i> <span>{user?.xp || 0} XP</span>
            </span>
            <span className="flex items-center text-amber-500">
              <i className="ri-coin-fill mr-1"></i> <span>{user?.coins || 0}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center mr-2">
          <i className="ri-notification-3-line text-dark/60"></i>
        </button>
        <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center">
          <i className="ri-settings-4-line text-dark/60"></i>
        </button>
      </div>
    </div>
  );
}
