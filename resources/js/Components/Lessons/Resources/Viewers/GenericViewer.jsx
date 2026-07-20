import React from "react";
import * as Icons from "lucide-react";
import { getResourceAccentStyles } from "@/constants/resourceTypes";

/**
 * GenericViewer - Placeholder viewer used for resource types that cannot be
 * embedded (downloads, links, quizzes, interactive content).
 *
 * @param {object} resource - Resource being shown
 * @param {string} type - Resource type, used to pick the accent colour
 * @param {object} config - Icon name and the action element rendered under the text
 */
export default function GenericViewer({ resource, type, config }) {
    const IconComponent = Icons[config.icon];
    const accent = getResourceAccentStyles(type);

    return (
        <div
            className={`flex h-[400px] items-center justify-center rounded-aba-md border-2 border-dashed ${accent.border} ${accent.softBg}`}
        >
            <div className="text-center">
                <IconComponent
                    size={64}
                    className={`mx-auto mb-4 ${accent.text}`}
                />
                <h3 className="mb-2 font-display text-xl font-black text-aba-ink">
                    {resource.title}
                </h3>
                {resource.description && (
                    <p className="mb-4 text-sm font-medium text-aba-ink-soft">
                        {resource.description}
                    </p>
                )}
                {config.action}
            </div>
        </div>
    );
}
