import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AbacusSimulator({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [columns, setColumns] = useState(7); // Number of columns (digits)
    const [beadStates, setBeadStates] = useState({});
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showValue, setShowValue] = useState(true);

    // Initialize bead states
    useEffect(() => {
        const initialStates = {};
        for (let col = 0; col < columns; col++) {
            initialStates[col] = {
                heaven: false, // 1 heaven bead (worth 5)
                earth: [false, false, false, false] // 4 earth beads (worth 1 each)
            };
        }
        setBeadStates(initialStates);
    }, [columns]);

    // Calculate the current value displayed on the abacus
    const calculateValue = () => {
        let total = 0;
        for (let col = 0; col < columns; col++) {
            const columnValue = getColumnValue(col);
            total += columnValue * Math.pow(10, columns - 1 - col);
        }
        return total;
    };

    // Get value for a specific column
    const getColumnValue = (column) => {
        const state = beadStates[column];
        if (!state) return 0;
        
        let value = 0;
        // Heaven bead is worth 5
        if (state.heaven) value += 5;
        // Each earth bead is worth 1
        value += state.earth.filter(bead => bead).length;
        
        return value;
    };

    // Play bead sound
    const playBeadSound = () => {
        if (!soundEnabled) return;
        
        // Create a simple bead click sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Toggle heaven bead
    const toggleHeavenBead = (column) => {
        setBeadStates(prev => ({
            ...prev,
            [column]: {
                ...prev[column],
                heaven: !prev[column].heaven
            }
        }));
        playBeadSound();
    };

    // Toggle earth bead
    const toggleEarthBead = (column, beadIndex) => {
        setBeadStates(prev => {
            const newEarthState = [...prev[column].earth];
            const currentBead = newEarthState[beadIndex];
            
            if (currentBead) {
                // If turning off, turn off this bead and all above it
                for (let i = beadIndex; i < newEarthState.length; i++) {
                    newEarthState[i] = false;
                }
            } else {
                // If turning on, turn on this bead and all below it
                for (let i = 0; i <= beadIndex; i++) {
                    newEarthState[i] = true;
                }
            }
            
            return {
                ...prev,
                [column]: {
                    ...prev[column],
                    earth: newEarthState
                }
            };
        });
        playBeadSound();
    };

    // Reset all beads
    const resetAbacus = () => {
        const resetStates = {};
        for (let col = 0; col < columns; col++) {
            resetStates[col] = {
                heaven: false,
                earth: [false, false, false, false]
            };
        }
        setBeadStates(resetStates);
        playBeadSound();
    };

    // Set a specific number on the abacus
    const setNumber = (number) => {
        const numberStr = number.toString().padStart(columns, '0');
        const newStates = {};
        
        for (let col = 0; col < columns; col++) {
            const digit = parseInt(numberStr[col]);
            const heaven = digit >= 5;
            const earthCount = Math.min(digit % 5, 4); // Ensure we don't exceed 4 earth beads
            
            newStates[col] = {
                heaven,
                earth: Array(4).fill(false).map((_, i) => i < earthCount)
            };
        }
        
        setBeadStates(newStates);
        playBeadSound();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-auto transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modern Header with Gradient */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🧮</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{t('dashboard.abacus_simulator')}</h2>
                            <p className="text-amber-100 text-sm">Mental Arithmetic Practice Tool</p>
                        </div>
                        {showValue && (
                            <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/30 ml-6">
                                <div className="text-xs text-amber-100 mb-1">Current Value</div>
                                <span className="text-2xl font-mono font-bold text-white">
                                    {calculateValue().toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Modern Controls */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/30"
                            title={soundEnabled ? t('dashboard.disable_sound') : t('dashboard.enable_sound')}
                        >
                            {soundEnabled ? (
                                <Volume2 className="w-5 h-5 text-white" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-white" />
                            )}
                        </button>
                        
                        <button
                            onClick={() => setShowValue(!showValue)}
                            className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30 text-white"
                        >
                            {showValue ? t('dashboard.hide_value') : t('dashboard.show_value')}
                        </button>
                        
                        <button
                            onClick={resetAbacus}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t('dashboard.reset')}
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="p-3 rounded-xl hover:bg-red-500/20 transition-all duration-200 backdrop-blur-sm border border-white/30"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Enhanced Quick Number Input */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            {t('dashboard.quick_set')}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {[0, 123, 456, 789, 1234, 5678, 9999].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setNumber(num)}
                                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                                >
                                    {num.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Abacus */}
                <div className="p-8">
                    {/* Traditional Soroban Frame */}
                    <div className="relative bg-gradient-to-b from-amber-900 to-amber-800 rounded-lg shadow-2xl border-4 border-amber-700 p-8">
                        {/* Outer frame decoration */}
                        <div className="absolute inset-2 border-2 border-amber-600 rounded-md"></div>
                        
                        {/* Position Labels */}
                        <div className="flex justify-center mb-6">
                            <div className="flex gap-2">
                                {Array.from({ length: columns }, (_, i) => (
                                    <div key={i} className="w-20 text-center">
                                        <div className="text-xs text-amber-200 mb-1 font-medium">
                                            {Math.pow(10, columns - 1 - i).toLocaleString()}
                                        </div>
                                        <div className="font-mono text-base font-bold text-amber-100 bg-amber-800 rounded px-2 py-1">
                                            {getColumnValue(i)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Abacus Body */}
                        <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg p-6 border-3 border-amber-600 shadow-inner">
                            {/* Vertical Rods */}
                            <div className="absolute inset-0 flex justify-center pointer-events-none">
                                <div className="flex gap-2">
                                    {Array.from({ length: columns }, (_, rodIndex) => (
                                        <div key={`rod-${rodIndex}`} className="w-20 flex justify-center">
                                            <div className="w-1 h-full bg-gradient-to-b from-amber-700 to-amber-900 rounded-full shadow-sm"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Heaven Section */}
                            <div className="relative z-10 mb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="flex gap-2">
                                        {Array.from({ length: columns }, (_, col) => (
                                            <div key={col} className="w-20 flex flex-col items-center">
                                                {/* Heaven Bead */}
                                                <button
                                                    onClick={() => toggleHeavenBead(col)}
                                                    className={`w-12 h-8 rounded-full border-3 transition-all duration-300 shadow-lg hover:scale-105 ${
                                                        beadStates[col]?.heaven
                                                            ? 'bg-gradient-to-b from-red-400 to-red-600 border-red-800 shadow-red-400/50 transform translate-y-4'
                                                            : 'bg-gradient-to-b from-red-300 to-red-500 border-red-700 hover:from-red-400 hover:to-red-600'
                                                    }`}
                                                    title={t('dashboard.heaven_bead', { column: col + 1 })}
                                                >
                                                    <div className="w-full h-full rounded-full bg-gradient-to-t from-transparent to-white/30"></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Crossbar (Separator) */}
                                <div className="flex justify-center">
                                    <div className="w-full max-w-4xl h-4 bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg shadow-lg border-2 border-amber-800 relative">
                                        <div className="absolute inset-1 bg-gradient-to-b from-amber-600 to-amber-800 rounded-md"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Earth Section */}
                            <div className="relative z-10 pt-4">
                                <div className="flex justify-center">
                                    <div className="flex gap-2">
                                        {Array.from({ length: columns }, (_, col) => (
                                            <div key={col} className="w-20 flex flex-col items-center space-y-2">
                                                {/* Earth Beads */}
                                                {Array.from({ length: 4 }, (_, beadIndex) => (
                                                    <button
                                                        key={beadIndex}
                                                        onClick={() => toggleEarthBead(col, beadIndex)}
                                                        className={`w-10 h-7 rounded-full border-3 transition-all duration-300 shadow-lg hover:scale-105 ${
                                                            beadStates[col]?.earth[beadIndex]
                                                                ? 'bg-gradient-to-b from-blue-400 to-blue-600 border-blue-800 shadow-blue-400/50 transform -translate-y-2'
                                                                : 'bg-gradient-to-b from-blue-300 to-blue-500 border-blue-700 hover:from-blue-400 hover:to-blue-600'
                                                        }`}
                                                        title={t('dashboard.earth_bead', { bead: beadIndex + 1, column: col + 1 })}
                                                    >
                                                        <div className="w-full h-full rounded-full bg-gradient-to-t from-transparent to-white/30"></div>
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Traditional corner decorations */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-amber-400 rounded-tl"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-amber-400 rounded-tr"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-amber-400 rounded-bl"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-amber-400 rounded-br"></div>
                    </div>
                </div>

                {/* Enhanced Instructions */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 text-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-lg">📚</span>
                                {t('dashboard.how_to_use')}
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{t('dashboard.click_red_beads')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{t('dashboard.click_blue_beads')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{t('dashboard.each_column_earth')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{t('dashboard.earth_beads_move')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{t('dashboard.each_column_digit')}</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-lg">💡</span>
                                {t('dashboard.tips')}
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-amber-500 mt-1 flex-shrink-0">✨</span>
                                    <span className="text-gray-700">{t('dashboard.use_heaven_beads')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1 flex-shrink-0">🧮</span>
                                    <span className="text-gray-700">{t('dashboard.practice_addition')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1 flex-shrink-0">⚡</span>
                                    <span className="text-gray-700">{t('dashboard.try_quick_set')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-purple-500 mt-1 flex-shrink-0">🔊</span>
                                    <span className="text-gray-700">{t('dashboard.sound_toggle')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}