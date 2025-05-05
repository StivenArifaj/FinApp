import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface ShopItem {
  id: number;
  name: string;
  price: number;
  type: string;
  icon: string;
  color: string;
  owned: boolean;
}

export default function ShopPage() {
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("Buildings");
  
  const { data: shopItems } = useQuery({
    queryKey: ['/api/shop'],
  });
  
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("POST", `/api/shop/purchase/${itemId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shop'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Purchase successful",
        description: "Your new item has been added to your city!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handlePurchase = (item: ShopItem) => {
    if (user && user.coins >= item.price) {
      purchaseMutation.mutate(item.id);
    } else {
      toast({
        title: "Not enough coins",
        description: `You need ${item.price - (user?.coins || 0)} more coins to buy this item.`,
        variant: "destructive",
      });
    }
  };
  
  // Mock shop items until we have real data
  const mockShopItems: ShopItem[] = [
    {
      id: 1,
      name: "Investment Center",
      price: 250,
      type: "Buildings",
      icon: "ri-building-fill",
      color: "primary",
      owned: false
    },
    {
      id: 2,
      name: "Housing Center",
      price: 300,
      type: "Buildings",
      icon: "ri-home-4-fill",
      color: "green-500",
      owned: false
    },
    {
      id: 3,
      name: "Credit Bureau",
      price: 200,
      type: "Buildings",
      icon: "ri-bank-fill",
      color: "purple-500",
      owned: false
    },
    {
      id: 4,
      name: "Security Center",
      price: 180,
      type: "Buildings",
      icon: "ri-shield-check-fill",
      color: "red-500",
      owned: false
    }
  ];
  
  const items = shopItems || mockShopItems;
  const filteredItems = items.filter(item => item.type === activeCategory);

  return (
    <>
      <main className="flex-1 overflow-auto bg-light">
        {/* Shop Header */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">FinCity Shop</h2>
            <div className="flex items-center bg-amber-50 text-amber-600 text-sm rounded-full px-3 py-1">
              <i className="ri-coin-fill mr-1"></i>
              <span>{user?.coins || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Shop Categories */}
        <div className="px-4 py-3 bg-white sticky top-0 z-10">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Buildings' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Buildings')}
            >
              Buildings
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Avatars' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Avatars')}
            >
              Avatars
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Decorations' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Decorations')}
            >
              Decorations
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Boosts' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Boosts')}
            >
              Boosts
            </button>
          </div>
        </div>
        
        {/* Shop Items */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className={`h-32 bg-${item.color === 'primary' ? 'blue' : item.color.split('-')[0]}-100 relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-20 h-20 bg-${item.color} rounded-lg flex items-center justify-center`}>
                    <i className={`${item.icon} text-white text-3xl`}></i>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium mb-1">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-amber-500 text-sm">
                    <i className="ri-coin-fill mr-1"></i> {item.price}
                  </span>
                  {item.owned ? (
                    <Button variant="secondary" className="text-white text-xs px-3 py-1 rounded" disabled>
                      Owned
                    </Button>
                  ) : user && user.coins >= item.price ? (
                    <Button 
                      className="bg-primary text-white text-xs px-3 py-1 rounded"
                      onClick={() => handlePurchase(item)}
                      disabled={purchaseMutation.isPending}
                    >
                      Buy
                    </Button>
                  ) : (
                    <Button className="bg-gray-200 text-gray-400 text-xs px-3 py-1 rounded" disabled>
                      Not enough
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-2 text-center py-10 text-dark/50">
              <i className="ri-shopping-cart-line text-3xl mb-2"></i>
              <p>No items available in this category</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav active="shop" />
    </>
  );
}
