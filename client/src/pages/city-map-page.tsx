// client/src/pages/city-map-page.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Settings, Shop, Trophy, Home, DollarSign, Tag, Gift } from "lucide-react"; // Added Gift icon
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottom-nav";
import UserHeader from "@/components/user-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast"; // Import useToast


// Import Firestore
import { getFirestore, collection, getDocs, DocumentData, doc, getDoc, updateDoc, arrayRemove, runTransaction, Timestamp, onSnapshot, QuerySnapshot } from "firebase/firestore"; // Added arrayRemove and onSnapshot
import { app } from "../firebaseConfig";

// Get Firestore instance
const db = getFirestore(app);

// Define a type for building data fetched from Firestore
interface BuildingData {
  id: string; // Firestore document ID
  name: string;
  description: string;
  type: string; // 'lesson', 'shop', 'property', 'event', 'bank', etc.
  position: { x: number; y: number }; // Assuming position is stored as a map
  color?: string;
  icon?: string;
  width?: string;
  height?: string;
  shopItemId?: number | string;
  dailyReward?: number; // Potential daily reward for some buildings (e.g., bank or owned properties)
  cost?: number; // Cost to buy (for properties) or interact (for events/bank)
  rent?: number; // Rent earned (for properties)
  upkeep?: number; // Upkeep cost (for properties)
  appreciationRate?: number; // Rate of value increase (for properties)
  depreciationRate?: number; // Rate of value decrease (for properties)
  currentValue?: number; // Dynamic current value (for properties)
  ownerId?: string | null; // ID of the user who owns the property (null if not owned)
  // Add other fields from your buildings collection as needed
}

// Define a type for user data fetched from Firestore
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
  achievements: string[];
  completedLessons: string[];
  ownedItems: string[];
  createdAt: any;
  lastDailyRewardCollection?: Timestamp; // Added field to track last reward collection time
}


