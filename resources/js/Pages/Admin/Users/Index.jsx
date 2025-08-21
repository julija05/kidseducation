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
            
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <Users className="w-8 h-8 mr-3 text-blue-600" />
                                    User Management
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Manage user accounts and access permissions
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search Form */}
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Search users by name or email..."
                                            defaultValue={filters.search || ""}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </form>

                                {/* Status Filter */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusFilter('')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            !filters.status 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter('active')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filters.status === 'active' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter('blocked')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filters.status === 'blocked' 
                                                ? 'bg-red-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Blocked
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter('suspended')}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            filters.status === 'suspended' 
                                                ? 'bg-yellow-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Suspended
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
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
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-gray-600" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.roles.length > 0 ? user.roles[0].name : 'No role'}
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

                        {/* Pagination */}
                        {users.links.length > 3 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {users.prev_page_url && (
                                        <Link
                                            href={users.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {users.next_page_url && (
                                        <Link
                                            href={users.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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