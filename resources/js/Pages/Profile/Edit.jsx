import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { User } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateLanguagePreferenceForm from './Partials/UpdateLanguagePreferenceForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();
    // Create branded navigation theme similar to lessons
    const profileTheme = {
        name: "Abacoding",
        color: "bg-gradient-to-r from-purple-600 to-pink-600",
        lightColor: "bg-gradient-to-br from-purple-50 to-pink-50",
        borderColor: "border-purple-300",
        textColor: "text-purple-700",
        icon: "User"
    };

    const customHeader = (
        <>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <User className="text-white" size={24} />
            </div>
            <button
                onClick={() => router.visit(route("dashboard"))}
                className="flex flex-col text-left hover:opacity-80 transition-opacity"
            >
                <span className="text-2xl font-bold">Abacoding</span>
                <span className="text-xs opacity-75 -mt-1">{t('profile.panel_subtitle')}</span>
            </button>
        </>
    );

    return (
        <AuthenticatedLayout
            programConfig={profileTheme}
            customHeader={customHeader}
        >
            <Head title={t('nav.profile')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateLanguagePreferenceForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
