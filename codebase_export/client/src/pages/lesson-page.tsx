import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Answer {
  id: number;
  text: string;
  correct: boolean;
}

interface Question {
  id: number;
  text: string;
  image?: string;
  answers: Answer[];
}

interface Lesson {
  id: string;
  title: string;
  topic: string;
  totalQuestions: number;
  currentQuestion: number;
  progress: number;
  questions: Question[];
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  const [, setLocation] = useLocation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // In a real app, this would fetch from the API
  const { data: lesson } = useQuery<Lesson>({
    queryKey: ['/api/lessons', id],
  });

  const mockLesson: Lesson = {
    id: id || "1",
    title: "Banking Basics",
    topic: "Banking & Cards",
    totalQuestions: 5,
    currentQuestion: 2,
    progress: 40,
    questions: [
      {
        id: 1,
        text: "What is the main difference between a debit card and a credit card?",
        answers: [
          { id: 1, text: "A debit card has a different color than a credit card.", correct: false },
          { id: 2, text: "A debit card uses your own money from your account, while a credit card borrows money that you have to pay back later.", correct: true },
          { id: 3, text: "A credit card can only be used online, while a debit card can be used in stores.", correct: false },
          { id: 4, text: "There is no difference, they're just different names for the same thing.", correct: false }
        ]
      }
    ]
  };

  const lessonData = lesson || mockLesson;
  const currentQuestion = lessonData.questions[0];

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswer(answerId);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    const selected = currentQuestion.answers.find(a => a.id === selectedAnswer);
    setIsCorrect(!!selected?.correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    // In a real app, this would advance to the next question or complete the lesson
    setLocation("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lesson Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button 
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => setLocation("/")}
          >
            <i className="ri-arrow-left-line text-dark/70"></i>
          </button>
          <div className="flex items-center">
            <div className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-3 py-1 mr-2">
              <i className="ri-heart-fill mr-1"></i>
              <span>3</span>
            </div>
            <div className="flex items-center bg-amber-50 text-amber-600 text-xs rounded-full px-3 py-1">
              <i className="ri-coin-fill mr-1"></i>
              <span>{user?.coins || 0}</span>
            </div>
          </div>
        </div>
        
        <Progress value={lessonData.progress} className="w-full h-2" />
        <div className="flex justify-between text-xs mt-1 text-dark/60">
          <span>Question {lessonData.currentQuestion}/{lessonData.totalQuestions}</span>
          <span>{lessonData.topic}</span>
        </div>
      </div>
      
      {/* Lesson Content */}
      <div className="flex-1 p-4 overflow-auto bg-light">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold mb-4">{currentQuestion.text}</h2>
          
          <div className="mb-5">
            <div className="w-full h-32 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
              <i className="ri-bank-card-line text-blue-500 text-4xl"></i>
            </div>
            <p className="text-dark/70">Select the correct answer:</p>
          </div>
          
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <div 
                key={answer.id}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all 
                  ${selectedAnswer === answer.id ? 'border-primary' : 'border-gray-200 hover:border-primary'}`}
                onClick={() => handleAnswerSelect(answer.id)}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center border-2 
                    ${selectedAnswer === answer.id ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {selectedAnswer === answer.id && (
                      <i className="ri-check-line text-white text-sm"></i>
                    )}
                  </div>
                  <p>{answer.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Lesson Bottom Navigation */}
      <div className="bg-white p-4 shadow-t">
        <Button
          className={`w-full py-3 rounded-lg font-medium transition-all 
            ${selectedAnswer === null ? 'bg-gray-300 text-dark/50' : 'bg-primary text-white hover:bg-primary/90'}`}
          disabled={selectedAnswer === null}
          onClick={handleCheckAnswer}
        >
          Check Answer
        </Button>
      </div>
      
      {/* Answer Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-dark/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 animate-bounce">
            <div className="text-center mb-4">
              {isCorrect ? (
                <div className="w-16 h-16 bg-success rounded-full mx-auto flex items-center justify-center mb-3">
                  <i className="ri-check-line text-3xl text-white"></i>
                </div>
              ) : (
                <div className="w-16 h-16 bg-destructive rounded-full mx-auto flex items-center justify-center mb-3">
                  <i className="ri-close-line text-3xl text-white"></i>
                </div>
              )}
              <h3 className="text-lg font-bold">{isCorrect ? 'Correct!' : 'Not quite right'}</h3>
              <p className="text-dark/70">
                {isCorrect 
                  ? "That's right! A debit card uses your own money, while a credit card lets you borrow money."
                  : "A debit card uses your own money from your account, while a credit card borrows money that you have to pay back later."}
              </p>
            </div>
            
            <div className="bg-light rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Did you know?</h4>
              <p className="text-sm text-dark/70">Credit cards often come with extra fees and interest if you don't pay back the full amount each month.</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-success">
                <i className="ri-coin-fill mr-1"></i>
                <span>+10 coins</span>
              </div>
              <Button 
                className="bg-primary text-white px-6 py-2 rounded-lg"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
