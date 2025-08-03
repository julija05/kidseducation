import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;

    // Handle existing users who don't have separate first/last names
    const getInitialNames = () => {
        if (user.first_name && user.last_name) {
            return {
                first_name: user.first_name,
                last_name: user.last_name
            };
        }
        
        // Split existing name for users who don't have separate fields
        const nameParts = (user.name || '').trim().split(' ');
        return {
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || ''
        };
    };

    const initialNames = getInitialNames();
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            first_name: initialNames.first_name,
            last_name: initialNames.last_name,
            email: user.email,
            address: user.address || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    {t('profile.profile_information')}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    {t('profile.profile_information_description')}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* First and Last Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="first_name" value={t('forms.first_name')} />

                        <TextInput
                            id="first_name"
                            className="mt-1 block w-full"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                            isFocused
                            autoComplete="given-name"
                            placeholder={t('forms.first_name')}
                        />

                        <InputError className="mt-2" message={errors.first_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value={t('forms.last_name')} />

                        <TextInput
                            id="last_name"
                            className="mt-1 block w-full"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                            autoComplete="family-name"
                            placeholder={t('forms.last_name')}
                        />

                        <InputError className="mt-2" message={errors.last_name} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('forms.email')} />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Address Field */}
                <div>
                    <InputLabel htmlFor="address" value={t('forms.address')} />

                    <textarea
                        id="address"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        autoComplete="street-address"
                        placeholder={t('forms.address_placeholder')}
                        rows={3}
                        style={{
                            borderColor: 'rgb(var(--primary-300, 147 197 253))',
                            focusRingColor: 'rgb(var(--primary-500, 59 130 246))'
                        }}
                    />

                    <InputError className="mt-2" message={errors.address} />
                </div>

                {/* Email Verification Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                {user.email_verified_at ? (
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {user.email_verified_at ? t('verification.email_verified_title') : t('verification.email_verification_required')}
                                </h3>
                                <div className="mt-1 text-sm text-gray-600">
                                    {user.email_verified_at ? (
                                        <p>{t('verification.email_verified_description')}</p>
                                    ) : (
                                        <div>
                                            <p className="mb-2">{t('verification.email_unverified_description')}</p>
                                            <p className="text-xs text-gray-500">{t('verification.already_verified_help')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {!user.email_verified_at && (
                            <div className="ml-4">
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t('verification.resend_email')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {t('profile.verification_sent')}
                                    </p>
                                    <p className="mt-1 text-sm text-green-700">
                                        {t('verification.check_email_instructions')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {status === 'already-verified' && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-800">
                                        {t('verification.already_verified_message')}
                                    </p>
                                    <p className="mt-1 text-sm text-blue-700">
                                        {t('verification.refresh_page_instruction')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{t('actions.save')}</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            {t('profile.saved')}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
