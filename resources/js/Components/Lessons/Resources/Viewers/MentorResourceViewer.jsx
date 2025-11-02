import React from "react";
import { FileText, Video, File, Download } from "lucide-react";
import VideoViewer from "./VideoViewer";
import DocumentViewer from "./DocumentViewer";
import { useTranslation } from "@/hooks/useTranslation";

export default function MentorResourceViewer({ resource }) {
    const { t } = useTranslation();

    if (!resource) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                    <File size={64} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">
                        {t('lessons.select_resource') || 'Select a Resource'}
                    </h3>
                    <p className="text-slate-500">
                        {t('lessons.choose_resource_to_begin') || 'Choose a resource from the right sidebar to preview'}
                    </p>
                </div>
            </div>
        );
    }

    // Transform resource data to match the expected format
    const resourceType = resource.type || resource.resource_type;

    const transformedResource = {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resourceType,
        resource_url: getResourceUrl(resource, resourceType),
        file_path: resource.file_path || null,
        file_name: resource.file_name || (resource.file_path ? resource.file_path.split('/').pop() : null),
        mime_type: resource.mime_type || getMimeType(resourceType),
    };

    function getResourceUrl(resource, type) {
        // For video resources, check for resource_url or youtube_url
        if (type === 'video' && (resource.resource_url || resource.youtube_url)) {
            return resource.resource_url || resource.youtube_url;
        }

        // For external links
        if (type === 'link' && resource.resource_url) {
            return resource.resource_url;
        }

        // For file-based resources (documents, downloads), generate the serve route
        if (resource.file_path) {
            return route('lesson-resources.serve', resource.id);
        }

        // Fallback to resource_url if available
        if (resource.resource_url) {
            return resource.resource_url;
        }

        return null;
    }

    function getMimeType(type) {
        if (type === 'document') return 'application/pdf';
        if (type === 'video') return 'video/mp4';
        return null;
    }

    // Render video for YouTube resources
    if (transformedResource.type === 'video' && transformedResource.resource_url) {
        return <VideoViewer resource={transformedResource} />;
    }

    // Render document viewer for PDFs and Word docs
    if (transformedResource.type === 'document' && transformedResource.file_path) {
        return (
            <DocumentViewer
                resource={transformedResource}
                onDownload={() => {
                    // Download will be handled by parent component's download button
                }}
            />
        );
    }

    // For other types, show a simple preview with download option
    return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                    {transformedResource.type === 'video' && <Video size={40} className="text-slate-600" />}
                    {transformedResource.type === 'document' && <FileText size={40} className="text-slate-600" />}
                    {transformedResource.type === 'download' && <Download size={40} className="text-slate-600" />}
                    {!['video', 'document', 'download'].includes(transformedResource.type) && <File size={40} className="text-slate-600" />}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {transformedResource.title}
                </h3>
                {transformedResource.description && (
                    <p className="text-slate-600 mb-6">
                        {transformedResource.description}
                    </p>
                )}
                {transformedResource.file_name && (
                    <p className="text-sm text-slate-500 mb-4">
                        {t('lessons.file') || 'File'}: {transformedResource.file_name}
                    </p>
                )}
                <p className="text-slate-500">
                    {t('lessons.resource_preview_not_available') || 'Preview not available for this resource type'}
                </p>
            </div>
        </div>
    );
}
