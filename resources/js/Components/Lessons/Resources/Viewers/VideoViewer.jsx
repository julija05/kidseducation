import React from "react";
import { Play } from "lucide-react";
import {
    isYouTubeUrl,
    extractYouTubeVideoId,
    getYouTubeEmbedUrl,
} from "@/Utils/helpers";

/**
 * VideoViewer - Plays a lesson video, embedding YouTube links and falling back
 * to a native player or a placeholder when no URL is available.
 *
 * @param {object} resource - Video resource to play
 */
export default function VideoViewer({ resource }) {
    if (!resource.resource_url) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-aba-md bg-aba-ink">
                <div className="text-center text-white">
                    <Play size={64} className="mx-auto mb-4" />
                    <h3 className="mb-2 font-display text-xl font-black">
                        {resource.title}
                    </h3>
                    <p className="text-sm font-medium text-aba-rod">
                        Video will be available soon
                    </p>
                </div>
            </div>
        );
    }

    if (isYouTubeUrl(resource.resource_url)) {
        const videoId = extractYouTubeVideoId(resource.resource_url);
        const embedUrl = getYouTubeEmbedUrl(videoId);

        return (
            <div className="relative">
                <iframe
                    src={embedUrl}
                    title={resource.title}
                    className="aspect-video w-full rounded-aba-md"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                <div className="mt-4">
                    <h3 className="font-display text-lg font-black text-aba-ink">{resource.title}</h3>
                    {resource.description && (
                        <p className="mt-2 text-sm font-medium text-aba-ink-soft">
                            {resource.description}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <video
                src={resource.resource_url}
                controls
                className="aspect-video w-full rounded-aba-md bg-aba-ink"
            >
                Your browser does not support the video tag.
            </video>
            <div className="mt-4">
                <h3 className="font-display text-lg font-black text-aba-ink">{resource.title}</h3>
                {resource.description && (
                    <p className="mt-2 text-sm font-medium text-aba-ink-soft">{resource.description}</p>
                )}
            </div>
        </div>
    );
}
