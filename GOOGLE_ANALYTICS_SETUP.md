# Google Tag Manager & Analytics Setup Guide

## Overview
This implementation provides comprehensive tracking for the Abacoding educational platform using Google Tag Manager (GTM) and Google Analytics 4 (GA4).

## Setup Instructions

### 1. Environment Configuration
Add your tracking IDs to the `.env` file:

```env
# Google Analytics & Tag Manager
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**Note**: If you're using GTM, you typically only need the `GOOGLE_TAG_MANAGER_ID`. The GA4 tracking can be configured within GTM.

### 2. Implementation Details

#### Server-Side Integration
The GTM code is automatically injected into every page via the main Blade template (`resources/views/app.blade.php`):
- GTM script loads in the `<head>` section
- GTM noscript fallback loads at the start of `<body>`
- Only loads when environment variables are set

#### Client-Side Integration
React components can trigger custom events using the analytics utility functions in `resources/js/Utils/analytics.js`.

### 3. Available Tracking Functions

#### Page Views
```javascript
import { trackPageView } from '@/Utils/analytics';

trackPageView('Home Page', window.location.href);
```

#### Program Enrollments
```javascript
import { trackEnrollment } from '@/Utils/analytics';

trackEnrollment('Mental Arithmetic Mastery', 'math');
```

#### Lesson Completion
```javascript
import { trackLessonCompletion } from '@/Utils/analytics';

trackLessonCompletion('Basic Addition', 'Mental Arithmetic', 1, 180);
```

#### Quiz Results
```javascript
import { trackQuizCompletion } from '@/Utils/analytics';

trackQuizCompletion('Level 1 Quiz', 8, 10, 'Mental Arithmetic');
```

#### Contact Form Submissions
```javascript
import { trackFormSubmission } from '@/Utils/analytics';

trackFormSubmission('Contact Form', 'Contact Page');
```

#### Demo Program Starts
```javascript
import { trackDemoStart } from '@/Utils/analytics';

trackDemoStart('Mental Arithmetic Mastery');
```

#### Chat Interactions
```javascript
import { trackChatInteraction } from '@/Utils/analytics';

trackChatInteraction('open'); // 'message_sent', 'close'
```

#### Resource Downloads
```javascript
import { trackResourceDownload } from '@/Utils/analytics';

trackResourceDownload('Lesson 1 Worksheet', 'pdf', 'Basic Addition');
```

#### Achievements
```javascript
import { trackAchievement } from '@/Utils/analytics';

trackAchievement('First Lesson Complete', 'milestone', 50);
```

#### Purchases (Future Enhancement)
```javascript
import { trackPurchase } from '@/Utils/analytics';

const items = [
    {
        program_id: 'math_001',
        program_name: 'Mental Arithmetic Mastery',
        program_type: 'math',
        price: 99.00
    }
];

trackPurchase('TXN_123456', items, 99.00);
```

## Google Tag Manager Configuration

### Recommended Tags to Set Up in GTM:

1. **Google Analytics 4 Configuration Tag**
   - Trigger: All Pages
   - Measurement ID: Your GA4 ID

2. **Enhanced Ecommerce Events**
   - Custom Events for: enrollment, lesson_complete, quiz_complete
   - Pass custom parameters to GA4

3. **Conversion Tracking**
   - Track demo starts as conversions
   - Track enrollments as conversions
   - Track lesson completions as micro-conversions

### Custom Events Data Layer Structure:
```javascript
// Example: Lesson Completion
dataLayer.push({
    event: 'lesson_complete',
    lesson_name: 'Basic Addition',
    program_name: 'Mental Arithmetic',
    lesson_level: 1,
    completion_time: 180,
    achievement_id: 'lesson_1_complete'
});
```

## Privacy & Compliance Considerations

### COPPA Compliance
Since this is a children's educational platform:
- Ensure GTM configuration respects children's privacy
- Consider implementing age verification before tracking
- Review data collection practices with legal team

### GDPR Compliance
- Implement consent management if serving EU users
- Provide clear privacy policy
- Allow users to opt-out of tracking

### Recommended GTM Settings for Children's Platform:
- Disable remarketing and advertising features
- Focus on educational analytics rather than commercial tracking
- Anonymize IP addresses
- Set appropriate data retention periods

## Testing & Validation

### Debug Mode
1. Install Google Tag Assistant browser extension
2. Enable GTM Preview mode
3. Verify tags fire correctly for custom events

### GA4 Real-Time Reports
1. Open GA4 Real-time reports
2. Navigate through the site
3. Verify events appear in real-time

### Console Debugging
Add to browser console to verify dataLayer:
```javascript
console.log(window.dataLayer);
```

## Integration Examples

### In React Components:
```javascript
import React, { useEffect } from 'react';
import { trackPageView, trackEnrollment } from '@/Utils/analytics';

const ProgramPage = ({ program }) => {
    useEffect(() => {
        trackPageView(`${program.name} - Program`, window.location.href);
    }, [program.name]);

    const handleEnrollment = () => {
        trackEnrollment(program.name, program.type);
        // Handle enrollment logic
    };

    return (
        <div>
            <h1>{program.name}</h1>
            <button onClick={handleEnrollment}>Enroll Now</button>
        </div>
    );
};
```

### In Laravel Controllers (Server-side events):
```php
// For server-side tracking (future enhancement)
public function trackEnrollment(Request $request)
{
    // Process enrollment
    
    // Optional: Track server-side via Measurement Protocol
    // This would require additional implementation
}
```

## Maintenance & Updates

### Regular Reviews:
1. Monthly review of GA4 reports
2. Quarterly GTM container updates
3. Annual privacy policy updates
4. Regular testing of tracking implementation

### Performance Monitoring:
- Monitor page load impact of tracking scripts
- Use GTM's built-in performance monitoring
- Consider implementing sampling for high-traffic pages

## Support & Resources

### Documentation:
- [Google Tag Manager Developer Guide](https://developers.google.com/tag-manager)
- [Google Analytics 4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GTM for Educational Platforms Best Practices](https://support.google.com/tagmanager/topic/3441530)

### Common Issues:
1. **Events not firing**: Check dataLayer in browser console
2. **Duplicate tracking**: Ensure GTM and direct GA4 aren't both implemented
3. **Privacy concerns**: Review children's privacy compliance regularly