import { useState } from "react";
import { router } from "@inertiajs/react";
import { getCsrfToken } from "@/Utils/helpers";

export default function useLessonProgress(lesson, initialProgress) {
    const [currentProgress, setCurrentProgress] = useState(
        initialProgress?.progress_percentage || 0
    );
    const [isLoading, setIsLoading] = useState(false);

    const startLesson = async () => {
        if (initialProgress?.status === "not_started") {
            setIsLoading(true);

            try {
                const response = await fetch(
                    route("lessons.start", lesson.id),
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": getCsrfToken(),
                            Accept: "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (data.success) {
                    setCurrentProgress(1);
                    router.reload({ only: ["progress"] });
                } else {
                    console.error("Error starting lesson:", data);
                    alert("Error starting lesson. Please try again.");
                }
            } catch (error) {
                console.error("Error starting lesson:", error);
                alert("Error starting lesson. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const updateProgress = async (percentage) => {
        setCurrentProgress(percentage);
        // You can add API call here to update progress on server
    };

    const completeLesson = async (score = null) => {
        setIsLoading(true);

        try {
            console.log('=== API CALL: lessons.complete ===');
            console.log('Lesson ID:', lesson.id);
            console.log('Route URL:', route("lessons.complete", lesson.id));
            console.log('Request body:', JSON.stringify({ score }));
            
            const response = await fetch(route("lessons.complete", lesson.id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({ score }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const data = await response.json();
            
            console.log('=== API RESPONSE ===');
            console.log('Raw response data:', JSON.stringify(data, null, 2));

            if (data.success) {
                setCurrentProgress(100);
                console.log('✅ Lesson completion successful, returning data:', data);
                return data;
            } else {
                console.error("Error completing lesson:", data);
                alert("Error completing lesson. Please try again.");
                return null;
            }
        } catch (error) {
            console.error("Error completing lesson:", error);
            alert("Error completing lesson. Please try again.");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        currentProgress,
        isLoading,
        startLesson,
        updateProgress,
        completeLesson,
    };
}
