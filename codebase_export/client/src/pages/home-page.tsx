import { useAuth } from "@/hooks/use-auth";
import BottomNav from "@/components/bottom-nav";
import UserHeader from "@/components/user-header";
import LessonCard from "@/components/lesson-card";
import AchievementCard from "@/components/achievement-card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: lessons } = useQuery({
    queryKey: ['/api/lessons'],
  });
  
  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements'],
  });

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div id="home-screen" className="p-4 pt-6">
          <UserHeader />
          
          {/* Daily challenge */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Daily Challenge</h3>
                <p className="text-sm text-white/80">Complete a lesson to earn extra coins!</p>
              </div>
              <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center">
                <i className="ri-calendar-check-fill text-2xl"></i>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-white/20 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{width: "40%"}}></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>2/5 days</span>
                <span>+25 coins</span>
              </div>
            </div>
          </div>
          
          {/* Continue Learning section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Continue Learning</h3>
              <Link href="/lessons" className="text-primary text-sm">View all</Link>
            </div>
            
            {lessons && lessons.length > 0 ? (
              lessons.slice(0, 2).map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-bank-card-line text-accent text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Banking & Cards</h4>
                    <div className="flex justify-between items-center">
                      <Progress value={65} className="w-3/4 h-2" />
                      <span className="text-xs text-dark/60">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Visit your city */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Your Financial City</h3>
              <span className="text-secondary text-sm flex items-center">
                <i className="ri-building-2-line mr-1"></i> 3 buildings
              </span>
            </div>
            
            <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 relative h-44 overflow-hidden">
              <div className="absolute bottom-0 right-0 w-full h-32">
                <div className="w-full h-full object-cover object-bottom opacity-40 bg-blue-200"></div>
              </div>
              <div className="relative z-10">
                <h4 className="font-medium mb-1">FinCity</h4>
                <p className="text-sm text-dark/70 mb-4">Explore your financial city</p>
                <Link href="/city-map" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm inline-block">
                  Visit City
                </Link>
              </div>
            </div>
          </div>
          
          {/* Achievement badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Your Achievements</h3>
              <Link href="/profile" className="text-primary text-sm">All badges</Link>
            </div>
            
            <div className="flex space-x-3 mb-3">
              {achievements && achievements.length > 0 ? (
                achievements.slice(0, 3).map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <>
                  <AchievementCard 
                    achievement={{
                      id: 1,
                      name: "First Lesson",
                      icon: "ri-award-fill",
                      iconColor: "text-secondary",
                      iconBg: "bg-secondary/20",
                      unlocked: true
                    }} 
                  />
                  <AchievementCard 
                    achievement={{
                      id: 2,
                      name: "Coin Collector",
                      icon: "ri-money-dollar-circle-fill",
                      iconColor: "text-primary",
                      iconBg: "bg-primary/20",
                      unlocked: true
                    }} 
                  />
                  <AchievementCard 
                    achievement={{
                      id: 3,
                      name: "???",
                      icon: "ri-lock-2-line",
                      iconColor: "text-gray-400",
                      iconBg: "bg-gray-200",
                      unlocked: false
                    }} 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav active="home" />
    </>
  );
}
