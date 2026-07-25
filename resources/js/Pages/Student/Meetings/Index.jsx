import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    MessageCircle,
    User,
    Video,
    XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
    Card,
    StudentShell,
    STUDENT_NAV_KEYS,
    isMentalArithmeticProgram,
} from "@/Components/StudentDashboard";

// Visual style + label for each participant response status. Kept as literal
// Tailwind class strings so the compiler can see every class name.
const STATUS_BADGES = {
    confirmed: { className: "bg-aba-green-soft text-aba-green", label: "Confirmed" },
    declined: { className: "bg-aba-coral-soft text-aba-coral-dark", label: "Declined" },
    attended: { className: "bg-aba-blue-soft text-aba-blue", label: "Attended" },
    missed: { className: "bg-aba-yellow-soft text-aba-yellow", label: "Missed" },
    invited: { className: "bg-aba-yellow-soft text-aba-yellow", label: "Awaiting your reply" },
};

// Fallback badge for any unexpected status value.
const DEFAULT_STATUS_BADGE = STATUS_BADGES.invited;

// Visual style + label for the meeting format (individual vs. group session).
const MEETING_TYPE_BADGES = {
    individual: { className: "bg-aba-blue-soft text-aba-blue", label: "1-on-1" },
    group: { className: "bg-aba-purple-soft text-aba-purple", label: "Group" },
};

// The status a participant has before they respond to an invitation.
const INVITED_STATUS = "invited";

/**
 * Resolves the badge descriptor for a participant status, falling back to the
 * "awaiting reply" style for unknown values.
 *
 * @param {string} status - Participant response status.
 * @returns {{className: string, label: string}}
 */
function getStatusBadge(status) {
    return STATUS_BADGES[status] || DEFAULT_STATUS_BADGE;
}

/**
 * Resolves the badge descriptor for a meeting type, defaulting to the group
 * style when the type is unrecognised.
 *
 * @param {string} type - Meeting type ("individual" | "group").
 * @returns {{className: string, label: string}}
 */
function getMeetingTypeBadge(type) {
    return MEETING_TYPE_BADGES[type] || MEETING_TYPE_BADGES.group;
}

/**
 * Formats a date value as a long, human-friendly day (e.g. "Monday, July 27").
 *
 * @param {string|Date} date - Parseable date value.
 * @returns {string}
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

/**
 * Formats a date value as a short local time (e.g. "14:30").
 *
 * @param {string|Date} date - Parseable date value.
 * @returns {string}
 */
function formatTime(date) {
    return new Date(date).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Clamps a numeric value into the 0-100 percentage range for the shell.
 *
 * @param {number} value
 * @returns {number}
 */
function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

/**
 * MessagesIndex - Student "Messages" page.
 *
 * For now Messages is dedicated to the meetings a mentor has arranged with the
 * student: upcoming invitations the student can confirm or decline, plus a
 * short history of past sessions. The page shares the dashboard shell and the
 * `aba-*` design system so it matches the rest of the student experience.
 *
 * @param {Array} upcomingMeetings - Pending/confirmed future meeting participations.
 * @param {Array} pastMeetings - Recent past meeting participations.
 * @param {Object|null} enrolledProgram - Formatted program data (for shell theme).
 */
export default function MessagesIndex({
    upcomingMeetings = [],
    pastMeetings = [],
    enrolledProgram = null,
}) {
    const { auth } = usePage().props;
    const student = auth?.user;

    const progress = clampPercent(enrolledProgram?.progress);
    const isMentalArithmetic = isMentalArithmeticProgram(enrolledProgram);

    return (
        <AuthenticatedLayout
            programConfig={enrolledProgram?.theme}
            abacusPlacement="dashboard"
            hideHeader
        >
            <Head title="Messages" />

            <StudentShell
                student={student}
                progress={progress}
                isMentalArithmetic={isMentalArithmetic}
                active={STUDENT_NAV_KEYS.MESSAGES}
            >
                <MessagesHeader upcomingCount={upcomingMeetings.length} />

                <UpcomingMeetings meetings={upcomingMeetings} />

                {pastMeetings.length > 0 && <PastMeetings meetings={pastMeetings} />}
            </StudentShell>
        </AuthenticatedLayout>
    );
}

/**
 * MessagesHeader - Page title with a short explanation of what Messages shows.
 */
function MessagesHeader({ upcomingCount }) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-black uppercase tracking-wide text-aba-blue">Messages</p>
                <h1 className="mt-1 font-display text-3xl font-black leading-tight text-aba-ink">
                    Messages 💬
                </h1>
                <p className="mt-1 text-sm font-medium text-aba-ink-soft">
                    Meetings your mentor has arranged with you.
                </p>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-aba-sm bg-aba-surface px-4 py-2.5 text-sm font-bold text-aba-ink-soft shadow-aba-sm sm:self-auto">
                <MessageCircle className="h-4 w-4 text-aba-blue" />
                {upcomingCount} upcoming
            </span>
        </header>
    );
}

/**
 * UpcomingMeetings - Section listing future meeting invitations as message-style
 * cards, each with the mentor, schedule details and confirm/decline actions.
 */
