import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import GuestFrontLayout from "@/Layouts/GuessFrontLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { iconMap } from "@/Utils/iconMapping";
import { BookOpen, Star, Sparkles, Clock, ArrowRight, Users, Award } from "lucide-react";

const ProgramsIndex = ({ auth, programs }) => {
    const { t } = useTranslation();
    // const { programs, pageTitle, content } = usePage().props;
    const colors = [
        {
            primary: "bg-gradient-to-br from-blue-500 to-blue-600",
            light: "bg-blue-50",
            accent: "text-blue-600",
            border: "border-blue-200",
        },
        {
            primary: "bg-gradient-to-br from-purple-500 to-purple-600", 
            light: "bg-purple-50",
            accent: "text-purple-600",
            border: "border-purple-200",
        },
        {
            primary: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            light: "bg-emerald-50", 
            accent: "text-emerald-600",
            border: "border-emerald-200",
        },
        {
            primary: "bg-gradient-to-br from-orange-500 to-orange-600",
            light: "bg-orange-50",
            accent: "text-orange-600", 
            border: "border-orange-200",
        },
    ];

    return (
        <GuestFrontLayout auth={auth}>
            <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 px-6 overflow-hidden">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Discover Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Learning Programs</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Interactive, engaging, and designed for young minds. Start your child's learning journey today.
                        </p>
                    </motion.div>
                </div>

                {/* Programs Grid */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program, index) => {
                            const color = colors[index % colors.length];
                            const Icon = iconMap[program.icon] || BookOpen;
                            
                            return (
                                <motion.div
                                    key={program.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className="group"
                                >
                                    <Link href={route("programs.show", program.slug)}>
                                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
                                            {/* Header with Icon */}
                                            <div className={`${color.light} relative p-8 text-center ${color.border} border-b`}>
                                                {/* Background Pattern */}
                                                <div className="absolute inset-0 opacity-5">
                                                    <div className="absolute top-4 left-4">
                                                        <div className="w-8 h-8 border-2 border-current rounded-full opacity-20"></div>
                                                    </div>
                                                    <div className="absolute top-8 right-6">
                                                        <div className="w-4 h-4 border border-current rounded opacity-30"></div>
                                                    </div>
                                                    <div className="absolute bottom-6 left-8">
                                                        <div className="w-6 h-6 border border-current rotate-45 opacity-25"></div>
                                                    </div>
                                                </div>
                                                
                                                {/* Icon */}
                                                <div className={`${color.primary} inline-flex p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon size={48} className="text-white" />
                                                </div>
                                                
                                                {/* Badge */}
                                                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-yellow-500">
                                                    NEW
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                                    {program.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                                                    {program.description}
                                                </p>
                                                
                                                {/* Stats */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center space-x-2 text-gray-500">
                                                            <Clock size={16} />
                                                            <span>{program.duration}</span>
                                                        </div>
                                                        <div className={`${color.accent} font-bold text-lg`}>
                                                            €{program.price}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Features */}
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                                        <div className="flex items-center space-x-1">
                                                            <Users size={12} />
                                                            <span>All Ages</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Award size={12} />
                                                            <span>Certificate</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* CTA Button */}
                                                    <div className={`${color.primary} text-white text-center py-3 px-4 rounded-xl font-medium text-sm group-hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2`}>
                                                        <span>Start Learning</span>
                                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </GuestFrontLayout>
    );
};

export default ProgramsIndex;
