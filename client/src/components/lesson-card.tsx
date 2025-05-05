import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface LessonProps {
  lesson: {
    id: number;
    title: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    progress: number;
  };
}

export default function LessonCard({ lesson }: LessonProps) {
  return (
    <Link href={`/lesson/${lesson.id}`}>
      <motion.a 
        className="block bg-white rounded-xl shadow-sm p-4 mb-3 border border-transparent transition-all"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderColor: "rgba(99, 102, 241, 0.2)" // primary color with transparency
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <motion.div 
            className={`w-12 h-12 ${lesson.iconBg} rounded-full flex items-center justify-center mr-4`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <i className={`${lesson.icon} ${lesson.iconColor} text-xl`}></i>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">{lesson.title}</h4>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="w-3/4 relative">
                  <Progress value={lesson.progress} className="h-2.5" />
                  <motion.div 
                    className="absolute top-0 bottom-0 left-0 bg-primary/20 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${lesson.progress}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                
                <span className={`text-xs font-bold ${
                  lesson.progress === 100 ? 'text-green-500' : 
                  lesson.progress > 50 ? 'text-primary' : 'text-dark/70'
                }`}>
                  {lesson.progress}%
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                {/* Status badge based on progress */}
                {lesson.progress === 100 ? (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full inline-flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                ) : lesson.progress > 0 ? (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    In Progress
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full inline-flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Not Started
                  </span>
                )}
                
                {/* Estimated time badge */}
                <span className="text-xs text-dark/50 inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  5 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
}
