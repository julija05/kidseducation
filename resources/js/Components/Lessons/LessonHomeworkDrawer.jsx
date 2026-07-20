import React, { useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    Calendar,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    HelpCircle,
    Users,
    X,
} from "lucide-react";
import { Chip } from "@/Components/StudentDashboard";

/**
 * Student-facing homework statuses, mirroring the PHP constants on
 * App\Models\HomeworkAssignmentStatus so the two stay in step.
 */
export const HOMEWORK_STATUS = {
    NOT_STARTED: "not_started",
    COMPLETED: "completed",
    NEEDS_HELP: "needs_help",
};

/**
 * Chip colour per student status. `not_started` deliberately has no variant: it
 * renders as a neutral outline chip, which Chip does not provide a colour for.
 */
const STATUS_CHIP_VARIANTS = {
    [HOMEWORK_STATUS.COMPLETED]: "green",
    [HOMEWORK_STATUS.NEEDS_HELP]: "yellow",
};

// Instructions longer than this are truncated in the drawer.
const MAX_INSTRUCTION_LENGTH = 180;

/**
 * HomeworkTrigger - Topbar button that opens the homework drawer.
 *
 * Renders nothing when there is no homework, so the lesson topbar stays clean
 * for lessons without assignments.
 *
 * @param {number} count - Number of assignments for this lesson
 * @param {function} onClick - Called to open the drawer
 */
export function HomeworkTrigger({ count, onClick }) {
    if (!count) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-haspopup="dialog"
            className="relative flex shrink-0 items-center gap-2 rounded-full bg-aba-green-soft py-2.5 pl-3 pr-4 text-sm font-black text-aba-green transition hover:brightness-95"
        >
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Homework</span>
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-aba-surface bg-aba-coral text-[10.5px] font-black text-white">
                {count}
            </span>
        </button>
    );
}

/**
 * LessonHomeworkDrawer - Slide-out panel listing the homework assigned with a
 * lesson, with per-assignment status actions and practice tasks.
 *
 * @param {Array} assignments - Homework assignments for the lesson
 * @param {boolean} isOpen - Whether the drawer is visible
 * @param {function} onClose - Called to dismiss the drawer
 */
