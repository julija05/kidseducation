import React from "react";
import { Download } from "lucide-react";
import * as Icons from "lucide-react";
import { RESOURCE_ICONS, RESOURCE_TYPES } from "@/constants/resourceTypes";
import { getResourceTypeColor } from "@/Utils/helpers";
import { useTranslation } from "@/hooks/useTranslation";

// Resource types the learner can pull down as a file.
const DOWNLOADABLE_RESOURCE_TYPES = [
    RESOURCE_TYPES.DOWNLOAD,
    RESOURCE_TYPES.DOCUMENT,
];

/**
 * ResourceItem - Single selectable resource row in the lesson resources sidebar.
 *
 * @param {object} resource - Resource to render
 * @param {boolean} isSelected - Whether this resource is the one being viewed
 * @param {function} onSelect - Called with the resource when the row is clicked
 * @param {function} onDownload - Called with (resource, event) for downloadable types
 */
export default function ResourceItem({
    resource,
    isSelected,
    onSelect,
    onDownload,
}) {
    const { t } = useTranslation();
    const iconConfig = RESOURCE_ICONS[resource.type] || {
        icon: "File",
        color: "text-aba-ink-soft",
    };
    const IconComponent = Icons[iconConfig.icon];
    const isDownloadable = DOWNLOADABLE_RESOURCE_TYPES.includes(resource.type);

    return (
        <div
            className={`border-2 rounded-aba-sm p-3 ${getResourceTypeColor(
                resource.type,
                isSelected
            )}`}
            onClick={() => onSelect(resource)}
        >
            <div className="flex items-start gap-2.5">
                <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-aba-sm bg-aba-surface-alt ${iconConfig.color}`}
                >
                    <IconComponent size={16} />
                </span>
                <div className="flex-1 min-w-0">
                    <h4 className="truncate text-sm font-black text-aba-ink">
                        {resource.translated_title || resource.title}
                    </h4>
                    <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-aba-ink-soft">
                            {resource.type}
                        </span>
                        {resource.is_required && (
                            <span className="rounded-full bg-aba-coral-soft px-2 py-0.5 text-[11px] font-extrabold text-aba-coral-dark">
                                {t('lessons.required')}
                            </span>
                        )}
                    </div>
                    {isDownloadable && (
                        <button
                            onClick={(e) => onDownload(resource, e)}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-aba-sm bg-aba-surface-alt px-2.5 py-1.5 text-xs font-black text-aba-ink-soft transition hover:text-aba-blue"
                        >
                            <Download size={12} />
                            {t('lessons.download')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
