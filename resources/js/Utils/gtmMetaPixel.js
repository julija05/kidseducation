// GTM-based Meta Pixel tracking utilities for educational platform

/**
 * Push events to GTM dataLayer for Meta Pixel tracking
 * @param {string} event - Event name
 * @param {Object} parameters - Event parameters
 */
export const pushToGTMDataLayer = (event, parameters = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event,
            ...parameters,
            timestamp: new Date().getTime()
        });
        
        // Log for debugging in development
        if (process.env.NODE_ENV === 'development') {
            console.log('GTM DataLayer Event:', { event, ...parameters });
        }
    }
};

/**
 * Check if Meta tracking consent is given
 * @returns {boolean} - Whether Meta tracking is allowed
 */
export const hasMetaTrackingConsent = () => {
    if (typeof window === 'undefined') return false;
    
    const consent = localStorage.getItem('meta_tracking_consent');
    const userAge = localStorage.getItem('user_age');
    
    // Block tracking for children under 13 (COPPA compliance)
    if (userAge && parseInt(userAge) < 13) {
        return false;
    }
    
    return consent === 'true';
};

/**
 * Set user consent for Meta tracking
 * @param {boolean} consent - User consent
 * @param {number} age - User age (optional)
 */
export const setMetaTrackingConsent = (consent, age = null) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('meta_tracking_consent', consent.toString());
        
        if (age !== null) {
            localStorage.setItem('user_age', age.toString());
            
            // Auto-deny consent for children under 13 (COPPA)
            if (age < 13) {
                localStorage.setItem('meta_tracking_consent', 'false');
            }
        }
        
        // Push consent status to dataLayer for GTM use
        pushToGTMDataLayer('consent_updated', {
            meta_tracking_consent: consent,
            user_age: age,
            consent_timestamp: new Date().toISOString()
        });
    }
};

/**
 * Track program enrollment via GTM (triggers Meta Pixel Lead event)
 * @param {string} program_name - Name of the program
 * @param {string} program_type - Type of program (math, coding, etc.)
 * @param {number} value - Monetary value of enrollment
 * @param {string} currency - Currency code (default: USD)
 */
export const trackEnrollmentViaGTM = (program_name, program_type, value = 0, currency = 'USD') => {
    pushToGTMDataLayer('enrollment', {
        program_name,
        program_type,
        value,
        currency,
        event_category: 'Education',
        event_label: 'Program Enrollment'
    });
};

/**
 * Track demo program start via GTM (triggers Meta Pixel InitiateCheckout)
 * @param {string} program_name - Name of the demo program
 * @param {string} program_type - Type of program
 */
export const trackDemoStartViaGTM = (program_name, program_type) => {
    pushToGTMDataLayer('demo_start', {
        program_name,
        program_type,
        demo_type: 'free_trial',
        event_category: 'Education',
        event_label: 'Demo Started'
    });
};

/**
 * Track lesson completion via GTM (triggers Meta Pixel custom event)
 * @param {string} lesson_name - Name of the lesson
 * @param {string} program_name - Name of the program
 * @param {number} lesson_level - Lesson level/number
 * @param {number} completion_time - Time taken to complete in seconds
 */
export const trackLessonCompletionViaGTM = (lesson_name, program_name, lesson_level, completion_time) => {
    pushToGTMDataLayer('lesson_complete', {
        lesson_name,
        program_name,
        lesson_level,
        completion_time,
        completion_date: new Date().toISOString(),
        event_category: 'Education',
        event_label: 'Lesson Completed'
    });
};

/**
 * Track quiz completion via GTM (triggers Meta Pixel Achievement if high score)
 * @param {string} quiz_name - Name of the quiz
 * @param {number} quiz_score - Score achieved
 * @param {number} quiz_max_score - Maximum possible score
 * @param {string} program_name - Name of the program
 */
export const trackQuizCompletionViaGTM = (quiz_name, quiz_score, quiz_max_score, program_name) => {
    const percentage = Math.round((quiz_score / quiz_max_score) * 100);
    
    pushToGTMDataLayer('quiz_complete', {
        quiz_name,
        quiz_score,
        quiz_max_score,
        quiz_percentage: percentage,
        program_name,
        quiz_passed: percentage >= 80,
        completion_date: new Date().toISOString(),
        event_category: 'Education',
        event_label: 'Quiz Completed'
    });
};

