// resources/js/Components/ProgramDetailsSection.jsx
import React from "react";
import { iconMap } from "@/Utils/iconMapping";
import { BookOpen, Clock, DollarSign, Star, Sparkles, Users, Award, PlayCircle, CheckCircle, Target, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProgramDetailsSection({ program }) {
    const { t } = useTranslation();
    const Icon = iconMap[program.icon] || BookOpen;
    
    const features = [
        { icon: PlayCircle, titleKey: "interactive_lessons", descKey: "interactive_lessons_desc" },
        { icon: Award, titleKey: "certificate", descKey: "certificate_desc" },
        { icon: Users, titleKey: "expert_support", descKey: "expert_support_desc" },
        { icon: Target, titleKey: "skill_building", descKey: "skill_building_desc" }
    ];
    
    return (
        <div className="space-y-8">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-8 left-8 w-16 h-16 border-2 border-blue-500 rounded-full"></div>
                        <div className="absolute top-20 right-12 w-8 h-8 border border-purple-500 rounded"></div>
                        <div className="absolute bottom-12 left-16 w-12 h-12 border border-pink-500 rotate-45"></div>
                    </div>
                    
                    <div className="relative p-12">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Content */}
                            <div className="space-y-6">
                                <div>
                                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-4">
                                        <Star size={16} className="mr-2" />
                                        {t('programs_page.most_popular')}
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                        {program.name}
                                    </h1>
                                    <p className="text-xl text-gray-600 leading-relaxed">
                                        {program.description}
                                    </p>
                                </div>
                                
                                {/* Rating */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} className="text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-gray-600 font-medium">4.9 (127 {t('programs_page.reviews')})</span>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{program.duration}</div>
                                        <div className="text-sm text-gray-500">{t('programs_page.duration')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">€{program.price}</div>
                                        <div className="text-sm text-gray-500">{t('programs_page.total_price')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">24/7</div>
                                        <div className="text-sm text-gray-500">{t('programs_page.support')}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Icon Visual */}
                            <div className="flex justify-center lg:justify-end">
                                <div className="relative">
                                    {/* Main icon container */}
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <Icon size={120} className="text-white" />
                                    </div>
                                    
                                    {/* Floating elements */}
                                    <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
                                        <Sparkles size={24} className="text-yellow-900" />
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 bg-pink-400 rounded-full p-2 shadow-lg animate-pulse">
                                        <Star size={20} className="text-pink-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-4 w-fit mb-4">
                            <feature.icon size={32} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{t(`programs_page.${feature.titleKey}`)}</h3>
                        <p className="text-sm text-gray-600">{t(`programs_page.${feature.descKey}`)}</p>
                    </div>
                ))}
            </div>
            
            {/* Progress & Achievement Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{t('programs_page.step_by_step')}</h3>
                        <p className="text-sm text-gray-600">{t('programs_page.step_by_step_desc')}</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-4">
                            <TrendingUp size={32} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{t('programs_page.track_progress')}</h3>
                        <p className="text-sm text-gray-600">{t('programs_page.track_progress_desc')}</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-purple-100 rounded-full p-4 w-fit mx-auto mb-4">
                            <Award size={32} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{t('programs_page.earn_rewards')}</h3>
                        <p className="text-sm text-gray-600">{t('programs_page.earn_rewards_desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
