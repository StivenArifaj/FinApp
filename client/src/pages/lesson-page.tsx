// client/src/pages/lesson-page.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth"; // To get the authenticated Firebase user

// Import Firestore and Auth
import { getFirestore, doc, getDoc, updateDoc, increment, arrayUnion, runTransaction, Timestamp, collection, getDocs, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";

// Get Firestore and Auth instances
const db = getFirestore(app);
const auth = getAuth(app);


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
   correctAnswerExplanation?: string; // Added explanation field
}

// Define type for Lesson data fetched from Firestore
interface LessonData {
  id: string; // Firestore document ID
  title: string;
  topic: string;
  description?: string;
  questions: Question[];
  xp_reward: number;
  coin_reward: number;
  order: number;
  // Add other relevant lesson fields
}

// Define type for Achievement data fetched from Firestore
interface AchievementData {
  id: string; // Firestore document ID
  name: string;
  description: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  reward?: number; // Coin reward for unlocking
  // Add other fields from your achievements collection
  // You might add a 'condition' field here in Firestore to define unlocking rules
  // For this implementation, we'll hardcode simple conditions based on lesson completion
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
  ownedProperties: { [propertyId: string]: { purchasePrice: number, purchaseTimestamp: any } };
  achievements: string[]; // Array of achievement IDs unlocked by the user
  completedLessons: string[]; // Array of lesson IDs completed by the user
  ownedItems: string[];
  createdAt: any;
  lastCompletedLessonAt?: any; // Optional: To track daily streak
}