function UpcomingMeetings({ meetings }) {
    return (
        <section className="space-y-3">
            <h2 className="font-display text-lg font-black text-aba-ink">Upcoming</h2>

            {meetings.length > 0 ? (
                <div className="space-y-4">
                    {meetings.map((item, index) => (
                        <UpcomingMeetingCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            ) : (
                <EmptyUpcoming />
            )}
        </section>
    );
}

/**
 * UpcomingMeetingCard - A single upcoming meeting invitation.
 */
function UpcomingMeetingCard({ item, index }) {
    const [isResponding, setIsResponding] = useState(false);

    const meeting = item.meeting;
    const typeBadge = getMeetingTypeBadge(meeting.meeting_type);
    const statusBadge = getStatusBadge(item.status);
    const mentorName = meeting.mentor?.name || "Your mentor";
    const canRespond = item.status === INVITED_STATUS;

    /**
     * Confirms attendance for this meeting invitation.
     */
    const handleConfirm = () => {
        setIsResponding(true);
        router.post(
            route("meetings.confirm", item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsResponding(false),
            }
        );
    };

    /**
     * Declines this meeting invitation after a confirmation prompt.
     */
    const handleDecline = () => {
        if (!confirm("Are you sure you want to decline this meeting?")) {
            return;
        }

        setIsResponding(true);
        router.post(
            route("meetings.decline", item.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsResponding(false),
            }
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
        >
            <Card className="flex flex-col gap-4">
                {/* Mentor + status row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aba-blue-soft text-base font-black text-aba-blue">
                            {mentorName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-aba-ink">{mentorName}</p>
                            <p className="text-xs font-semibold text-aba-ink-soft">
                                arranged a meeting with you
                            </p>
                        </div>
                    </div>
                    <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusBadge.className}`}
                    >
                        {statusBadge.label}
                    </span>
                </div>

                {/* Title + type */}
                <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${typeBadge.className}`}
                        >
                            {typeBadge.label}
                        </span>
                    </div>
                    <h3 className="font-display text-lg font-black text-aba-ink">{meeting.title}</h3>
                    {meeting.description && (
                        <p className="mt-1 text-sm font-medium text-aba-ink-soft">
                            {meeting.description}
                        </p>
                    )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-2.5 rounded-aba-md bg-aba-surface-alt p-4 sm:grid-cols-2">
                    <DetailRow icon={Calendar}>{formatDate(meeting.scheduled_at)}</DetailRow>
                    <DetailRow icon={Clock}>
                        {formatTime(meeting.scheduled_at)} · {meeting.duration_minutes} min
                    </DetailRow>
                    <DetailRow icon={User}>{mentorName}</DetailRow>
                    {meeting.meeting_url && (
                        <DetailRow icon={Video}>
                            <a
                                href={meeting.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-aba-blue hover:underline"
                            >
                                Join online
                            </a>
                        </DetailRow>
                    )}
                    {meeting.location && <DetailRow icon={MapPin}>{meeting.location}</DetailRow>}
                </div>

                {item.response_note && (
                    <p className="rounded-aba-sm bg-aba-surface-alt px-3 py-2 text-sm text-aba-ink-soft">
                        <span className="font-bold">Your note: </span>
                        {item.response_note}
                    </p>
                )}

                {/* Actions */}
                {canRespond && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isResponding}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-aba-sm bg-aba-green px-4 py-2.5 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Confirm
                        </button>
                        <button
                            type="button"
                            onClick={handleDecline}
                            disabled={isResponding}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-aba-sm border border-aba-line bg-aba-surface px-4 py-2.5 text-sm font-black text-aba-coral-dark transition hover:bg-aba-coral-soft disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <XCircle className="h-4 w-4" />
                            Decline
                        </button>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

/**
 * DetailRow - Icon + text line used inside a meeting's details panel.
 */
function DetailRow({ icon: Icon, children }) {
    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-aba-ink">
            <Icon className="h-4 w-4 shrink-0 text-aba-blue" />
            <span className="min-w-0 truncate">{children}</span>
        </div>
    );
}

/**
 * PastMeetings - Compact history list of the student's recent past meetings.
 */
function PastMeetings({ meetings }) {
    return (
        <section className="space-y-3">
            <h2 className="font-display text-lg font-black text-aba-ink">Past</h2>
            <Card className="space-y-2 p-4">
                {meetings.map((item) => {
                    const typeBadge = getMeetingTypeBadge(item.meeting.meeting_type);
                    const statusBadge = getStatusBadge(item.status);

                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-aba-sm bg-aba-surface-alt px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-aba-ink">
                                    {item.meeting.title}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-aba-ink-soft">
                                    <span>{formatDate(item.meeting.scheduled_at)}</span>
                                    <span>{item.meeting.mentor_name}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${typeBadge.className}`}
                                    >
                                        {typeBadge.label}
                                    </span>
                                </div>
                            </div>
                            <span
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusBadge.className}`}
                            >
                                {statusBadge.label}
                            </span>
                        </div>
                    );
                })}
            </Card>
        </section>
    );
}

/**
 * EmptyUpcoming - Friendly empty state when no meetings are scheduled.
 */
function EmptyUpcoming() {
    return (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-aba-blue-soft text-aba-blue">
                <MessageCircle className="h-7 w-7" />
            </span>
            <div>
                <p className="font-display text-lg font-black text-aba-ink">No messages yet</p>
                <p className="mt-1 text-sm font-medium text-aba-ink-soft">
                    When your mentor arranges a meeting, you'll see the invitation here.
                </p>
            </div>
        </Card>
    );
}
