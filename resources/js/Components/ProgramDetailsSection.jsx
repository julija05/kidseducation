// resources/js/Components/ProgramDetailsSection.jsx
import React from "react";

export default function ProgramDetailsSection({ program }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <div className="flex gap-8 items-center mb-8">
                <div className="flex-shrink-0 w-1/3">
                    <img
                        src={`/${program.image}`}
                        alt={program.name}
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        {program.name}
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        {program.description}
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-8">
                        <div className="bg-blue-100 p-4 rounded-lg text-center">
                            <div className="text-sm text-blue-600">Price</div>
                            <div className="text-2xl font-bold text-blue-800">
                                ${program.price}
                            </div>
                        </div>
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                            <div className="text-sm text-green-600">
                                Duration
                            </div>
                            <div className="text-2xl font-bold text-green-800">
                                {program.duration}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
