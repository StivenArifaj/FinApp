interface AchievementProps {
  achievement: {
    id: number;
    name: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    unlocked: boolean;
  };
}

export default function AchievementCard({ achievement }: AchievementProps) {
  return (
    <div className={`relative overflow-hidden bg-white rounded-xl shadow-sm p-4 text-center flex-1 border ${achievement.unlocked ? 'border-secondary/30' : 'border-gray-200'} transition-all duration-300 hover:shadow-md`}>
      {/* Achievement badge */}
      <div className={`relative w-14 h-14 mx-auto ${achievement.iconBg} rounded-full flex items-center justify-center mb-3 ${achievement.unlocked ? 'animate-pulse-soft' : ''}`}>
        {/* Inner glow effect for unlocked achievements */}
        {achievement.unlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spin-slow opacity-70"></div>
        )}
        
        {/* Icon */}
        <i className={`${achievement.icon} ${achievement.iconColor} text-2xl ${achievement.unlocked ? '' : 'opacity-60'}`}></i>
        
        {/* Lock overlay for locked achievements */}
        {!achievement.unlocked && (
          <div className="absolute inset-0 bg-gray-100/70 rounded-full flex items-center justify-center backdrop-blur-sm">
            <i className="ri-lock-2-line text-gray-400 text-lg"></i>
          </div>
        )}
      </div>
      
      {/* Achievement name */}
      <h5 className={`text-sm font-medium mb-1 ${!achievement.unlocked ? 'text-gray-400' : ''}`}>
        {achievement.name}
      </h5>
      
      {/* Unlocked status indicator */}
      {achievement.unlocked ? (
        <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full inline-block">
          Unlocked
        </span>
      ) : (
        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full inline-block">
          Locked
        </span>
      )}
      
      {/* Decorative elements */}
      {achievement.unlocked && (
        <div className="absolute top-1 right-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.3 9.9l-8.1 8.1a1 1 0 01-1.4 0l-4.5-4.5a1 1 0 010-1.4l1.4-1.4a1 1 0 011.4 0l2.4 2.4 6-6a1 1 0 011.4 0l1.4 1.4a1 1 0 010 1.4z" 
                  fill="currentColor" className="text-secondary/30" />
          </svg>
        </div>
      )}
    </div>
  );
}
