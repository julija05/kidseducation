import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export default function AbacusSimulator({ isOpen, onClose }) {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Abacus Simulator</h2>
                        {showValue && (
                            <div className="bg-blue-100 px-4 py-2 rounded-lg">
                                <span className="text-lg font-mono font-bold text-blue-900">
                                    {calculateValue().toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Controls */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={soundEnabled ? "Disable Sound" : "Enable Sound"}
                        >
                            {soundEnabled ? (
                                <Volume2 className="w-5 h-5 text-gray-600" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                        
                        <button
                            onClick={() => setShowValue(!showValue)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                            {showValue ? "Hide Value" : "Show Value"}
                        </button>
                        
                        <button
                            onClick={resetAbacus}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Quick Number Input */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600">Quick set:</span>
                        {[0, 123, 456, 789, 1234, 5678, 9999].map(num => (
                            <button
                                key={num}
                                onClick={() => setNumber(num)}
                                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                            >
                                {num.toLocaleString()}
                            </button>
                        ))}
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
                                                    title={`Heaven bead (5) - Column ${col + 1}`}
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
                                                        title={`Earth bead ${beadIndex + 1} (1) - Column ${col + 1}`}
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

                {/* Instructions */}
                <div className="p-4 bg-gray-50 text-sm text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">How to use:</h4>
                            <ul className="space-y-1">
                                <li>• Click red beads (heaven) to add/subtract 5</li>
                                <li>• Click blue beads (earth) to add/subtract 1</li>
                                <li>• Each column has 4 earth beads (1-4)</li>
                                <li>• Earth beads move together naturally</li>
                                <li>• Each column represents a digit position</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Tips:</h4>
                            <ul className="space-y-1">
                                <li>• Use heaven beads for numbers 5-9</li>
                                <li>• Practice addition and subtraction</li>
                                <li>• Try the quick set numbers to learn</li>
                                <li>• Sound can be toggled on/off</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}