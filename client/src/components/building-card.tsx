import { motion } from "framer-motion";

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
  
  const buildingVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: Math.random() * 0.3 // stagger the animations randomly
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  const lockIconVariants = {
    hover: {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  return (
    <motion.div 
      className={`map-building absolute ${isLocked ? 'opacity-80' : ''} cursor-pointer`}
      style={{
        top: building.position.top,
        left: building.position.left,
        right: building.position.right,
        bottom: building.position.bottom,
        width: building.width,
        height: building.height
      }}
      onClick={onClick}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={buildingVariants}
    >
      <motion.div 
        className={`bg-${building.color} rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg relative overflow-hidden`}
      >
        {/* Pulsing highlight effect for unlocked buildings */}
        {!isLocked && (
          <motion.div
            className="absolute inset-0 bg-white opacity-0"
            animate={{
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}

        {isLocked ? (
          <motion.div 
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/30 rounded-lg"
            variants={lockIconVariants}
          >
            <motion.i 
              className="ri-lock-fill text-white text-3xl drop-shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>
        ) : (
          <>
            {building.type === "bank" && (
              <>
                <div className="bg-primary-dark absolute top-0 left-0 right-0 h-4 rounded-t-lg"></div>
                <div className="absolute top-6 left-2 right-2 h-12 flex flex-col">
                  <motion.div 
                    className="h-2 bg-white/30 mb-1 rounded"
                    animate={{ width: ["100%", "70%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.div 
                    className="h-2 bg-white/30 mb-1 rounded"
                    animate={{ width: ["100%", "60%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
                  />
                  <motion.div 
                    className="h-2 bg-white/30 rounded"
                    animate={{ width: ["100%", "80%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 0.6 }}
                  />
                </div>
              </>
            )}
            
            {building.type === "shop" && (
              <div className="absolute top-4 left-2 right-2 h-8 flex items-center justify-center">
                <motion.i 
                  className="ri-store-2-fill text-white/70 text-2xl"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
            )}
            
            {building.type === "school" && (
              <>
                <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg bg-blue-600"></div>
                <motion.div 
                  className="absolute top-7 left-3 right-3 h-8 bg-white/30 rounded"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            )}
            
            {building.type === "savings" && (
              <motion.div 
                className="absolute top-2 left-2 right-2 h-6 bg-white/20 rounded"
                animate={{ height: ["6px", "10px", "6px"] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </>
        )}
        
        <motion.i 
          className={`${building.icon} text-white text-xl mb-1 drop-shadow-md`}
          whileHover={{ scale: 1.2, rotate: 5 }}
        />
        <motion.span 
          className="text-white text-xs font-medium drop-shadow-md"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {building.name}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
