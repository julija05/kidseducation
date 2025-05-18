import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useEffect, useState } from "react";

export default function News({ news }) {
    const { delete: destroy } = useForm();
    const { props } = usePage();
    const [successMessage, setSuccessMessage] = useState(
        props.flash.success || ""
    );
    const [deleteMessage, setDeleteMessage] = useState(
        props.flash.deleted || ""
    );

    useEffect(() => {
        if (successMessage || deleteMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setDeleteMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, deleteMessage]);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this post?")) {
            destroy(route("admin.news.destroy", id));
        }
    };

    return (
        <AdminLayout className="space-y-8 ">
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
                    {successMessage}
                </div>
            )}
            {deleteMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                    {deleteMessage}
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">News Posts</h1>
                <Link
                    href={route("admin.news.create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create New Post
                </Link>
            </div>

            {news.data.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    <p className="text-lg">No news available.</p>
                    <p className="mt-2">
                        Be the first to{" "}
                        <Link
                            href={route("admin.news.create")}
                            className="text-blue-600 hover:underline"
                        >
                            create a new post
                        </Link>
                        .
                    </p>
                </div>
            ) : (
                news.data.map((item) => (
                    <div
                        key={item.id}
                        className="border p-4 rounded shadow space-y-4 mt-8"
                    >
                        <h2 className="text-xl font-bold">{item.title}</h2>

                        <p>{item.content}</p>

                        <div className="flex gap-4 mt-4">
                            <Link
                                href={route("admin.news.edit", item.id)}
                                className="text-blue-600 hover:underline"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2 flex-wrap">
                {news.links.map((link, index) =>
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            className={`px-3 py-1 rounded border ${
                                link.active
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-blue-600 hover:bg-blue-100"
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={index}
                            className="px-3 py-1 rounded border text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                )}
            </div>
        </AdminLayout>
    );
}
