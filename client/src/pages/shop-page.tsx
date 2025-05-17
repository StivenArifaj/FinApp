// client/src/pages/shop-page.tsx

import { useState, useEffect } from "react";
import BottomNav from "@/components/bottom-nav";
// Remove React Query imports related to shop data and mutations
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient"; // apiRequest and queryClient likely not needed here anymore

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
// Remove User schema import if only using Firestore data structure
// import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth"; // To get the authenticated Firebase user

// Import Firestore
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, runTransaction, DocumentData } from "firebase/firestore"; // Added runTransaction
import { app } from "../firebaseConfig"; // Import the initialized Firebase app

// Get Firestore instance
const db = getFirestore(app);

// Define types for data fetched from Firestore
interface ShopItem {
  id: string; // Firestore document ID
  name: string;
  price: number;
  type: string; // e.g., "Buildings", "Avatars", "Decorations", "Boosts"
  icon?: string; // Optional icon name/url
  color?: string; // Optional color for styling
  description?: string; // Optional description
  // Add other fields from your shopItems collection
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
  ownedProperties: { [key: string]: any }; // Define a more specific type if possible
  achievements: string[];
  completedLessons: string[];
  ownedItems: string[]; // Added to track owned shop items (storing item IDs)
  createdAt: any;
}


