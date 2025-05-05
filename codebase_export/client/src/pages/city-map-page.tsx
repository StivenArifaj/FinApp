import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BuildingCard from "@/components/building-card";
import { Link } from "wouter";

interface Building {
  id: number;
  name: string;
  description: string;
  owned: boolean;
  dailyReward: number;
  progress: number;
  lessons: {
    total: number;
    completed: number;
  };
  quizzes: {
    total: number;
    remaining: number;
  };
}

export default function CityMapPage() {
  const { user } = useAuth();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  
  const { data: buildings } = useQuery({
    queryKey: ['/api/buildings'],
  });

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
  };

  const closePropertyInfo = () => {
    setSelectedBuilding(null);
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your FinCity</h2>
            <div className="flex items-center">
              <span className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-sm mr-2">
                <i className="ri-coin-fill mr-1"></i> <span>{user?.coins || 0}</span>
              </span>
              <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center">
                <i className="ri-information-line text-dark/60"></i>
              </button>
            </div>
          </div>
          
          {/* City Map */}
          <div className="relative bg-blue-50 rounded-xl h-[500px] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-100 to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-blue-100 to-transparent"></div>
            </div>
            
            {/* Roads */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-0 right-0 h-8 bg-gray-300"></div>
              <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-300"></div>
              <div className="absolute bottom-1/4 left-0 right-0 h-8 bg-gray-300"></div>
              <div className="absolute left-1/4 top-0 bottom-0 w-8 bg-gray-300"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-gray-300"></div>
              <div className="absolute right-1/4 top-0 bottom-0 w-8 bg-gray-300"></div>
            </div>
            
            {/* Map Buildings */}
            <div className="absolute inset-0 p-4">
              {buildings ? (
                buildings.map((building) => (
                  <BuildingCard 
                    key={building.id} 
                    building={building} 
                    onClick={() => handleBuildingClick(building)} 
                  />
                ))
              ) : (
                <>
                  {/* Default Buildings */}
                  <div 
                    className="map-building absolute top-[15%] left-[30%] w-20 h-28 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 1,
                      name: "Bank",
                      description: "Learn about payment methods, bank accounts, and how to manage cards.",
                      owned: true,
                      dailyReward: 10,
                      progress: 65,
                      lessons: {
                        total: 3,
                        completed: 2
                      },
                      quizzes: {
                        total: 3,
                        remaining: 1
                      }
                    })}
                  >
                    <div className="bg-primary rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="bg-primary-dark absolute top-0 left-0 right-0 h-4 rounded-t-lg"></div>
                      <div className="absolute top-6 left-2 right-2 h-12 flex flex-col">
                        <div className="h-2 bg-white/30 mb-1 rounded"></div>
                        <div className="h-2 bg-white/30 mb-1 rounded"></div>
                        <div className="h-2 bg-white/30 rounded"></div>
                      </div>
                      <i className="ri-bank-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">Bank</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute top-[20%] right-[30%] w-20 h-24 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 2,
                      name: "Shop",
                      description: "Learn about consumer choices and responsible spending.",
                      owned: true,
                      dailyReward: 8,
                      progress: 30,
                      lessons: {
                        total: 4,
                        completed: 1
                      },
                      quizzes: {
                        total: 2,
                        remaining: 1
                      }
                    })}
                  >
                    <div className="bg-secondary rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-4 left-2 right-2 h-8 flex items-center justify-center">
                        <i className="ri-store-2-fill text-white/70 text-2xl"></i>
                      </div>
                      <i className="ri-shopping-bag-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">Shop</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute bottom-[20%] left-[35%] w-20 h-20 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 3,
                      name: "Savings",
                      description: "Learn how to save money and plan for the future.",
                      owned: true,
                      dailyReward: 5,
                      progress: 10,
                      lessons: {
                        total: 5,
                        completed: 0
                      },
                      quizzes: {
                        total: 2,
                        remaining: 2
                      }
                    })}
                  >
                    <div className="bg-accent rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-2 left-2 right-2 h-6 bg-white/20 rounded"></div>
                      <i className="ri-safe-2-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">Savings</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute bottom-[25%] right-[32%] w-24 h-24 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 4,
                      name: "School",
                      description: "Learn financial education fundamentals.",
                      owned: true,
                      dailyReward: 12,
                      progress: 80,
                      lessons: {
                        total: 3,
                        completed: 2
                      },
                      quizzes: {
                        total: 3,
                        remaining: 1
                      }
                    })}
                  >
                    <div className="bg-blue-500 rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg bg-blue-600"></div>
                      <div className="absolute top-7 left-3 right-3 h-8 bg-white/30 rounded"></div>
                      <i className="ri-book-open-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">School</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute top-[45%] left-[60%] w-20 h-20 opacity-60 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 5,
                      name: "??? Building",
                      description: "This building is locked. Earn more coins to unlock it.",
                      owned: false,
                      dailyReward: 15,
                      progress: 0,
                      lessons: {
                        total: 0,
                        completed: 0
                      },
                      quizzes: {
                        total: 0,
                        remaining: 0
                      }
                    })}
                  >
                    <div className="bg-gray-400 rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <i className="ri-lock-fill text-white text-3xl"></i>
                      </div>
                      <span className="text-white text-xs font-medium">250 Coins</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Add Building Button */}
            <Link href="/shop" className="absolute bottom-4 right-4 bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center">
              <i className="ri-add-line text-xl"></i>
            </Link>
          </div>
          
          {/* Property Info (Would slide up when property is clicked) */}
          {selectedBuilding && (
            <div 
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-w-md mx-auto transition-transform duration-300"
              style={{ transform: selectedBuilding ? 'translateY(0)' : 'translateY(100%)' }}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3" onClick={closePropertyInfo}></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{selectedBuilding.name}</h3>
                  <span className={`${selectedBuilding.owned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-xs px-2 py-1 rounded-full`}>
                    {selectedBuilding.owned ? 'Owned' : 'Available'}
                  </span>
                </div>
                
                <p className="text-dark/70 mb-4">{selectedBuilding.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Daily Reward</h4>
                    <span className="flex items-center text-amber-500 text-sm">
                      <i className="ri-coin-fill mr-1"></i> +{selectedBuilding.dailyReward} coins
                    </span>
                  </div>
                  {selectedBuilding.owned ? (
                    <Link href={`/lesson/${selectedBuilding.id}`} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Start Lesson</Link>
                  ) : (
                    <Button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">Buy for 250 coins</Button>
                  )}
                </div>
                
                {selectedBuilding.owned && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Your Progress</h4>
                    <div className="flex items-center">
                      <Progress value={selectedBuilding.progress} className="w-full h-2 mr-3" />
                      <span className="text-xs whitespace-nowrap">{selectedBuilding.progress}%</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-dark/70">
                      <span>{selectedBuilding.lessons.completed}/{selectedBuilding.lessons.total} lessons completed</span>
                      <span>{selectedBuilding.quizzes.remaining} quiz remaining</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav active="city-map" />
    </>
  );
}
