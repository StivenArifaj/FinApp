import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BuildingCard from "@/components/building-card";
import { Link } from "wouter";
import { motion } from "framer-motion";

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
  const [mapView, setMapView] = useState<'normal' | '3d'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [dailyRewardCollected, setDailyRewardCollected] = useState<boolean>(false);
  
  const { data: buildings } = useQuery({
    queryKey: ['/api/buildings'],
  });

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
  };

  const closePropertyInfo = () => {
    setSelectedBuilding(null);
  };
  
  const toggleMapView = () => {
    setMapView(prev => prev === 'normal' ? '3d' : 'normal');
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 1.5) {
      setZoomLevel(prev => prev + 0.1);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.8) {
      setZoomLevel(prev => prev - 0.1);
    }
  };
  
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  const collectDailyRewards = () => {
    // This would typically call an API to collect rewards
    setDailyRewardCollected(true);
    
    // Show a toast or notification for feedback
    // This is a placeholder for actual reward logic
    setTimeout(() => {
      setDailyRewardCollected(false);
    }, 3000);
  };

  return (
    <>
      <main className="flex-1 overflow-auto pb-20">
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your FinCity</h2>
            <div className="flex items-center">
              <span className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-sm mr-2">
                <i className="ri-coin-fill mr-1"></i> <span>{user?.coins || 0}</span>
              </span>
              <button 
                className="w-9 h-9 rounded-full bg-light flex items-center justify-center mr-2 relative"
                onClick={collectDailyRewards}
                disabled={dailyRewardCollected}
              >
                <i className={`ri-money-dollar-circle-line text-dark/60 ${dailyRewardCollected ? '' : 'animate-pulse-soft'}`}></i>
                {!dailyRewardCollected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button 
                className="w-9 h-9 rounded-full bg-light flex items-center justify-center mr-2"
                onClick={toggleControls}
              >
                <i className="ri-settings-4-line text-dark/60"></i>
              </button>
              <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center">
                <i className="ri-information-line text-dark/60"></i>
              </button>
            </div>
          </div>
          
          {/* City Map Container */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            {/* City Map with zoom and 3D effects */}
            <div 
              className={`relative bg-gradient-to-b from-blue-100 to-blue-50 h-[500px] overflow-hidden transition-all duration-500 ${mapView === '3d' ? 'animate-tilt-3d' : ''}`}
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Sky with clouds */}
              <div className="absolute inset-0">
                {/* Animated clouds */}
                <div className="absolute top-[10%] left-[-10%] w-20 h-8 bg-white/70 rounded-full blur-sm animate-[moveRight_40s_linear_infinite]"></div>
                <div className="absolute top-[5%] left-[20%] w-32 h-10 bg-white/80 rounded-full blur-sm animate-[moveRight_60s_linear_infinite]"></div>
                <div className="absolute top-[15%] right-[-5%] w-24 h-7 bg-white/60 rounded-full blur-sm animate-[moveLeft_50s_linear_infinite]"></div>
                
                {/* Sky gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent h-1/6 opacity-40"></div>
                
                {/* Ground areas */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3">
                  {/* Park areas */}
                  <div className="absolute bottom-0 left-[5%] right-[70%] top-[20%] bg-green-200 rounded-tl-3xl rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-[60%] right-[5%] top-[30%] bg-green-200 rounded-tl-lg rounded-tr-3xl"></div>
                  
                  {/* Trees in parks */}
                  <div className="absolute bottom-[5%] left-[10%] w-10 h-12">
                    <div className="absolute bottom-0 left-[35%] w-3 h-6 bg-yellow-800 rounded-sm"></div>
                    <div className="absolute bottom-[40%] left-0 right-0 h-8 bg-green-600 rounded-full"></div>
                  </div>
                  
                  <div className="absolute bottom-[10%] left-[20%] w-8 h-10">
                    <div className="absolute bottom-0 left-[35%] w-2 h-4 bg-yellow-800 rounded-sm"></div>
                    <div className="absolute bottom-[30%] left-0 right-0 h-7 bg-green-600 rounded-full"></div>
                  </div>
                  
                  <div className="absolute bottom-[7%] right-[25%] w-10 h-12">
                    <div className="absolute bottom-0 left-[35%] w-3 h-6 bg-yellow-800 rounded-sm"></div>
                    <div className="absolute bottom-[40%] left-0 right-0 h-8 bg-green-600 rounded-full"></div>
                  </div>
                  
                  <div className="absolute bottom-[12%] right-[10%] w-8 h-10">
                    <div className="absolute bottom-0 left-[35%] w-2 h-4 bg-yellow-800 rounded-sm"></div>
                    <div className="absolute bottom-[30%] left-0 right-0 h-7 bg-green-600 rounded-full"></div>
                  </div>
                  
                  {/* Lake */}
                  <div className="absolute bottom-[15%] left-[38%] right-[38%] h-[20%] bg-blue-400 rounded-full">
                    <div className="absolute inset-[10%] bg-blue-300 rounded-full opacity-70"></div>
                    <div className="absolute top-[20%] left-[20%] w-[15%] h-[10%] bg-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-[25%] right-[30%] w-[10%] h-[8%] bg-white/20 rounded-full animate-pulse" style={{animationDelay: "0.5s"}}></div>
                  </div>
                </div>
              </div>
              
              {/* Interactive grid overlay for placement visualization */}
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10 pointer-events-none">
                {Array.from({length: 12}).map((_, rowIndex) => (
                  Array.from({length: 12}).map((_, colIndex) => (
                    <div key={`grid-${rowIndex}-${colIndex}`} className="border border-black/20"></div>
                  ))
                ))}
              </div>
              
              {/* Roads network */}
              <div className="absolute inset-0">
                {/* Main horizontal roads */}
                <div className="absolute top-[30%] left-0 right-0 h-10 bg-gray-600">
                  {/* Road markings */}
                  <div className="absolute top-[45%] left-0 right-0 h-1 bg-yellow-400 opacity-80">
                    <div className="absolute top-0 left-0 right-0 h-full w-full flex items-center">
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-[60%] left-0 right-0 h-10 bg-gray-600">
                  {/* Road markings */}
                  <div className="absolute top-[45%] left-0 right-0 h-1 bg-yellow-400 opacity-80">
                    <div className="absolute top-0 left-0 right-0 h-full w-full flex items-center">
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                      <div className="w-6 h-[2px] bg-yellow-400 mr-3"></div>
                    </div>
                  </div>
                </div>
                
                {/* Main vertical roads */}
                <div className="absolute left-[30%] top-0 bottom-0 w-10 bg-gray-600">
                  {/* Road markings */}
                  <div className="absolute left-[45%] top-0 bottom-0 w-1 bg-yellow-400 opacity-80">
                    <div className="absolute left-0 top-0 bottom-0 w-full h-full flex flex-col items-center justify-start">
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute left-[65%] top-0 bottom-0 w-10 bg-gray-600">
                  {/* Road markings */}
                  <div className="absolute left-[45%] top-0 bottom-0 w-1 bg-yellow-400 opacity-80">
                    <div className="absolute left-0 top-0 bottom-0 w-full h-full flex flex-col items-center justify-start">
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                      <div className="h-6 w-[2px] bg-yellow-400 mb-3"></div>
                    </div>
                  </div>
                </div>
                
                {/* Road intersections with animated cars */}
                <div className="absolute top-[30%] left-[30%] w-10 h-10 bg-gray-700">
                  {/* Animated car */}
                  <div className="absolute w-4 h-2 bg-red-500 rounded-sm animate-[moveRight_10s_linear_infinite] top-2"></div>
                </div>
                
                <div className="absolute top-[30%] left-[65%] w-10 h-10 bg-gray-700">
                  {/* Animated car */}
                  <div className="absolute w-4 h-2 bg-blue-500 rounded-sm animate-[moveLeft_8s_linear_infinite] bottom-2"></div>
                </div>
                
                <div className="absolute top-[60%] left-[30%] w-10 h-10 bg-gray-700">
                  {/* Animated car */}
                  <div className="absolute w-2 h-4 bg-green-500 rounded-sm animate-[moveLeft_12s_linear_infinite] left-2"></div>
                </div>
                
                <div className="absolute top-[60%] left-[65%] w-10 h-10 bg-gray-700">
                  {/* Animated car */}
                  <div className="absolute w-2 h-4 bg-yellow-500 rounded-sm animate-[moveRight_9s_linear_infinite] right-2"></div>
                </div>
              </div>
              
              {/* Map Buildings */}
              <div className="absolute inset-0 p-4">
                {buildings && Array.isArray(buildings) ? (
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
                    <motion.div 
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.div>
                    
                    <motion.div 
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-secondary rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                        <div className="absolute top-4 left-2 right-2 h-8 flex items-center justify-center">
                          <i className="ri-store-2-fill text-white/70 text-2xl"></i>
                        </div>
                        <i className="ri-shopping-bag-fill text-white text-xl mb-1"></i>
                        <span className="text-white text-xs font-medium">Shop</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-accent rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                        <div className="absolute top-2 left-2 right-2 h-6 bg-white/20 rounded"></div>
                        <i className="ri-safe-2-fill text-white text-xl mb-1"></i>
                        <span className="text-white text-xs font-medium">Savings</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-blue-500 rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                        <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg bg-blue-600"></div>
                        <div className="absolute top-7 left-3 right-3 h-8 bg-white/30 rounded"></div>
                        <i className="ri-book-open-fill text-white text-xl mb-1"></i>
                        <span className="text-white text-xs font-medium">School</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-gray-400 rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                          <i className="ri-lock-fill text-white text-3xl"></i>
                        </div>
                        <span className="text-white text-xs font-medium">250 Coins</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
              
              {/* Map Controls */}
              {showControls && (
                <motion.div 
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <button 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${mapView === '3d' ? 'bg-primary text-white' : 'bg-light text-dark/60'}`}
                    onClick={toggleMapView}
                    title={mapView === '3d' ? 'Switch to 2D View' : 'Switch to 3D View'}
                  >
                    <i className={mapView === '3d' ? 'ri-cube-line' : 'ri-landscape-line'}></i>
                  </button>
                  <button 
                    className="w-10 h-10 rounded-full bg-light flex items-center justify-center mb-2 text-dark/60"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 1.5}
                    title="Zoom In"
                  >
                    <i className="ri-zoom-in-line"></i>
                  </button>
                  <button 
                    className="w-10 h-10 rounded-full bg-light flex items-center justify-center text-dark/60"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 0.8}
                    title="Zoom Out"
                  >
                    <i className="ri-zoom-out-line"></i>
                  </button>
                </motion.div>
              )}

              {/* Coins earned notification */}
              {dailyRewardCollected && (
                <motion.div 
                  className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-yellow-300 flex items-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <i className="ri-coin-line text-yellow-500 mr-2"></i>
                  <span className="text-yellow-600 font-medium">+35 coins collected!</span>
                </motion.div>
              )}
              
              {/* Add Building Button */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center">
                <Link href="/shop" className="bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center mb-2">
                  <i className="ri-add-line text-xl"></i>
                </Link>
                <motion.button 
                  onClick={collectDailyRewards}
                  className={`bg-secondary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${dailyRewardCollected ? 'opacity-50' : ''}`}
                  disabled={dailyRewardCollected}
                  animate={dailyRewardCollected ? {} : { y: [0, -8, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <i className="ri-money-dollar-circle-line text-xl"></i>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Property Info (Would slide up when property is clicked) */}
          {selectedBuilding && (
            <motion.div 
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-w-md mx-auto z-50"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
            </motion.div>
          )}
        </div>
      </main>
      <BottomNav active="city-map" />
    </>
  );
}
