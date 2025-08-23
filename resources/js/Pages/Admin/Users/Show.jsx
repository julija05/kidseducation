import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, Link } from "@inertiajs/react";
import {
    User,
    Mail,
    Calendar,
    Shield,
    ShieldOff,
    ArrowLeft,
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    UserCheck,
    Settings,
} from "lucide-react";

export default function UserShow({ user }) {
    const [processing, setProcessing] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState('');

    const handleUserAction = (action) => {
        setActionType(action);
        setShowActionModal(true);
    };

    const confirmAction = () => {
        if (!actionType) return;

        setProcessing(true);
        
        const routeName = `admin.users.${actionType}`;
        
        router.post(route(routeName, user.id), {}, {
            onFinish: () => {
                setProcessing(false);
                setShowActionModal(false);
                setActionType('');
            },
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: "bg-green-100 text-green-800", icon: CheckCircle, text: "Active" },
            blocked: { class: "bg-red-100 text-red-800", icon: XCircle, text: "Blocked" },
            suspended: { class: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Suspended" }
        };

        const config = statusConfig[status] || statusConfig.active;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
                <Icon className="w-4 h-4 mr-2" />
                {config.text}
            </span>
        );
    };

    const getActionButtons = () => {
        const buttons = [];

        if (user.status === 'active') {
            buttons.push(
                <button
                    key="suspend"
                    onClick={() => handleUserAction('suspend')}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    <Clock className="w-4 h-4 mr-2" />
                    Suspend User
                </button>
            );
            buttons.push(
                <button
                    key="block"
                    onClick={() => handleUserAction('block')}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Block User
                </button>
            );
        } else {
            buttons.push(
                <button
                    key="activate"
                    onClick={() => handleUserAction('activate')}
                    className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate User
                </button>
            );
        }

        return buttons;
    };

    const getActionModalContent = () => {
        if (!actionType) return null;

        const actionConfig = {
            block: {
                title: "Block User",
                message: `Are you sure you want to block ${user.name}? This will prevent them from accessing the learning platform.`,
                buttonClass: "bg-red-600 hover:bg-red-700",
                buttonText: "Block User"
            },
            suspend: {
                title: "Suspend User",
                message: `Are you sure you want to suspend ${user.name}? This will temporarily prevent them from accessing the learning platform.`,
                buttonClass: "bg-yellow-600 hover:bg-yellow-700",
                buttonText: "Suspend User"
            },
            activate: {
                title: "Activate User",
                message: `Are you sure you want to activate ${user.name}? This will restore their access to the learning platform.`,
                buttonClass: "bg-green-600 hover:bg-green-700",
                buttonText: "Activate User"
            }
        };

        return actionConfig[actionType];
    };

    return (
        <AdminLayout>
            <Head title={`User: ${user.name}`} />
            
            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={route('admin.users.index')}
                                    className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        User Details
                                    </h1>
                                    <p className="mt-2 text-gray-600">
                                        View and manage user account
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {getActionButtons()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User Information Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-600" />
                                        User Information
                                    </h3>
                                </div>
                                <div className="px-6 py-5 space-y-6">
                                    {/* Profile Section */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                                <User className="w-8 h-8 text-gray-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                                            <p className="text-gray-500 flex items-center mt-1">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {user.email}
                                            </p>
                                            <div className="mt-2">
                                                {getStatusBadge(user.status)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {user.first_name && user.last_name 
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : user.name
                                                }
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {user.roles.length > 0 ? user.roles[0].name : 'No role assigned'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {getStatusBadge(user.status)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {user.email_verified_at ? (
                                                    <span className="text-green-600">Verified</span>
                                                ) : (
                                                    <span className="text-red-600">Not verified</span>
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                                            <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </dd>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    {user.address && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{user.address}</dd>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* Enrollments Card */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-5 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                            Enrollments
                                        </h3>
                                    </div>
                                    <div className="px-6 py-5">
                                        {user.enrollments && user.enrollments.length > 0 ? (
                                            <div className="space-y-3">
                                                {user.enrollments.map((enrollment) => (
                                                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {enrollment.program.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                Status: {enrollment.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                No enrollments found
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions Card */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-5 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <Settings className="w-5 h-5 mr-2 text-blue-600" />
                                            Quick Actions
                                        </h3>
                                    </div>
                                    <div className="px-6 py-5 space-y-3">
                                        {getActionButtons().map((button, index) => (
                                            <div key={index} className="w-full">
                                                {button}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Confirmation Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {getActionModalContent()?.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {getActionModalContent()?.message}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowActionModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    disabled={processing}
                                    className={`px-4 py-2 text-white rounded-md ${getActionModalContent()?.buttonClass} ${
                                        processing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {processing ? 'Processing...' : getActionModalContent()?.buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}