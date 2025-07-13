import React from "react";
import { Download } from "lucide-react";
import * as Icons from "lucide-react";
import { RESOURCE_ICONS } from "@/constants/resourceTypes";
import { getResourceTypeColor } from "@/Utils/helpers";

export default function ResourceItem({
    resource,
    isSelected,
    onSelect,
    onDownload,
}) {
    const iconConfig = RESOURCE_ICONS[resource.type] || {
        icon: "File",
        color: "text-gray-600",
    };
    const IconComponent = Icons[iconConfig.icon];

    return (
        <div
            className={`border rounded-lg p-3 ${getResourceTypeColor(
                resource.type,
                isSelected
            )}`}
            onClick={() => onSelect(resource)}
        >
            <div className="flex items-start">
                <div className="mr-2 mt-1">
                    <IconComponent size={16} className={iconConfig.color} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                        {resource.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium capitalize">
                            {resource.type}
                        </span>
                        {resource.is_required && (
                            <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                                Required
                            </span>
                        )}
                    </div>
                    {(resource.type === "download" ||
                        resource.type === "document") && (
                        <button
                            onClick={(e) => onDownload(resource, e)}
                            className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center"
                        >
                            <Download size={12} className="mr-1" />
                            Download
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