/**
 * Track contact form submission via GTM (triggers Meta Pixel Lead)
 * @param {string} form_name - Name of the form
 * @param {string} form_location - Page/location where form was submitted
 * @param {string} form_type - Type of form (contact, enrollment, demo, etc.)
 */
export const trackFormSubmissionViaGTM = (form_name, form_location, form_type = 'contact') => {
    pushToGTMDataLayer('form_submit', {
        form_name,
        form_location,
        form_type,
        submission_date: new Date().toISOString(),
        event_category: 'Lead Generation',
        event_label: 'Form Submitted'
    });
};

/**
 * Track resource download via GTM
 * @param {string} resource_name - Name of the downloaded resource
 * @param {string} resource_type - Type of resource (pdf, video, worksheet, etc.)
 * @param {string} lesson_name - Associated lesson name
 * @param {string} program_name - Associated program name
 */
export const trackResourceDownloadViaGTM = (resource_name, resource_type, lesson_name, program_name) => {
    pushToGTMDataLayer('resource_download', {
        resource_name,
        resource_type,
        lesson_name,
        program_name,
        download_date: new Date().toISOString(),
        event_category: 'Content Engagement',
        event_label: 'Resource Downloaded'
    });
};

/**
 * Track video engagement via GTM
 * @param {string} video_name - Name of the video
 * @param {string} lesson_name - Associated lesson
 * @param {number} watch_time - Time watched in seconds
 * @param {number} video_duration - Total video duration in seconds
 * @param {string} engagement_type - Type of engagement (started, 25%, 50%, 75%, completed)
 */
export const trackVideoEngagementViaGTM = (video_name, lesson_name, watch_time, video_duration, engagement_type) => {
    const watch_percentage = Math.round((watch_time / video_duration) * 100);
    
    pushToGTMDataLayer('video_engagement', {
        video_name,
        lesson_name,
        watch_time,
        video_duration,
        watch_percentage,
        engagement_type,
        engagement_date: new Date().toISOString(),
        event_category: 'Video Engagement',
        event_label: `Video ${engagement_type}`
    });
};

/**
 * Track achievement/milestone via GTM (triggers Meta Pixel Achievement)
 * @param {string} achievement_name - Name of the achievement
 * @param {string} achievement_type - Type of achievement (streak, completion, score, etc.)
 * @param {number} points_earned - Points earned for achievement
 * @param {string} program_name - Associated program name
 */
export const trackAchievementViaGTM = (achievement_name, achievement_type, points_earned, program_name) => {
    pushToGTMDataLayer('achievement_unlocked', {
        achievement_name,
        achievement_type,
        points_earned,
        program_name,
        achievement_id: achievement_name.toLowerCase().replace(/\s+/g, '_'),
        achievement_date: new Date().toISOString(),
        event_category: 'Student Achievement',
        event_label: 'Achievement Unlocked'
    });
};

/**
 * Track user registration via GTM (triggers Meta Pixel CompleteRegistration)
 * @param {string} registration_method - How they registered (email, social, etc.)
 * @param {string} user_type - Type of user (student, parent, teacher)
 * @param {number} user_age - User's age (for compliance tracking)
 */
export const trackRegistrationViaGTM = (registration_method = 'email', user_type = 'student', user_age = null) => {
    pushToGTMDataLayer('user_registration', {
        registration_method,
        user_type,
        user_age,
        registration_date: new Date().toISOString(),
        event_category: 'User Acquisition',
        event_label: 'Account Created'
    });
};

/**
 * Track search actions via GTM
 * @param {string} search_term - What the user searched for
 * @param {string} search_category - Category searched (programs, lessons, resources)
 * @param {number} results_count - Number of results returned
 */
export const trackSearchViaGTM = (search_term, search_category = 'general', results_count = 0) => {
    pushToGTMDataLayer('search', {
        search_term,
        search_category,
        results_count,
        search_date: new Date().toISOString(),
        event_category: 'Site Search',
        event_label: 'Search Performed'
    });
};

/**
 * Track content/page views via GTM
 * @param {string} content_name - Name of the content/page
 * @param {string} content_type - Type of content (program, lesson, article, etc.)
 * @param {string} content_id - Unique identifier for the content
 * @param {string} content_category - Category of content
 */
