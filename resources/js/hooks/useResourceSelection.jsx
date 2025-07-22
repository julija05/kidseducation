import { useState, useEffect } from "react";
import { getCsrfToken } from "@/Utils/helpers";

export default function useResourceSelection(resources) {
    const [selectedResource, setSelectedResource] = useState(null);

    useEffect(() => {
        if (resources && resources.length > 0 && !selectedResource) {
            setSelectedResource(resources[0]);
        }
    }, [resources]);

    const handleResourceSelect = async (resource) => {
        setSelectedResource(resource);

        // Mark resource as viewed
        try {
            const response = await fetch(
                route("lesson-resources.mark-viewed", resource.id),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": getCsrfToken(),
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            const data = await response.json();

            if (!data.success) {
                console.warn(
                    "Failed to mark resource as viewed:",
                    data.message
                );
            }
        } catch (error) {
            console.error("Error marking resource as viewed:", error);
        }
    };

    const handleResourceDownload = (resource, e) => {
        e.stopPropagation();

        if (resource.download_url) {
            window.open(resource.download_url, "_blank");
        } else if (resource.resource_url) {
            const link = document.createElement("a");
            link.href = resource.resource_url;
            link.download = resource.file_name || resource.title || "download";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Download not available for this resource");
        }
    };

    return {
        selectedResource,
        handleResourceSelect,
        handleResourceDownload,
    };
}
