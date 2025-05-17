import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { UserWithProfile } from "@shared/schema";

interface SpendingItem {
  id: number;
  name: string;
  icon: string;
  cost: number;
  priority?: number;
}

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useQuery<UserWithProfile>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  const navigate = useNavigate();
  const [items, setItems] = useState<SpendingItem[]>([
    { id: 1, name: "Food for the week", icon: "ri-restaurant-fill", cost: 25 },
    { id: 2, name: "Movie tickets", icon: "ri-movie-fill", cost: 15 },
    { id: 3, name: "New t-shirt", icon: "ri-t-shirt-fill", cost: 20 },
    { id: 4, name: "School supplies", icon: "ri-book-fill", cost: 10 },
    { id: 5, name: "Mobile game in-app purchase", icon: "ri-game-fill", cost: 5 }
  ]);
  
  const [prioritizedItems, setPrioritizedItems] = useState<SpendingItem[]>([]);
  const [budget, setBudget] = useState(50);
  const [spent, setSpent] = useState(0);
  
  const handleDragStart = (e: React.DragEvent, item: SpendingItem) => {
    e.dataTransfer.setData("itemId", item.id.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData("itemId"));
    const draggedItem = items.find(item => item.id === itemId);
    
    if (draggedItem && prioritizedItems.length < 3) {
      // Calculate new spent amount
      const newSpent = spent + draggedItem.cost;
      
      // Check if we have enough budget
      if (newSpent <= budget) {
        // Add item to prioritized list with a priority value
        const priority = prioritizedItems.length + 1;
        const prioritizedItem = { ...draggedItem, priority };
        
        // Remove item from available items
        setItems(items.filter(item => item.id !== itemId));
        
        // Add to prioritized items
        setPrioritizedItems([...prioritizedItems, prioritizedItem]);
        
        // Update spent amount
        setSpent(newSpent);
      }
    }
  };
  
  const handleReset = () => {
    // Reset the game
    setItems([
      { id: 1, name: "Food for the week", icon: "ri-restaurant-fill", cost: 25 },
      { id: 2, name: "Movie tickets", icon: "ri-movie-fill", cost: 15 },
      { id: 3, name: "New t-shirt", icon: "ri-t-shirt-fill", cost: 20 },
      { id: 4, name: "School supplies", icon: "ri-book-fill", cost: 10 },
      { id: 5, name: "Mobile game in-app purchase", icon: "ri-game-fill", cost: 5 }
    ]);
    setPrioritizedItems([]);
    setSpent(0);
  };
  
  const handleSubmit = () => {
    // In a real app, this would submit the priorities to the backend
    // and navigate to a results page
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Game Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button 
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => navigate("/")}
          >
            <i className="ri-arrow-left-line text-dark/70"></i>
          </button>
          <h2 className="text-lg font-bold">Budget Challenge</h2>
          <div className="w-8 h-8"></div> {/* Empty div for alignment */}
        </div>
      </div>
      
      {/* Game Content */}
      <div className="flex-1 p-4 overflow-auto bg-light">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Spending Priority Game</h3>
            <p className="text-dark/70">You have €50 to spend. Drag items below to arrange them by priority of spending.</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Your Budget:</span>
              <span className="text-primary font-bold">€{budget}</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full">
              <div 
                className="bg-primary h-full rounded-full progress-indicator" 
                style={{width: `${(spent / budget) * 100}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-dark/60">
              <span>€{spent} spent</span>
              <span>€{budget - spent} remaining</span>
            </div>
          </div>
          
          {/* Priority drop area */}
          <div 
            className="mb-6 border-2 border-dashed border-primary/30 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h4 className="text-sm font-medium mb-3">Your Priorities (Drag items here)</h4>
            
            {prioritizedItems.length > 0 ? (
              <div className="space-y-3">
                {prioritizedItems.map((item) => (
                  <div key={item.id} className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <i className={`${item.icon} text-primary`}></i>
                      </div>
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-xs text-primary">Priority #{item.priority}</div>
                      </div>
                    </div>
                    <span className="font-medium">€{item.cost}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-dark/50">
                <i className="ri-drag-move-2-line text-2xl mb-2"></i>
                <p>Drag items here to set your spending priorities</p>
              </div>
            )}
          </div>
          
          {/* Draggable items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2">Available Items:</h4>
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-gray-100 rounded-lg p-3 cursor-move flex items-center justify-between" 
                draggable="true"
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <div className="flex items-center">
                  <i className={`${item.icon} text-primary mr-3 text-lg`}></i>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">€{item.cost}</span>
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="text-center py-4 text-dark/50">
                <p>No more items available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Game Bottom Navigation */}
      <div className="bg-white p-4 shadow-t">
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex-1 py-3 rounded-lg font-medium"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium transition-all hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={prioritizedItems.length === 0}
          >
            Submit My Priorities
          </Button>
        </div>
      </div>
    </div>
  );
}
