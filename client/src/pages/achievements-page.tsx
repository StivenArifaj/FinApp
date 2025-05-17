// client/src/pages/achievements-page.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Award, Trophy, LockOpen, Lock } from "lucide-react"; // Added LockOpen and Lock icons
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available
import { useAuth } from "@/hooks/use-auth"; // To check authentication status
import { useToast } from "@/hooks/use-toast"; // To display toasts


// Import Firestore
import { getFirestore, collection, query, orderBy, limit, getDocs, DocumentData, onSnapshot, QuerySnapshot, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app

// Get Firestore instance
const db = getFirestore(app);

// Define type for Achievement data fetched from Firestore
interface AchievementData {
  id: string; // Firestore document ID
  name: string;
  description: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  reward?: number; // Coin reward for unlocking
  // Add other fields from your achievements collection, potentially including unlocking criteria
  // conditionDescription?: string; // Optional: A user-friendly description of how to unlock
}

// Define type for user data fetched for unlocked achievements
interface UserData {
  uid: string;
  achievements: string[]; // Array of achievement IDs unlocked by the user
  // Include other fields only if needed on this page
}


export default function AchievementsPage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get authenticated Firebase user and loading state
  const { toast } = useToast(); // Get toast function

  const [allAchievements, setAllAchievements] = useState<AchievementData[]>([] as AchievementData[]);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(true);

  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(true);


  // --- Real-time listener for All Achievements ---
  useEffect(() => {
      setIsFetchingAchievements(true);
      const unsubscribe = onSnapshot(collection(db, "achievements"), (snapshot: QuerySnapshot<DocumentData>) => {
          const achievementsList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data() as AchievementData
          }));
          setAllAchievements(achievementsList);
          setIsFetchingAchievements(false);
      }, (error) => {
          console.error("Error fetching real-time achievements updates:", error);
           toast({
              title: "Error",
              description: "Failed to get real-time achievements data.",
              variant: "destructive",
            });
          setIsFetchingAchievements(false);
      });

      return () => unsubscribe();
  }, []); // Fetch once on mount


   // --- Real-time listener for Current User Data (for unlocked achievements) ---
   useEffect(() => {
       let unsubscribe: (() => void) | undefined;

       if (user) {
           setIsFetchingUserData(true);
           const userDocRef = doc(db, "users", user.uid);
            unsubscribe = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                 // Only fetch the achievements array and uid for this page
                 const userData = docSnap.data() as UserData;
                 setCurrentUserData({
                     uid: user.uid,
                     achievements: userData.achievements || [], // Ensure it's an array
                     // Only include other fields if you need them on this page
                 });
              } else {
                 console.warn("No user document found in Firestore for UID:", user.uid);
                 setCurrentUserData(null);
              }
              setIsFetchingUserData(false);
            }, (error) => {
               console.error("Error fetching real-time user data updates:", error);
                toast({
                 title: "Error",
                 description: "Failed to get real-time user data updates.",
                 variant: "destructive",
               });
              setIsFetchingUserData(false);
            });
       } else {
          setCurrentUserData(null);
          setIsFetchingUserData(false);
       }

       return () => {
          if (unsubscribe) {
             unsubscribe();
          }
       };
   }, [user]); // Rerun when the Firebase auth user object changes


   // Redirect if no user is logged in (handled by useAuth hook)
    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate("/auth"); // Redirect to auth page if not authenticated and not loading
        }
    }, [user, isAuthLoading, navigate]);


  // Show loading state while checking authentication or fetching data
  if (isAuthLoading || isFetchingAchievements || isFetchingUserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Achievements...
      </div>
    );
  }

   // If user is not logged in (and loading is complete), the effect above will redirect, so we return null here.
   if (!user) {
       return null;
   }

    // Determine unlocked status for each achievement
    const achievementsWithStatus = allAchievements.map(ach => ({
        ...ach,
        unlocked: currentUserData?.achievements?.includes(ach.id) || false,
    }));

    // Optional: Sort achievements (e.g., unlocked first, then alphabetical)
     achievementsWithStatus.sort((a, b) => {
         if (a.unlocked && !b.unlocked) return -1;
         if (!a.unlocked && b.unlocked) return 1;
         return a.name.localeCompare(b.name); // Sort by name alphabetically
     });


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)} // Navigate back to the previous page
          className="mr-2"
        >
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-lg font-bold flex-1">All Achievements</h2>
         <Award size={24} className="text-yellow-500"/> {/* Achievement icon */}
      </div>

      {/* Achievements List */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {achievementsWithStatus.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {achievementsWithStatus.map((achievement) => (
                <motion.li
                  key={achievement.id}
                  className="flex items-center p-4"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.3 }} // Simple animation
                >
                   {/* Achievement Icon and Status */}
                   <div className={`w-10 h-10 rounded-full ${achievement.iconBg || (achievement.unlocked ? 'bg-green-100' : 'bg-gray-100')} flex items-center justify-center mr-3 flex-shrink-0`}>
                        {/* Conditional rendering for unlocked/locked icon */}
                        {achievement.unlocked ? (
                             <LockOpen size={20} className={achievement.iconColor || 'text-green-600'}/> // Unlocked icon
                        ) : (
                             <Lock size={20} className="text-gray-500"/> // Locked icon
                        )}
                   </div>

                  {/* Achievement Details */}
                  <div className="flex-1 pr-4"> {/* Added padding right */}
                    <h4 className={`font-medium ${achievement.unlocked ? 'text-gray-800' : 'text-gray-600'}`}>{achievement.name}</h4>
                    <p className={`text-xs ${achievement.unlocked ? 'text-gray-600' : 'text-gray-500'}`}>{achievement.description}</p>
                     {/* Optional: Display unlocking criteria if not unlocked */}
                     {!achievement.unlocked && achievement.conditionDescription && (
                         <p className="text-xs text-blue-600 mt-1 italic">{achievement.conditionDescription}</p>
                     )}
                  </div>

                   {/* Achievement Reward (if unlocked) */}
                  {achievement.unlocked && achievement.reward !== undefined && achievement.reward > 0 && (
                       <div className="flex items-center text-amber-600 text-sm font-semibold flex-shrink-0"> {/* Added flex-shrink-0 */}
                           {/* Assuming lucide-circle-dollar-sign */}
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-dollar-sign mr-1"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4h-6"/><path d="M12 17.5v-.5"/><path d="M12 6v.5"/></svg>
                           <span>+{achievement.reward}</span>
                       </div>
                   )}
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Trophy size={32} className="mx-auto mb-3"/>
              <p>No achievements defined yet.</p>
            </div>
          )}
             {/* Show loading message only if currently fetching and no data is yet available */}
           {isFetchingAchievements && achievementsWithStatus.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                   Loading achievements...
                </div>
           )}
        </div>
      </ScrollArea>

      {/* Assuming no bottom nav is needed on this page, or add it if desired */}
      {/* <BottomNav /> */}
    </div>
  );
}
