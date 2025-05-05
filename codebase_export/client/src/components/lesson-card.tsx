import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

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
      <a className="block bg-white rounded-xl shadow-sm p-4 mb-3">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${lesson.iconBg} rounded-full flex items-center justify-center mr-4`}>
            <i className={`${lesson.icon} ${lesson.iconColor} text-xl`}></i>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">{lesson.title}</h4>
            <div className="flex justify-between items-center">
              <Progress value={lesson.progress} className="w-3/4 h-2" />
              <span className="text-xs text-dark/60">{lesson.progress}%</span>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
