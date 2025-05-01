import React from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

export const HeroCard = ({ age, title, color, image }) => {
    return (
        <div
            className={`rounded-2xl p-4 md:p-6 ${color} text-black shadow-md relative`}
        >
            <p className="text-xs md:text-sm font-medium mb-2">{age}</p>
            <h3 className="text-xl md:text-2xl font-semibold mb-4 italic">
                {title}
            </h3>
            <div className="w-full aspect-square bg-white/20 rounded-lg flex items-center justify-center">
                {image}
            </div>
            <div className="absolute bottom-4 right-4">
                <FaArrowUpRightFromSquare className="text-lg md:text-xl" />
            </div>
        </div>
    );
};
