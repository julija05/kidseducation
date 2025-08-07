import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuessFrontLayout from '@/Layouts/GuessFrontLayout';
import { Play, Lock, Users, Clock, Star } from 'lucide-react';

// Let me try direct translation access instead of the hook
function useTranslation() {
    return {
        t: (key, replacements = {}) => {
            // Hardcoded translations for now to test
            const translations = {
                'app.demo.what_included': 'What\'s Included in the Demo',
                'app.demo.first_lesson_access': 'Access to First Lesson',
                'app.demo.first_lesson_description': 'Experience the full first lesson with all resources and materials.',
                'app.demo.no_commitment': 'No Commitment Required',
                'app.demo.no_commitment_description': 'Just enter your email to get started - no payment required.',
                'app.demo.seven_days': '7 Days Free Access',
                'app.demo.seven_days_description': 'Your demo account remains active for 7 days.',
                'app.demo.easy_enrollment': 'Easy Enrollment',
                'app.demo.easy_enrollment_description': 'Convert to full enrollment with one click if you like what you see.',
                'app.demo.limitations': 'Demo Limitations',
                'app.demo.only_first_lesson': 'Access limited to first lesson only',
                'app.demo.no_progress_saved': 'Progress is not permanently saved',
                'app.demo.expires_seven_days': 'Demo expires after 7 days',
                'app.demo.no_teacher_interaction': 'No teacher support or feedback',
                'app.demo.start_demo': 'Start Your Free Demo',
                'app.demo.start_free_demo': 'Start Free Demo',
                'app.demo.no_credit_card': 'No credit card required',
                'app.demo.try': 'Try',
                'app.demo.description': 'Get a free preview of the first lesson and see what our program offers before enrolling.',
                'app.form.first_name': 'First Name',
                'app.form.last_name': 'Last Name',
                'app.form.email': 'Email',
                'app.form.password': 'Password',
                'app.form.confirm_password': 'Confirm Password',
                'app.form.enter_first_name': 'Enter your first name',
                'app.form.enter_last_name': 'Enter your last name',
                'app.form.enter_email': 'Enter your email',
                'app.form.enter_password': 'Enter your password',
                'app.form.creating': 'Creating...',
                'app.navigation.back_to_programs': 'Back to Programs',
            };
            
            return translations[key] || key;
        }
    };
}

export default function DemoAccess({ program }) {
    const { t } = useTranslation();
    
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('demo.create', program.slug));
    };

    return (
        <GuessFrontLayout>
            <Head title={`${t('app.demo.try')} ${program.translated_name || program.name}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-2xl font-bold mb-6">
                            {program.icon || '📚'}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('app.demo.try')} {program.translated_name || program.name}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('app.demo.description')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Demo Features */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    {t('app.demo.what_included')}
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <Play className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {t('app.demo.first_lesson_access')}
                                            </h3>
                                            <p className="text-gray-600">
                                                {t('app.demo.first_lesson_description')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <Users className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {t('app.demo.no_commitment')}
                                            </h3>
                                            <p className="text-gray-600">
                                                {t('app.demo.no_commitment_description')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <Clock className="h-6 w-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {t('app.demo.seven_days')}
                                            </h3>
                                            <p className="text-gray-600">
                                                {t('app.demo.seven_days_description')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <Star className="h-6 w-6 text-yellow-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {t('app.demo.easy_enrollment')}
                                            </h3>
                                            <p className="text-gray-600">
                                                {t('app.demo.easy_enrollment_description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Limitations */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                <div className="flex items-start space-x-3">
                                    <Lock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-lg font-medium text-amber-800 mb-2">
                                            {t('app.demo.limitations')}
                                        </h3>
                                        <ul className="text-amber-700 space-y-1 text-sm">
                                            <li>• {t('app.demo.only_first_lesson')}</li>
                                            <li>• {t('app.demo.no_progress_saved')}</li>
                                            <li>• {t('app.demo.expires_seven_days')}</li>
                                            <li>• {t('app.demo.no_teacher_interaction')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demo Access Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                {t('app.demo.start_demo')}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('app.form.first_name')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.first_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={t('app.form.enter_first_name')}
                                            required
                                        />
                                        {errors.first_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('app.form.last_name')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                errors.last_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={t('app.form.enter_last_name')}
                                            required
                                        />
                                        {errors.last_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('app.form.email')} *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder={t('app.form.enter_email')}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('app.form.password')} *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder={t('app.form.enter_password')}
                                        required
                                        minLength={8}
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('app.form.confirm_password')} *
                                    </label>
                                    <input
                                        type="password"
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder={t('app.form.confirm_password')}
                                        required
                                        minLength={8}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
                                >
                                    {processing ? t('app.form.creating') : t('app.demo.start_free_demo')}
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    {t('app.demo.no_credit_card')}
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* Back to Programs */}
                    <div className="text-center mt-12">
                        <a
                            href={route('programs.index')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← {t('app.navigation.back_to_programs')}
                        </a>
                    </div>
                </div>
            </div>
        </GuessFrontLayout>
    );
}