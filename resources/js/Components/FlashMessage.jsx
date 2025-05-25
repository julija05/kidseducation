import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

// Single Responsibility: Handle flash message display and auto-dismiss
export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(null);
    const [type, setType] = useState(null);

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType("success");
            setVisible(true);
        } else if (flash.error) {
            setMessage(flash.error);
            setType("error");
            setVisible(true);
        } else if (flash.warning) {
            setMessage(flash.warning);
            setType("warning");
            setVisible(true);
        } else if (flash.info) {
            setMessage(flash.info);
            setType("info");
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000); // Auto-dismiss after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !message) {
        return null;
    }

    const getMessageStyles = () => {
        const baseStyles =
            "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out";

        switch (type) {
            case "success":
                return `${baseStyles} bg-green-100 border border-green-400 text-green-700`;
            case "error":
                return `${baseStyles} bg-red-100 border border-red-400 text-red-700`;
            case "warning":
                return `${baseStyles} bg-yellow-100 border border-yellow-400 text-yellow-700`;
            case "info":
                return `${baseStyles} bg-blue-100 border border-blue-400 text-blue-700`;
            default:
                return `${baseStyles} bg-gray-100 border border-gray-400 text-gray-700`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "error":
                return (
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "warning":
                return (
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "info":
                return (
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={getMessageStyles()}>
            <div className="flex items-center">
                {getIcon()}
                <span className="flex-1">{message}</span>
                <button
                    onClick={() => setVisible(false)}
                    className="ml-4 text-current hover:opacity-70 transition-opacity"
                    aria-label="Close message"
                >
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
