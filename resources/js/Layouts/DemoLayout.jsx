import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, Clock } from 'lucide-react';

export default function DemoLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const handleLogout = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('demo.logout');
        
        const token = document.createElement('input');
        token.type = 'hidden';
        token.name = '_token';
        token.value = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        form.appendChild(token);
        
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Demo Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href={route('landing.index')} className="flex items-center">
                                <img
                                    src="/assets/logo.png"
                                    alt="Abacoding"
                                    className="h-8 w-auto"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'inline';
                                    }}
                                />
                                <span className="hidden ml-2 text-xl font-bold text-gray-900">
                                    Abacoding
                                </span>
                            </Link>
                            
                            {/* Demo Badge */}
                            <div className="ml-4 px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-bold rounded-full">
                                DEMO MODE
                            </div>
                        </div>

                        {/* Demo Info & Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Demo Expiry */}
                            {user.demo_expires_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>
                                        Expires: {new Date(user.demo_expires_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="flex items-center space-x-2">
                                <div className="text-sm">
                                    <span className="text-gray-500">Demo User:</span>
                                    <span className="ml-1 font-medium text-gray-900">{user.name}</span>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Exit Demo</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Demo Notice Bar */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center text-sm font-medium">
                        <span>🎯 You're in Demo Mode - Limited to first lesson only</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Demo Footer */}
            <footer className="bg-white border-t py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-gray-500">
                        <p>Demo Mode - Experience limited to first lesson only</p>
                        <p className="mt-1">
                            <Link 
                                href={route('programs.index')} 
                                className="text-blue-600 hover:text-blue-800"
                            >
                                View All Programs
                            </Link>
                            {' • '}
                            <Link 
                                href={route('contact.index')} 
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}