import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, Link } from "@inertiajs/react";
import {
    User,
    Mail,
    Calendar,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    ShieldOff,
    Eye,
    UserCheck,
    UserX,
    Users,
} from "lucide-react";

// Rotating avatar background colors, picked by user id for a stable color.
const AVATAR_COLORS = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
];

// Status filter options for the toolbar; activeClass applies when selected.
const STATUS_FILTERS = [
    { value: "", label: "All", activeClass: "bg-blue-600 text-white" },
    { value: "active", label: "Active", activeClass: "bg-green-600 text-white" },
    { value: "blocked", label: "Blocked", activeClass: "bg-red-600 text-white" },
    { value: "suspended", label: "Suspended", activeClass: "bg-yellow-600 text-white" },
];

// Returns up-to-two-letter uppercase initials for a person's name.
const getInitials = (name) =>
    (name || "?")
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

// Picks a stable avatar color for a given user id.
const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

export default function UsersIndex({ users, filters }) {
    const [processing, setProcessing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        router.get(route("admin.users.index"), {
            search,
            status: filters.status,
        });
    };

    const handleStatusFilter = (status) => {
        router.get(route("admin.users.index"), {
            status,
            search: filters.search,
        });
    };

    const handleUserAction = (user, action) => {
        setSelectedUser(user);
        setActionType(action);
        setShowActionModal(true);
    };

    const confirmAction = () => {
        if (!selectedUser || !actionType) return;

        setProcessing(true);
        
        const routeName = `admin.users.${actionType}`;
        
        router.post(route(routeName, selectedUser.id), {}, {
            onFinish: () => {
                setProcessing(false);
                setShowActionModal(false);
                setSelectedUser(null);
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const getActionButtons = (user) => {
        const buttons = [];

        if (user.status === 'active') {
            buttons.push(
                <button
                    key="suspend"
                    onClick={() => handleUserAction(user, 'suspend')}
                    className="text-yellow-600 hover:text-yellow-800 mr-3"
                    title="Suspend User"
                >
                    <Clock className="w-4 h-4" />
                </button>
            );
            buttons.push(
                <button
                    key="block"
                    onClick={() => handleUserAction(user, 'block')}
                    className="text-red-600 hover:text-red-800 mr-3"
                    title="Block User"
                >
                    <ShieldOff className="w-4 h-4" />
                </button>
            );
        } else {
            buttons.push(
                <button
                    key="activate"
                    onClick={() => handleUserAction(user, 'activate')}
                    className="text-green-600 hover:text-green-800 mr-3"
                    title="Activate User"
                >
                    <UserCheck className="w-4 h-4" />
                </button>
            );
        }

        return buttons;
    };

    const getActionModalContent = () => {
        if (!selectedUser || !actionType) return null;

        const actionConfig = {
            block: {
                title: "Block User",
                message: `Are you sure you want to block ${selectedUser.name}? This will prevent them from accessing the learning platform.`,
                buttonClass: "bg-red-600 hover:bg-red-700",
                buttonText: "Block User"
            },
            suspend: {
                title: "Suspend User",
                message: `Are you sure you want to suspend ${selectedUser.name}? This will temporarily prevent them from accessing the learning platform.`,
                buttonClass: "bg-yellow-600 hover:bg-yellow-700",
                buttonText: "Suspend User"
            },
            activate: {
                title: "Activate User",
                message: `Are you sure you want to activate ${selectedUser.name}? This will restore their access to the learning platform.`,
                buttonClass: "bg-green-600 hover:bg-green-700",
                buttonText: "Activate User"
            }
        };

        return actionConfig[actionType];
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            
            <div className="h-full flex flex-col">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 min-h-0 flex flex-col">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                    <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                                    User Management
                                </h1>
                                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                                    Manage user accounts and access permissions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-4 sm:mb-6 flex-shrink-0 p-4">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by name or email..."
                                    defaultValue={filters.search || ""}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                                Search
                            </button>
                            {filters.search && (
                                <button
                                    type="button"
                                    onClick={() => router.get(route("admin.users.index"), { status: filters.status })}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Clear
                                </button>
                            )}
                        </form>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {STATUS_FILTERS.map((filter) => {
                                    const isActive = (filters.status || "") === filter.value;
                                    return (
                                        <button
                                            key={filter.value}
                                            onClick={() => handleStatusFilter(filter.value)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                isActive
                                                    ? filter.activeClass
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {filter.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-900">{users.total}</span>{" "}
                                {users.total === 1 ? "user" : "users"}
                            </p>
                        </div>
                    </div>

                    {/* Users Table Panel */}
                    <div className="bg-white shadow rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
                        {/* Scrolling rows region */}
                        <div className="flex-1 min-h-0 overflow-auto">
                        <div className="hidden sm:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                    <p>No users found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            users.data.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${avatarColor(user.id)}`}>
                                                                {getInitials(user.name)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <Link
                                                                    href={route('admin.users.show', user.id)}
                                                                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                                >
                                                                    {user.name}
                                                                </Link>
                                                                <div className="text-sm text-gray-500 flex items-center">
                                                                    <Mail className="w-3 h-3 mr-1" />
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(user.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium capitalize">
                                                            {user.roles.length > 0 ? user.roles[0].name : 'No role'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end items-center">
                                                            <Link
                                                                href={route('admin.users.show', user.id)}
                                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                                                title="View User"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            {getActionButtons(user)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="sm:hidden">
                            {users.data.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500">
                                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No users found</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {users.data.map((user) => (
                                        <div key={user.id} className="p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${avatarColor(user.id)}`}>
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <Link
                                                                href={route('admin.users.show', user.id)}
                                                                className="block text-sm font-medium text-gray-900 truncate hover:text-blue-600"
                                                            >
                                                                {user.name}
                                                            </Link>
                                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                <Mail className="w-3 h-3 mr-1" />
                                                                <span className="truncate">{user.email}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <div className="flex items-center space-x-4">
                                                                    {getStatusBadge(user.status)}
                                                                    <span className="text-xs text-gray-500">
                                                                        {user.roles.length > 0 ? user.roles[0].name : 'No role'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {new Date(user.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-2">
                                                            <Link
                                                                href={route('admin.users.show', user.id)}
                                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                                title="View User"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            {getActionButtons(user)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        </div>
                        {/* end scrolling rows region */}

                        {/* Pagination (pinned to the bottom of the panel) */}
                        {users.links.length > 3 && (
                            <div className="flex-shrink-0 bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                {/* Mobile Pagination */}
                                <div className="flex justify-between sm:hidden">
                                    {users.prev_page_url ? (
                                        <Link
                                            href={users.prev_page_url}
                                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    ) : (
                                        <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-300 bg-gray-50 cursor-not-allowed">
                                            Previous
                                        </span>
                                    )}
                                    <div className="flex items-center">
                                        <p className="text-xs text-gray-700">
                                            {users.current_page} of {users.last_page}
                                        </p>
                                    </div>
                                    {users.next_page_url ? (
                                        <Link
                                            href={users.next_page_url}
                                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    ) : (
                                        <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-300 bg-gray-50 cursor-not-allowed">
                                            Next
                                        </span>
                                    )}
                                </div>

                                {/* Desktop Pagination */}
                                <div className="hidden sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{users.from}</span> to{" "}
                                            <span className="font-medium">{users.to}</span> of{" "}
                                            <span className="font-medium">{users.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {users.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || "#"}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                            : link.url
                                                            ? "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                            : "bg-gray-50 border-gray-300 text-gray-300 cursor-not-allowed"
                                                    } ${
                                                        index === 0 ? "rounded-l-md" : ""
                                                    } ${
                                                        index === users.links.length - 1 ? "rounded-r-md" : ""
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Confirmation Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                        <div className="p-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {getActionModalContent()?.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-6 px-2">
                                    {getActionModalContent()?.message}
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                    <button
                                        onClick={() => setShowActionModal(false)}
                                        className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmAction}
                                        disabled={processing}
                                        className={`w-full sm:w-auto px-4 py-2 text-white rounded-md text-sm font-medium ${getActionModalContent()?.buttonClass} ${
                                            processing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {processing ? 'Processing...' : getActionModalContent()?.buttonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}