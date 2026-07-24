import { Link } from "@inertiajs/react";
import {
    Home,
    BarChart3,
    BookOpen,
    Gamepad2,
    Trophy,
    Award,
    MessageCircle,
    Calculator,
} from "lucide-react";

// Stable identifiers for each sidebar entry, so pages can flag which one is
// active without depending on label text.
export const STUDENT_NAV_KEYS = {
    DASHBOARD: "dashboard",
    PROGRESS: "progress",
    LESSONS: "lessons",
    PRACTICE: "practice",
    CHALLENGES: "challenges",
    ACHIEVEMENTS: "achievements",
    MESSAGES: "messages",
};

// In-page anchors that only exist on the dashboard page.
const DASHBOARD_ANCHOR_EXTRA_TOOLS = "extra-tools";

/**
 * Safely resolve a Ziggy route, returning null when the route is not defined
 * so the caller can hide the related navigation item.
 *
 * @param {string} routeName - Ziggy route name.
 * @param {...*} params - Optional route parameters.
 * @returns {string|null} The resolved URL or null when unavailable.
 */
function safeRoute(routeName, ...params) {
    try {
        if (typeof route === "function" && route().has && !route().has(routeName)) {
            return null;
        }

        return route(routeName, ...params);
    } catch {
        return null;
    }
}

/**
 * Dispatches the global event that opens the abacus simulator modal, which is
 * rendered by AuthenticatedLayout.
 */
export function openAbacusSimulator() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-abacus-simulator"));
    }
}

/**
 * Builds the shared student navigation items.
 *
 * @param {Object} options
 * @param {string} options.active - Active nav key (see STUDENT_NAV_KEYS).
 * @param {string|null} options.lessonsHref - Href for the Lessons entry (null hides it).
 * @param {string|null} options.progressHref - Href for progress-related entries.
 * @param {string|null} options.dashboardHref - Href for the Dashboard entry.
 * @returns {Array} Navigation item descriptors.
 */
function buildNavItems({ active, lessonsHref, progressHref, dashboardHref }) {
    const onDashboard = active === STUDENT_NAV_KEYS.DASHBOARD;

    // Practice lives in a dashboard section; link to the anchor in-page when on
    // the dashboard, otherwise navigate back to the dashboard at that anchor.
    const practiceHref = dashboardHref
        ? onDashboard
            ? `#${DASHBOARD_ANCHOR_EXTRA_TOOLS}`
            : `${dashboardHref}#${DASHBOARD_ANCHOR_EXTRA_TOOLS}`
        : null;

    return [
        { key: STUDENT_NAV_KEYS.DASHBOARD, label: "Dashboard", icon: Home, href: dashboardHref },
        { key: STUDENT_NAV_KEYS.PROGRESS, label: "My Progress", icon: BarChart3, href: progressHref },
        { key: STUDENT_NAV_KEYS.LESSONS, label: "Lessons", icon: BookOpen, href: lessonsHref },
        { key: STUDENT_NAV_KEYS.PRACTICE, label: "Practice", icon: Gamepad2, href: practiceHref },
        { key: STUDENT_NAV_KEYS.CHALLENGES, label: "Challenges", icon: Trophy, href: progressHref },
        { key: STUDENT_NAV_KEYS.ACHIEVEMENTS, label: "Achievements", icon: Award, href: progressHref },
        { key: STUDENT_NAV_KEYS.MESSAGES, label: "Messages", icon: MessageCircle, href: safeRoute("meetings.index") },
    ].filter((item) => item.href);
}

/**
 * StudentShell - Shared chrome (desktop sidebar + mobile nav + main container)
 * for the student dashboard and its sub-pages (Lessons, My Progress). Keeping
 * this in one place means every student page shares the same navigation.
 *
 * @param {Object} props
 * @param {Object} props.student - Authenticated student user.
 * @param {number} props.progress - Overall program progress percentage.
 * @param {boolean} props.isMentalArithmetic - Whether the abacus tool is available.
 * @param {string} props.active - Active nav key (see STUDENT_NAV_KEYS).
 * @param {string|null} [props.lessonsHref] - Override for the Lessons href.
 * @param {React.ReactNode} props.children - Page content.
 */
