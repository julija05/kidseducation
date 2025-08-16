import React from "react";
import ResourceViewer from "./Resources/Viewers/ResourceViewer";
import ResourcesSidebar from "./Resources/ResourcesSidebar";
import LessonActions from "./LessonActions";
import QuizList from "./QuizList";
import { motion } from "framer-motion";

export default function LessonContent({
    lesson,
    selectedResource,
    currentProgress,
    isLoading,
    onResourceSelect,
    onResourceDownload,
    onUpdateProgress,
    onCompleteLesson,
}) {
    return (
        <motion.div 
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            {/* Modern Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
                {/* Modern Resource Viewer */}
                <motion.div 
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                >
                    <ResourceViewer
                        selectedResource={selectedResource}
                        onDownload={onResourceDownload}
                    />
                </motion.div>

                {/* Modern Lesson Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <LessonActions
                        currentProgress={currentProgress}
                        isLoading={isLoading}
                        onUpdateProgress={onUpdateProgress}
                        onCompleteLesson={onCompleteLesson}
                    />
                </motion.div>

                {/* Modern Quizzes Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <QuizList quizzes={lesson.quizzes} />
                </motion.div>
            </div>

            {/* Modern Resources Sidebar */}
            <motion.div 
                className="lg:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
            >
                <div className="sticky top-6">
                    <ResourcesSidebar
                        resources={lesson.resources}
                        selectedResource={selectedResource}
                        onResourceSelect={onResourceSelect}
                        onResourceDownload={onResourceDownload}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
