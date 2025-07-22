import React from "react";
import { FileText, Download } from "lucide-react";

export default function DocumentViewer({ resource, onDownload }) {
    if (!resource.resource_url && !resource.download_url) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <FileText
                        size={64}
                        className="mx-auto mb-4 text-gray-400"
                    />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {resource.title}
                    </h3>
                    {resource.description && (
                        <p className="text-gray-500 mb-4">
                            {resource.description}
                        </p>
                    )}
                    <p className="text-gray-500">
                        Document will be available soon
                    </p>
                </div>
            </div>
        );
    }

    if (!resource.resource_url && resource.download_url) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <FileText
                        size={64}
                        className="mx-auto mb-4 text-gray-400"
                    />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {resource.title}
                    </h3>
                    {resource.description && (
                        <p className="text-gray-500 mb-4">
                            {resource.description}
                        </p>
                    )}
                    {resource.file_name && (
                        <p className="text-sm text-gray-500 mb-4">
                            File: {resource.file_name}
                        </p>
                    )}
                    <button
                        onClick={(e) => onDownload(resource, e)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={16} className="mr-2" />
                        Download Document
                    </button>
                </div>
            </div>
        );
    }

    const isPDF =
        resource.resource_url?.toLowerCase().includes(".pdf") ||
        resource.mime_type === "application/pdf";

    if (isPDF) {
        return (
            <div className="space-y-4">
                <div className="h-[600px] border rounded-lg overflow-hidden">
                    <iframe
                        src={`${resource.resource_url}#toolbar=1`}
                        title={resource.title}
                        className="w-full h-full"
                        frameBorder="0"
                    />
                </div>
                <DocumentFooter resource={resource} onDownload={onDownload} />
            </div>
        );
    }

    // For other document types, use Google Docs viewer
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        resource.resource_url
    )}&embedded=true`;

    return (
        <div className="space-y-4">
            <div className="h-[600px] border rounded-lg overflow-hidden">
                <iframe
                    src={viewerUrl}
                    title={resource.title}
                    className="w-full h-full"
                    frameBorder="0"
                />
            </div>
            <DocumentFooter resource={resource} onDownload={onDownload} />
        </div>
    );
}

function DocumentFooter({ resource, onDownload }) {
    return (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                {resource.description && (
                    <p className="text-gray-600 mt-1">{resource.description}</p>
                )}
            </div>
            <button
                onClick={(e) => onDownload(resource, e)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <Download size={16} className="mr-2" />
                Download
            </button>
        </div>
    );
}
