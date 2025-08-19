// Privacy-compliant tracking utilities for children's educational platform
import { trackMetaEvent, trackMetaCustomEvent } from './metaPixel';
import { gtmPushEvent } from './analytics';

/**
 * Privacy-compliant tracking wrapper that respects COPPA/GDPR requirements
 */
class PrivacyCompliantTracker {
    constructor() {
        this.consentGiven = false;
        this.userAge = null;
        this.trackingEnabled = true;
        this.initializePrivacySettings();
    }

    /**
     * Initialize privacy settings from local storage or environment
     */
    initializePrivacySettings() {
        if (typeof window !== 'undefined') {
            // Check for consent in localStorage
            const consent = localStorage.getItem('tracking_consent');
            const userAge = localStorage.getItem('user_age');
            
            this.consentGiven = consent === 'true';
            this.userAge = userAge ? parseInt(userAge) : null;
            
            // Disable tracking for children under 13 by default (COPPA compliance)
            if (this.userAge !== null && this.userAge < 13) {
                this.trackingEnabled = false;
            }
        }
    }

    /**
     * Set user consent for tracking
     * @param {boolean} consent - Whether user consents to tracking
     * @param {number} age - User's age (optional)
     */
    setConsent(consent, age = null) {
        this.consentGiven = consent;
        
        if (age !== null) {
            this.userAge = age;
            // Automatically disable tracking for children under 13
            if (age < 13) {
                this.trackingEnabled = false;
                this.consentGiven = false;
            }
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem('tracking_consent', consent.toString());
            if (age !== null) {
                localStorage.setItem('user_age', age.toString());
            }
        }
    }

    /**
     * Check if tracking is allowed
     * @returns {boolean}
     */
    canTrack() {
        return this.trackingEnabled && this.consentGiven;
    }

    /**
     * Track events with privacy compliance
     * @param {string} platform - 'meta' or 'gtm'
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    track(platform, eventName, parameters = {}) {
        // Only track if consent is given and tracking is enabled
        if (!this.canTrack()) {
            console.log('Tracking skipped - no consent or under age limit');
            return;
        }

        // Remove any personally identifiable information
        const sanitizedParams = this.sanitizeParameters(parameters);

        if (platform === 'meta') {
            trackMetaEvent(eventName, sanitizedParams);
        } else if (platform === 'gtm') {
            gtmPushEvent(eventName, sanitizedParams);
        }
    }

    /**
     * Track custom events with privacy compliance
     * @param {string} platform - 'meta' or 'gtm'
     * @param {string} eventName - Custom event name
     * @param {Object} parameters - Event parameters
     */
    trackCustom(platform, eventName, parameters = {}) {
        if (!this.canTrack()) {
            console.log('Custom tracking skipped - no consent or under age limit');
            return;
        }

        const sanitizedParams = this.sanitizeParameters(parameters);

        if (platform === 'meta') {
            trackMetaCustomEvent(eventName, sanitizedParams);
        } else if (platform === 'gtm') {
            gtmPushEvent(eventName, sanitizedParams);
        }
    }

    /**
     * Remove personally identifiable information from parameters
     * @param {Object} parameters - Original parameters
     * @returns {Object} - Sanitized parameters
     */
    sanitizeParameters(parameters) {
        const sanitized = { ...parameters };
        
        // Remove common PII fields
        const piiFields = [
            'email', 'phone', 'name', 'first_name', 'last_name',
            'address', 'ip_address', 'user_id', 'student_id'
        ];
        
        piiFields.forEach(field => {
            if (sanitized[field]) {
                delete sanitized[field];
            }
        });

        // Hash any remaining identifiers
        if (sanitized.identifier) {
            sanitized.hashed_identifier = this.hashString(sanitized.identifier);
            delete sanitized.identifier;
        }

        return sanitized;
    }

    /**
     * Simple hash function for identifiers
     * @param {string} str - String to hash
     * @returns {string} - Hashed string
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    /**
     * Get consent status for UI display
     * @returns {Object} - Consent information
     */
    getConsentStatus() {
        return {
            consentGiven: this.consentGiven,
            trackingEnabled: this.trackingEnabled,
            userAge: this.userAge,
            canTrack: this.canTrack()
        };
    }
}

// Create singleton instance
const privacyTracker = new PrivacyCompliantTracker();

/**
 * Educational platform specific tracking functions with privacy compliance
 */

/**
 * Track program enrollment with privacy compliance
 * @param {string} program_name - Name of the program
 * @param {string} program_type - Type of program
 * @param {number} value - Value if applicable
 */
export const trackEnrollmentPrivacy = (program_name, program_type, value = 0) => {
    privacyTracker.track('meta', 'Lead', {
        content_name: program_name,
        content_category: program_type,
        value: value,
        currency: 'USD'
    });
    
    privacyTracker.track('gtm', 'enrollment', {
        program_name,
        program_type,
        value
    });
};

/**
 * Track lesson completion with privacy compliance
 * @param {string} lesson_name - Name of the lesson
 * @param {string} program_name - Name of the program
 * @param {number} lesson_level - Lesson level
 * @param {number} completion_time - Time to complete
 */
export const trackLessonCompletionPrivacy = (lesson_name, program_name, lesson_level, completion_time) => {
    privacyTracker.trackCustom('meta', 'LessonComplete', {
        lesson_name,
        program_name,
        lesson_level,
        completion_time
    });
    
    privacyTracker.track('gtm', 'lesson_complete', {
        lesson_name,
        program_name,
        lesson_level,
        completion_time
    });
};

/**
 * Track demo starts with privacy compliance
 * @param {string} program_name - Name of the demo program
 * @param {string} program_type - Type of program
 */
export const trackDemoStartPrivacy = (program_name, program_type) => {
    privacyTracker.track('meta', 'InitiateCheckout', {
        content_name: `${program_name} - Demo`,
        content_category: program_type,
        value: 0
    });
    
    privacyTracker.track('gtm', 'demo_start', {
        program_name,
        program_type
    });
};

/**
 * Track contact form submissions with privacy compliance
 * @param {string} form_name - Name of the form
 * @param {string} form_location - Form location
 */
export const trackFormSubmissionPrivacy = (form_name, form_location) => {
    privacyTracker.track('meta', 'Lead', {
        content_name: form_name,
        content_category: 'Contact',
        source: form_location
    });
    
    privacyTracker.track('gtm', 'form_submit', {
        form_name,
        form_location
    });
};

/**
 * Set user consent and age
 * @param {boolean} consent - User consent
 * @param {number} age - User age
 */
export const setUserConsent = (consent, age = null) => {
    privacyTracker.setConsent(consent, age);
    
    // If consent is withdrawn, clear any existing tracking cookies
    if (!consent && typeof window !== 'undefined') {
        // Clear Facebook Pixel cookies
        document.cookie = '_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = '_fbc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Clear Google Analytics cookies
        document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = '_ga_*=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
};

/**
 * Get current consent status
 * @returns {Object} - Consent status
 */
export const getConsentStatus = () => {
    return privacyTracker.getConsentStatus();
};

/**
 * Check if user can be tracked
 * @returns {boolean}
 */
export const canTrackUser = () => {
    return privacyTracker.canTrack();
};

export default privacyTracker;