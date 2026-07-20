import React, { useState, useEffect } from "react";
import { FileText, Download, Loader2 } from "lucide-react";

export default function DocumentViewer({ resource, onDownload }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Clean up blob URL when component unmounts or resource changes
        return () => {
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    useEffect(() => {
        // Fetch PDF with credentials for authenticated preview
        const fetchPDF = async () => {
            if (!resource.resource_url) return;

            const isPDF =
                resource.resource_url?.toLowerCase().includes(".pdf") ||
                resource.mime_type === "application/pdf";

            if (isPDF && resource.resource_url.startsWith('/lesson-resources/')) {
                setLoading(true);
                setError(null);

                try {
                    const response = await fetch(resource.resource_url, {
                        credentials: 'include', // Include session cookies
                        headers: {
                            'Accept': 'application/pdf',
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to load PDF');
                    }

                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    setPdfUrl(blobUrl);
                } catch (err) {
                    console.error('Error loading PDF:', err);
                    setError('Failed to load document. Please try downloading instead.');
                } finally {
                    setLoading(false);
                }
            } else {
                // For external URLs, use them directly
                setPdfUrl(resource.resource_url);
            }
        };

        fetchPDF();
    }, [resource.resource_url, resource.mime_type]);

    if (!resource.resource_url && !resource.download_url) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-aba-md border-2 border-dashed border-aba-line bg-aba-surface-alt">
                <div className="text-center">
                    <FileText
                        size={64}
                        className="mx-auto mb-4 text-aba-ink-faint"
                    />
                    <h3 className="mb-2 font-display text-xl font-black text-aba-ink">
                        {resource.title}
                    </h3>
                    {resource.description && (
                        <p className="mb-4 text-sm font-medium text-aba-ink-soft">
                            {resource.description}
                        </p>
                    )}
                    <p className="text-sm font-semibold text-aba-ink-soft">
                        Document will be available soon
                    </p>
                </div>
            </div>
        );
    }

    if (!resource.resource_url && resource.download_url) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-aba-md border-2 border-dashed border-aba-line bg-aba-surface-alt">
                <div className="text-center">
                    <FileText
                        size={64}
                        className="mx-auto mb-4 text-aba-ink-faint"
                    />
                    <h3 className="mb-2 font-display text-xl font-black text-aba-ink">
                        {resource.title}
                    </h3>
                    {resource.description && (
                        <p className="mb-4 text-sm font-medium text-aba-ink-soft">
                            {resource.description}
                        </p>
                    )}
                    {resource.file_name && (
                        <p className="mb-4 text-sm font-semibold text-aba-ink-soft">
                            File: {resource.file_name}
                        </p>
                    )}
                    <button
                        onClick={(e) => onDownload(resource, e)}
                        className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-green px-4 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
                    >
                        <Download size={16} />
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
        if (loading) {
            return (
                <div className="flex h-[600px] items-center justify-center rounded-aba-md border border-aba-line bg-aba-surface-alt">
                    <div className="text-center">
                        <Loader2 size={48} className="mx-auto mb-4 animate-spin text-aba-blue" />
                        <p className="font-semibold text-aba-ink-soft">Loading document...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex h-[400px] items-center justify-center rounded-aba-md border-2 border-aba-coral bg-aba-coral-soft">
                    <div className="text-center">
                        <FileText size={64} className="mx-auto mb-4 text-aba-coral" />
                        <h3 className="mb-2 font-display text-xl font-black text-aba-coral-dark">
                            {error}
                        </h3>
                        {resource.download_url && (
                            <button
                                onClick={(e) => onDownload(resource, e)}
                                className="mt-4 inline-flex items-center gap-2 rounded-aba-sm bg-aba-green px-4 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
                            >
                                <Download size={16} />
                                Download Instead
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        if (pdfUrl) {
            return (
                <div className="space-y-4">
                    <div className="h-[600px] overflow-hidden rounded-aba-md border border-aba-line">
                        <iframe
                            src={`${pdfUrl}#toolbar=1`}
                            title={resource.title}
                            className="w-full h-full"
                            frameBorder="0"
                        />
                    </div>
                    <DocumentFooter resource={resource} onDownload={onDownload} />
                </div>
            );
        }
    }

    // For other document types, use Google Docs viewer
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        resource.resource_url
    )}&embedded=true`;

    return (
        <div className="space-y-4">
            <div className="h-[600px] overflow-hidden rounded-aba-md border border-aba-line">
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

/**
 * DocumentFooter - Title, description and download button shown beneath a
 * document preview.
 *
 * @param {object} resource - Document resource being previewed
 * @param {function} onDownload - Called with (resource, event) to download
 */
function DocumentFooter({ resource, onDownload }) {
    return (
        <div className="flex items-center justify-between rounded-aba-md bg-aba-surface-alt p-4">
            <div>
                <h3 className="font-display text-lg font-black text-aba-ink">{resource.title}</h3>
                {resource.description && (
                    <p className="mt-1 text-sm font-medium text-aba-ink-soft">{resource.description}</p>
                )}
            </div>
            <button
                onClick={(e) => onDownload(resource, e)}
                className="inline-flex items-center gap-2 rounded-aba-sm bg-aba-green px-4 py-2.5 text-sm font-black text-white shadow-aba-sm transition hover:brightness-95"
            >
                <Download size={16} />
                Download
            </button>
        </div>
    );
}