export default function LessonPage() {
  const { id: lessonId } = useParams<{ id: string }>(); // Get lesson ID from URL
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isFetchingLesson, setIsFetchingLesson] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(true);
  const [allAchievements, setAllAchievements] = useState<AchievementData[]>([]); // State for all achievements
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(true);


  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);


  // Fetch lesson data from Firestore
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) {
         toast({
            title: "Error",
            description: "Lesson ID is missing.",
            variant: "destructive",
          });
         setIsFetchingLesson(false);
         return;
      }
      setIsFetchingLesson(true);
      try {
        const lessonDocRef = doc(db, "lessons", lessonId);
        const lessonDocSnap = await getDoc(lessonDocRef);

        if (lessonDocSnap.exists()) {
          setLesson({ id: lessonDocSnap.id, ...lessonDocSnap.data() as LessonData });
        } else {
          console.warn("No lesson document found for ID:", lessonId);
           toast({
              title: "Not Found",
              description: "The requested lesson does not exist.",
              variant: "destructive",
           });
           setLesson(null); // Lesson not found
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
         toast({
            title: "Error",
            description: "Failed to fetch lesson data.",
            variant: "destructive",
          });
         setLesson(null); // Handle error
      } finally {
        setIsFetchingLesson(false);
      }
    };

    fetchLesson();
  }, [lessonId]); // Rerun when lessonId changes


    // Fetch current user's data from Firestore
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

   // Fetch all achievements from Firestore
   useEffect(() => {
      const fetchAchievements = async () => {
         setIsFetchingAchievements(true);
         try {
            const querySnapshot = await getDocs(collection(db, "achievements"));
            const achievementsList = querySnapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data() as AchievementData
            }));
            setAllAchievements(achievementsList);
         } catch (error) {
            console.error("Error fetching achievements:", error);
         } finally {
            setIsFetchingAchievements(false);
         }
      };

      fetchAchievements();
   }, []); // Fetch once on mount


  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswer(answerId);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || !lesson || !lesson.questions[currentQuestionIndex]) return;

    const currentQuestion = lesson.questions[currentQuestionIndex];
    const selected = currentQuestion.answers.find(a => a.id === selectedAnswer);

    setIsCorrect(!!selected?.correct);
    setShowResult(true);
  };

   // Function to handle moving to the next question or completing the lesson
   const handleContinue = async () => {
       // If the answer was incorrect, just hide the result and allow retrying the same question
       if (!isCorrect) {
            setShowResult(false);
            setSelectedAnswer(null); // Allow re-selecting answer
            // setIsCorrect remains false until correct answer is selected
           return;
       }


       // If the answer was correct, proceed
       setShowResult(false);
       setSelectedAnswer(null);
       setIsCorrect(false); // Reset correctness state for next question

       if (!lesson) return;

       // Check if there are more questions
       if (currentQuestionIndex < lesson.questions.length - 1) {
           // Move to the next question
           setCurrentQuestionIndex(prevIndex => prevIndex + 1);
       } else {
           // Lesson completed!
           await handleLessonCompletion();
           // Navigate away after completion and updating data
           // Use a slight delay to allow toast to be seen
           setTimeout(() => navigate("/city-map"), 2000); // Navigate back to city map after a delay
       }
   };

    // Function to handle lesson completion, update user data, and check for achievements
    const handleLessonCompletion = async () => {
        if (!user || !currentUserData || !lesson) {
            toast({
                title: "Error",
                description: "User not authenticated, user data not loaded, or lesson data missing.",
                variant: "destructive",
            });
            return;
        }

         // Check if the lesson is already completed by the user
        if (currentUserData.completedLessons?.includes(lesson.id)) {
             console.log(`Lesson ${lesson.id} already completed by user ${user.uid}`);
              toast({
                title: "Lesson Already Completed",
                description: "You have already completed this lesson.",
                variant: "default",
             });
             return; // Don't award rewards or check achievements again for this lesson
        }


        setIsProcessingAction(true); // Disable actions during update

        const userDocRef = doc(db, "users", user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);

                if (!userDoc.exists()) {
                    throw new Error("User document does not exist!");
                }

                const currentXP = userDoc.data().xp;
                const currentCoins = userDoc.data().coins;
                const completedLessons = userDoc.data().completedLessons || [];
                const currentStreak = userDoc.data().streak || 0;
                 const currentAchievements = userDoc.data().achievements || [];


                 // Double-check if lesson is already completed within the transaction
                 if (completedLessons.includes(lesson.id)) {
                      console.warn(`Transaction aborted: Lesson ${lesson.id} already completed.`);
                      return; // Abort transaction without error
                 }


                // Calculate new XP and coins
                const newXP = currentXP + lesson.xp_reward;
                const newCoins = currentCoins + lesson.coin_reward;

                // Add lesson to completed lessons array using arrayUnion for safety
                // arrayUnion ensures the lesson ID is added only if it's not already there
                const updatedCompletedLessonsInTransaction = arrayUnion(lesson.id);


                 // Increment streak (basic implementation, needs refinement for daily streaks)
                 // For a true streak, you'd need to check the timestamp of the last completed lesson
                const newStreak = currentStreak + 1;


                 // --- Achievement Unlocking Logic ---
                const newlyUnlockedAchievements: AchievementData[] = [];
                const updatedAchievements = [...currentAchievements]; // Start with current achievements
                const completedLessonsAfterThis = [...completedLessons, lesson.id]; // Array including the just completed lesson

                 allAchievements.forEach(achievement => {
                    // Define achievement unlocking conditions here based on lesson completion
                    // Evaluate conditions based on the state *after* this lesson completion
                    // Example: Unlock achievement for completing THIS specific lesson (replace 'your_first_lesson_id' with the actual ID)
                    if (achievement.id === 'first_lesson_complete' && lesson.id === 'your_first_lesson_id' && !updatedAchievements.includes(achievement.id)) {
                         updatedAchievements.push(achievement.id);
                         newlyUnlockedAchievements.push(achievement);
                    }
                    // Example: Unlock achievement for completing a total of N lessons (replace 5 with the required number)
                     if (achievement.id === 'lesson_master_5' && completedLessonsAfterThis.length >= 5 && !updatedAchievements.includes(achievement.id)) {
                        updatedAchievements.push(achievement.id);
                        newlyUnlockedAchievements.push(achievement);
                     }
                     // Add more conditions based on your defined achievements and their criteria related to lessons
                 });
                 // --- End Achievement Unlocking Logic ---


                const updatePayload: any = {
                    xp: newXP,
                    coins: newCoins,
                    completedLessons: updatedCompletedLessonsInTransaction, // Use arrayUnion here
                     streak: newStreak,
                     achievements: updatedAchievements, // Update with newly unlocked achievements
                     lastCompletedLessonAt: Timestamp.now(),
                };

                // If the user document didn't have completedLessons or achievements fields before,
                // arrayUnion will create the array.

                transaction.update(userDocRef, updatePayload);

                 // console.log("Newly unlocked achievements:", newlyUnlockedAchievements); // Log for debugging
            });

            // If the transaction is successful
            toast({
                title: "Lesson Complete!",
                description: `You earned ${lesson.xp_reward} XP and ${lesson.coin_reward} coins.`,
                variant: "default",
            });

             // Show toasts for newly unlocked achievements AFTER the transaction
             // We need to determine which achievements were newly unlocked based on the state *before* the transaction
             // compared to the state *after*.
             // For simplicity and to use the fetched `allAchievements` state, we can re-evaluate locally.
             // A more robust approach for showing real-time toasts would be a Cloud Function trigger
             // that sends a notification when achievements are added to the user document.

             // Manually update local user data state after successful completion and achievement check
             setCurrentUserData(prevData => {
                  if (!prevData || !lesson) return null;

                   // Simulate the completed lessons array after the transaction for local state
                  const updatedCompletedLessonsLocally = Array.from(new Set([...(prevData.completedLessons || []), lesson.id]));

                   const updatedAchievementsLocally = [...(prevData.achievements || [])];
                   const newlyUnlockedAchievementToasts: AchievementData[] = [];

                   allAchievements.forEach(achievement => {
                        if (!updatedAchievementsLocally.includes(achievement.id)) {
                             // Re-evaluate conditions based on the updatedCompletedLessonsLocally count
                              let unlockedNow = false;
                               if (achievement.id === 'first_lesson_complete' && lesson!.id === 'your_first_lesson_id' && updatedCompletedLessonsLocally.includes(lesson!.id)) {
                                   unlockedNow = true;
                               }
                                if (achievement.id === 'lesson_master_5' && updatedCompletedLessonsLocally.length >= 5) {
                                    unlockedNow = true;
                                }
                                // Add other conditions here

                              if (unlockedNow) {
                                   updatedAchievementsLocally.push(achievement.id);
                                   newlyUnlockedAchievementToasts.push(achievement);
                              }
                        }
                   });

                  // Show toasts for the achievements unlocked in this session
                  newlyUnlockedAchievementToasts.forEach(ach => {
                       toast({
                           title: "Achievement Unlocked!",
                           description: `You earned the "${ach.name}" achievement.`,
                           variant: "default", // Or a custom variant
                       });
                  });


                  return {
                      ...prevData,
                      xp: prevData.xp + lesson.xp_reward,
                      coins: prevData.coins + lesson.coin_reward,
                      completedLessons: updatedCompletedLessonsLocally, // Use the locally simulated completed lessons
                       streak: (prevData.streak || 0) + 1,
                       achievements: updatedAchievementsLocally, // Update with newly unlocked achievements
                       lastCompletedLessonAt: Timestamp.now(),
                  };
             });


        } catch (error: any) {
            console.error("Firestore Transaction failed during lesson completion:", error);
            let errorMessage = "Failed to record lesson completion or unlock achievements. Please try again.";
             if (error.message === "User document does not exist!") {
               errorMessage = "Your user data is missing. Please try logging in again.";
             }
            toast({
                title: "Completion Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsProcessingAction(false); // Re-enable actions
        }
    };


  // Show loading state
  if (isAuthLoading || isFetchingLesson || isFetchingUserData || isFetchingAchievements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Lesson...
      </div>
    );
  }

   // Handle case where lesson was not found
  if (!lesson) {
    return (
        <div className="flex items-center justify-center min-h-screen text-red-500">
           Lesson not found.
        </div>
     );
  }

  // Redirect if no user is logged in
  if (!user) {
     return null; // useAuth hook handles redirect
  }


   // Get the current question based on the index
  const currentQuestion = lesson.questions[currentQuestionIndex];
   const totalQuestions = lesson.questions.length;
   // Progress based on completed questions + current question if result is shown and correct
   const currentProgress = ((currentQuestionIndex + (showResult && isCorrect ? 1 : 0)) / totalQuestions) * 100;


  return (
    <div className="flex flex-col h-full">
      {/* Lesson Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => navigate("/city-map")} // Navigate back to city map or previous page
            disabled={isProcessingAction}
          >
             {/* Assuming lucide-arrow-left is available */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
          <div className="flex items-center">
             {/* Assuming you have a way to track lives/hearts */}
            {/* <div className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-3 py-1 mr-2">
              <i className="ri-heart-fill mr-1"></i>
              <span>3</span>
            </div> */}
            {/* Display current user's coins and XP */}
            <div className="flex items-center bg-amber-50 text-amber-600 text-xs rounded-full px-3 py-1 mr-2 font-semibold"> {/* Added font-semibold */}
               {/* Assuming lucide-circle-dollar-sign is available */}
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-dollar-sign"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4h-6"/><path d="M12 17.5v-.5"/><path d="M12 6v.5"/></svg>
              <span className="ml-1">{currentUserData?.coins ?? 0}</span>
            </div>
              <div className="flex items-center bg-green-50 text-green-600 text-xs rounded-full px-3 py-1 font-semibold"> {/* Added font-semibold */}
                 {/* Assuming lucide-star is available */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="ml-1">{currentUserData?.xp ?? 0}</span>
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={currentProgress} className="w-full h-2" />
        <div className="flex justify-between text-xs mt-1 text-gray-600">
          <span>Question {currentQuestionIndex + 1}/{totalQuestions}</span>
          <span>{lesson.topic || ''}</span>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 p-4 overflow-auto bg-gray-100">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold mb-4 text-gray-800">{currentQuestion.text}</h2>

          {/* Optional: Display question image if available */}
          {currentQuestion.image && (
            <div className="mb-5">
                <img src={currentQuestion.image} alt="Question illustration" className="w-full h-auto rounded-lg object-cover"/>
            </div>
          )}


          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <div
                key={answer.id}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all
                  ${selectedAnswer === answer.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}
                  ${showResult && answer.correct ? 'border-green-500 bg-green-50' : ''} `}
                onClick={() => !showResult && handleAnswerSelect(answer.id)} // Disable clicking after checking answer
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center border-2
                    ${selectedAnswer === answer.id ? 'bg-primary border-primary text-white' : 'border-gray-300 text-gray-500'}
                     ${showResult && answer.correct ? 'bg-green-500 border-green-500 text-white' : ''} `}> {/* Highlight correct answer icon container */}
                    {selectedAnswer === answer.id && !showResult && (
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    )}
                     {showResult && answer.correct && (
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                     )}
                  </div>
                  <p className="text-gray-700">{answer.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Bottom Navigation - Check Answer Button */}
      {!showResult && (
          <div className="bg-white p-4 shadow-t">
            <Button
              className={`w-full py-3 rounded-lg font-medium transition-all
                ${selectedAnswer === null ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
              disabled={selectedAnswer === null || isProcessingAction}
              onClick={handleCheckAnswer}
            >
              Check Answer
            </Button>
          </div>
      )}


      {/* Answer Result Modal */}
      {showResult && (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" // Added p-4 for padding on smaller screens
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={(e) => e.stopPropagation()} // Prevent closing by clicking overlay when modal is shown
        >
          <motion.div
             className={`rounded-xl p-6 max-w-sm w-full shadow-xl text-center
                ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`} // Dynamic background based on correctness
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="text-center mb-4">
              {isCorrect ? (
                 <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-3 text-white text-3xl">
                   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                 </div>
              ) : (
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-3 text-white text-3xl">
                   <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </div>
              )}
              <h3 className={`text-lg font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}> {/* Dynamic text color */}
                 {isCorrect ? 'Correct!' : 'Not quite right'}
              </h3>
               <p className="text-gray-700 mt-2">
                   {/* Display explanation if available, otherwise generic feedback */}
                   {currentQuestion.correctAnswerExplanation ? currentQuestion.correctAnswerExplanation : (isCorrect
                       ? "That's right!"
                       : "Let's learn from that.")}
               </p>
            </div>

            {/* Display rewards only if the answer was correct */}
             {isCorrect && (currentQuestionIndex === totalQuestions - 1) && (lesson.coin_reward > 0 || lesson.xp_reward > 0) && ( // Only show rewards if correct and on last question, and there are rewards
                 <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <h4 className="font-medium mb-2 text-gray-800">Lesson Rewards:</h4>
                    <div className="flex justify-around text-sm font-semibold">
                        {lesson.coin_reward > 0 && (
                           <span className="flex items-center text-amber-600">
                              {/* Assuming lucide-circle-dollar-sign is available */}
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24
24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-dollar-sign"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4h-6"/><path d="M12 17.5v-.5"/><path d="M12 6v.5"/></svg>
                             <span className="ml-1">+{lesson.coin_reward} Coins</span>
                           </span>
                        )}
                         {lesson.xp_reward > 0 && (
                             <span className="flex items-center text-green-600">
                                {/* Assuming lucide-star is available */}
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              <span className="ml-1">+{lesson.xp_reward} XP</span>
                           </span>
                        )}
                    </div>
                 </div>
             )}


            <Button
              className="w-full py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90"
              onClick={handleContinue}
              disabled={isProcessingAction} // Disable during processing
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Lesson'}
               {isProcessingAction && '...'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
