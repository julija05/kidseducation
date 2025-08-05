import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Languages, BookOpen, Play, FileText, ChevronRight } from 'lucide-react';

export default function TranslationsIndex({ auth, programs, supported_locales }) {
    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <Languages className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Translation Management
                        </h2>
                        <p className="text-sm text-gray-600">
                            Manage translations for programs, lessons, and resources
                        </p>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Supported Languages Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Languages className="w-5 h-5 text-blue-600" />
                            <h3 className="font-medium text-blue-900">Supported Languages</h3>
                        </div>
                        <div className="flex space-x-4">
                            {supported_locales.map((locale) => (
                                <span
                                    key={locale}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                    {locale.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Programs List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Programs & Content</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Click on a program to manage translations for it and all its lessons and resources.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {programs.map((program) => (
                                <div key={program.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <BookOpen className="w-6 h-6 text-gray-400" />
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {program.name}
                                                    </h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center space-x-1">
                                                            <Play className="w-4 h-4" />
                                                            <span>{program.lessons_count} lessons</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <FileText className="w-4 h-4" />
                                                            <span>{program.resources_count} resources</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Translation Status */}
                                            <div className="mt-3 flex space-x-2">
                                                {supported_locales.map((locale) => {
                                                    const hasNameTranslation = program.name_translations && program.name_translations[locale];
                                                    const hasDescTranslation = program.description_translations && program.description_translations[locale];
                                                    const isComplete = hasNameTranslation && hasDescTranslation;
                                                    
                                                    return (
                                                        <div
                                                            key={locale}
                                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                                isComplete
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : hasNameTranslation || hasDescTranslation
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            {locale.toUpperCase()}: {
                                                                isComplete ? 'Complete' 
                                                                : hasNameTranslation || hasDescTranslation ? 'Partial'
                                                                : 'Missing'
                                                            }
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <Link
                                            href={route('admin.translations.programs.show', program.id)}
                                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            <span>Manage Translations</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {programs.length === 0 && (
                            <div className="p-12 text-center">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                                <p className="text-gray-600">
                                    Create some programs first to manage their translations.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}