export default function ShopPage() {
  const { user, isLoading: isAuthLoading } = useAuth(); // Get authenticated Firebase user
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("Buildings");

  const [shopItems, setShopItems] = useState<ShopItem[]>([] as ShopItem[]); // State for shop items
  const [isFetchingShopItems, setIsFetchingShopItems] = useState(true); // Loading state for shop items

  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null); // State for current user's Firestore data
  const [isFetchingUserData, setIsFetchingUserData] = useState(true); // Loading state for user data

  const [isPurchasing, setIsPurchasing] = useState(false); // State to disable buttons during purchase


  // Fetch shop items from Firestore on component mount
  useEffect(() => {
    const fetchShopItems = async () => {
      setIsFetchingShopItems(true);
      try {
        const querySnapshot = await getDocs(collection(db, "shopItems"));
        const itemsList = querySnapshot.docs.map(doc => ({
          id: doc.id, // Use Firestore document ID as item ID
          ...doc.data() as ShopItem
        }));
        setShopItems(itemsList);
      } catch (error) {
        console.error("Error fetching shop items:", error);
         toast({
            title: "Error",
            description: "Failed to fetch shop items.",
            variant: "destructive",
          });
      } finally {
        setIsFetchingShopItems(false);
      }
    };

    fetchShopItems();
  }, []); // Fetch once on mount

   // Fetch current user's data from Firestore when the authenticated user object is available
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
           toast({
            title: "Error",
            description: "Failed to fetch user data.",
            variant: "destructive",
          });
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


  // Handle purchase using Firestore Transaction
  const handlePurchase = async (item: ShopItem) => {
    if (!user || !currentUserData) {
      toast({
        title: "Error",
        description: "User not authenticated or user data not loaded.",
        variant: "destructive",
      });
      return;
    }

    if (currentUserData.coins < item.price) {
      toast({
        title: "Not enough coins",
        description: `You need ${item.price - currentUserData.coins} more coins to buy this item.`,
        variant: "destructive",
      });
      return;
    }

     // Check if the user already owns the item (assuming ownedItems is an array of item IDs)
     if (currentUserData.ownedItems && currentUserData.ownedItems.includes(item.id)) {
         toast({
            title: "Already Owned",
            description: "You already own this item.",
            variant: "default",
         });
         return;
     }


    setIsPurchasing(true); // Disable buttons

    const userDocRef = doc(db, "users", user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);

        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const currentCoins = userDoc.data().coins;
        const ownedItems = userDoc.data().ownedItems || [];

        // Re-check if user has enough coins and doesn't already own the item within the transaction
        if (currentCoins < item.price) {
           throw new Error("Not enough coins for purchase.");
        }
        if (ownedItems.includes(item.id)) {
            throw new Error("Item already owned.");
        }

        // Deduct coins and add item to owned items
        const newCoins = currentCoins - item.price;
        const newOwnedItems = [...ownedItems, item.id]; // Add the new item ID

        transaction.update(userDocRef, {
          coins: newCoins,
          ownedItems: newOwnedItems,
        });

        // Optional: Update item in shopItems collection if you need to mark it as sold globally
        // This depends on your game design. If items can only be bought once by anyone,
        // or if the total available quantity needs to be tracked.
        // If each user just owns their copy, updating the user document is sufficient.
        // If updating shopItems is needed:
        // const shopItemDocRef = doc(db, "shopItems", item.id);
        // transaction.update(shopItemDocRef, { available: false }); // Example field


      });

      // If the transaction is successful
      toast({
        title: "Purchase successful",
        description: `You have successfully purchased ${item.name}!`,
        variant: "default",
      });

      // Manually update the local user data state after a successful purchase
      setCurrentUserData(prevData => {
          if (!prevData) return null;
          return {
              ...prevData,
              coins: prevData.coins - item.price,
              ownedItems: [...(prevData.ownedItems || []), item.id],
          };
      });


    } catch (error: any) {
      console.error("Firestore Transaction failed:", error);
       let errorMessage = "Purchase failed. Please try again.";
       if (error.message === "Not enough coins for purchase.") {
           errorMessage = "Not enough coins for purchase.";
       } else if (error.message === "Item already owned.") {
            errorMessage = "You already own this item.";
       } else {
            errorMessage = error.message; // Fallback to error message
       }

      toast({
        title: "Purchase failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false); // Re-enable buttons
    }
  };

  // Filter items by active category
  const filteredItems = shopItems.filter(item => item.type === activeCategory);

  // Show loading state
  if (isAuthLoading || isFetchingShopItems || isFetchingUserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Shop...
      </div>
    );
  }

  // Redirect if no user is logged in
  if (!user) {
     return null; // useAuth hook handles redirect
  }


  return (
    <>
      <main className="flex-1 overflow-auto bg-gray-100"> {/* Used bg-gray-100 for consistency */}
        {/* Shop Header */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">FinCity Shop</h2>
            {/* Display current user's coins */}
            <div className="flex items-center bg-amber-50 text-amber-600 text-sm rounded-full px-3 py-1">
              <i className="ri-coin-fill mr-1"></i> {/* Assuming ri-coin-fill is available (Remixicon) */}
              <span>{currentUserData?.coins ?? 0}</span> {/* Use fetched user coins */}
            </div>
          </div>
        </div>

        {/* Shop Categories */}
        <div className="px-4 py-3 bg-white sticky top-0 z-10 shadow-sm"> {/* Added shadow */}
          <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar"> {/* Added no-scrollbar class if you have it */}
            {/* Dynamically create category buttons based on available item types */}
             {[...new Set(shopItems.map(item => item.type))].map(category => (
                 <button
                    key={category}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === category ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`} // Updated styling
                    onClick={() => setActiveCategory(category)}
                 >
                    {category}
                 </button>
             ))}
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="p-4 grid grid-cols-auto-fill-150 gap-4"> {/* Using a responsive grid class 'grid-cols-auto-fill-150' - define this in your CSS */}
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"> {/* Added flex and flex-col */}
              <div className={`h-32 bg-${item.color || 'blue'}-100 relative flex items-center justify-center`}> {/* Added flex centering */}
                 {/* You might want to use an actual image or icon component here */}
                <div className={`w-20 h-20 bg-${item.color || 'blue'}-500 rounded-lg flex items-center justify-center text-white text-3xl`}>
                    {/* Placeholder for icon - replace with actual icon rendering */}
                   <i className={`${item.icon || 'ri-question-mark'}`}></i> {/* Default icon */}
                </div>
              </div>
              <div className="p-3 flex flex-col flex-grow"> {/* Added flex-grow */}
                <h3 className="font-medium mb-1 text-gray-800">{item.name}</h3>
                {item.description && <p className="text-gray-600 text-xs mb-2 flex-grow">{item.description}</p>} {/* Added description and flex-grow */}
                <div className="flex items-center justify-between mt-auto"> {/* Use mt-auto to push to bottom */}
                  <span className="flex items-center text-amber-600 text-sm font-semibold"> {/* Updated coin color and font */}
                    {/* Assuming ri-coin-fill is available (Remixicon) */}
                    <i className="ri-coin-fill mr-1"></i> {item.price}
                  </span>
                  {/* Determine if the user owns this item */}
                  {currentUserData?.ownedItems?.includes(item.id) ? (
                    <Button variant="secondary" className="text-white text-xs px-3 py-1 rounded" disabled>
                      Owned
                    </Button>
                  ) : (
                    <Button
                      className="bg-primary text-white text-xs px-3 py-1 rounded hover:bg-primary/90" // Updated styling
                      onClick={() => handlePurchase(item)}
                      disabled={isPurchasing || (currentUserData?.coins ?? 0) < item.price} // Disable if purchasing or not enough coins
                    >
                      {isPurchasing ? 'Buying...' : 'Buy'} {/* Indicate purchasing state */}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* No items message */}
          {filteredItems.length === 0 && !isFetchingShopItems && (
            <div className="col-span-full text-center py-10 text-gray-500"> {/* Updated styling and col-span */}
              <i className="ri-shopping-cart-line text-3xl mb-2"></i> {/* Assuming ri-shopping-cart-line */}
              <p>No items available in this category.</p>
            </div>
          )}
             {/* Loading message */}
             {isFetchingShopItems && (
                  <div className="col-span-full text-center py-10 text-gray-500">
                     Loading items...
                  </div>
             )}
        </div>
      </main>
      <BottomNav active="shop" />
    </>
  );
}
