import React from "react";
import { BookOpen } from "lucide-react";
import ResourceItem from "./ResourceItem";
import { Card, CardHead, CardTitle } from "@/Components/StudentDashboard";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * ResourcesSidebar - Lists every resource attached to the lesson.
 *
 * @param {Array} resources - Lesson resources
 * @param {object} selectedResource - Resource currently being viewed
 * @param {function} onResourceSelect - Called with the resource to view
 * @param {function} onResourceDownload - Called with (resource, event) to download
 */
export default function ResourcesSidebar({
    resources,
    selectedResource,
    onResourceSelect,
    onResourceDownload,
}) {
    const { t } = useTranslation();
    const resourceCount = resources?.length || 0;
    const hasResources = resourceCount > 0;

    return (
        <Card as="aside" className="p-5">
            <CardHead>
                <CardTitle icon={<BookOpen className="h-4 w-4" />}>
                    {t('lessons.resources')}
                </CardTitle>
                <span className="ml-auto shrink-0 rounded-[20px] bg-aba-surface-alt px-2.5 py-1 text-[11.5px] font-extrabold text-aba-ink-faint">
                    {hasResources
                        ? t('lessons.resources_item_count', { count: resourceCount })
                        : t('lessons.resources_empty')}
                </span>
            </CardHead>

            {hasResources ? (
                <div className="space-y-2">
                    {resources.map((resource) => (
                        <ResourceItem
                            key={resource.id}
                            resource={resource}
                            isSelected={selectedResource?.id === resource.id}
                            onSelect={onResourceSelect}
                            onDownload={onResourceDownload}
                        />
                    ))}
                </div>
            ) : (
                <div className="px-3 pb-2 pt-6 text-center">
                    <span className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-aba-surface-alt text-aba-ink-faint">
                        <BookOpen className="h-[22px] w-[22px]" />
                    </span>
                    <p className="mb-1.5 text-[13.5px] font-extrabold text-aba-ink">
                        {t('lessons.no_resources_yet')}
                    </p>
                    <p className="text-xs font-bold leading-relaxed text-aba-ink-faint">
                        {t('lessons.no_resources_sidebar_hint')}
                    </p>
                </div>
            )}
        </Card>
    );
}
