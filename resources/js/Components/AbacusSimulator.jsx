import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

// Abacus dimensions. A 16-rod soroban lets students represent very large numbers.
const ABACUS_COLUMN_COUNT = 16;
const EARTH_BEADS_PER_COLUMN = 4;
const HEAVEN_BEAD_VALUE = 5;

// Shared Tailwind sizing so every stacked row (labels, rods, beads) stays aligned.
const COLUMN_WIDTH_CLASS = 'w-14';
const COLUMN_GAP_CLASS = 'gap-1.5';

// Flattened-hexagon silhouette that gives each bead the classic bi-convex soroban shape.
const SOROBAN_BEAD_CLIP_PATH = 'polygon(0% 50%, 22% 6%, 78% 6%, 100% 50%, 78% 94%, 22% 94%)';

// A soft top highlight layered over the base colour to fake a rounded, glossy bead surface.
const BEAD_SURFACE_HIGHLIGHT = 'radial-gradient(ellipse at 50% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 58%)';

// Bead colours drawn from the Abacoding dashboard palette: coral heaven beads
// (aba-coral) and blue earth beads (aba-blue) to match the brand accents.
const BEAD_GRADIENTS = {
    heaven: {
        idle: 'linear-gradient(155deg, #FF8A6E 0%, #E8543A 100%)',
        active: 'linear-gradient(155deg, #FF6B4D 0%, #C6402A 100%)',
    },
    earth: {
        idle: 'linear-gradient(155deg, #6FA8FE 0%, #2F6FE0 100%)',
        active: 'linear-gradient(155deg, #3D8BFD 0%, #1E5FD0 100%)',
    },
};

/**
 * SorobanBead - A single bi-convex abacus bead.
 *
 * Renders the diamond/hexagon silhouette with layered gradients for a 3D look and
 * slides toward the reckoning bar when it is counted (active).
 *
 * @param {"heaven" | "earth"} variant - Bead family, drives colour and dimensions.
 * @param {boolean} active - Whether the bead currently counts (sits against the bar).
 * @param {string} activeTranslateClass - Tailwind transform applied while active.
 * @param {() => void} onClick - Toggle handler.
 * @param {string} title - Accessible tooltip text.
 */
function SorobanBead({ variant, active, activeTranslateClass, onClick, title }) {
    const dimensionClasses = variant === 'heaven' ? 'w-11 h-7' : 'w-9 h-6';
    const gradients = BEAD_GRADIENTS[variant];

    return (
        <button
            onClick={onClick}
            title={title}
            aria-pressed={active}
            className={`${dimensionClasses} transition-transform duration-300 ease-out hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${active ? activeTranslateClass : ''}`}
            style={{
                clipPath: SOROBAN_BEAD_CLIP_PATH,
                background: `${BEAD_SURFACE_HIGHLIGHT}, ${active ? gradients.active : gradients.idle}`,
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
            }}
        />
    );
}

