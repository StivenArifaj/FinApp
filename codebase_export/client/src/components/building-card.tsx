interface BuildingProps {
  building: {
    id: number;
    name: string;
    type: string;
    position: { top: string; left: string; right?: string; bottom?: string; };
    color: string;
    icon: string;
    width: string;
    height: string;
    locked?: boolean;
  };
  onClick: () => void;
}

export default function BuildingCard({ building, onClick }: BuildingProps) {
  const isLocked = building.locked || false;
  
  return (
    <div 
      className={`map-building absolute ${isLocked ? 'opacity-60' : ''} cursor-pointer`}
      style={{
        top: building.position.top,
        left: building.position.left,
        right: building.position.right,
        bottom: building.position.bottom,
        width: building.width,
        height: building.height
      }}
      onClick={onClick}
    >
      <div className={`bg-${building.color} rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg`}>
        {isLocked ? (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <i className="ri-lock-fill text-white text-3xl"></i>
          </div>
        ) : (
          <>
            {building.type === "bank" && (
              <>
                <div className="bg-primary-dark absolute top-0 left-0 right-0 h-4 rounded-t-lg"></div>
                <div className="absolute top-6 left-2 right-2 h-12 flex flex-col">
                  <div className="h-2 bg-white/30 mb-1 rounded"></div>
                  <div className="h-2 bg-white/30 mb-1 rounded"></div>
                  <div className="h-2 bg-white/30 rounded"></div>
                </div>
              </>
            )}
            
            {building.type === "shop" && (
              <div className="absolute top-4 left-2 right-2 h-8 flex items-center justify-center">
                <i className="ri-store-2-fill text-white/70 text-2xl"></i>
              </div>
            )}
            
            {building.type === "school" && (
              <>
                <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg bg-blue-600"></div>
                <div className="absolute top-7 left-3 right-3 h-8 bg-white/30 rounded"></div>
              </>
            )}
            
            {building.type === "savings" && (
              <div className="absolute top-2 left-2 right-2 h-6 bg-white/20 rounded"></div>
            )}
          </>
        )}
        
        <i className={`${building.icon} text-white text-xl mb-1`}></i>
        <span className="text-white text-xs font-medium">{building.name}</span>
      </div>
    </div>
  );
}