export default function CityMapPage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and auth loading state
  const { toast } = useToast(); // Get toast function

  const [buildings, setBuildings] = useState<BuildingData[]>([] as BuildingData[]);
  const [isFetchingBuildings, setIsFetchingBuildings] = useState(true); // Keep loading state for initial fetch
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(true); // Keep loading state for initial fetch
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showDailyRewardButton, setShowDailyRewardButton] = useState(false); // State to show daily reward button


  // --- Real-time listener for Buildings ---
  useEffect(() => {
    setIsFetchingBuildings(true); // Set loading true initially
    const unsubscribe = onSnapshot(collection(db, "buildings"), (snapshot: QuerySnapshot<DocumentData>) => {
      const buildingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as BuildingData
      }));
      setBuildings(buildingsList);
      setIsFetchingBuildings(false); // Set loading false after data is received
    }, (error) => {
      console.error("Error fetching real-time buildings updates:", error);
       toast({
          title: "Error",
          description: "Failed to get real-time building updates.",
          variant: "destructive",
        });
      setIsFetchingBuildings(false); // Set loading false on error
    });

    // Unsubscribe from listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this sets up the listener once on mount


  // --- Real-time listener for Current User Data and Daily Reward Check ---
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      setIsFetchingUserData(true); // Set loading true initially
      const userDocRef = doc(db, "users", user.uid);
       unsubscribe = onSnapshot(userDocRef, (docSnap) => {
         if (docSnap.exists()) {
            const userData = docSnap.data() as UserData;
            setCurrentUserData(userData);

             // --- Daily Reward Check ---
             const lastCollectionTimestamp = userData.lastDailyRewardCollection;
             const now = Timestamp.now();
             const twentyFourHoursInMillis = 24 * 60 * 60 * 1000; // Corrected variable name


             // Check if last collection was more than 24 hours ago
             if (!lastCollectionTimestamp || (now.toMillis() - lastCollectionTimestamp.toMillis()) >= twentyFourHoursInMillis) {
                 // Check if the user owns any properties with a daily reward
                 const ownedPropertyIds = Object.keys(userData.ownedProperties || {});
                 const propertiesWithDailyReward = buildings.filter(b => ownedPropertyIds.includes(b.id) && (b.dailyReward ?? 0) > 0);

                 if (propertiesWithDailyReward.length > 0) {
                     setShowDailyRewardButton(true); // Show the daily reward button
                 } else {
                     setShowDailyRewardButton(false);
                 }

             } else {
                 setShowDailyRewardButton(false); // Hide if not enough time has passed
             }
             // --- End Daily Reward Check ---


         } else {
            console.warn("No user document found in Firestore for UID:", user.uid);
            setCurrentUserData(null);
            setShowDailyRewardButton(false); // Hide button if no user data
            // Optionally, log out the user or redirect if their document is missing unexpectedly
         }
         setIsFetchingUserData(false); // Set loading false after data is received
       }, (error) => {
          console.error("Error fetching real-time user data updates:", error);
           toast({
            title: "Error",
            description: "Failed to get real-time user data updates.",
            variant: "destructive",
          });
         setIsFetchingUserData(false); // Set loading false on error
         setShowDailyRewardButton(false); // Hide button on error
       });
    } else {
       setCurrentUserData(null); // Clear user data if no user is logged in
       setIsFetchingUserData(false); // Not loading user data if no user
       setShowDailyRewardButton(false); // Hide button if no user
    }

    // Unsubscribe from listener when the user changes or component unmounts
    return () => {
       if (unsubscribe) {
          unsubscribe();
       }
    };
  }, [user, buildings]); // Rerun when the Firebase auth user object changes or buildings data changes (needed for reward check)


  const handleBuildingClick = (building: BuildingData) => {
    setSelectedBuilding(building);
    console.log("Building clicked:", building);
  };

  // Function to handle navigating to a lesson
  const handleGoToLesson = async (lessonId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to the lesson page
    navigate(`/lesson/${lessonId}`);
    // Lesson completion and reward logic will be on the lesson page
    // or handled by a Cloud Function
  };

  // Function to handle buying a property using a Firestore Transaction
  const handleBuyProperty = async (property: BuildingData) => {
      if (!user || !currentUserData) {
          toast({
              title: "Error",
              description: "User not authenticated or user data not loaded.",
              variant: "destructive",
          });
          return;
      }

      if (!property.cost || property.cost <= 0) {
           toast({
               title: "Error",
               description: "This property cannot be purchased.",
               variant: "destructive",
           });
           return;
      }

      if (currentUserData.coins < property.cost) {
          toast({
              title: "Not enough coins",
              description: `You need ${property.cost - currentUserData.coins} more coins to buy this property.`,
              variant: "destructive",
          });
          return;
      }

      if (property.ownerId) {
          toast({
              title: "Property Owned",
              description: "This property is already owned by another player.",
              variant: "default",
          });
          return;
      }

      setIsProcessingAction(true); // Disable buttons

      const userDocRef = doc(db, "users", user.uid);
      const propertyDocRef = doc(db, "buildings", property.id); // Reference to the property document

      try {
          await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userDocRef);
              const propertyDoc = await transaction.get(propertyDocRef);

              if (!userDoc.exists()) {
                  throw new Error("User document does not exist!");
              }
              if (!propertyDoc.exists()) {
                   throw new Error("Property document does not exist!");
              }

              const currentCoins = userDoc.data().coins;
              const ownedProperties = userDoc.data().ownedProperties || {};
              const currentOwnerId = propertyDoc.data().ownerId;
              const propertyCost = propertyDoc.data().cost; // Get cost from property doc in transaction

              // Re-check conditions within the transaction
              if (currentCoins < propertyCost) {
                  throw new Error("Not enough coins for purchase.");
              }
              if (currentOwnerId) {
                  throw new Error("Property already owned.");
              }

              // Deduct coins from user
              const newCoins = currentCoins - propertyCost;

              // Add property to user's owned properties
              const newOwnedProperties = {
                  ...ownedProperties,
                  [property.id]: {
                      purchasePrice: propertyCost,
                      purchaseTimestamp: Timestamp.now(),
                      // Add other relevant details like upgrades, etc.
                  }
              };

              transaction.update(userDocRef, {
                  coins: newCoins,
                  ownedProperties: newOwnedProperties,
              });

              // Update property document to set owner
              transaction.update(propertyDocRef, {
                  ownerId: user.uid,
                  // Optionally update currentValue if you want it to reflect purchase price initially
                  currentValue: propertyCost,
              });
          });

          // If the transaction is successful
          toast({
              title: "Purchase successful",
              description: `You are now the owner of ${property.name}!`,
              variant: "default",
          });

          // Real-time listeners will update the state

           setSelectedBuilding(null); // Close the modal


      } catch (error: any) {
          console.error("Firestore Transaction failed:", error);
           let errorMessage = "Purchase failed. Please try again.";
           if (error.message === "Not enough coins for purchase.") {
               errorMessage = "Not enough coins for purchase.";
           } else if (error.message === "Property already owned.") {
                errorMessage = "This property is already owned.";
           } else if (error.message === "User document does not exist!") {
               errorMessage = "Your user data is missing. Please try logging in again.";
           } else if (error.message === "Property document does not exist!") {
                errorMessage = "This property no longer exists.";
           }
           else {
              errorMessage = error.message; // Fallback to error message
           }

          toast({
              title: "Purchase failed",
              description: errorMessage,
              variant: "destructive",
          });
      } finally {
          setIsProcessingAction(false); // Re-enable buttons
      }
  };


    // Function to handle selling a property using a Firestore Transaction
    const handleSellProperty = async (property: BuildingData) => {
        if (!user || !currentUserData) {
             toast({
                 title: "Error",
                 description: "User not authenticated or user data not loaded.",
                 variant: "destructive",
             });
             return;
         }

        if (property.ownerId !== user.uid) {
            toast({
                title: "Not Your Property",
                description: "You do not own this property.",
                variant: "destructive",
            });
            return;
        }

         // Determine sale price (Example: Sell for 80% of purchase price)
         // Using purchase price for simplicity here. Adjust logic as needed.
         const purchaseDetails = currentUserData.ownedProperties?.[property.id];
         if (!purchaseDetails) {
              toast({
                  title: "Error",
                  description: "Could not find purchase details for this property.",
                  variant: "destructive",
              });
              return;
         }

         const salePrice = Math.floor(purchaseDetails.purchasePrice * 0.8); // Example: Sell for 80% of purchase price


        setIsProcessingAction(true); // Disable buttons

        const userDocRef = doc(db, "users", user.uid);
        const propertyDocRef = doc(db, "buildings", property.id); // Reference to the property document


        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                const propertyDoc = await transaction.get(propertyDocRef);

                if (!userDoc.exists()) {
                    throw new Error("User document does not exist!");
                }
                 if (!propertyDoc.exists()) {
                     throw new Error("Property document does not exist!");
                 }

                const currentCoins = userDoc.data().coins;
                const ownedProperties = userDoc.data().ownedProperties || {};
                const currentOwnerId = propertyDoc.data().ownerId;

                 // Re-check ownership within the transaction
                 if (currentOwnerId !== user.uid) {
                     throw new Error("You do not own this property.");
                 }

                 // Add coins from sale
                const newCoins = currentCoins + salePrice;

                // Remove property from user's owned properties
                const newOwnedProperties = { ...ownedProperties };
                delete newOwnedProperties[property.id]; // Remove the property by ID


                transaction.update(userDocRef, {
                    coins: newCoins,
                    ownedProperties: newOwnedProperties,
                });

                // Update property document to set owner to null
                transaction.update(propertyDocRef, {
                    ownerId: null,
                     // Optionally reset currentValue or other fields
                     // currentValue: property.cost, // Reset to original cost or leave as is
                });
            });

             // If the transaction is successful
             toast({
                 title: "Property Sold!",
                 description: `You sold ${property.name} for ${salePrice} coins.`,
                 variant: "default",
             });

             // Real-time listeners will update the state

            setSelectedBuilding(null); // Close the modal


        } catch (error: any) {
            console.error("Firestore Transaction failed during sell:", error);
            let errorMessage = "Failed to sell property. Please try again.";
             if (error.message === "You do not own this property.") {
                 errorMessage = "You do not own this property.";
             } else if (error.message === "User document does not exist!") {
                 errorMessage = "Your user data is missing. Please try logging in again.";
             } else if (error.message === "Property document does not exist!") {
                 errorMessage = "This property no longer exists.";
             }
            else {
               errorMessage = error.message; // Fallback to error message
            }

             toast({
                 title: "Sale Failed",
                 description: errorMessage,
                 variant: "destructive",
             });
        } finally {
            setIsProcessingAction(false); // Re-enable actions
        }
    };

    // Function to collect daily rewards from owned properties
    const collectDailyRewards = async () => {
        if (!user || !currentUserData) {
             toast({
                 title: "Error",
                 description: "User not authenticated or user data not loaded.",
                 variant: "destructive",
             });
             return;
         }

         setIsProcessingAction(true); // Disable actions

         const userDocRef = doc(db, "users", user.uid);

         try {
             await runTransaction(db, async (transaction) => {
                 const userDoc = await transaction.get(userDocRef);

                 if (!userDoc.exists()) {
                     throw new Error("User document does not exist!");
                 }

                 const userDataInTransaction = userDoc.data() as UserData;
                 const lastCollectionTimestamp = userDataInTransaction.lastDailyRewardCollection;
                 const now = Timestamp.now();
                 const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;


                 // Re-check within the transaction if rewards are collectable
                if (lastCollectionTimestamp && (now.toMillis() - lastCollectionTimestamp.toMillis()) < twentyFourHoursInMillis) {
                    console.warn("Daily rewards already collected within the last 24 hours.");
                     toast({
                         title: "Already Collected",
                         description: "Daily rewards can only be collected once every 24 hours.",
                         variant: "default", // Or a different variant
                     });
                    return; // Abort transaction without error
                }


                 const ownedPropertyIds = Object.keys(userDataInTransaction.ownedProperties || {});
                 const ownedPropertiesWithRewards = buildings.filter(b => ownedPropertyIds.includes(b.id) && (b.dailyReward ?? 0) > 0);

                 if (ownedPropertiesWithRewards.length === 0) {
                     console.warn("No owned properties with daily rewards.");
                      toast({
                         title: "No Rewards Available",
                         description: "You don't own any properties that provide daily rewards.",
                         variant: "default",
                      });
                     return; // Abort transaction without error
                 }


                 // Calculate total daily reward
                 const totalDailyReward = ownedPropertiesWithRewards.reduce((sum, prop) => sum + (prop.dailyReward ?? 0), 0);

                 if (totalDailyReward <= 0) {
                      console.warn("Calculated daily reward is zero or negative.");
                       toast({
                         title: "No Rewards Available",
                         description: "No daily rewards to collect at this time.",
                         variant: "default",
                      });
                     return; // Abort transaction without error
                 }


                 // Add reward coins to user
                 const newCoins = userDataInTransaction.coins + totalDailyReward;

                 // Update user document with new coins and last collection timestamp
                 transaction.update(userDocRef, {
                     coins: newCoins,
                     lastDailyRewardCollection: now, // Update with current timestamp
                 });
             });

             // If the transaction is successful
              toast({
                  title: "Daily Reward Collected!",
                  description: `You collected ${totalDailyReward} coins from your properties.`,
                  variant: "default",
              });

              // Real-time listeners will update the state
              setShowDailyRewardButton(false); // Hide the button after successful collection


         } catch (error: any) {
             console.error("Firestore Transaction failed during reward collection:", error);
             let errorMessage = "Failed to collect daily rewards. Please try again.";
              if (error.message === "User document does not exist!") {
                 errorMessage = "Your user data is missing. Please try logging in again.";
              } else if (error.message === "Daily rewards already collected within the last 24 hours.") {
                 errorMessage = "Daily rewards can only be collected once every 24 hours.";
              } else if (error.message === "No owned properties with daily rewards.") {
                 errorMessage = "You don't own any properties that provide daily rewards.";
              } else if (error.message === "Calculated daily reward is zero or negative.") {
                  errorMessage = "No daily rewards to collect at this time.";
              }
             else {
                errorMessage = error.message; // Fallback to error message
             }

              toast({
                  title: "Collection Failed",
                  description: errorMessage,
                  variant: "destructive",
              });
         } finally {
             setIsProcessingAction(false); // Re-enable actions
         }
    };


  // Show loading state
  if (isAuthLoading || isFetchingBuildings || isFetchingUserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading City Map...
      </div>
    );
  }

  // Redirect if no user is logged in
  if (!user) {
     return null; // useAuth hook handles redirect
  }


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <UserHeader
       username={currentUserData?.username || user.displayName || "FinCity Player"}
       coins={currentUserData?.coins ?? 0}
       xp={currentUserData?.xp ?? 0}
       avatarUrl={user.photoURL || undefined}
      />

      {/* City Map Area */}
      <div className="flex-1 relative p-4 overflow-auto" style={{ backgroundImage: 'url(/path/to/your/map-background.png)', backgroundSize: 'cover' }}>

        {/* Daily Reward Button */}
        {showDailyRewardButton && (
            <motion.div
                className="absolute top-4 right-4 z-10" // Position the button
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
            >
                <Button
                     onClick={collectDailyRewards}
                     disabled={isProcessingAction}
                     className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                >
                    <Gift size={20} className="mr-2"/>
                    {isProcessingAction ? 'Collecting...' : 'Collect Daily Reward'}
                </Button>
            </motion.div>
        )}


        {/* Render buildings from Firestore data */}
        {buildings.map(building => (
          <motion.div
            key={building.id}
            className={`absolute cursor-pointer p-2 rounded-lg shadow-md ${building.ownerId === user.uid ? 'border-2 border-primary' : building.ownerId ? 'border-2 border-yellow-400' : ''}`} // Indicate ownership
            style={{
              top: `${building.position.y}px`,
              left: `${building.position.x}px`,
              backgroundColor: building.color || '#3498db',
              width: building.width || '50px',
              height: building.height || '50px',
            }}
            onClick={() => handleBuildingClick(building)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
             <div className="text-center text-white text-xs font-bold">
               {/* Display icon or abbreviated name, maybe ownership status */}
               {building.ownerId === user.uid ? 'Owned' : building.name}
            </div>
          </motion.div>
        ))}

      </div>

      {/* Overlay or Modal for selected building details */}
      {selectedBuilding && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedBuilding(null)}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-2">{selectedBuilding.name}</h3>
            <p className="text-gray-700 mb-4">{selectedBuilding.description}</p>

             {/* Display property-specific details if applicable */}
             {selectedBuilding.type === 'property' && (
                 <div className="mb-4 text-gray-700">
                     <div className="flex items-center mb-1">
                         <DollarSign size={16} className="mr-2 text-green-600"/> Cost: {selectedBuilding.cost ?? 'N/A'} coins
                     </div>
                      <div className="flex items-center mb-1">
                         <Home size={16} className="mr-2 text-blue-600"/> Rent: {selectedBuilding.rent ?? 'N/A'} coins
                     </div>
                       {/* Display current value if available */}
                      {selectedBuilding.currentValue !== undefined && (
                           <div className="flex items-center mb-1">
                              <Tag size={16} className="mr-2 text-purple-600"/> Value: {selectedBuilding.currentValue} coins
                           </div>
                      )}
                        {/* Display daily reward if available */}
                       {selectedBuilding.dailyReward !== undefined && selectedBuilding.dailyReward > 0 && (
                            <div className="flex items-center mb-1">
                                <Gift size={16} className="mr-2 text-green-600"/> Daily Reward: {selectedBuilding.dailyReward} coins
                            </div>
                       )}
                       {/* Display owner status */}
                      {selectedBuilding.ownerId ? (
                           <p className="text-yellow-700 font-semibold mt-2">Owned by {selectedBuilding.ownerId === user.uid ? 'You' : 'Another Player'}</p>
                      ) : (
                           <p className="text-green-700 font-semibold mt-2">Available for purchase</p>
                      )}
                 </div>
             )}


             {/* Actions based on building type */}
             {selectedBuilding.type === 'lesson' && (
                <Button className="w-full" onClick={() => handleGoToLesson(selectedBuilding.id)} disabled={isProcessingAction}>Go to Lesson</Button>
             )}
              {selectedBuilding.type === 'shop' && (
                <Button className="w-full" onClick={() => navigate('/shop')} disabled={isProcessingAction}>Go to Shop</Button>
             )}
              {/* Buy Property Button */}
             {selectedBuilding.type === 'property' && !selectedBuilding.ownerId && selectedBuilding.cost !== undefined && (
                <Button
                     className="w-full"
                     onClick={() => handleBuyProperty(selectedBuilding)}
                     disabled={isProcessingAction || (currentUserData?.coins ?? 0) < selectedBuilding.cost!} // Use non-null assertion as we checked above
                 >
                     {isProcessingAction ? 'Buying...' : `Buy Property (${selectedBuilding.cost} coins)`}
                 </Button>
             )}
              {/* Sell Property Button */}
              {selectedBuilding.type === 'property' && selectedBuilding.ownerId === user.uid && (
                 <Button
                      variant="outline"
                      className="w-full mt-2 border-red-500 text-red-500 hover:bg-red-50" // Styled for selling
                      onClick={() => handleSellProperty(selectedBuilding)}
                      disabled={isProcessingAction}
                   >
                    {isProcessingAction ? 'Selling...' : 'Sell Property'}
                 </Button>
              )}


             {/* Add more actions based on building type (e.g., collect daily reward for owned properties) */}
            {selectedBuilding.type === 'property' && selectedBuilding.ownerId === user.uid && (selectedBuilding.dailyReward ?? 0) > 0 && currentUserData?.lastDailyRewardCollection && (Timestamp.now().toMillis() - currentUserData.lastDailyRewardCollection.toMillis()) >= (24 * 60 * 60 * 1000) && ( // Show collect button if owned, has reward, and 24 hours passed
                 <Button
                      className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white" // Styled for collection
                      onClick={() => collectDailyRewards()} // Call the collect function
                      disabled={isProcessingAction}
                   >
                    {isProcessingAction ? 'Collecting...' : `Collect Daily Reward (${selectedBuilding.dailyReward} coins)`}
                 </Button>
              )}


            <Button variant="outline" className="w-full mt-2" onClick={() => setSelectedBuilding(null)} disabled={isProcessingAction}>Close</Button>
          </motion.div>
        </motion.div>
      )}

      <BottomNav active="map" />
    </div>
  );
}
