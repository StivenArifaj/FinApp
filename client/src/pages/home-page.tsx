// client/src/pages/home-page.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Home, Settings, Shop, Trophy, Star } from "lucide-react"; // Added Star icon for potential use
import BottomNav from "@/components/bottom-nav";
import UserHeader from "@/components/user-header";
import AchievementCard from "@/components/achievement-card"; // Assuming this component exists
import LessonCard from "@/components/lesson-card"; // Assuming this component exists
import ProgressBar from "@/components/progress-bar"; // Assuming this component exists
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming you have a ScrollArea component
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

// Import Firestore
import { getFirestore, collection, getDocs, doc, getDoc, DocumentData } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app

// Get Firestore instance
const db = getFirestore(app);

// Define types for data fetched from Firestore
interface AchievementData {
  id: string; // Firestore document ID
  name: string;
  description: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  reward?: number; // Coin reward
  // Add other fields from your achievements collection
}

interface LessonData {
   id: string; // Firestore document ID
   title: string;
   description?: string;
   topic: string;
   xp_reward: number;
   coin_reward: number;
   order: number;
   // Add other fields from your lessons collection
}

interface UserData {
  uid: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  xp: number;
  coins: number;
  streak: number;
  ownedProperties: { [key: string]: any };
  achievements: string[]; // Array of achievement IDs unlocked by the user
  completedLessons: string[]; // Added to track completed lessons
  createdAt: any;
}


export default function HomePage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(true);
  const [allAchievements, setAllAchievements] = useState<AchievementData[]>([]);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(true);
  const [latestLessons, setLatestLessons] = useState<LessonData[]>([]); // State for fetching some lessons
   const [isFetchingLessons, setIsFetchingLessons] = useState(true);


  // Fetch current user's data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsFetchingUserData(true);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setCurrentUserData(userDocSnap.data() as UserData);
          } else {
            console.warn("No user document found in Firestore for UID:", user.uid);
            setCurrentUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setCurrentUserData(null);
        } finally {
          setIsFetchingUserData(false);
        }
      } else {
        setCurrentUserData(null);
        setIsFetchingUserData(false);
      }
    };

    fetchUserData();
  }, [user]); // Rerun when the Firebase auth user object changes

  // Fetch all achievements from Firestore
  useEffect(() => {
    const fetchAchievements = async () => {
      setIsFetchingAchievements(true);
      try {
        const querySnapshot = await getDocs(collection(db, "achievements"));
        const achievementsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as AchievementData
        }));
        setAllAchievements(achievementsList);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsFetchingAchievements(false);
      }
    };

    fetchAchievements();
  }, []); // Fetch once on mount

    // Fetch a few latest lessons from Firestore (you might want to refine this query)
    useEffect(() => {
        const fetchLatestLessons = async () => {
            setIsFetchingLessons(true);
            try {
                // Example: Fetching first 3 lessons ordered by 'order' or 'createdAt'
                // Requires indexing in Firestore for ordering
                // const lessonsQuery = query(collection(db, "lessons"), orderBy("order"), limit(3));
                const querySnapshot = await getDocs(collection(db, "lessons")); // Simple fetch all for now
                const lessonsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as LessonData
                }));
                // Sort lessons if needed (e.g., by order if not using Firestore ordering)
                lessonsList.sort((a, b) => (a.order || 0) - (b.order || 0));
                setLatestLessons(lessonsList.slice(0, 3)); // Take the first 3 after sorting
            } catch (error) {
                console.error("Error fetching latest lessons:", error);
            } finally {
                setIsFetchingLessons(false);
            }
        };

        fetchLatestLessons();
    }, []); // Fetch once on mount


  // Show loading state while fetching
  if (isAuthLoading || isFetchingUserData || isFetchingAchievements || isFetchingLessons) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Home Page...
      </div>
    );
  }

  // Redirect if no user is logged in
  if (!user) {
    return null; // useAuth hook will handle the redirect
  }

  // Determine unlocked state for achievements
  const unlockedAchievements = currentUserData?.achievements || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <UserHeader
        username={currentUserData?.username || user.displayName || "FinCity Player"}
        coins={currentUserData?.coins ?? 0}
        xp={currentUserData?.xp ?? 0}
        avatarUrl={user.photoURL || undefined}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUserData?.username || "FinCity Player"}!</h2>
            <p className="text-gray-700">Keep up the great work on your financial journey.</p>
          </motion.div>

          {/* Progress Section */}
          <motion.div
             className="bg-white rounded-lg shadow-md p-6 mb-6"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
          >
             <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
             {/* You'll need to calculate total XP needed for next level */}
             <ProgressBar label={`Level ${Math.floor((currentUserData?.xp ?? 0) / 100) + 1}`} progress={((currentUserData?.xp ?? 0) % 100) / 100 * 100} /> {/* Example progress based on XP */}
             <p className="text-sm text-gray-600 mt-2">XP: {currentUserData?.xp ?? 0}</p>
          </motion.div>

          {/* Quick Actions */}
           <motion.div
              className="grid grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
           >
               <Button className="h-24 flex flex-col items-center justify-center" variant="outline" onClick={() => navigate('/city-map')}>
                   <MapPin size={24} className="mb-1" />
                   City Map
               </Button>
                <Button className="h-24 flex flex-col items-center justify-center" variant="outline" onClick={() => navigate('/shop')}>
                   <Shop size={24} className="mb-1" />
                   Shop
               </Button>
           </motion.div>


          <Separator className="my-6" />

          {/* Latest Lessons Section */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Latest Lessons</h3>
              <Button variant="link" onClick={() => navigate('/lessons')} className="p-0 h-auto">
                See All <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
             {isFetchingLessons ? (
                <p>Loading lessons...</p>
             ) : latestLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestLessons.map(lesson => (
                    <LessonCard
                        key={lesson.id}
                        lesson={{
                            id: lesson.id,
                            title: lesson.title,
                            description: lesson.description || 'No description provided.',
                             xp_reward: lesson.xp_reward,
                             coin_reward: lesson.coin_reward,
                             // Determine if completed (requires checking user.completedLessons)
                             completed: currentUserData?.completedLessons?.includes(lesson.id) || false,
                             // Add other lesson properties needed by LessonCard
                        }}
                        onClick={() => navigate(`/lesson/${lesson.id}`)} // Navigate to lesson detail page
                    />
                ))}
                </div>
             ) : (
                <p>No lessons available yet.</p>
             )}
          </motion.div>


          {/* Achievements Section */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Achievements</h3>
               {/* Link to a dedicated achievements page if you create one */}
              <Button variant="link" onClick={() => navigate('/achievements')} className="p-0 h-auto">
                See All <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            {isFetchingAchievements ? (
              <p>Loading achievements...</p>
            ) : allAchievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={{
                      id: achievement.id,
                      name: achievement.name,
                      icon: achievement.icon || "ri-trophy-fill", // Default icon if none in Firestore
                      iconColor: achievement.iconColor || "text-primary", // Default color
                      iconBg: achievement.iconBg || "bg-primary/20", // Default background
                      unlocked: unlockedAchievements.includes(achievement.id), // Check if user has this achievement ID
                      description: achievement.description || '', // Add description
                      reward: achievement.reward ?? 0, // Add reward
                    }}
                  />
                ))}
              </div>
            ) : (
              <p>No achievements defined yet.</p>
            )}
          </motion.div>
        </div>
      </ScrollArea>

      <BottomNav active="home" />
    </div>
  );
}
