import React from "react";
import { Play } from "lucide-react";
import {
    isYouTubeUrl,
    extractYouTubeVideoId,
    getYouTubeEmbedUrl,
} from "@/Utils/helpers";

export default function VideoViewer({ resource }) {
    if (!resource.resource_url) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-black rounded-lg">
                <div className="text-white text-center">
                    <Play size={64} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                        {resource.title}
                    </h3>
                    <p className="text-gray-300">
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
                    className="w-full aspect-video rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                    {resource.description && (
                        <p className="text-gray-600 mt-2">
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
                className="w-full aspect-video rounded-lg bg-black"
            >
                Your browser does not support the video tag.
            </video>
            <div className="mt-4">
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                {resource.description && (
                    <p className="text-gray-600 mt-2">{resource.description}</p>
                )}
            </div>
        </div>
    );
}
