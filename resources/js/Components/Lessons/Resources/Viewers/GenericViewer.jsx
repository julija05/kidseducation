import React from "react";
import * as Icons from "lucide-react";

export default function GenericViewer({ resource, type, config }) {
    const IconComponent = Icons[config.icon];

    return (
        <div
            className={`flex items-center justify-center h-[400px] ${config.bgColor} rounded-lg border-2 border-dashed ${config.borderColor}`}
        >
            <div className="text-center">
                <IconComponent
                    size={64}
                    className={`mx-auto mb-4 ${config.iconColor}`}
                />
                <h3
                    className={`text-xl font-semibold ${config.titleColor} mb-2`}
                >
                    {resource.title}
                </h3>
                {resource.description && (
                    <p className={`${config.textColor} mb-4`}>
                        {resource.description}
                    </p>
                )}
                {config.action}
            </div>
        </div>
    );
}
