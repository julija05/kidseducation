import React from 'react';
import { Link } from '@inertiajs/react';
import { Play, Clock, Award, Users, FileQuestion } from 'lucide-react';
import { Card, CardHead, CardTitle } from '@/Components/StudentDashboard';

// Emoji shown next to each quiz depending on its type.
const QUIZ_TYPE_EMOJIS = {
    mental_arithmetic: '🧮',
    multiple_choice: '✅',
    text_answer: '✏️',
    true_false: '❓',
    mixed: '📝',
};

const DEFAULT_QUIZ_EMOJI = '📝';

/**
 * QuizList - Renders the quizzes attached to a lesson.
 *
 * @param {Array} quizzes - Quizzes to display
 */
export default function QuizList({ quizzes = [] }) {
    if (!quizzes || quizzes.length === 0) {
        return null;
    }

    const getQuizTypeEmoji = (type) => QUIZ_TYPE_EMOJIS[type] || DEFAULT_QUIZ_EMOJI;

    return (
        <Card as="section" className="p-5">
            <CardHead>
                <CardTitle
                    icon={<FileQuestion className="h-4 w-4" />}
                    iconBg="bg-aba-purple-soft"
                    iconColor="text-aba-purple"
                >
                    Quizzes ({quizzes.length})
                </CardTitle>
            </CardHead>

            <div className="grid gap-3">
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.id}
                        className="rounded-aba-md border border-aba-line bg-aba-surface-alt p-4 transition hover:shadow-aba-sm"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-2xl">{getQuizTypeEmoji(quiz.type)}</span>
                                    <h4 className="text-lg font-black text-aba-ink">
                                        {quiz.title}
                                    </h4>
                                    <span className="rounded-full bg-aba-purple-soft px-2.5 py-0.5 text-xs font-extrabold text-aba-purple">
                                        {quiz.type_display}
                                    </span>
                                </div>

                                {quiz.description && (
                                    <p className="mt-2 text-sm font-medium text-aba-ink-soft">{quiz.description}</p>
                                )}

                                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-aba-ink-soft">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-aba-blue" />
                                        {quiz.total_questions} questions
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Award className="h-4 w-4 text-aba-yellow" />
                                        {quiz.total_points} points
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-black text-aba-ink">Pass:</span>
                                        {quiz.passing_score}%
                                    </span>
                                    {quiz.formatted_time_limit && (
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-aba-green" />
                                            {quiz.formatted_time_limit}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={route('student.quiz.show', quiz.id)}
                                className="inline-flex shrink-0 items-center gap-2 rounded-aba-sm bg-aba-purple px-4 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-aba-purple focus:ring-offset-2"
                            >
                                <Play className="h-4 w-4" />
                                Take Quiz
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