export default function LessonHomeworkDrawer({ assignments = [], isOpen, onClose }) {
    // Close on Escape and lock background scrolling while the drawer is open.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const updateHomeworkStatus = (assignment, status) => {
        router.patch(
            route("dashboard.homework.status", assignment.id),
            { status },
            { preserveScroll: true }
        );
    };

    const markPracticeTaskDone = (task) => {
        router.patch(
            route("dashboard.homework.practice-tasks.done", task.id),
            {},
            { preserveScroll: true }
        );
    };

    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-aba-ink/35 transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden="true"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="lesson-homework-title"
                aria-hidden={!isOpen}
                className={`fixed bottom-0 right-0 top-0 z-50 flex w-[min(460px,92vw)] flex-col bg-aba-bg shadow-[-14px_0_40px_rgba(27,42,74,0.18)] transition-transform duration-[250ms] ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-aba-line bg-aba-surface px-5 py-4">
                    <span
                        id="lesson-homework-title"
                        className="inline-flex items-center gap-2 rounded-full bg-aba-green-soft px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-aba-green"
                    >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Lesson homework
                    </span>
                    <span className="rounded-full bg-aba-blue-soft px-3.5 py-1.5 text-xs font-black text-aba-blue">
                        {assignments.length} assigned
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close homework panel"
                        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aba-surface-alt text-aba-ink-soft transition hover:text-aba-ink"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="flex-1 space-y-3.5 overflow-y-auto px-5 pb-8 pt-5">
                    {assignments.map((assignment) => (
                        <HomeworkItem
                            key={assignment.id}
                            assignment={assignment}
                            onUpdateStatus={updateHomeworkStatus}
                            onPracticeTaskDone={markPracticeTaskDone}
                        />
                    ))}
                </div>
            </aside>
        </>
    );
}

/**
 * HomeworkItem - One assignment: title, status, meta facts, tasks and actions.
 *
 * @param {object} assignment - Assignment to render
 * @param {function} onUpdateStatus - Called with (assignment, status)
 * @param {function} onPracticeTaskDone - Called with the task to mark done
 */
function HomeworkItem({ assignment, onUpdateStatus, onPracticeTaskDone }) {
    const isCompleted = assignment.student_status === HOMEWORK_STATUS.COMPLETED;
    const chipVariant = STATUS_CHIP_VARIANTS[assignment.student_status];
    const statusLabel = assignment.student_status_label || assignment.status;

    return (
        <article className="rounded-aba-md bg-aba-surface-alt p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-[15px] font-black text-aba-ink">{assignment.title}</h3>
                    <p className="mt-0.5 text-[12.5px] font-bold text-aba-ink-faint">
                        {shortInstruction(assignment.instructions)}
                    </p>
                </div>
                {chipVariant ? (
                    <Chip variant={chipVariant}>{statusLabel}</Chip>
                ) : (
                    <span className="shrink-0 whitespace-nowrap rounded-[20px] border-[1.5px] border-aba-line bg-aba-surface px-[10px] py-[5px] text-[11px] font-extrabold text-aba-ink-faint">
                        {statusLabel}
                    </span>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
                <HomeworkMeta
                    icon={Clock}
                    label="Practice time"
                    value={assignment.estimated_practice_time}
                    iconClassName="bg-aba-blue-soft text-aba-blue"
                />
                <HomeworkMeta
                    icon={Calendar}
                    label="Due date"
                    value={assignment.due_date}
                    iconClassName="bg-aba-coral-soft text-aba-coral-dark"
                />
                <HomeworkMeta
                    icon={Users}
                    label="Group"
                    value={assignment.group?.name}
                    iconClassName="bg-aba-purple-soft text-aba-purple"
                />
            </div>

            <PracticeTaskList
                tasks={assignment.practice_tasks || []}
                onDone={onPracticeTaskDone}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {isCompleted ? (
                    <span className="inline-flex items-center gap-2 rounded-[10px] bg-aba-green-soft px-3.5 py-2 text-[12.5px] font-black text-aba-green">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                    </span>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => onUpdateStatus(assignment, HOMEWORK_STATUS.COMPLETED)}
                            className="inline-flex items-center gap-2 rounded-[10px] bg-aba-coral px-3.5 py-2 text-[12.5px] font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark Completed
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdateStatus(assignment, HOMEWORK_STATUS.NEEDS_HELP)}
                            disabled={assignment.student_status === HOMEWORK_STATUS.NEEDS_HELP}
                            className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-aba-yellow-soft bg-aba-yellow-soft px-3.5 py-2 text-[12.5px] font-black text-[#B9790A] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <HelpCircle className="h-3.5 w-3.5" />
                            I need help
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}

/**
 * PracticeTaskList - Checklist of practice tasks belonging to an assignment.
 *
 * Tasks can only be marked done: the backend exposes no "undo" route, so a
 * completed task renders as a static done row rather than a toggle.
 *
 * @param {Array} tasks - Practice tasks
 * @param {function} onDone - Called with the task to mark done
 */
function PracticeTaskList({ tasks, onDone }) {
    if (!tasks.length) {
        return null;
    }

    return (
        <div className="mt-4">
            <p className="mb-2 text-[10.5px] font-black uppercase tracking-wide text-aba-ink-faint">
                Practice tasks
            </p>
            <div className="space-y-2">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center gap-3 rounded-aba-sm bg-aba-surface px-3.5 py-2.5"
                    >
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                task.is_done
                                    ? "border-aba-green bg-aba-green text-white"
                                    : "border-aba-line text-transparent"
                            }`}
                        >
                            <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span
                            className={`flex-1 text-[13.5px] font-bold ${
                                task.is_done
                                    ? "text-aba-ink-soft line-through decoration-aba-line"
                                    : "text-aba-ink"
                            }`}
                        >
                            {task.prompt}
                        </span>
                        {task.is_done ? (
                            <span className="shrink-0 rounded-[20px] bg-aba-green-soft px-3 py-1.5 text-[11.5px] font-black text-aba-green">
                                Done
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onDone(task)}
                                className="shrink-0 rounded-[20px] border-[1.5px] border-aba-line bg-aba-surface px-3 py-1.5 text-[11.5px] font-black text-aba-ink-soft transition hover:text-aba-ink"
                            >
                                Mark done
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * HomeworkMeta - Single labelled fact tile (practice time, due date, group).
 *
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} label - Fact label
 * @param {string} value - Fact value, shown as "Not set" when empty
 * @param {string} iconClassName - Accent classes for the icon tile
 */
function HomeworkMeta({ icon: Icon, label, value, iconClassName }) {
    return (
        <div className="flex min-w-[150px] flex-1 items-center gap-2.5 rounded-[13px] bg-aba-surface px-3.5 py-2.5">
            <span
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] ${iconClassName}`}
            >
                <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-aba-ink-faint">
                    {label}
                </p>
                <p className="mt-px truncate text-[13px] font-black text-aba-ink">
                    {value || "Not set"}
                </p>
            </div>
        </div>
    );
}

/**
 * Truncates long assignment instructions for the drawer summary.
 *
 * @param {string} value - Raw instructions
 * @returns {string}
 */
function shortInstruction(value) {
    if (!value) {
        return "No instructions added yet.";
    }

    const text = String(value).trim();

    return text.length > MAX_INSTRUCTION_LENGTH
        ? `${text.slice(0, MAX_INSTRUCTION_LENGTH - 3)}...`
        : text;
}
