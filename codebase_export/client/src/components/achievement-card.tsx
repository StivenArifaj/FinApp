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
    <div className="bg-white rounded-xl shadow-sm p-3 text-center flex-1">
      <div className={`w-12 h-12 mx-auto ${achievement.iconBg} rounded-full flex items-center justify-center mb-2`}>
        <i className={`${achievement.icon} ${achievement.iconColor} text-xl`}></i>
      </div>
      <h5 className={`text-xs font-medium ${!achievement.unlocked ? 'text-gray-400' : ''}`}>
        {achievement.name}
      </h5>
    </div>
  );
}
