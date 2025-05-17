// client/src/pages/profile-page.tsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { motion } from "framer-motion";
import { ChevronLeft, Settings, LogOut, Trophy, Home, DollarSign, Star, BookOpen, Award } from "lucide-react"; // Added relevant icons
import BottomNav from "@/components/bottom-nav";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth"; // To get the authenticated Firebase user

// Import Firestore and Auth
import { getFirestore, doc, getDoc, updateDoc, increment, arrayUnion, runTransaction, Timestamp, collection, getDocs, DocumentData, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth"; // Import signOut
import { app } from "../firebaseConfig";

// Get Firestore and Auth instances
const db = getFirestore(app);
const auth = getAuth(app);


// Define types for data fetched from Firestore
interface AchievementData {
  id: string; // Firestore document ID
  name: string;
  description: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  reward?: number; // Coin reward for unlocking
  // Add other fields
}

interface BuildingData {
  id: string; // Firestore document ID
  name: string;
  type: string;
  // Include other relevant fields for displaying owned properties (e.g., icon)
   icon?: string;
   color?: string;
   currentValue?: number;
}

interface ShopItemData {
   id: string; // Firestore document ID
   name: string;
   type: string;
   price: number;
   icon?: string;
   color?: string;
    description?: string;
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
  ownedProperties: { [propertyId: string]: { purchasePrice: number, purchaseTimestamp: any } }; // Storing details about owned properties
  achievements: string[]; // Array of achievement IDs unlocked by the user
  completedLessons: string[]; // Array of lesson IDs completed by the user
  ownedItems: string[]; // Array of shop item IDs owned by the user
  createdAt: any;
  lastCompletedLessonAt?: any;
}


export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get authenticated Firebase user and loading state
  const { toast } = useToast();

  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(true);

  const [allAchievements, setAllAchievements] = useState<AchievementData[]>([]);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(true);

  const [allBuildings, setAllBuildings] = useState<BuildingData[]>([]);
  const [isFetchingBuildings, setIsFetchingBuildings] = useState(true);

   const [allShopItems, setAllShopItems] = useState<ShopItemData[]>([]);
  const [isFetchingShopItems, setIsFetchingShopItems] = useState(true);


  // --- Real-time listener for Current User Data ---
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      setIsFetchingUserData(true);
      const userDocRef = doc(db, "users", user.uid);
       unsubscribe = onSnapshot(userDocRef, (docSnap) => {
         if (docSnap.exists()) {
            setCurrentUserData(docSnap.data() as UserData);
         } else {
            console.warn("No user document found in Firestore for UID:", user.uid);
            setCurrentUserData(null);
            // This might indicate an issue; the user is authenticated but no profile document exists.
            // You might want to prompt them to create a profile or log them out.
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


   // --- Real-time listener for All Buildings (to show owned property details) ---
   useEffect(() => {
        setIsFetchingBuildings(true);
        const unsubscribe = onSnapshot(collection(db, "buildings"), (snapshot: QuerySnapshot<DocumentData>) => {
            const buildingsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as BuildingData
            }));
            setAllBuildings(buildingsList);
            setIsFetchingBuildings(false);
        }, (error) => {
            console.error("Error fetching real-time buildings updates:", error);
             toast({
                title: "Error",
                description: "Failed to get real-time buildings data.",
                variant: "destructive",
              });
            setIsFetchingBuildings(false);
        });

        return () => unsubscribe();
    }, []); // Fetch once on mount


     // --- Real-time listener for All Shop Items (to show owned item details) ---
    useEffect(() => {
         setIsFetchingShopItems(true);
         const unsubscribe = onSnapshot(collection(db, "shopItems"), (snapshot: QuerySnapshot<DocumentData>) => {
             const itemsList = snapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data() as ShopItemData
             }));
             setAllShopItems(itemsList);
             setIsFetchingShopItems(false);
         }, (error) => {
             console.error("Error fetching real-time shop items updates:", error);
              toast({
                 title: "Error",
                 description: "Failed to get real-time shop items data.",
                 variant: "destructive",
               });
             setIsFetchingShopItems(false);
         });

         return () => unsubscribe();
     }, []); // Fetch once on mount


   // Redirect if no user is logged in (handled by useAuth hook)
    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate("/auth"); // Redirect to auth page if not authenticated and not loading
        }
    }, [user, isAuthLoading, navigate]);


   // Handle Logout
   const handleLogout = async () => {
      try {
         await signOut(auth);
         // Firebase Auth listener in useAuth will handle state change and navigation
         toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
         });
      } catch (error: any) {
         console.error("Firebase Logout error:", error);
         toast({
            title: "Logout failed",
            description: error.message || "Could not log out. Please try again.",
            variant: "destructive",
         });
      }
   };

   // Helper to get achievement details by ID
   const getAchievementDetails = (id: string) => {
       return allAchievements.find(ach => ach.id === id);
   };

    // Helper to get building details by ID
    const getBuildingDetails = (id: string) => {
        return allBuildings.find(b => b.id === id);
    };

     // Helper to get shop item details by ID
    const getShopItemDetails = (id: string) => {
        return allShopItems.find(item => item.id === id);
    };


  // Show loading state while checking auth or fetching any data
  if (isAuthLoading || isFetchingUserData || isFetchingAchievements || isFetchingBuildings || isFetchingShopItems) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Profile...
      </div>
    );
  }

   // If user is not logged in (and loading is complete), the effect above will redirect, so we return null here.
   if (!user) {
       return null;
   }

    // Calculate progress to next level (Example: 100 XP per level)
    const currentXP = currentUserData?.xp ?? 0;
    const currentLevel = Math.floor(currentXP / 100) + 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const xpEarnedInLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progressToNextLevel = (xpEarnedInLevel / xpNeededForNextLevel) * 100;


  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100"> {/* Set height to screen height */}
      {/* Profile Header */}
        <div className="bg-white p-4 shadow-sm flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Profile</h2>
             <div className="flex items-center space-x-4">
                 {/* Link to Notifications (assuming you have one) */}
                <Link to="/notifications" className="text-gray-600 hover:text-gray-800">
                     {/* Assuming lucide-bell is available */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </Link>
                 {/* Link to Settings (assuming you have one) */}
                <Link to="/settings" className="text-gray-600 hover:text-gray-800">
                     {/* Assuming lucide-settings is available */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2.5 2.5 0 0 0-.42 4.97A9.38 9.38 0 0 0 5 13a8.89 8.89 0 0 0 1.56 5.55s.09.52-.83 1.45A4.9 4.9 0 0 1 5 22v0"/><path d="M17.98 18.4c.85.05 1.71-.01 2.5-.12a9.38 9.38 0 0 0 2-5 8.89 8.89 0 0 0-1.56-5.55s-.09-.52.83-1.45A4.9 4.9 0 0 1 19 2v0"/><path d="M12 19.v-7"/><path d="M12 6V3"/></svg>
                </Link>
                {/* Logout Button */}
                <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isProcessingAction}>
                     {/* Assuming lucide-log-out is available */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </Button>
             </div>
        </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">

          {/* User Info */}
          <motion.div
             className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
          >
             {/* User Avatar/Initial */}
            <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-3">
              {/* Display user's first initial or avatar */}
               {user?.photoURL ? (
                   <img src={user.photoURL} alt="User Avatar" className="w-20 h-20 rounded-full object-cover"/>
               ) : (
                   <span className="text-primary text-2xl font-bold">{currentUserData?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
               )}
            </div>
            <h3 className="text-xl font-bold mb-1 text-gray-800">{currentUserData?.username || user?.email || 'User'}</h3>
             {/* Display joined date - requires adding joinedDate to user doc */}
            <p className="text-gray-600 mb-4">Joined {currentUserData?.createdAt ? new Date(currentUserData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>

             {/* Key Stats */}
            <div className="flex justify-center space-x-6"> {/* Increased space-x */}
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{currentLevel}</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{currentUserData?.xp ?? 0}</div> {/* Used green-600 */}
                <div className="text-xs text-gray-600">Total XP</div> {/* Updated label */}
              </div>
               <div className="text-center">
                <div className="text-lg font-bold text-amber-600">{currentUserData?.coins ?? 0}</div> {/* Used amber-600 */}
                <div className="text-xs text-gray-600">Coins</div>
              </div>
               <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{currentUserData?.streak ?? 0}</div> {/* Added Streak, used blue-600 */}
                <div className="text-xs text-gray-600">Streak</div>
              </div>
            </div>

             {/* Level Progress Bar */}
            <div className="mt-6"> {/* Increased mt */}
              <div className="flex justify-between text-xs mb-1 text-gray-600">
                <span>Level {currentLevel}</span>
                <span>Level {currentLevel + 1}</span>
              </div>
              <Progress value={progressToNextLevel} className="w-full h-2" />
              <div className="text-xs text-right mt-1 text-gray-600">
                {xpNeededForNextLevel - xpEarnedInLevel} XP to next level ({xpEarnedInLevel}/{xpNeededForNextLevel})
              </div>
            </div>
          </motion.div>


          {/* Owned Properties */}
          <motion.div
             className="bg-white rounded-xl shadow-sm p-6 mb-6"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
          >
              <h3 className="font-bold mb-4 text-gray-800">Owned Properties</h3>
               {(currentUserData?.ownedProperties && Object.keys(currentUserData.ownedProperties).length > 0) ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Responsive grid */}
                       {Object.keys(currentUserData.ownedProperties).map(propertyId => {
                           const propertyDetails = getBuildingDetails(propertyId);
                           if (!propertyDetails) return null; // Don't render if details not found
                           const purchaseDetails = currentUserData.ownedProperties[propertyId];

                           return (
                               <div key={propertyId} className="border rounded-lg p-4 flex items-center space-x-3 bg-gray-50"> {/* Added bg-gray-50 */}
                                   {/* Property Icon */}
                                   <div className={`w-10 h-10 rounded-full bg-${propertyDetails.color || 'blue'}-500 flex items-center justify-center text-white`}>
                                        {/* Assuming lucide-home or other icons */}
                                        <Home size={20}/> {/* Placeholder icon */}
                                   </div>
                                    {/* Property Info */}
                                   <div className="flex-1">
                                       <h4 className="font-medium text-gray-800">{propertyDetails.name}</h4>
                                        <p className="text-xs text-gray-600">
                                            Purchased: {purchaseDetails.purchaseTimestamp ? new Date(purchaseDetails.purchaseTimestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </p>
                                         {/* Display current value or rent info if available */}
                                         {propertyDetails.currentValue !== undefined && (
                                              <p className="text-xs text-gray-600">
                                                  Value: {propertyDetails.currentValue} coins
                                              </p>
                                         )}
                                         {propertyDetails.rent !== undefined && (
                                              <p className="text-xs text-gray-600">
                                                  Rent: {propertyDetails.rent} coins
                                              </p>
                                         )}
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               ) : (
                   <div className="text-center py-4 text-gray-500">
                       <Home size={32} className="mx-auto mb-3"/>
                       <p>You don't own any properties yet.</p>
                   </div>
               )}
          </motion.div>


           {/* Owned Shop Items */}
          <motion.div
             className="bg-white rounded-xl shadow-sm p-6 mb-6"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
          >
              <h3 className="font-bold mb-4 text-gray-800">Owned Items</h3>
               {(currentUserData?.ownedItems && currentUserData.ownedItems.length > 0) ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Responsive grid */}
                       {currentUserData.ownedItems.map(itemId => {
                           const itemDetails = getShopItemDetails(itemId);
                            if (!itemDetails) return null; // Don't render if details not found

                           return (
                               <div key={itemId} className="border rounded-lg p-3 text-center bg-gray-50"> {/* Added bg-gray-50 */}
                                   {/* Item Icon */}
                                    <div className={`w-12 h-12 rounded-full bg-${itemDetails.color || 'gray'}-500 mx-auto flex items-center justify-center text-white mb-2`}>
                                         {/* Placeholder for icon - replace with actual icon rendering */}
                                        <Award size={24}/> {/* Placeholder icon */}
                                    </div>
                                   <h4 className="font-medium text-sm text-gray-800">{itemDetails.name}</h4>
                                    {/* Optional: Display item type or description */}
                                    {/* <p className="text-xs text-gray-600">{itemDetails.type}</p> */}
                               </div>
                           );
                       })}
                   </div>
               ) : (
                   <div className="text-center py-4 text-gray-500">
                       <Award size={32} className="mx-auto mb-3"/>
                       <p>You don't own any shop items yet.</p>
                   </div>
               )}
          </motion.div>


          {/* Unlocked Achievements */}
          <motion.div
             className="bg-white rounded-xl shadow-sm p-6 mb-6"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-bold mb-4 text-gray-800">Unlocked Achievements</h3>

            {(currentUserData?.achievements && currentUserData.achievements.length > 0) ? (
              <div className="space-y-4">
                {currentUserData.achievements.map((achievementId) => {
                    const achievementDetails = getAchievementDetails(achievementId);
                    if (!achievementDetails) return null; // Don't render if details not found

                    return (
                      <div key={achievementId} className="flex items-center border rounded-lg p-3 bg-gray-50"> {/* Added border and bg-gray-50 */}
                        <div className={`w-10 h-10 rounded-full ${achievementDetails.iconBg || 'bg-secondary/20'} flex items-center justify-center mr-3`}>
                           {/* Assuming lucide icons or similar */}
                            <Trophy size={20} className={achievementDetails.iconColor || 'text-secondary'}/> {/* Placeholder icon */}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{achievementDetails.name}</h4>
                          <p className="text-xs text-gray-600">{achievementDetails.description}</p> {/* Display description */}
                        </div>
                        {achievementDetails.reward !== undefined && (
                            <div className="flex items-center text-amber-600 text-sm font-semibold"> {/* Used amber-600, font-semibold */}
                                {/* Assuming lucide-circle-dollar-sign */}
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-dollar-sign mr-1"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4h-6"/><path d="M12 17.5v-.5"/><path d="M12 6v.5"/></svg>
                              <span>+{achievementDetails.reward}</span>
                            </div>
                        )}
                      </div>
                    );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Trophy size={32} className="mx-auto mb-3"/>
                <p>No achievements unlocked yet. Complete lessons to earn some!</p>
              </div>
            )}
          </motion.div>


           {/* Learning Stats Summary (Optional - can link to a dedicated page) */}
            {/* <motion.div
               className="bg-white rounded-xl shadow-sm p-6"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.4 }}
            >
               <h3 className="font-bold mb-4 text-gray-800">Learning Summary</h3>

                 {(currentUserData?.completedLessons && currentUserData.completedLessons.length > 0) ? (
                     <div className="space-y-4">
                           // You would need to fetch all lessons to display progress by topic
                          // For simplicity, you could show total completed lessons vs total lessons
                         <div className="flex items-center space-x-3 border rounded-lg p-3 bg-gray-50">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                   <BookOpen size={20}/>
                              </div>
                               <div>
                                   <h4 className="font-medium text-gray-800">Lessons Completed</h4>
                                   // Requires fetching total number of lessons
                                  <p className="text-sm text-gray-600">{currentUserData.completedLessons.length} / Total Lessons (Approx)</p>
                               </div>
                         </div>
                          // Link to a dedicated lessons list page if you have one
                           <div className="text-right">
                               <Link to="/lessons" className="text-primary text-sm hover:underline">See All Lessons</Link>
                           </div>
                     </div>
                 ) : (
                      <div className="text-center py-4 text-gray-500">
                         <BookOpen size={32} className="mx-auto mb-3"/>
                         <p>No lessons completed yet. Start learning!</p>
                     </div>
                 )}

            </motion.div> */}


        </div>
      </ScrollArea>

      <BottomNav active="profile" />
      </div> {/* Closing div for h-screen flex container */}
    </>
  );
}
