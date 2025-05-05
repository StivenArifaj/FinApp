import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function UserHeader() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Get notification count
  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    staleTime: 30000 // 30 seconds
  });
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  const handleNotificationsClick = () => {
    navigate("/notifications");
  };
  
  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Calculate level based on XP
  const level = Math.floor((user?.xp || 0) / 100) + 1;
  const levelProgress = ((user?.xp || 0) % 100) / 100;
  
  return (
    <motion.div 
      className="flex items-center justify-between mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center" onClick={handleProfileClick}>
        <motion.div 
          className="relative w-12 h-12 rounded-full bg-gradient-to-r from-primary/80 to-primary flex items-center justify-center mr-3 cursor-pointer shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Level indicator */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-black/20 h-full" 
              style={{height: `${levelProgress * 100}%`, transform: 'translateY(100%)'}}
            ></div>
          </div>
          <span className="text-white font-bold text-lg z-10">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
        </motion.div>
        
        <div>
          <h2 className="font-bold text-dark flex items-center">
            {user?.username || 'User'}
            <span className="ml-2 bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
              Lvl {level}
            </span>
          </h2>
          
          <div className="flex items-center text-xs mt-1">
            <motion.span 
              className="flex items-center bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full mr-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <i className="ri-star-fill mr-1"></i> 
              <span>{user?.xp || 0} XP</span>
            </motion.span>
            
            <motion.span 
              className="flex items-center bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full"
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              animate={{ 
                scale: [1, 1.03, 1],
                transition: { 
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2
                }
              }}
            >
              <i className="ri-coin-fill mr-1"></i> 
              <span>{user?.coins || 0}</span>
            </motion.span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <motion.button 
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center relative"
          onClick={handleNotificationsClick}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(240, 240, 240, 1)" }}
          whileTap={{ scale: 0.95 }}
        >
          <i className={`ri-notification-3-line text-dark/70 ${unreadCount > 0 ? 'animate-bell-shake' : ''}`}></i>
          {unreadCount > 0 && (
            <motion.span 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 15 
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>
        
        <motion.button 
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center"
          onClick={handleSettingsClick}
          whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(240, 240, 240, 1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <i className="ri-settings-4-line text-dark/70"></i>
        </motion.button>
      </div>
    </motion.div>
  );
}
