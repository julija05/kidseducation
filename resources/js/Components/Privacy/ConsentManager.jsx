import React, { useState, useEffect } from 'react';
import { setMetaTrackingConsent, getTrackingConsentStatus } from '@/Utils/gtmMetaPixel';

const ConsentManager = ({ onConsentUpdate }) => {
    const [showBanner, setShowBanner] = useState(false);
    const [showAgeGate, setShowAgeGate] = useState(false);
    const [userAge, setUserAge] = useState('');
    const [consentStatus, setConsentStatus] = useState(null);

    useEffect(() => {
        // Check current consent status
        const status = getTrackingConsentStatus();
        setConsentStatus(status);
        
        // Show banner if no consent decision has been made
        if (status.consentGiven === null || status.consentGiven === undefined) {
            setShowBanner(true);
        }
    }, []);

    const handleAcceptTracking = () => {
        setShowBanner(false);
        setShowAgeGate(true);
    };

    const handleDeclineTracking = () => {
        setMetaTrackingConsent(false);
        setShowBanner(false);
        setConsentStatus({ consentGiven: false, canTrack: false, reason: 'User declined' });
        
        if (onConsentUpdate) {
            onConsentUpdate(false, null);
        }
    };

    const handleAgeSubmit = () => {
        const age = parseInt(userAge);
        
        if (age && age > 0) {
            const canConsent = age >= 13;
            setMetaTrackingConsent(canConsent, age);
            setShowAgeGate(false);
            
            const newStatus = getTrackingConsentStatus();
            setConsentStatus(newStatus);
            
            if (onConsentUpdate) {
                onConsentUpdate(canConsent, age);
            }
        }
    };

    const ConsentBanner = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold mb-2">🍪 Privacy & Cookies</h3>
                    <p className="text-sm text-gray-300">
                        We use cookies and tracking to improve your learning experience and measure how our platform performs. 
                        This helps us create better educational content for you.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDeclineTracking}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAcceptTracking}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );

    const AgeGate = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4">🎓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Age Verification</h2>
                    <p className="text-gray-600">
                        We need to verify your age to comply with children's privacy laws (COPPA). 
                        This information is used only for compliance and is not shared.
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        How old are you?
                    </label>
                    <input
                        type="number"
                        min="4"
                        max="100"
                        value={userAge}
                        onChange={(e) => setUserAge(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your age"
                        autoFocus
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <div className="text-blue-600 mr-2">ℹ️</div>
                        <div className="text-sm text-blue-800">
                            <strong>Privacy Protection:</strong> If you're under 13, we won't track your activity 
                            to protect your privacy as required by law. You can still use our platform normally!
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setShowAgeGate(false);
                            setShowBanner(true);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleAgeSubmit}
                        disabled={!userAge || parseInt(userAge) < 4}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );

    const ConsentStatus = () => {
        if (!consentStatus) return null;

        return (
            <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-40 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${consentStatus.canTrack ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">
                        {consentStatus.canTrack ? 'Tracking Active' : 'Privacy Protected'}
                    </span>
                </div>
                <p className="text-xs text-gray-600">{consentStatus.reason}</p>
                {consentStatus.userAge && (
                    <p className="text-xs text-gray-500">Age: {consentStatus.userAge}</p>
                )}
            </div>
        );
    };

    return (
        <>
            {showBanner && <ConsentBanner />}
            {showAgeGate && <AgeGate />}
            {process.env.NODE_ENV === 'development' && <ConsentStatus />}
        </>
    );
};

export default ConsentManager;