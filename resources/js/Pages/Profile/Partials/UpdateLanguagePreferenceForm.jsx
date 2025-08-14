import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Globe, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function UpdateLanguagePreferenceForm({ className = '' }) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    
    const [selectedLanguage, setSelectedLanguage] = useState(user.language_preference || 'en');
    
    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        language: user.language_preference || 'en',
        first_time: false
    });

    const languages = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
            description: 'Use English as your preferred language'
        },
        {
            code: 'mk',
            name: 'Macedonian',
            nativeName: 'Македонски',
            flag: '🇲🇰',
            description: 'Користете македонски како ваш преферираен јазик'
        }
    ];

    const handleLanguageSelect = (languageCode) => {
        setSelectedLanguage(languageCode);
        setData('language', languageCode);
    };

    const submit = (e) => {
        e.preventDefault();

        console.log('Submitting language preference:', data);
        console.log('Using route URL:', route('language.set-preference'));

        // Now that route order is fixed, use the simple approach
        post(route('language.set-preference'), {
            preserveScroll: true,
            onSuccess: (response) => {
                console.log('Language preference updated successfully:', response);
                // Force a page reload to apply language changes immediately
                setTimeout(() => window.location.reload(), 500);
            },
            onError: (errors) => {
                console.error('Error updating language preference:', errors);
                console.error('Error details:', JSON.stringify(errors, null, 2));
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <div className="flex items-center mb-4">
                    <Globe 
                        className="w-6 h-6 mr-3" 
                        style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                    />
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            {t('profile.language_preference')}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {t('profile.language_preference_description')}
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="space-y-3">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            type="button"
                            onClick={() => handleLanguageSelect(language.code)}
                            className="w-full text-left p-4 rounded-lg border-2 transition-all duration-200"
                            style={{
                                borderColor: selectedLanguage === language.code 
                                    ? 'rgb(var(--primary-500, 59 130 246))' 
                                    : '#e5e7eb',
                                backgroundColor: selectedLanguage === language.code 
                                    ? 'rgb(var(--primary-100, 219 234 254))' 
                                    : 'transparent',
                                boxShadow: selectedLanguage === language.code ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedLanguage !== language.code) {
                                    e.target.style.backgroundColor = '#f9fafb';
                                    e.target.style.borderColor = 'rgb(var(--primary-300, 147 197 253))';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedLanguage !== language.code) {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.borderColor = '#e5e7eb';
                                }
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{language.flag}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {language.nativeName}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {language.description}
                                        </div>
                                    </div>
                                </div>
                                {selectedLanguage === language.code && (
                                    <div>
                                        <Check 
                                            className="w-5 h-5" 
                                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>


                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white"
                        style={{
                            backgroundColor: processing 
                                ? '#d1d5db' 
                                : 'rgb(var(--primary-600, 37 99 235))',
                            color: processing ? '#6b7280' : 'white',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            boxShadow: processing ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            if (!processing) {
                                e.target.style.backgroundColor = 'rgb(var(--primary-700, 29 78 216))';
                                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!processing) {
                                e.target.style.backgroundColor = 'rgb(var(--primary-600, 37 99 235))';
                                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }
                        }}
                    >
                        {processing ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {t('actions.save')}...
                            </div>
                        ) : (
                            t('actions.save')
                        )}
                    </button>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            {t('profile.language_saved')}
                        </p>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.language || 'An error occurred while updating language preference'}
                        </div>
                    )}
                </div>

                <div 
                    className="text-sm text-gray-600 border rounded-lg p-3"
                    style={{
                        backgroundColor: 'rgb(var(--primary-50, 239 246 255))',
                        borderColor: 'rgb(var(--primary-200, 191 219 254))'
                    }}
                >
                    <div className="flex items-start">
                        <div 
                            className="mr-2"
                            style={{ color: 'rgb(var(--primary-600, 37 99 235))' }}
                        >
                            💡
                        </div>
                        <div>
                            <strong>{t('profile.language_note')}:</strong> {t('profile.language_note_description')}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}