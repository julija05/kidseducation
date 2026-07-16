import { useState } from "react";

/**
 * TabGroup - Generic tabbed panel switcher component
 *
 * Used for Schedule/Activity on Dashboard and topic tabs on Lessons page.
 *
 * @param {Array<{ id: string, label: string }>} tabs - Array of tab definitions
 * @param {string} activeTab - Currently active tab ID
 * @param {function} onTabChange - Callback when tab changes
 * @param {string} className - Additional CSS classes
 */
export default function TabGroup({ tabs, activeTab, onTabChange, className = "" }) {
    return (
        <div
            className={`flex gap-[6px] bg-aba-surface-alt p-1 rounded-aba-sm ${className}`}
            role="tablist"
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        border-none bg-transparent
                        font-body font-extrabold text-[12.5px]
                        py-[7px] px-[13px]
                        rounded-[9px]
                        cursor-pointer
                        transition-all duration-150
                        focus:outline-none focus:ring-2 focus:ring-aba-blue focus:ring-offset-1
                        ${
                            activeTab === tab.id
                                ? "bg-aba-surface text-aba-ink shadow-aba-sm"
                                : "text-aba-ink-faint hover:text-aba-ink-soft"
                        }
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

/**
 * TabPanel - Container for tab content, shows/hides based on active state
 *
 * @param {string} id - Panel ID (matches tab id)
 * @param {boolean} active - Whether this panel is currently visible
 * @param {React.ReactNode} children - Panel content
 */
export function TabPanel({ id, active, children }) {
    return (
        <div
            id={`panel-${id}`}
            role="tabpanel"
            aria-hidden={!active}
            className={active ? "flex flex-col gap-[10px]" : "hidden"}
        >
            {children}
        </div>
    );
}

/**
 * Custom hook for managing tab state
 *
 * @param {string} defaultTab - Default active tab ID
 * @returns {[string, function]} - [activeTab, setActiveTab]
 */
export function useTabs(defaultTab) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    return [activeTab, setActiveTab];
}
