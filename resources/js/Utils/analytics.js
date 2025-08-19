// Analytics utility functions for Google Tag Manager and Google Analytics

/**
 * Push custom events to Google Tag Manager dataLayer
 * @param {string} event - Event name
 * @param {Object} parameters - Additional event parameters
 */
export const gtmPushEvent = (event, parameters = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event,
            ...parameters
        });
    }
};

/**
 * Track page views
 * @param {string} page_title - Page title
 * @param {string} page_location - Page URL
 */
export const trackPageView = (page_title, page_location) => {
    gtmPushEvent('page_view', {
        page_title,
        page_location,
        timestamp: new Date().getTime()
    });
};

/**
 * Track user enrollment in programs
 * @param {string} program_name - Name of the program
 * @param {string} program_type - Type of program (e.g., 'math', 'coding')
 */
export const trackEnrollment = (program_name, program_type) => {
    gtmPushEvent('enrollment', {
        program_name,
        program_type,
        value: 1,
        currency: 'USD'
    });
};

/**
 * Track lesson completion
 * @param {string} lesson_name - Name of the lesson
 * @param {string} program_name - Name of the program
 * @param {number} lesson_level - Lesson level/number
 * @param {number} completion_time - Time taken to complete (in seconds)
 */
export const trackLessonCompletion = (lesson_name, program_name, lesson_level, completion_time) => {
    gtmPushEvent('lesson_complete', {
        lesson_name,
        program_name,
        lesson_level,
        completion_time,
        achievement_id: `lesson_${lesson_level}_complete`
    });
};

/**
 * Track quiz completion and scores
 * @param {string} quiz_name - Name of the quiz
 * @param {number} score - Quiz score
 * @param {number} max_score - Maximum possible score
 * @param {string} program_name - Name of the program
 */
export const trackQuizCompletion = (quiz_name, score, max_score, program_name) => {
    const percentage = Math.round((score / max_score) * 100);
    
    gtmPushEvent('quiz_complete', {
        quiz_name,
        score,
        max_score,
        percentage,
        program_name,
        achievement_id: `quiz_${percentage >= 80 ? 'pass' : 'attempt'}`
    });
};

/**
 * Track contact form submissions
 * @param {string} form_name - Name of the form
 * @param {string} form_location - Where the form was submitted from
 */
export const trackFormSubmission = (form_name, form_location) => {
    gtmPushEvent('form_submit', {
        form_name,
        form_location
    });
};

/**
 * Track demo program starts
 * @param {string} program_name - Name of the demo program
 */
export const trackDemoStart = (program_name) => {
    gtmPushEvent('demo_start', {
        program_name,
        engagement_type: 'trial'
    });
};

/**
 * Track chat widget interactions
 * @param {string} action - Action taken (e.g., 'open', 'message_sent', 'close')
 */
export const trackChatInteraction = (action) => {
    gtmPushEvent('chat_interaction', {
        action,
        engagement_type: 'support'
    });
};

/**
 * Track resource downloads
 * @param {string} resource_name - Name of the downloaded resource
 * @param {string} resource_type - Type of resource (e.g., 'pdf', 'video', 'worksheet')
 * @param {string} lesson_name - Name of the associated lesson
 */
export const trackResourceDownload = (resource_name, resource_type, lesson_name) => {
    gtmPushEvent('resource_download', {
        resource_name,
        resource_type,
        lesson_name,
        engagement_type: 'content'
    });
};

/**
 * Track user achievements/milestones
 * @param {string} achievement_name - Name of the achievement
 * @param {string} achievement_type - Type of achievement
 * @param {number} points_earned - Points earned for the achievement
 */
export const trackAchievement = (achievement_name, achievement_type, points_earned = 0) => {
    gtmPushEvent('achievement_unlock', {
        achievement_name,
        achievement_type,
        points_earned,
        achievement_id: achievement_name.toLowerCase().replace(/\s+/g, '_')
    });
};

/**
 * Enhanced ecommerce tracking for program purchases
 * @param {string} transaction_id - Unique transaction ID
 * @param {Array} items - Array of purchased items
 * @param {number} value - Total transaction value
 */
export const trackPurchase = (transaction_id, items, value) => {
    gtmPushEvent('purchase', {
        transaction_id,
        value,
        currency: 'USD',
        items: items.map(item => ({
            item_id: item.program_id,
            item_name: item.program_name,
            category: item.program_type,
            quantity: 1,
            price: item.price
        }))
    });
};