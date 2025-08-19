// Meta Pixel (Facebook Pixel) utility functions for educational platform

/**
 * Track Meta Pixel events
 * @param {string} eventName - Standard or custom event name
 * @param {Object} parameters - Event parameters
 */
export const trackMetaEvent = (eventName, parameters = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        if (parameters && Object.keys(parameters).length > 0) {
            window.fbq('track', eventName, parameters);
        } else {
            window.fbq('track', eventName);
        }
    }
};

/**
 * Track custom Meta Pixel events
 * @param {string} eventName - Custom event name
 * @param {Object} parameters - Event parameters
 */
export const trackMetaCustomEvent = (eventName, parameters = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, parameters);
    }
};

/**
 * Track page views (usually automatic, but useful for SPA navigation)
 */
export const trackMetaPageView = () => {
    trackMetaEvent('PageView');
};

/**
 * Track program enrollment as Lead event
 * @param {string} program_name - Name of the program
 * @param {string} program_type - Type of program (math, coding, etc.)
 * @param {number} value - Monetary value if applicable
 */
export const trackMetaEnrollment = (program_name, program_type, value = 0) => {
    trackMetaEvent('Lead', {
        content_name: program_name,
        content_category: program_type,
        value: value,
        currency: 'USD'
    });
    
    // Also track as custom event for more detailed tracking
    trackMetaCustomEvent('ProgramEnrollment', {
        program_name,
        program_type,
        enrollment_date: new Date().toISOString()
    });
};

/**
 * Track demo program starts as InitiateCheckout
 * @param {string} program_name - Name of the demo program
 * @param {string} program_type - Type of program
 */
export const trackMetaDemoStart = (program_name, program_type) => {
    trackMetaEvent('InitiateCheckout', {
        content_name: `${program_name} - Demo`,
        content_category: program_type,
        value: 0,
        currency: 'USD'
    });
    
    trackMetaCustomEvent('DemoStart', {
        program_name,
        program_type,
        demo_date: new Date().toISOString()
    });
};

/**
 * Track lesson completion
 * @param {string} lesson_name - Name of the lesson
 * @param {string} program_name - Name of the program
 * @param {number} lesson_level - Lesson level
 * @param {number} completion_time - Time to complete in seconds
 */
export const trackMetaLessonCompletion = (lesson_name, program_name, lesson_level, completion_time) => {
    trackMetaCustomEvent('LessonComplete', {
        lesson_name,
        program_name,
        lesson_level,
        completion_time,
        completion_date: new Date().toISOString()
    });
};

/**
 * Track quiz completion and achievement
 * @param {string} quiz_name - Name of the quiz
 * @param {number} score - Quiz score
 * @param {number} max_score - Maximum possible score
 * @param {string} program_name - Program name
 */
export const trackMetaQuizCompletion = (quiz_name, score, max_score, program_name) => {
    const percentage = Math.round((score / max_score) * 100);
    
    // Track as Achievement for high scores
    if (percentage >= 80) {
        trackMetaEvent('Achievement', {
            achievement_id: `quiz_${quiz_name}_passed`,
            content_name: quiz_name,
            content_category: program_name
        });
    }
    
    trackMetaCustomEvent('QuizComplete', {
        quiz_name,
        score,
        max_score,
        percentage,
        program_name,
        passed: percentage >= 80,
        completion_date: new Date().toISOString()
    });
};

/**
 * Track contact form submissions as Lead
 * @param {string} form_name - Name of the form
 * @param {string} form_location - Where the form was submitted
 */
export const trackMetaFormSubmission = (form_name, form_location) => {
    trackMetaEvent('Lead', {
        content_name: form_name,
        content_category: 'Contact',
        source: form_location
    });
    
    trackMetaCustomEvent('FormSubmission', {
        form_name,
        form_location,
        submission_date: new Date().toISOString()
    });
};

/**
 * Track search actions on the platform
 * @param {string} search_term - What the user searched for
 * @param {string} search_category - Category of search (programs, lessons, etc.)
 */
export const trackMetaSearch = (search_term, search_category = 'general') => {
    trackMetaEvent('Search', {
        search_string: search_term,
        content_category: search_category
    });
};

