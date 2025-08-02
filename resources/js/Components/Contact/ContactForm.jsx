import React, { useState } from "react";
import axios from "@/config/axios";
import AlertMessage from "./AlertMessage";
import { useTranslation } from "@/hooks/useTranslation";

export default function ContactForm() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");
        setErrors({});

        try {
            const response = await axios.post("/contact", formData);
            setSuccessMessage(
                response.data.message || t('contact.message_sent_success')
            );
            setFormData({ name: "", email: "", message: "" });

            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrorMessage(
                    t('contact.something_went_wrong')
                );
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6">
            <AlertMessage type="success" message={successMessage} />
            <AlertMessage type="error" message={errorMessage} />

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('forms.name')}
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('forms.email')}
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('forms.message')}
                </label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                        {errors.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
                {t('contact.send_message')}
            </button>
        </form>
    );
}
