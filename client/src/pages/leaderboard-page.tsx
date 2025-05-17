// client/src/pages/leaderboard-page.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy, Star, CircleDollarSign } from "lucide-react"; // Added Star and CircleDollarSign icons
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available
import { useAuth } from "@/hooks/use-auth"; // To check authentication status
import { useToast } from "@/hooks/use-toast"; // To display toasts

// Import Firestore
import { getFirestore, collection, query, orderBy, limit, getDocs, DocumentData, onSnapshot, QuerySnapshot } from "firebase/firestore"; // Added onSnapshot
import { app } from "../firebaseConfig"; // Import the initialized Firebase app

// Get Firestore instance
const db = getFirestore(app);

// Define type for user data fetched for the leaderboard
interface LeaderboardUserData {
  uid: string;
  username: string;
  xp: number;
  coins: number;
  // Include other fields you might want to display on the leaderboard, e.g., avatarUrl
  // avatarUrl?: string;
}


export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get authenticated Firebase user and loading state
  const { toast } = useToast(); // Get toast function

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUserData[]>([] as LeaderboardUserData[]);
  const [isFetchingLeaderboard, setIsFetchingLeaderboard] = useState(true); // Keep loading state for initial fetch
  const [sortBy, setSortBy] = useState<"xp" | "coins">("xp"); // State to manage sorting criteria


  // --- Real-time listener for Leaderboard Data ---
  useEffect(() => {
    setIsFetchingLeaderboard(true); // Set loading true initially

    // Create a real-time query to fetch users, ordered by XP (or coins) and limited
    const leaderboardQuery = query(
      collection(db, "users"),
      orderBy(sortBy, "desc"), // Order by sortBy criteria in descending order
      limit(50) // Limit to top 50 users (adjust as needed)
    );

    const unsubscribe = onSnapshot(leaderboardQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const usersList = snapshot.docs.map(doc => {
        const data = doc.data() as UserData; // Cast to UserData interface (defined in other files like lesson-page.tsx)
        return {
           uid: doc.id,
           username: data.username,
           xp: data.xp ?? 0, // Use 0 as default if xp is missing
           coins: data.coins ?? 0, // Use 0 as default if coins are missing
           // Include other fields here if needed, e.g., avatarUrl: data.avatarUrl
        } as LeaderboardUserData; // Cast to LeaderboardUserData
      });

      setLeaderboardData(usersList);
      setIsFetchingLeaderboard(false); // Set loading false after initial data is received
    }, (error) => {
      console.error("Error fetching real-time leaderboard updates:", error);
       toast({
          title: "Error",
          description: "Failed to get real-time leaderboard updates.",
          variant: "destructive",
        });
      setIsFetchingLeaderboard(false); // Set loading false on error
    });

    // Unsubscribe from listener when the component unmounts or sortBy changes
    return () => unsubscribe();
  }, [sortBy]); // Rerun the effect when the sorting criteria changes


   // Redirect if no user is logged in (this is handled by useAuth hook)
   useEffect(() => {
       if (!isAuthLoading && !user) {
           navigate("/auth"); // Redirect to auth page if not authenticated and not loading
       }
   }, [user, isAuthLoading, navigate]);


  // Show loading state while checking authentication or fetching data
  if (isAuthLoading || isFetchingLeaderboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Leaderboard...
      </div>
    );
  }

   // If user is not logged in (and loading is complete), the effect above will redirect, so we return null here.
   if (!user) {
       return null;
   }


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
        <h2 className="text-lg font-bold flex-1">Leaderboard</h2>
         <Trophy size={24} className="text-yellow-500"/> {/* Leaderboard icon */}
      </div>

      {/* Sort By Options */}
       <div className="bg-white px-4 py-2 shadow-sm">
           <div className="flex justify-center space-x-4">
               <Button
                   variant={sortBy === "xp" ? "default" : "outline"}
                   onClick={() => setSortBy("xp")}
                   size="sm"
               >
                   Sort by XP
               </Button>
               <Button
                    variant={sortBy === "coins" ? "default" : "outline"}
                   onClick={() => setSortBy("coins")}
                   size="sm"
               >
                   Sort by Coins
               </Button>
           </div>
       </div>


      {/* Leaderboard List */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {leaderboardData.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {leaderboardData.map((player, index) => (
                <motion.li
                  key={player.uid}
                  className="flex items-center p-4"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.3, delay: index * 0.05 }} // Stagger animation
                >
                  <div className="w-8 text-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                  {/* You might want to display an avatar here */}
                  {/* <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div> */}
                  <div className="flex-1 font-medium text-gray-800">
                     {player.username}
                     {/* Highlight the current user */}
                     {user?.uid === player.uid && (
                         <span className="ml-2 text-primary text-xs">(You)</span>
                     )}
                  </div>
                  <div className="text-right font-semibold text-gray-700 flex items-center justify-end"> {/* Added flex for icon */}
                     {sortBy === "xp" ? (
                        <>
                           {player.xp}
                           <Star size={16} className="ml-1 text-green-500"/>
                        </>
                     ) : (
                         <>
                            {player.coins}
                             <CircleDollarSign size={16} className="ml-1 text-amber-500"/>
                         </>
                     )}
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Trophy size={32} className="mx-auto mb-3"/>
              <p>No players on the leaderboard yet.</p>
            </div>
          )}
             {/* Show loading message only if currently fetching and no data is yet available */}
           {isFetchingLeaderboard && leaderboardData.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                   Loading leaderboard...
                </div>
           )}
        </div>
      </ScrollArea>

      {/* Assuming no bottom nav is needed on the leaderboard page, or add it if desired */}
      {/* <BottomNav /> */}
    </div>
  );
}
