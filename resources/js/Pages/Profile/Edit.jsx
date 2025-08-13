import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { User, Settings, Palette, Shield, Globe, Trash2, Award, BookOpen, Calendar, Star, Trophy, Clock, Target } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateLanguagePreferenceForm from './Partials/UpdateLanguagePreferenceForm';
import SimpleThemeSelector from '@/Components/SimpleThemeSelector';
import AvatarSelector from '@/Components/AvatarSelector';
import { useTranslation } from '@/hooks/useTranslation';
import StudentNavBar from '@/Components/StudentNavBar';
import { useAvatar } from '@/hooks/useAvatar.jsx';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    const { avatarData, renderAvatar } = useAvatar();
    
    // Generate full name from first/last name or fallback to existing name
    const getFullName = () => {
        if (user.first_name && user.last_name) {
            // If both first and last name exist, combine them
            return `${user.first_name} ${user.last_name}`.trim();
        }
        
        // If no separate fields, use the existing name field
        if (user.name && user.name.trim()) {
            return user.name.trim();
        }
        
        // Last fallback
        return 'User';
    };
    
    const fullName = getFullName();
    
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
        <StudentNavBar 
            panelType="profile"
            icon={Settings}
        />
    );

    const profileSections = [
        {
            id: 'profile-info',
            title: t('profile.profile_information'),
            description: t('profile.profile_information_description'),
            icon: User,
            component: <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
        },
        {
            id: 'avatar-selection',
            title: t('profile.avatar_selection'),
            description: t('profile.avatar_selection_description'),
            icon: User,
            component: <AvatarSelector currentAvatar={(() => {
                try {
                    // First try localStorage, then fallback to database
                    const localAvatar = localStorage.getItem('user_avatar_preference');
                    if (localAvatar) {
                        const avatarData = JSON.parse(localAvatar);
                        return avatarData?.id || 'initial';
                    }
                    const avatarData = user.avatar_path ? JSON.parse(user.avatar_path) : null;
                    return avatarData?.id || 'initial';
                } catch (e) {
                    return 'initial';
                }
            })()} />
        },
        {
            id: 'theme-preferences',
            title: t('profile.dashboard_theme'),
            description: t('profile.dashboard_theme_description'),
            icon: Palette,
            component: <SimpleThemeSelector />
        },
        {
            id: 'language-preferences',
            title: t('profile.language_preference'),
            description: t('profile.language_preference_description'),
            icon: Globe,
            component: <UpdateLanguagePreferenceForm />
        },
        {
            id: 'security',
            title: t('profile.update_password'),
            description: t('profile.update_password_description'),
            icon: Shield,
            component: <UpdatePasswordForm />
        },
        {
            id: 'danger-zone',
            title: t('profile.delete_account'),
            description: t('profile.delete_account_description'),
            icon: Trash2,
            component: <DeleteUserForm />,
            isDanger: true
        }
    ];

    return (
        <AuthenticatedLayout
            programConfig={profileTheme}
            customHeader={customHeader}
        >
            <Head title={t('nav.profile')} />

            {/* Full Page Background */}
            <div 
                className="min-h-screen"
                style={{
                    background: 'var(--primary-gradient-light, linear-gradient(to bottom right, rgb(239 246 255), rgb(219 234 254)))'
                }}
            >
                {/* Hero Profile Section */}
                <div className="relative overflow-hidden">
                    {/* Background Pattern */}
                    <div 
                        className="absolute inset-0"
                        style={{
                            background: 'var(--primary-gradient, linear-gradient(to right, rgb(37 99 235), rgb(79 70 229)))'
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    
                    {/* Content */}
                    <div className="relative px-4 py-16 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-6xl">
                            <div className="flex flex-col items-center space-y-8 text-center lg:flex-row lg:space-x-12 lg:space-y-0 lg:text-left">
                                {/* Avatar Section */}
                                <div className="relative">
                                    <div className="group relative">
                                        <div 
                                            className="h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-2xl transition-transform group-hover:scale-105"
                                            style={{
                                                backgroundColor: `rgb(var(--primary-600, 37 99 235))`
                                            }}
                                        >
                                            {avatarData && avatarData.type === 'emoji' ? (
                                                <div 
                                                    className="flex h-full w-full items-center justify-center text-6xl"
                                                    style={{
                                                        backgroundColor: `rgb(var(--primary-100, 219 234 254))`
                                                    }}
                                                >
                                                    {avatarData.value}
                                                </div>
                                            ) : user.avatar_path && !user.avatar_path.startsWith('{') ? (
                                                <img 
                                                    src={user.avatar_path} 
                                                    alt={fullName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-white">
                                                    {fullName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-2 right-2 rounded-full bg-white p-2 shadow-lg">
                                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h1 className="text-4xl font-bold text-white lg:text-5xl">{fullName}</h1>
                                        <p className="text-xl text-purple-100">{user.email}</p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-3 lg:justify-start">
                                            <span className="rounded-full bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                                🎓 {t('profile.active_student')}
                                            </span>
                                            <span className="rounded-full bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                                ⭐ {t('profile.learning_enthusiast')}
                                            </span>
                                            {user.email_verified_at ? (
                                                <span className="rounded-full bg-green-500 bg-opacity-90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm flex items-center gap-2">
                                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.email_verified_badge')}
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-yellow-500 bg-opacity-90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm flex items-center gap-2">
                                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {t('verification.email_unverified_badge')}
                                                </span>
                                            )}
                                            <span className="rounded-full bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                                📅 {t('profile.member_since')} {(() => {
                                                    if (!user.created_at) return 'N/A';
                                                    const date = new Date(user.created_at);
                                                    return isNaN(date.getTime()) ? 'N/A' : date.getFullYear();
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="relative -mt-8 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-center space-x-4">
                                    <div 
                                        className="rounded-xl p-3 transition-colors"
                                        style={{
                                            backgroundColor: `rgb(var(--primary-100, 219 234 254))`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = `rgb(var(--primary-200, 191 219 254))`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = `rgb(var(--primary-100, 219 234 254))`;
                                        }}
                                    >
                                        <BookOpen 
                                            className="h-6 w-6" 
                                            style={{ color: `rgb(var(--primary-600, 37 99 235))` }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{t('nav.programs')}</p>
                                        <p className="text-2xl font-bold text-gray-900">3</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-xl bg-primary-100 p-3 group-hover:bg-primary-200 transition-colors">
                                        <Trophy className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{t('lessons.completed')}</p>
                                        <p className="text-2xl font-bold text-gray-900">12</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-xl bg-primary-100 p-3 group-hover:bg-primary-200 transition-colors">
                                        <Clock className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{t('profile.study_hours')}</p>
                                        <p className="text-2xl font-bold text-gray-900">24</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-xl bg-primary-100 p-3 group-hover:bg-primary-200 transition-colors">
                                        <Target className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{t('profile.streak')}</p>
                                        <p className="text-2xl font-bold text-gray-900">7 {t('profile.days')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-8 lg:grid-cols-2">
                            {profileSections.map((section) => {
                                const IconComponent = section.icon;
                                return (
                                    <div 
                                        key={section.id}
                                        className={`group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                            section.isDanger ? 'border border-red-200' : ''
                                        }`}
                                    >
                                        {/* Section Header */}
                                        <div className={`px-8 py-6 ${
                                            section.isDanger 
                                                ? 'bg-gradient-to-r from-red-50 to-red-100' 
                                                : 'bg-primary-gradient-light'
                                        }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`rounded-xl p-3 ${
                                                    section.isDanger 
                                                        ? 'bg-red-100 group-hover:bg-red-200' 
                                                        : 'bg-primary-100 group-hover:bg-primary-200'
                                                } transition-colors`}>
                                                    <IconComponent 
                                                        className={`h-6 w-6 ${
                                                            section.isDanger ? 'text-red-600' : 'text-primary-600'
                                                        }`} 
                                                    />
                                                </div>
                                                <div>
                                                    <h2 className={`text-xl font-bold ${
                                                        section.isDanger ? 'text-red-900' : 'text-gray-900'
                                                    }`}>
                                                        {section.title}
                                                    </h2>
                                                    <p className={`text-sm ${
                                                        section.isDanger ? 'text-red-700' : 'text-gray-600'
                                                    }`}>
                                                        {section.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Section Content */}
                                        <div className="p-8">
                                            {section.component}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