/**
 * Track content views (program pages, lesson pages)
 * @param {string} content_name - Name of the content
 * @param {string} content_type - Type of content (program, lesson, etc.)
 * @param {string} content_id - Unique ID of the content
 */
export const trackMetaContentView = (content_name, content_type, content_id) => {
    trackMetaEvent('ViewContent', {
        content_name,
        content_type,
        content_ids: [content_id],
        content_category: content_type
    });
};

/**
 * Track user registration/account creation
 * @param {string} registration_method - How they registered (email, social, etc.)
 */
export const trackMetaRegistration = (registration_method = 'email') => {
    trackMetaEvent('CompleteRegistration', {
        content_name: 'Account Creation',
        status: 'completed',
        method: registration_method
    });
    
    trackMetaCustomEvent('UserRegistration', {
        registration_method,
        registration_date: new Date().toISOString()
    });
};

/**
 * Track resource downloads
 * @param {string} resource_name - Name of the downloaded resource
 * @param {string} resource_type - Type of resource (pdf, video, worksheet)
 * @param {string} lesson_name - Associated lesson
 */
export const trackMetaResourceDownload = (resource_name, resource_type, lesson_name) => {
    trackMetaCustomEvent('ResourceDownload', {
        resource_name,
        resource_type,
        lesson_name,
        download_date: new Date().toISOString()
    });
};

/**
 * Track milestone achievements
 * @param {string} milestone_name - Name of the milestone
 * @param {string} milestone_type - Type of milestone
 * @param {number} points_earned - Points earned
 */
export const trackMetaAchievement = (milestone_name, milestone_type, points_earned = 0) => {
    trackMetaEvent('Achievement', {
        achievement_id: milestone_name.toLowerCase().replace(/\s+/g, '_'),
        content_name: milestone_name,
        content_category: milestone_type,
        value: points_earned
    });
    
    trackMetaCustomEvent('MilestoneAchieved', {
        milestone_name,
        milestone_type,
        points_earned,
        achievement_date: new Date().toISOString()
    });
};

/**
 * Track purchases/payments (for premium features)
 * @param {string} transaction_id - Unique transaction ID
 * @param {Array} items - Array of purchased items
 * @param {number} value - Total purchase value
 * @param {string} currency - Currency code
 */
export const trackMetaPurchase = (transaction_id, items, value, currency = 'USD') => {
    trackMetaEvent('Purchase', {
        value: value,
        currency: currency,
        transaction_id: transaction_id,
        content_type: 'product',
        contents: items.map(item => ({
            id: item.program_id,
            quantity: 1,
            item_price: item.price
        }))
    });
    
    trackMetaCustomEvent('ProgramPurchase', {
        transaction_id,
        items,
        total_value: value,
        currency,
        purchase_date: new Date().toISOString()
    });
};

/**
 * Track video engagement (for lesson videos)
 * @param {string} video_name - Name of the video
 * @param {string} lesson_name - Associated lesson
 * @param {number} watch_time - Time watched in seconds
 * @param {number} video_duration - Total video duration
 */
export const trackMetaVideoEngagement = (video_name, lesson_name, watch_time, video_duration) => {
    const watch_percentage = Math.round((watch_time / video_duration) * 100);
    
    trackMetaCustomEvent('VideoEngagement', {
        video_name,
        lesson_name,
        watch_time,
        video_duration,
        watch_percentage,
        engagement_date: new Date().toISOString()
    });
    
    // Track as special event for high engagement
    if (watch_percentage >= 75) {
        trackMetaCustomEvent('HighVideoEngagement', {
            video_name,
            lesson_name,
            watch_percentage
        });
    }
};

/**
 * Track user engagement patterns
 * @param {string} engagement_type - Type of engagement (daily_login, streak, etc.)
 * @param {Object} engagement_data - Additional engagement data
 */
export const trackMetaEngagement = (engagement_type, engagement_data = {}) => {
    trackMetaCustomEvent('UserEngagement', {
        engagement_type,
        ...engagement_data,
        engagement_date: new Date().toISOString()
    });
};