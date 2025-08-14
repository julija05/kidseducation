import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { User, Settings, Shield, Globe, Trash2, Award, BookOpen, Star, Trophy, Clock, Target, Zap, Heart, Rocket, Sparkles, Gift, Crown, Medal, Camera, Edit3, Mail, Lock, Languages, UserX, Gamepad2, Palette, Coffee } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateLanguagePreferenceForm from './Partials/UpdateLanguagePreferenceForm';
import { useTranslation } from '@/hooks/useTranslation';
import StudentNavBar from '@/Components/StudentNavBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeSection, setActiveSection] = useState('overview');
    
    // Generate full name from first/last name or fallback to existing name
    const getFullName = () => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`.trim();
        }
        if (user.name && user.name.trim()) {
            return user.name.trim();
        }
        return t('profile.super_learner');
    };
    
    const fullName = getFullName();
    
    // Kid-friendly avatar options
    const avatarOptions = [
        { emoji: '🦸', name: t('profile.avatars.superhero'), color: 'from-blue-400 to-purple-600' },
        { emoji: '🚀', name: t('profile.avatars.space_explorer'), color: 'from-purple-400 to-pink-600' },
        { emoji: '🎨', name: t('profile.avatars.artist'), color: 'from-pink-400 to-red-500' },
        { emoji: '🔬', name: t('profile.avatars.scientist'), color: 'from-green-400 to-blue-500' },
        { emoji: '🎭', name: t('profile.avatars.actor'), color: 'from-yellow-400 to-orange-500' },
        { emoji: '⚡', name: t('profile.avatars.lightning_kid'), color: 'from-yellow-300 to-yellow-500' },
        { emoji: '🌟', name: t('profile.avatars.star_student'), color: 'from-indigo-400 to-purple-600' },
        { emoji: '🎯', name: t('profile.avatars.goal_crusher'), color: 'from-emerald-400 to-green-600' }
    ];
    
    const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
    
    // Stats for the profile
    const profileStats = [
        { label: t('profile.stats.learning_streak'), value: `7 ${t('profile.stats.days')}`, icon: Zap, color: 'from-orange-400 to-red-500', bgColor: 'from-orange-50 to-red-50' },
        { label: t('profile.stats.lessons_done'), value: '24', icon: Trophy, color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-50 to-orange-50' },
        { label: t('profile.stats.points_earned'), value: '1,250', icon: Star, color: 'from-purple-400 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
        { label: t('profile.stats.level'), value: t('profile.stats.math_hero'), icon: Crown, color: 'from-blue-400 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50' }
    ];
    
    // Achievements
    const achievements = [
        { name: t('profile.achievements_list.first_steps.name'), description: t('profile.achievements_list.first_steps.description'), icon: '🎯', earned: true },
        { name: t('profile.achievements_list.speed_demon.name'), description: t('profile.achievements_list.speed_demon.description'), icon: '⚡', earned: true },
        { name: t('profile.achievements_list.streak_master.name'), description: t('profile.achievements_list.streak_master.description'), icon: '🔥', earned: true },
        { name: t('profile.achievements_list.math_wizard.name'), description: t('profile.achievements_list.math_wizard.description'), icon: '🧙‍♂️', earned: false },
        { name: t('profile.achievements_list.code_ninja.name'), description: t('profile.achievements_list.code_ninja.description'), icon: '🥷', earned: false },
        { name: t('profile.achievements_list.super_star.name'), description: t('profile.achievements_list.super_star.description'), icon: '⭐', earned: false }
    ];

    const customHeader = (
        <StudentNavBar 
            panelType="profile"
            icon={Settings}
        />
    );
    
    // Navigation sections
    const navigationSections = [
        { id: 'overview', name: t('profile.navigation.overview'), icon: User, color: 'from-blue-400 to-purple-500' },
        { id: 'settings', name: t('profile.navigation.settings'), icon: Settings, color: 'from-green-400 to-blue-500' },
        { id: 'achievements', name: t('profile.navigation.achievements'), icon: Trophy, color: 'from-yellow-400 to-orange-500' },
        { id: 'security', name: t('profile.navigation.security'), icon: Shield, color: 'from-red-400 to-pink-500' }
    ];

    // Settings sections
    const settingsComponents = {
        'profile-info': <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />,
        'language': <UpdateLanguagePreferenceForm />,
        'password': <UpdatePasswordForm />,
        'danger': <DeleteUserForm />
    };

    return (
        <AuthenticatedLayout customHeader={customHeader}>
            <Head title={t('profile.title')} />
            
            {/* Fun Background */}
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-20 left-10 text-4xl"
                    >
                        ⭐
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -15, 0],
                            rotate: [0, -10, 10, 0]
                        }}
                        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                        className="absolute top-32 right-20 text-5xl"
                    >
                        🚀
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -8, 0],
                            x: [0, 5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                        className="absolute bottom-32 left-20 text-3xl"
                    >
                        ✨
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -12, 0],
                            rotate: [0, 15, -15, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-20 right-10 text-4xl"
                    >
                        🎯
                    </motion.div>
                </div>

                <div className="relative px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Hero Profile Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 shadow-2xl"
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_25%_25%,white,transparent_50%)]"></div>
                            </div>
                            
                            <div className="relative flex flex-col items-center space-y-6 text-center lg:flex-row lg:space-x-8 lg:space-y-0 lg:text-left">
                                {/* Avatar Section */}
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="relative"
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className={`relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br ${selectedAvatar.color} shadow-2xl lg:h-40 lg:w-40`}
                                    >
                                        <div className="flex h-full w-full items-center justify-center text-6xl lg:text-7xl">
                                            {selectedAvatar.emoji}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="absolute -bottom-2 -right-2 rounded-full bg-white p-2 shadow-lg"
                                        >
                                            <Camera className="h-4 w-4 text-gray-600" />
                                        </motion.button>
                                    </motion.div>
                                    
                                    {/* Level Badge */}
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                        className="absolute -top-2 -left-2 rounded-full bg-yellow-400 p-2 shadow-lg"
                                    >
                                        <Crown className="h-5 w-5 text-yellow-800" />
                                    </motion.div>
                                </motion.div>

                                {/* User Info */}
                                <div className="flex-1 space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        <h1 className="text-4xl font-bold text-white lg:text-5xl">
                                            {t('profile.hey_greeting', { name: fullName })}
                                        </h1>
                                        <p className="text-xl text-purple-100 lg:text-2xl">
                                            {selectedAvatar.name} • {t('profile.level_text', { level: 5, title: t('profile.learning_hero') })}
                                        </p>
                                    </motion.div>
                                    
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.5 }}
                                        className="flex flex-wrap justify-center gap-3 lg:justify-start"
                                    >
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            className="rounded-full bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm border border-white/20"
                                        >
                                            🎓 {t('profile.badges.student')}
                                        </motion.span>
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            className="rounded-full bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm border border-white/20"
                                        >
                                            🔥 {t('profile.badges.streak_days', { count: 7 })}
                                        </motion.span>
                                        {user.email_verified_at ? (
                                            <motion.span 
                                                whileHover={{ scale: 1.05 }}
                                                className="rounded-full bg-green-500 bg-opacity-90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm flex items-center gap-2 border border-green-400"
                                            >
                                                ✅ {t('profile.badges.verified')}
                                            </motion.span>
                                        ) : (
                                            <motion.span 
                                                whileHover={{ scale: 1.05 }}
                                                className="rounded-full bg-yellow-500 bg-opacity-90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm flex items-center gap-2 border border-yellow-400"
                                            >
                                                ⚠️ {t('profile.badges.verify_email')}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Navigation Tabs */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start"
                        >
                            {navigationSections.map((section, index) => {
                                const IconComponent = section.icon;
                                return (
                                    <motion.button
                                        key={section.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
                                            activeSection === section.id
                                                ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                                                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                                        }`}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                        <span className="hidden sm:inline">{section.name}</span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>

                        {/* Content Sections */}
                        <AnimatePresence mode="wait">
                            {activeSection === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-8"
                                >
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                        {profileStats.map((stat, index) => {
                                            const IconComponent = stat.icon;
                                            return (
                                                <motion.div
                                                    key={stat.label}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    className={`rounded-2xl bg-gradient-to-br ${stat.bgColor} p-6 shadow-lg border-2 border-white/50`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <motion.div 
                                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                                            className={`rounded-xl bg-gradient-to-r ${stat.color} p-3 shadow-md`}
                                                        >
                                                            <IconComponent className="h-6 w-6 text-white" />
                                                        </motion.div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Avatar Selection */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="rounded-2xl bg-white p-8 shadow-lg border-2 border-purple-100"
                                    >
                                        <h3 className="mb-6 text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            <Sparkles className="h-6 w-6 text-purple-500" />
                                            {t('profile.choose_avatar')}
                                        </h3>
                                        <div className="grid grid-cols-4 gap-4 lg:grid-cols-8">
                                            {avatarOptions.map((avatar, index) => (
                                                <motion.button
                                                    key={avatar.name}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedAvatar(avatar)}
                                                    className={`relative rounded-2xl p-4 transition-all ${
                                                        selectedAvatar.name === avatar.name
                                                            ? `bg-gradient-to-br ${avatar.color} shadow-lg ring-4 ring-purple-300`
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <div className="text-3xl">{avatar.emoji}</div>
                                                    {selectedAvatar.name === avatar.name && (
                                                        <motion.div 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute -top-2 -right-2 rounded-full bg-green-400 p-1"
                                                        >
                                                            <Star className="h-3 w-3 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {activeSection === 'achievements' && (
                                <motion.div
                                    key="achievements"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <Trophy className="h-8 w-8 text-yellow-500" />
                                        {t('profile.your_achievements')}
                                    </h2>
                                    
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {achievements.map((achievement, index) => (
                                            <motion.div
                                                key={achievement.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className={`rounded-2xl p-6 shadow-lg border-2 transition-all ${
                                                    achievement.earned
                                                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`text-4xl ${achievement.earned ? '' : 'grayscale'}`}>
                                                        {achievement.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`text-lg font-bold ${
                                                            achievement.earned ? 'text-gray-900' : 'text-gray-500'
                                                        }`}>
                                                            {achievement.name}
                                                        </h3>
                                                        <p className={`text-sm ${
                                                            achievement.earned ? 'text-gray-600' : 'text-gray-400'
                                                        }`}>
                                                            {achievement.description}
                                                        </p>
                                                    </div>
                                                    {achievement.earned ? (
                                                        <motion.div 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="rounded-full bg-green-100 p-2"
                                                        >
                                                            <Star className="h-5 w-5 text-green-600" />
                                                        </motion.div>
                                                    ) : (
                                                        <div className="rounded-full bg-gray-200 p-2">
                                                            <Lock className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <Settings className="h-8 w-8 text-blue-500" />
                                        {t('profile.profile_settings')}
                                    </h2>
                                    
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Profile Information */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.4 }}
                                            className="rounded-2xl bg-white p-6 shadow-lg border-2 border-blue-100"
                                        >
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-xl bg-blue-100 p-3">
                                                    <Edit3 className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{t('profile.profile_information')}</h3>
                                                    <p className="text-sm text-gray-600">{t('profile.profile_info_desc')}</p>
                                                </div>
                                            </div>
                                            {settingsComponents['profile-info']}
                                        </motion.div>

                                        {/* Language */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2, duration: 0.4 }}
                                            className="rounded-2xl bg-white p-6 shadow-lg border-2 border-green-100"
                                        >
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-xl bg-green-100 p-3">
                                                    <Languages className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{t('profile.language_preference')}</h3>
                                                    <p className="text-sm text-gray-600">{t('profile.language_pref_desc')}</p>
                                                </div>
                                            </div>
                                            {settingsComponents['language']}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <Shield className="h-8 w-8 text-red-500" />
                                        {t('profile.security_settings')}
                                    </h2>
                                    
                                    <div className="grid gap-6">
                                        {/* Password */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1, duration: 0.4 }}
                                            className="rounded-2xl bg-white p-6 shadow-lg border-2 border-orange-100"
                                        >
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-xl bg-orange-100 p-3">
                                                    <Lock className="h-6 w-6 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{t('profile.update_password')}</h3>
                                                    <p className="text-sm text-gray-600">{t('profile.password_desc')}</p>
                                                </div>
                                            </div>
                                            {settingsComponents['password']}
                                        </motion.div>

                                        {/* Danger Zone */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2, duration: 0.4 }}
                                            className="rounded-2xl bg-white p-6 shadow-lg border-2 border-red-200"
                                        >
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-xl bg-red-100 p-3">
                                                    <UserX className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-red-900">{t('profile.delete_account')}</h3>
                                                    <p className="text-sm text-red-700">{t('profile.delete_account_desc')}</p>
                                                </div>
                                            </div>
                                            {settingsComponents['danger']}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
