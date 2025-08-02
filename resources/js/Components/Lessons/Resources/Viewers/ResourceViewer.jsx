import React from "react";
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
    [RESOURCE_TYPES.DOWNLOAD]: {
        icon: "Download",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-300",
        iconColor: "text-indigo-500",
        titleColor: "text-indigo-800",
        textColor: "text-indigo-600",
    },
    [RESOURCE_TYPES.INTERACTIVE]: {
        icon: "Calculator",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
        iconColor: "text-orange-500",
        titleColor: "text-orange-800",
        textColor: "text-orange-600",
    },
    [RESOURCE_TYPES.QUIZ]: {
        icon: "Trophy",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-300",
        iconColor: "text-yellow-500",
        titleColor: "text-yellow-800",
        textColor: "text-yellow-600",
    },
    [RESOURCE_TYPES.LINK]: {
        icon: "ExternalLink",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300",
        iconColor: "text-purple-500",
        titleColor: "text-purple-800",
        textColor: "text-purple-600",
    },
};

export default function ResourceViewer({ selectedResource, onDownload }) {
    const { t } = useTranslation();
    
    if (!selectedResource) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                    <BookOpen
                        size={64}
                        className="mx-auto mb-4 text-gray-400"
                    />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {t('lessons.select_resource')}
                    </h3>
                    <p className="text-gray-500">
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
                                    <p className="text-sm text-indigo-600 mb-4">
                                        {t('lessons.file')}: {selectedResource.file_name}
                                    </p>
                                )}
                                <button
                                    onClick={(e) =>
                                        onDownload(selectedResource, e)
                                    }
                                    className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Download size={16} className="mr-2" />
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
                    <div className="h-[600px] border rounded-lg overflow-hidden">
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
                            <p className="text-orange-600">
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
                            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors">
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
                                className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <ExternalLink size={16} className="mr-2" />
                                {t('lessons.open_link')}
                            </button>
                        ),
                    }}
                />
            );

        default:
            return (
                <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <File
                            size={64}
                            className="mx-auto mb-4 text-gray-400"
                        />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {selectedResource.translated_title || selectedResource.title}
                        </h3>
                        {(selectedResource.translated_description || selectedResource.description) && (
                            <p className="text-gray-500 mb-4">
                                {selectedResource.translated_description || selectedResource.description}
                            </p>
                        )}
                        <p className="text-gray-500">
                            {t('lessons.resource_preview_not_available')}
                        </p>
                    </div>
                </div>
            );
    }
}