export default function StudentShell({
    student,
    progress = 0,
    isMentalArithmetic = false,
    active,
    lessonsHref,
    children,
}) {
    const navItems = buildNavItems({
        active,
        lessonsHref: lessonsHref === undefined ? safeRoute("lessons.index") : lessonsHref,
        progressHref: safeRoute("progress.index"),
        dashboardHref: safeRoute("dashboard"),
    });

    return (
        <div className="min-h-screen">
            <StudentSidebar
                student={student}
                progress={progress}
                isMentalArithmetic={isMentalArithmetic}
                navItems={navItems}
                active={active}
            />

            <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:pl-[282px] lg:pr-6">
                <div className="mx-auto max-w-[1120px] space-y-4">
                    <StudentMobileNav
                        navItems={navItems}
                        active={active}
                        isMentalArithmetic={isMentalArithmetic}
                    />
                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * StudentSidebar - Fixed desktop navigation rail.
 */
function StudentSidebar({ student, progress, isMentalArithmetic, navItems, active }) {
    return (
        <aside className="hidden border-r border-aba-line bg-aba-surface lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:flex lg:h-screen lg:min-h-screen lg:w-[250px] lg:flex-col lg:overflow-y-auto lg:p-5">
            <div className="shrink-0">
                <Link
                    href={safeRoute("landing.index") || safeRoute("dashboard") || "#"}
                    className="flex items-center px-2 py-3 font-display text-xl font-bold text-aba-ink transition hover:text-aba-blue"
                >
                    Abacoding
                </Link>
            </div>

            <nav className="mt-7 shrink-0 space-y-1.5" aria-label="Student dashboard sections">
                {navItems.map((item) => (
                    <a
                        key={item.key}
                        href={item.href}
                        aria-current={item.key === active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-aba-sm px-3 py-2.5 text-sm font-bold transition ${
                            item.key === active
                                ? "bg-aba-blue-soft text-aba-blue"
                                : "text-aba-ink-soft hover:bg-aba-surface-alt hover:text-aba-blue"
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </a>
                ))}
            </nav>

            <button
                type="button"
                onClick={openAbacusSimulator}
                disabled={!isMentalArithmetic}
                className="mt-6 flex shrink-0 items-center gap-3 rounded-aba-md border border-dashed border-aba-coral bg-aba-coral-soft px-4 py-4 text-left text-aba-coral-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:border-aba-line disabled:bg-aba-surface-alt disabled:text-aba-ink-faint"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-aba-sm bg-aba-surface text-aba-coral shadow-aba-sm">
                    <Calculator className="h-5 w-5" />
                </span>
                <span>
                    <span className="block text-sm font-black">Open Abacus</span>
                    <span className="block text-xs font-semibold">
                        {isMentalArithmetic ? "Practice tool" : "Available in Mental Arithmetic"}
                    </span>
                </span>
            </button>

            <div className="mt-auto shrink-0 rounded-aba-md bg-aba-surface-alt p-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-aba-sm bg-aba-surface text-xl font-black text-aba-blue shadow-aba-sm">
                        {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-black text-aba-ink">{student?.name || "Student"}</p>
                        <p className="text-xs font-semibold text-aba-ink-soft">{Math.round(progress)}% complete</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

/**
 * StudentMobileNav - Horizontal scrollable nav shown on small screens.
 */
function StudentMobileNav({ navItems, active, isMentalArithmetic }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Student dashboard navigation">
            {navItems.map((item) => (
                <a
                    key={item.key}
                    href={item.href}
                    aria-current={item.key === active ? "page" : undefined}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-aba-sm px-4 py-2.5 text-sm font-black ${
                        item.key === active ? "bg-aba-blue text-white" : "bg-aba-surface text-aba-ink-soft"
                    }`}
                    onClick={
                        item.key === STUDENT_NAV_KEYS.PRACTICE && isMentalArithmetic
                            ? (event) => {
                                  event.preventDefault();
                                  openAbacusSimulator();
                              }
                            : undefined
                    }
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </a>
            ))}
        </div>
    );
}
