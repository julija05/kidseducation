import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuessFrontLayout from '@/Layouts/GuessFrontLayout';
import { Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DemoExpired() {
    const { t } = useTranslation();

    return (
        <GuessFrontLayout>
            <Head title={t('app.demo.expired_title')} />
            
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-6">
                            <Clock className="h-10 w-10" />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {t('app.demo.expired_title')}
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-gray-600 mb-8">
                            {t('app.demo.expired_description')}
                        </p>

                        {/* Actions */}
                        <div className="space-y-4">
                            <Link
                                href={route('programs.index')}
                                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105"
                            >
                                <RefreshCw className="h-5 w-5 mr-2" />
                                {t('app.demo.try_another_demo')}
                            </Link>

                            <div className="text-gray-500">
                                {t('app.common.or')}
                            </div>

                            <Link
                                href={route('register')}
                                className="inline-flex items-center px-8 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-600 hover:text-white transform transition-all duration-200"
                            >
                                {t('app.enrollment.enroll_full_program')}
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                {t('app.demo.contact_support')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuessFrontLayout>
    );
}