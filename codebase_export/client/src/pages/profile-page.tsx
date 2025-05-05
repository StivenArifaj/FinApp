import BottomNav from "@/components/bottom-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: number;
  name: string;
  icon: string;
  date: string;
  reward: number;
}

interface LearningTopic {
  id: number;
  name: string;
  lessons: {
    completed: number;
    total: number;
  };
  progress: number;
}

export default function ProfilePage() {
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // Redirect to auth page
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements'],
  });
  
  const { data: topics } = useQuery({
    queryKey: ['/api/topics'],
  });

  // Mock data until we have real data
  const mockAchievements: Achievement[] = [
    {
      id: 1,
      name: "First Lesson Completed",
      icon: "ri-award-fill",
      date: "2 days ago",
      reward: 50
    },
    {
      id: 2,
      name: "First Building Purchased",
      icon: "ri-building-2-fill",
      date: "1 week ago",
      reward: 100
    },
    {
      id: 3,
      name: "Budget Master",
      icon: "ri-money-dollar-circle-fill",
      date: "1 week ago",
      reward: 75
    }
  ];
  
  const mockTopics: LearningTopic[] = [
    {
      id: 1,
      name: "Budgeting",
      lessons: {
        completed: 3,
        total: 5
      },
      progress: 60
    },
    {
      id: 2,
      name: "Banking & Cards",
      lessons: {
        completed: 4,
        total: 6
      },
      progress: 65
    },
    {
      id: 3,
      name: "Savings",
      lessons: {
        completed: 1,
        total: 4
      },
      progress: 25
    },
    {
      id: 4,
      name: "Online Safety",
      lessons: {
        completed: 0,
        total: 3
      },
      progress: 0
    }
  ];
  
  const userAchievements = achievements || mockAchievements;
  const learningTopics = topics || mockTopics;
  
  // Calculate progress to next level
  const currentLevel = 4;
  const currentXP = user?.xp || 240;
  const nextLevelXP = 400;
  const xpToNextLevel = nextLevelXP - currentXP;
  const progressToNextLevel = (currentXP / nextLevelXP) * 100;

  return (
    <>
      <main className="flex-1 p-4 overflow-auto bg-light">
        {/* Profile Header */}
        <div className="bg-white p-4 shadow-sm mb-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Profile</h2>
            <button className="w-8 h-8 flex items-center justify-center" onClick={() => logoutMutation.mutate()}>
              <i className="ri-logout-box-line text-dark/70"></i>
            </button>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-3">
            <span className="text-primary text-2xl font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{user?.username || 'User'}</h3>
          <p className="text-dark/60 mb-4">Joined 2 weeks ago</p>
          
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">Level {currentLevel}</div>
              <div className="text-xs text-dark/60">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{user?.xp || 0} XP</div>
              <div className="text-xs text-dark/60">Experience</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{userAchievements.length}</div>
              <div className="text-xs text-dark/60">Badges</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Level {currentLevel}</span>
              <span>Level {currentLevel + 1}</span>
            </div>
            <Progress value={progressToNextLevel} className="w-full h-2" />
            <div className="text-xs text-right mt-1 text-dark/60">
              {xpToNextLevel} XP to next level
            </div>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold mb-4">Recent Achievements</h3>
          
          <div className="space-y-4">
            {userAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                  <i className={`${achievement.icon} text-secondary`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.name}</h4>
                  <p className="text-xs text-dark/60">{achievement.date}</p>
                </div>
                <div className="flex items-center text-amber-500 text-sm">
                  <i className="ri-coin-fill mr-1"></i>
                  <span>+{achievement.reward}</span>
                </div>
              </div>
            ))}
            
            {userAchievements.length === 0 && (
              <div className="text-center py-4 text-dark/50">
                <p>No achievements yet. Keep learning!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Learning Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">Your Learning Stats</h3>
          
          <div className="space-y-4">
            {learningTopics.map((topic) => (
              <div key={topic.id}>
                <div className="flex justify-between mb-1">
                  <h4 className="text-sm font-medium">{topic.name}</h4>
                  <span className="text-xs text-dark/60">{topic.lessons.completed}/{topic.lessons.total} lessons</span>
                </div>
                <Progress value={topic.progress} className="w-full h-2" />
              </div>
            ))}
            
            {learningTopics.length === 0 && (
              <div className="text-center py-4 text-dark/50">
                <p>No learning progress yet. Start a lesson!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav active="profile" />
    </>
  );
}
