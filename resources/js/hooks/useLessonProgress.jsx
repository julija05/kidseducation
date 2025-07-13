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
            const response = await fetch(route("lessons.complete", lesson.id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({ score }),
            });

            const data = await response.json();

            if (data.success) {
                setCurrentProgress(100);
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
