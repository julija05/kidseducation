import React from "react";
import { BookOpen, FileText } from "lucide-react";
import ResourceItem from "./ResourceItem";

export default function ResourcesSidebar({
    resources,
    selectedResource,
    onResourceSelect,
    onResourceDownload,
}) {
    const hasResources = resources && resources.length > 0;

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" size={18} />
                Resources
            </h3>

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
                <div className="text-center py-8">
                    <FileText
                        size={32}
                        className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-sm text-gray-500">
                        No resources available yet
                    </p>
                </div>
            )}
        </div>
    );
}