export default function AbacusSimulator({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [columns, setColumns] = useState(ABACUS_COLUMN_COUNT); // Number of rods (digits)
    const [beadStates, setBeadStates] = useState({});
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showValue, setShowValue] = useState(true);

    // Build the empty state for a single column (no beads counted).
    const createEmptyColumnState = () => ({
        heaven: false, // 1 heaven bead (worth HEAVEN_BEAD_VALUE)
        earth: Array(EARTH_BEADS_PER_COLUMN).fill(false), // earth beads (worth 1 each)
    });

    // Initialize bead states
    useEffect(() => {
        const initialStates = {};
        for (let col = 0; col < columns; col++) {
            initialStates[col] = createEmptyColumnState();
        }
        setBeadStates(initialStates);
    }, [columns]);

    // Calculate the current value displayed on the abacus. BigInt is used because a
    // 16-rod abacus can exceed JavaScript's safe-integer range for regular numbers.
    const calculateValue = () => {
        let total = 0n;
        for (let col = 0; col < columns; col++) {
            const placeValue = 10n ** BigInt(columns - 1 - col);
            total += BigInt(getColumnValue(col)) * placeValue;
        }
        return total;
    };

    // Get value for a specific column
    const getColumnValue = (column) => {
        const state = beadStates[column];
        if (!state) return 0;
        
        let value = 0;
        // Heaven bead is worth HEAVEN_BEAD_VALUE
        if (state.heaven) value += HEAVEN_BEAD_VALUE;
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
            resetStates[col] = createEmptyColumnState();
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
            const heaven = digit >= HEAVEN_BEAD_VALUE;
            // Earth beads represent the remainder after the heaven bead, capped at the rod's count.
            const earthCount = Math.min(digit % HEAVEN_BEAD_VALUE, EARTH_BEADS_PER_COLUMN);

            newStates[col] = {
                heaven,
                earth: Array(EARTH_BEADS_PER_COLUMN).fill(false).map((_, i) => i < earthCount),
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
                className="bg-aba-surface rounded-aba-lg shadow-aba-card max-w-7xl w-full max-h-[95vh] overflow-auto transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modern Header with Gradient */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-aba-coral to-aba-coral-dark text-white rounded-t-aba-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-aba-sm flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🧮</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{t('dashboard.abacus_simulator')}</h2>
                            <p className="text-white/80 text-sm font-semibold">Mental Arithmetic Practice Tool</p>
                        </div>
                        {showValue && (
                            <div className="bg-white/20 px-6 py-3 rounded-aba-sm backdrop-blur-sm border border-white/30 ml-6">
                                <div className="text-xs text-white/80 mb-1 font-semibold">Current Value</div>
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
                            className="p-3 rounded-aba-sm hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/30"
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
                            className="px-4 py-2 text-sm font-bold bg-white/20 hover:bg-white/30 rounded-aba-sm transition-all duration-200 backdrop-blur-sm border border-white/30 text-white"
                        >
                            {showValue ? t('dashboard.hide_value') : t('dashboard.show_value')}
                        </button>

                        <button
                            onClick={resetAbacus}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/20 hover:bg-white/30 text-white rounded-aba-sm transition-all duration-200 backdrop-blur-sm border border-white/30"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t('dashboard.reset')}
                        </button>

                        <button
                            onClick={onClose}
                            className="p-3 rounded-aba-sm hover:bg-white/25 transition-all duration-200 backdrop-blur-sm border border-white/30"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Enhanced Quick Number Input */}
                <div className="p-6 border-b border-aba-line bg-aba-surface-alt">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-bold text-aba-ink-soft flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            {t('dashboard.quick_set')}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                            {[0, 123, 456, 789, 1234, 5678, 9999, 1000000].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setNumber(num)}
                                    className="px-4 py-2 text-sm font-bold bg-aba-blue hover:brightness-95 text-white rounded-aba-sm transition-all duration-200 transform hover:scale-105 hover:shadow-aba-sm"
                                >
                                    {num.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Abacus */}
                <div className="p-6 sm:p-8">
                    {/* Soroban Frame (navy, matching the dashboard ink palette) */}
                    <div className="relative bg-gradient-to-b from-[#243456] to-aba-ink rounded-aba-lg shadow-aba-card p-4 sm:p-6 ring-1 ring-black/10">
                        {/* Outer frame decoration */}
                        <div className="absolute inset-2 border border-white/10 rounded-aba-md pointer-events-none"></div>

                        {/* Horizontal scroll keeps all 16 rods usable on narrow screens */}
                        <div className="relative overflow-x-auto pb-1">
                            <div className="mx-auto w-max min-w-full">
                                {/* Position Labels (current digit on each rod) */}
                                <div className={`flex justify-center mb-5 ${COLUMN_GAP_CLASS}`}>
                                    {Array.from({ length: columns }, (_, i) => (
                                        <div key={i} className={`${COLUMN_WIDTH_CLASS} text-center`}>
                                            <div className="font-mono text-sm font-bold text-white bg-white/10 rounded-md px-1 py-1">
                                                {getColumnValue(i)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Abacus Body */}
                                <div className="relative bg-gradient-to-b from-aba-surface to-aba-blue-soft rounded-aba-md p-5 border border-aba-line shadow-inner">
                                    {/* Vertical Rods */}
                                    <div className="absolute inset-0 flex justify-center pointer-events-none">
                                        <div className={`flex ${COLUMN_GAP_CLASS}`}>
                                            {Array.from({ length: columns }, (_, rodIndex) => (
                                                <div key={`rod-${rodIndex}`} className={`${COLUMN_WIDTH_CLASS} flex justify-center`}>
                                                    <div className="w-[3px] h-full bg-aba-rod rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Heaven Section */}
                                    <div className="relative z-10 mb-5">
                                        <div className={`flex justify-center mb-4 ${COLUMN_GAP_CLASS}`}>
                                            {Array.from({ length: columns }, (_, col) => (
                                                <div key={col} className={`${COLUMN_WIDTH_CLASS} flex flex-col items-center`}>
                                                    {/* Heaven Bead (worth 5) - slides down toward the bar when counted */}
                                                    <SorobanBead
                                                        variant="heaven"
                                                        active={beadStates[col]?.heaven}
                                                        activeTranslateClass="translate-y-2.5"
                                                        onClick={() => toggleHeavenBead(col)}
                                                        title={t('dashboard.heaven_bead', { column: col + 1 })}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Crossbar (reckoning bar) */}
                                        <div className="flex justify-center">
                                            <div className="w-full h-3.5 bg-gradient-to-b from-[#243456] to-aba-ink rounded-full shadow-md ring-1 ring-black/20 relative">
                                                {/* Polished highlight line along the top of the bar */}
                                                <div className="absolute inset-x-2 top-[3px] h-[2px] bg-aba-blue/50 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Earth Section */}
                                    <div className="relative z-10 pt-3">
                                        <div className={`flex justify-center ${COLUMN_GAP_CLASS}`}>
                                            {Array.from({ length: columns }, (_, col) => (
                                                <div key={col} className={`${COLUMN_WIDTH_CLASS} flex flex-col items-center space-y-1.5`}>
                                                    {/* Earth Beads (worth 1 each) - slide up toward the bar when counted */}
                                                    {Array.from({ length: EARTH_BEADS_PER_COLUMN }, (_, beadIndex) => (
                                                        <SorobanBead
                                                            key={beadIndex}
                                                            variant="earth"
                                                            active={beadStates[col]?.earth[beadIndex]}
                                                            activeTranslateClass="-translate-y-1.5"
                                                            onClick={() => toggleEarthBead(col, beadIndex)}
                                                            title={t('dashboard.earth_bead', { bead: beadIndex + 1, column: col + 1 })}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Instructions */}
                <div className="p-6 bg-aba-surface-alt text-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-aba-surface p-6 rounded-aba-md shadow-aba-sm border border-aba-line">
                            <h4 className="font-black text-aba-ink mb-4 flex items-center gap-2">
                                <span className="text-lg">📚</span>
                                {t('dashboard.how_to_use')}
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-aba-coral rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-aba-ink-soft">{t('dashboard.click_red_beads')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-aba-blue rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-aba-ink-soft">{t('dashboard.click_blue_beads')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-aba-ink-faint rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-aba-ink-soft">{t('dashboard.each_column_earth')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-aba-green rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-aba-ink-soft">{t('dashboard.earth_beads_move')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 bg-aba-purple rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-aba-ink-soft">{t('dashboard.each_column_digit')}</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-aba-surface p-6 rounded-aba-md shadow-aba-sm border border-aba-line">
                            <h4 className="font-black text-aba-ink mb-4 flex items-center gap-2">
                                <span className="text-lg">💡</span>
                                {t('dashboard.tips')}
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-aba-yellow mt-1 flex-shrink-0">✨</span>
                                    <span className="text-aba-ink-soft">{t('dashboard.use_heaven_beads')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-aba-green mt-1 flex-shrink-0">🧮</span>
                                    <span className="text-aba-ink-soft">{t('dashboard.practice_addition')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-aba-blue mt-1 flex-shrink-0">⚡</span>
                                    <span className="text-aba-ink-soft">{t('dashboard.try_quick_set')}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-aba-purple mt-1 flex-shrink-0">🔊</span>
                                    <span className="text-aba-ink-soft">{t('dashboard.sound_toggle')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}