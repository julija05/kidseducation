import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function UpdateLanguagePreferenceForm({ className = '' }) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        language_preference: user.language_preference || 'en',
    });

    const [selectedLanguage, setSelectedLanguage] = useState(user.language_preference || 'en');

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
        setData('language_preference', languageCode);
    };

    const submit = (e) => {
        e.preventDefault();

        // Use the dedicated language preference endpoint instead
        router.post('/language/set-preference', {
            language: selectedLanguage,
            first_time: false
        }, {
            onSuccess: () => {
                // Reload the page to apply the new language
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Error updating language preference:', errors);
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <div className="flex items-center mb-4">
                    <Globe className="w-6 h-6 text-blue-600 mr-3" />
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
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                selectedLanguage === language.code
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
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
                                    <div className="text-blue-500">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {errors.language_preference && (
                    <div className="text-sm text-red-600">
                        {errors.language_preference}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            processing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        }`}
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
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                        <div className="text-blue-500 mr-2">💡</div>
                        <div>
                            <strong>{t('profile.language_note')}:</strong> {t('profile.language_note_description')}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}