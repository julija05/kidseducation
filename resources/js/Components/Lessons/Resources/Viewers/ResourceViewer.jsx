import React from "react";
import { router } from "@inertiajs/react";
import {
    BookOpen,
    Download,
    ExternalLink,
    Calculator,
    Trophy,
    File,
} from "lucide-react";
import VideoViewer from "./VideoViewer";
import DocumentViewer from "./DocumentViewer";
import GenericViewer from "./GenericViewer";
import { RESOURCE_TYPES } from "@/constants/resourceTypes";
import { useTranslation } from "@/hooks/useTranslation";

const VIEWER_CONFIGS = {
    [RESOURCE_TYPES.DOWNLOAD]: { icon: "Download" },
    [RESOURCE_TYPES.INTERACTIVE]: { icon: "Calculator" },
    [RESOURCE_TYPES.QUIZ]: { icon: "Trophy" },
    [RESOURCE_TYPES.LINK]: { icon: "ExternalLink" },
};

/**
 * ResourceViewer - Renders the currently selected resource, or the appropriate
 * empty state.
 *
 * A lesson with no resources at all is a different situation from one where the
 * student simply has nothing selected yet, so the two get distinct messages:
 * prompting someone to "choose a resource" is misleading when there is nothing
 * to choose.
 *
 * @param {object} selectedResource - Resource currently being viewed
 * @param {function} onDownload - Called with (resource, event) to download
 * @param {boolean} hasResources - Whether the lesson has any resources at all
 */
export default function ResourceViewer({ selectedResource, onDownload, hasResources = true }) {
    const { t } = useTranslation();

    if (!hasResources) {
        return (
            <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center px-8 py-10 text-center">
                <span className="mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-aba-surface-alt text-[34px]">
                    📼
                </span>
                <h3 className="mb-2 font-display text-xl font-black text-aba-ink">
                    {t('lessons.no_resources_available')}
                </h3>
                <p className="mb-5 max-w-[380px] text-sm font-medium leading-relaxed text-aba-ink-soft">
                    {t('lessons.no_resources_viewer_hint')}
                </p>
                <button
                    type="button"
                    onClick={() => router.visit(route("dashboard"))}
                    className="inline-flex items-center gap-2 rounded-aba-sm border-[1.5px] border-aba-line bg-aba-surface px-5 py-3 text-sm font-black text-aba-ink transition hover:bg-aba-surface-alt"
                >
                    {t('lessons.back_to_lessons')}
                </button>
            </div>
        );
    }

    if (!selectedResource) {
        return (
            <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aba-surface-alt text-aba-blue">
                        <BookOpen size={32} />
                    </span>
                    <h3 className="mb-2 font-display text-xl font-black text-aba-ink">
                        {t('lessons.select_resource')}
                    </h3>
                    <p className="text-sm font-semibold text-aba-ink-soft">
                        {t('lessons.choose_resource_to_begin')}
                    </p>
                </div>
            </div>
        );
    }

    switch (selectedResource.type) {
        case RESOURCE_TYPES.VIDEO:
            return <VideoViewer resource={selectedResource} />;

        case RESOURCE_TYPES.DOCUMENT:
            return (
                <DocumentViewer
                    resource={selectedResource}
                    onDownload={onDownload}
                />
            );

        case RESOURCE_TYPES.DOWNLOAD:
            return (
                <GenericViewer
                    resource={selectedResource}
                    type={RESOURCE_TYPES.DOWNLOAD}
                    config={{
                        ...VIEWER_CONFIGS[RESOURCE_TYPES.DOWNLOAD],
                        action: (
                            <>
                                {selectedResource.file_name && (
                                    <p className="mb-4 text-sm font-semibold text-aba-coral-dark">
                                        {t('lessons.file')}: {selectedResource.file_name}
                                    </p>
                                )}
                                <button
                                    onClick={(e) =>
                                        onDownload(selectedResource, e)
                                    }
                                    className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-coral px-6 py-2.5 text-sm font-black text-white shadow-aba-coral transition hover:bg-aba-coral-dark"
                                >
                                    <Download size={16} />
                                    {t('lessons.download_file')}
                                </button>
                            </>
                        ),
                    }}
                />
            );

        case RESOURCE_TYPES.INTERACTIVE:
            if (selectedResource.resource_url) {
                return (
                    <div className="h-[600px] overflow-hidden rounded-aba-md border border-aba-line">
                        <iframe
                            src={selectedResource.resource_url}
                            title={selectedResource.title}
                            className="w-full h-full"
                            frameBorder="0"
                        />
                    </div>
                );
            }
            return (
                <GenericViewer
                    resource={selectedResource}
                    type={RESOURCE_TYPES.INTERACTIVE}
                    config={{
                        ...VIEWER_CONFIGS[RESOURCE_TYPES.INTERACTIVE],
                        action: (
                            <p className="font-semibold text-aba-purple">
                                {t('lessons.interactive_content_coming_soon')}
                            </p>
                        ),
                    }}
                />
            );

        case RESOURCE_TYPES.QUIZ:
            return (
                <GenericViewer
                    resource={selectedResource}
                    type={RESOURCE_TYPES.QUIZ}
                    config={{
                        ...VIEWER_CONFIGS[RESOURCE_TYPES.QUIZ],
                        action: (
                            <button className="rounded-aba-sm bg-aba-yellow px-6 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95">
                                {t('lessons.start_quiz')}
                            </button>
                        ),
                    }}
                />
            );

        case RESOURCE_TYPES.LINK:
            return (
                <GenericViewer
                    resource={selectedResource}
                    type={RESOURCE_TYPES.LINK}
                    config={{
                        ...VIEWER_CONFIGS[RESOURCE_TYPES.LINK],
                        action: (
                            <button
                                onClick={(e) => onDownload(selectedResource, e)}
                                className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-purple px-6 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
                            >
                                <ExternalLink size={16} />
                                {t('lessons.open_link')}
                            </button>
                        ),
                    }}
                />
            );

        default:
            return (
                <div className="flex h-[400px] items-center justify-center rounded-aba-md border-2 border-dashed border-aba-line bg-aba-surface-alt">
                    <div className="text-center">
                        <File
                            size={64}
                            className="mx-auto mb-4 text-aba-ink-faint"
                        />
                        <h3 className="mb-2 font-display text-xl font-black text-aba-ink">
                            {selectedResource.translated_title || selectedResource.title}
                        </h3>
                        {(selectedResource.translated_description || selectedResource.description) && (
                            <p className="mb-4 text-sm font-medium text-aba-ink-soft">
                                {selectedResource.translated_description || selectedResource.description}
                            </p>
                        )}
                        <p className="text-sm font-semibold text-aba-ink-soft">
                            {t('lessons.resource_preview_not_available')}
                        </p>
                    </div>
                </div>
            );
    }
}
