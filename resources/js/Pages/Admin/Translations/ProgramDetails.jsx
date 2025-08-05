import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Languages, BookOpen, Play, FileText, ChevronLeft, 
    Save, Check, AlertCircle, Loader2 
} from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ProgramDetails({ auth, program, supported_locales }) {
    const [activeTab, setActiveTab] = useState('program');
    const [expandedLessons, setExpandedLessons] = useState(new Set());

    // Program translations form
    const programForm = useForm({
        translations: supported_locales.reduce((acc, locale) => {
            acc[locale] = {
                name: program.name_translations[locale] || (locale === 'en' ? program.name : ''),
                description: program.description_translations[locale] || (locale === 'en' ? program.description : ''),
            };
            return acc;
        }, {})
    });

    // Lesson translations form
    const lessonForm = useForm({
        lesson_id: null,
        translations: {}
    });

    // Resource translations form  
    const resourceForm = useForm({
        resource_id: null,
        translations: {}
    });

    const toggleLessonExpansion = (lessonId) => {
        const newExpanded = new Set(expandedLessons);
        if (newExpanded.has(lessonId)) {
            newExpanded.delete(lessonId);
        } else {
            newExpanded.add(lessonId);
        }
        setExpandedLessons(newExpanded);
    };

    const handleProgramSubmit = (e) => {
        e.preventDefault();
        programForm.post(route('admin.translations.programs.update', program.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Form will be reset automatically
            }
        });
    };

    const handleLessonSubmit = (lessonId, formData) => {
        const dataToSend = {
            lesson_id: lessonId,
            translations: formData
        };

        lessonForm.post(route('admin.translations.lessons.update', lessonId), {
            data: dataToSend,
            preserveScroll: true,
            onSuccess: () => {
                lessonForm.reset();
            }
        });
    };

    const handleResourceSubmit = (resourceId, formData) => {
        const dataToSend = {
            resource_id: resourceId,
            translations: formData
        };

        resourceForm.post(route('admin.translations.resources.update', resourceId), {
            data: dataToSend,
            preserveScroll: true,
            onSuccess: () => {
                resourceForm.reset();
            }
        });
    };

    const getTranslationStatus = (translations, fields) => {
        let totalFields = supported_locales.length * fields.length;
        let completedFields = 0;

        supported_locales.forEach(locale => {
            fields.forEach(field => {
                if (translations[`${field}_translations`] && translations[`${field}_translations`][locale]) {
                    completedFields++;
                }
            });
        });

        return {
            completed: completedFields,
            total: totalFields,
            percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
        };
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-3">
                    <Link
                        href={route('admin.translations.index')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <Languages className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Translations: {program.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Manage translations for this program and all its content
                        </p>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="mb-6">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('program')}
                                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'program'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Program</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('lessons')}
                                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'lessons'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Play className="w-4 h-4" />
                                    <span>Lessons ({program.lessons.length})</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Program Tab */}
                    {activeTab === 'program' && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Program Translations</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Translate the program name and description for all supported languages.
                                </p>
                            </div>

                            <form onSubmit={handleProgramSubmit} className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {supported_locales.map((locale) => (
                                        <div key={locale} className="space-y-4">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {locale.toUpperCase()}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {locale === 'en' ? 'English' : locale === 'mk' ? 'Macedonian' : locale}
                                                </span>
                                            </div>

                                            <div>
                                                <InputLabel value="Program Name" />
                                                <TextInput
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={programForm.data.translations[locale].name}
                                                    onChange={(e) =>
                                                        programForm.setData('translations', {
                                                            ...programForm.data.translations,
                                                            [locale]: {
                                                                ...programForm.data.translations[locale],
                                                                name: e.target.value
                                                            }
                                                        })
                                                    }
                                                    required
                                                />
                                                <InputError message={programForm.errors[`translations.${locale}.name`]} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel value="Program Description" />
                                                <textarea
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    rows="4"
                                                    value={programForm.data.translations[locale].description}
                                                    onChange={(e) =>
                                                        programForm.setData('translations', {
                                                            ...programForm.data.translations,
                                                            [locale]: {
                                                                ...programForm.data.translations[locale],
                                                                description: e.target.value
                                                            }
                                                        })
                                                    }
                                                    required
                                                />
                                                <InputError message={programForm.errors[`translations.${locale}.description`]} className="mt-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <PrimaryButton disabled={programForm.processing}>
                                        {programForm.processing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Program Translations
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Lessons Tab */}
                    {activeTab === 'lessons' && (
                        <div className="space-y-6">
                            {program.lessons.map((lesson) => {
                                const translationStatus = getTranslationStatus(lesson, ['title', 'description', 'content_body']);
                                
                                return (
                                    <div key={lesson.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        Level {lesson.level} - {lesson.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Translation Progress: {translationStatus.completed}/{translationStatus.total} 
                                                        ({translationStatus.percentage}%)
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => toggleLessonExpansion(lesson.id)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    {expandedLessons.has(lesson.id) ? 'Collapse' : 'Expand'}
                                                </button>
                                            </div>
                                        </div>

                                        {expandedLessons.has(lesson.id) && (
                                            <div className="p-6">
                                                <LessonTranslationForm
                                                    lesson={lesson}
                                                    supported_locales={supported_locales}
                                                    onSubmit={(formData) => handleLessonSubmit(lesson.id, formData)}
                                                    processing={lessonForm.processing && lessonForm.data.lesson_id === lesson.id}
                                                />

                                                {/* Resources */}
                                                {lesson.resources.length > 0 && (
                                                    <div className="mt-8">
                                                        <h5 className="text-md font-medium text-gray-900 mb-4">Resources</h5>
                                                        <div className="space-y-4">
                                                            {lesson.resources.map((resource) => (
                                                                <ResourceTranslationForm
                                                                    key={resource.id}
                                                                    resource={resource}
                                                                    supported_locales={supported_locales}
                                                                    onSubmit={(formData) => handleResourceSubmit(resource.id, formData)}
                                                                    processing={resourceForm.processing && resourceForm.data.resource_id === resource.id}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

// Component for lesson translation form
function LessonTranslationForm({ lesson, supported_locales, onSubmit, processing }) {
    const [formData, setFormData] = useState(() => {
        const initialData = supported_locales.reduce((acc, locale) => {
            acc[locale] = {
                title: lesson.title_translations?.[locale] || (locale === 'en' ? lesson.title : ''),
                description: lesson.description_translations?.[locale] || (locale === 'en' ? lesson.description : ''),
                content_body: lesson.content_body_translations?.[locale] || (locale === 'en' ? lesson.content_body : ''),
            };
            return acc;
        }, {});
        
        return initialData;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {supported_locales.map((locale) => (
                    <div key={locale} className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {locale.toUpperCase()}
                            </span>
                        </div>

                        <div>
                            <InputLabel value="Lesson Title" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full"
                                value={formData[locale].title}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        [locale]: { ...prev[locale], title: e.target.value }
                                    }))
                                }
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Lesson Description" />
                            <textarea
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="2"
                                value={formData[locale].description || ''}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        [locale]: { ...prev[locale], description: e.target.value }
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <InputLabel value="Lesson Content" />
                            <textarea
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="4"
                                value={formData[locale].content_body || ''}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        [locale]: { ...prev[locale], content_body: e.target.value }
                                    }))
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <PrimaryButton disabled={processing}>
                    {processing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Lesson Translations
                        </>
                    )}
                </PrimaryButton>
            </div>
        </form>
    );
}

// Component for resource translation form
function ResourceTranslationForm({ resource, supported_locales, onSubmit, processing }) {
    const [formData, setFormData] = useState(() => {
        return supported_locales.reduce((acc, locale) => {
            acc[locale] = {
                title: resource.title_translations[locale] || (locale === 'en' ? resource.title : ''),
                description: resource.description_translations[locale] || (locale === 'en' ? resource.description : ''),
            };
            return acc;
        }, {});
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{resource.title}</span>
                <span className="text-sm text-gray-500">({resource.type})</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {supported_locales.map((locale) => (
                        <div key={locale} className="space-y-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {locale.toUpperCase()}
                            </span>

                            <div>
                                <InputLabel value="Resource Title" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={formData[locale].title}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            [locale]: { ...prev[locale], title: e.target.value }
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Resource Description" />
                                <textarea
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="2"
                                    value={formData[locale].description || ''}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            [locale]: { ...prev[locale], description: e.target.value }
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-end">
                    <PrimaryButton disabled={processing} className="text-sm">
                        {processing ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-3 h-3 mr-1" />
                                Save Resource Translations
                            </>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}