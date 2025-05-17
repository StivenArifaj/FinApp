import { useAuth } from "@/hooks/use-auth";
import BottomNav from "@/components/bottom-nav";
import UserHeader from "@/components/user-header";
import LessonCard from "@/components/lesson-card";
import AchievementCard from "@/components/achievement-card";
import { Link } from "react-router-dom";
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
          <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 rounded-xl p-5 text-white mb-6 shadow-lg border border-primary/20">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 opacity-10">
              <svg width="100" height="100" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="2" />
                <circle cx="40" cy="40" r="15" stroke="white" strokeWidth="2" />
                <path d="M40 10V20M40 60V70M10 40H20M60 40H70" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center">
                  Daily Challenge 
                  <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-primary text-xs rounded-full font-bold">STREAK: 2</span>
                </h3>
                <p className="text-sm text-white/90">Complete a lesson to earn extra coins!</p>
              </div>
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center shadow-inner relative group">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
                <i className="ri-calendar-check-fill text-3xl group-hover:scale-110 transition-transform"></i>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">2/5 days</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-white rounded-full"
                  style={{width: "40%", boxShadow: "0 0 8px rgba(255,255,255,0.8)"}}></div>
              </div>
              <div className="flex justify-between mt-2 items-center">
                <span className="text-xs text-white/90 inline-flex items-center">
                  <i className="ri-time-line mr-1"></i> Resets at midnight
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium inline-flex items-center">
                  <i className="ri-coin-line mr-1 text-yellow-300"></i> +25 coins
                </span>
              </div>
            </div>
          </div>
          
          {/* Continue Learning section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Continue Learning</h3>
              <Link to="/lessons" className="text-primary text-sm">View all</Link>
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
              <span className="text-secondary text-sm flex items-center bg-secondary/10 px-2 py-1 rounded-full">
                <i className="ri-building-2-line mr-1"></i> 3 buildings
              </span>
            </div>
            
            <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl relative h-48 overflow-hidden shadow-lg border border-blue-300">
              {/* Abstract city skyline */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-blue-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0">
                  <path fill="rgba(255,255,255,0.1)" fillOpacity="1" d="M0,224L40,213.3C80,203,160,181,240,181.3C320,181,400,203,480,202.7C560,203,640,181,720,181.3C800,181,880,203,960,213.3C1040,224,1120,224,1200,202.7C1280,181,1360,139,1400,117.3L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
                </svg>
              </div>
              
              {/* Cloud animations */}
              <div className="absolute top-5 left-5 w-20 h-8 bg-white/30 rounded-full animate-[moveRight_60s_linear_infinite]"></div>
              <div className="absolute top-10 right-10 w-16 h-6 bg-white/20 rounded-full animate-[moveLeft_45s_linear_infinite]"></div>
              
              <div className="relative z-10 p-5 text-white h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center">
                    <i className="ri-map-pin-2-fill text-xl mr-2 text-red-300"></i>
                    <h4 className="font-bold text-xl">FinCity</h4>
                  </div>
                  <p className="text-sm text-white/90 mt-1">Your growing financial metropolis</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 mb-3 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Daily income:</span>
                    <span className="text-sm font-bold flex items-center">
                      <i className="ri-coin-line text-yellow-300 mr-1"></i> 35 coins
                    </span>
                  </div>
                  <Link to="/city-map" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm inline-flex items-center justify-center w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <i className="ri-building-4-line mr-2"></i>
                    Visit Your City
                  </Link>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-1/4 right-4 w-5 h-5 rounded-full bg-yellow-300/40 animate-pulse"></div>
              <div className="absolute top-1/3 right-8 w-3 h-3 rounded-full bg-yellow-300/40 animate-pulse delay-150"></div>
            </div>
          </div>
          
          {/* Achievement badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Your Achievements</h3>
              <Link to="/profile" className="text-primary text-sm">All badges</Link>
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