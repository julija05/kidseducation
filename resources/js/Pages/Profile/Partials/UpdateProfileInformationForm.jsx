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

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            {t('profile.email_unverified')}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {t('profile.resend_verification')}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                {t('profile.verification_sent')}
                            </div>
                        )}
                    </div>
                )}

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
