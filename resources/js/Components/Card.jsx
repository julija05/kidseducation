import React from "react";

function Card({ title, content }) {
    return (
        <div className="overflow-hidden bg-white rounded shadow-md text-slate-500 shadow-slate-200">
            <div className="p-6">
                <h3 className="mb-4 text-xl font-medium text-slate-700">
                    {title}
                </h3>
                <p>{content}</p>
            </div>
        </div>
    );
}

export default Card;