export const trackContentViewViaGTM = (content_name, content_type, content_id, content_category) => {
    pushToGTMDataLayer('content_view', {
        content_name,
        content_type,
        content_id,
        content_category,
        view_date: new Date().toISOString(),
        event_category: 'Content Engagement',
        event_label: 'Content Viewed'
    });
};

/**
 * Track user engagement patterns via GTM
 * @param {string} engagement_type - Type of engagement (daily_login, streak, time_spent)
 * @param {Object} engagement_data - Additional engagement metrics
 */
export const trackUserEngagementViaGTM = (engagement_type, engagement_data = {}) => {
    pushToGTMDataLayer('user_engagement', {
        engagement_type,
        ...engagement_data,
        engagement_date: new Date().toISOString(),
        event_category: 'User Engagement',
        event_label: 'Engagement Activity'
    });
};

/**
 * Track purchases/payments via GTM (triggers Meta Pixel Purchase)
 * @param {string} transaction_id - Unique transaction identifier
 * @param {Array} items - Array of purchased items
 * @param {number} total_value - Total purchase value
 * @param {string} currency - Currency code
 * @param {string} payment_method - Payment method used
 */
export const trackPurchaseViaGTM = (transaction_id, items, total_value, currency = 'USD', payment_method = 'stripe') => {
    pushToGTMDataLayer('purchase', {
        transaction_id,
        items: items.map(item => ({
            item_id: item.program_id,
            item_name: item.program_name,
            item_category: item.program_type,
            quantity: 1,
            price: item.price
        })),
        total_value,
        currency,
        payment_method,
        purchase_date: new Date().toISOString(),
        event_category: 'Ecommerce',
        event_label: 'Purchase Completed'
    });
};

/**
 * Track chat interactions via GTM
 * @param {string} action - Chat action (opened, message_sent, closed, etc.)
 * @param {string} chat_type - Type of chat (support, sales, general)
 * @param {Object} additional_data - Additional chat data
 */
export const trackChatInteractionViaGTM = (action, chat_type = 'support', additional_data = {}) => {
    pushToGTMDataLayer('chat_interaction', {
        chat_action: action,
        chat_type,
        ...additional_data,
        interaction_date: new Date().toISOString(),
        event_category: 'Customer Support',
        event_label: 'Chat Interaction'
    });
};

/**
 * Track errors and issues via GTM
 * @param {string} error_type - Type of error (404, form_error, video_load_error, etc.)
 * @param {string} error_message - Error message or description
 * @param {string} page_location - Where the error occurred
 */
export const trackErrorViaGTM = (error_type, error_message, page_location) => {
    pushToGTMDataLayer('error_tracking', {
        error_type,
        error_message,
        page_location,
        error_date: new Date().toISOString(),
        event_category: 'Site Errors',
        event_label: 'Error Occurred'
    });
};

/**
 * Get current tracking consent status
 * @returns {Object} - Consent status information
 */
export const getTrackingConsentStatus = () => {
    if (typeof window === 'undefined') {
        return { canTrack: false, reason: 'Not in browser environment' };
    }
    
    const consent = localStorage.getItem('meta_tracking_consent');
    const userAge = localStorage.getItem('user_age');
    const age = userAge ? parseInt(userAge) : null;
    
    return {
        consentGiven: consent === 'true',
        userAge: age,
        canTrack: hasMetaTrackingConsent(),
        reason: age !== null && age < 13 ? 'Under age limit (COPPA)' : 
                consent !== 'true' ? 'No consent given' : 'Can track'
    };
};

/**
 * Initialize GTM Meta Pixel tracking with privacy compliance
 * @param {number} userAge - User's age for COPPA compliance
 * @param {boolean} hasConsent - Whether user has given tracking consent
 */
export const initializeGTMMetaTracking = (userAge = null, hasConsent = false) => {
    setMetaTrackingConsent(hasConsent, userAge);
    
    // Push initialization event to dataLayer
    pushToGTMDataLayer('tracking_initialized', {
        user_age: userAge,
        consent_given: hasConsent,
        can_track: hasMetaTrackingConsent(),
        initialization_date: new Date().toISOString()
    });
    
    return getTrackingConsentStatus();
};