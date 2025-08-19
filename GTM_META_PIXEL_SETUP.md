# Meta Pixel Setup via Google Tag Manager - Complete Guide

## 🎯 Why Use Meta Pixel via GTM?

Setting up Meta Pixel through Google Tag Manager provides several advantages:
- **Centralized Management**: All tracking codes in one place
- **Easy Updates**: Change tracking without touching website code
- **Better Privacy Control**: Enhanced consent management
- **Advanced Targeting**: More sophisticated trigger conditions
- **Debugging Tools**: GTM's preview mode for easier testing

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Google Tag Manager container set up (`GTM-N59RL7B8`)
- ✅ Meta Business Manager account
- ✅ Meta Pixel ID (`2032470714226764`)
- ✅ Your website with GTM code installed

## 🚀 Step-by-Step GTM Setup

### Step 1: Access Your GTM Container

1. **Go to**: https://tagmanager.google.com
2. **Select your container**: `GTM-N59RL7B8`
3. **Click "Workspace"** to start editing

### Step 2: Create Meta Pixel Configuration Tag

1. **Tags → New → Tag Configuration**
2. **Choose**: "Custom HTML"
3. **Tag Name**: "Meta Pixel - Base Code"
4. **HTML Content**:
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2032470714226764');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=2032470714226764&ev=PageView&noscript=1"/>
</noscript>
```
5. **Triggering**: Select "All Pages"
6. **Save**

### Step 3: Create Data Layer Variables

You need to create variables to capture data from your website events:

#### A. Program Name Variable
1. **Variables → User-Defined Variables → New**
2. **Variable Type**: "Data Layer Variable"
3. **Data Layer Variable Name**: `program_name`
4. **Variable Name**: "DL - Program Name"
5. **Save**

#### B. Program Type Variable
1. **Variables → New**
2. **Variable Type**: "Data Layer Variable"
3. **Data Layer Variable Name**: `program_type`
4. **Variable Name**: "DL - Program Type"
5. **Save**

#### C. Event Value Variable
1. **Variables → New**
2. **Variable Type**: "Data Layer Variable"
3. **Data Layer Variable Name**: `value`
4. **Variable Name**: "DL - Event Value"
5. **Save**

#### D. Create all these variables:
- `DL - Lesson Name` (lesson_name)
- `DL - Lesson Level` (lesson_level)
- `DL - Completion Time` (completion_time)
- `DL - Quiz Score` (quiz_score)
- `DL - Form Name` (form_name)
- `DL - Form Location` (form_location)

### Step 4: Create Meta Pixel Event Tags

#### A. Program Enrollment Tag (Lead Event)

1. **Tags → New → Custom HTML**
2. **Tag Name**: "Meta Pixel - Program Enrollment"
3. **HTML Content**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
        content_name: {{DL - Program Name}},
        content_category: {{DL - Program Type}},
        value: {{DL - Event Value}},
        currency: 'USD'
    });
    
    fbq('trackCustom', 'ProgramEnrollment', {
        program_name: {{DL - Program Name}},
        program_type: {{DL - Program Type}},
        enrollment_date: new Date().toISOString()
    });
}
</script>
```
4. **Triggering**: Create new trigger
   - **Trigger Type**: "Custom Event"
   - **Event name**: `enrollment`
   - **Trigger Name**: "Enrollment Event"
5. **Save**

#### B. Demo Start Tag (InitiateCheckout)

1. **Tags → New → Custom HTML**
2. **Tag Name**: "Meta Pixel - Demo Start"
3. **HTML Content**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', {
        content_name: {{DL - Program Name}} + ' - Demo',
        content_category: {{DL - Program Type}},
        value: 0,
        currency: 'USD'
    });
    
    fbq('trackCustom', 'DemoStart', {
        program_name: {{DL - Program Name}},
        program_type: {{DL - Program Type}},
        demo_date: new Date().toISOString()
    });
}
</script>
```
4. **Triggering**: Create trigger for event name `demo_start`
5. **Save**

#### C. Lesson Completion Tag

1. **Tags → New → Custom HTML**
2. **Tag Name**: "Meta Pixel - Lesson Complete"
3. **HTML Content**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('trackCustom', 'LessonComplete', {
        lesson_name: {{DL - Lesson Name}},
        program_name: {{DL - Program Name}},
        lesson_level: {{DL - Lesson Level}},
        completion_time: {{DL - Completion Time}},
        completion_date: new Date().toISOString()
    });
}
</script>
```
4. **Triggering**: Create trigger for event name `lesson_complete`
5. **Save**

#### D. Contact Form Tag (Lead)

1. **Tags → New → Custom HTML**
2. **Tag Name**: "Meta Pixel - Contact Form"
3. **HTML Content**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
        content_name: {{DL - Form Name}},
        content_category: 'Contact',
        source: {{DL - Form Location}}
    });
    
    fbq('trackCustom', 'FormSubmission', {
        form_name: {{DL - Form Name}},
        form_location: {{DL - Form Location}},
        submission_date: new Date().toISOString()
    });
}
</script>
```
4. **Triggering**: Create trigger for event name `form_submit`
5. **Save**

#### E. Quiz Completion Tag

1. **Tags → New → Custom HTML**
2. **Tag Name**: "Meta Pixel - Quiz Complete"
3. **HTML Content**:
```html
<script>
if (typeof fbq !== 'undefined') {
    var score = {{DL - Quiz Score}};
    var maxScore = {{DL - Quiz Max Score}};
    var percentage = Math.round((score / maxScore) * 100);
    
    if (percentage >= 80) {
        fbq('track', 'Achievement', {
            achievement_id: 'quiz_' + {{DL - Quiz Name}} + '_passed',
            content_name: {{DL - Quiz Name}},
            content_category: {{DL - Program Name}}
        });
    }
    
    fbq('trackCustom', 'QuizComplete', {
        quiz_name: {{DL - Quiz Name}},
        score: score,
        max_score: maxScore,
        percentage: percentage,
        program_name: {{DL - Program Name}},
        passed: percentage >= 80,
        completion_date: new Date().toISOString()
    });
}
</script>
```
4. **Triggering**: Create trigger for event name `quiz_complete`
5. **Save**

### Step 5: Set Up Privacy Compliance in GTM

#### A. Create Consent Variable

1. **Variables → New → Custom JavaScript**
2. **Variable Name**: "Consent - Meta Tracking"
3. **Custom JavaScript**:
```javascript
function() {
    // Check if user has given consent for Meta tracking
    var consent = localStorage.getItem('meta_tracking_consent');
    var userAge = localStorage.getItem('user_age');
    
    // Block tracking for children under 13 (COPPA compliance)
    if (userAge && parseInt(userAge) < 13) {
        return false;
    }
    
    return consent === 'true';
}
```
4. **Save**

#### B. Update All Meta Pixel Tags with Consent Check

For each Meta Pixel tag, wrap the content with a consent check:

```html
<script>
if ({{Consent - Meta Tracking}} && typeof fbq !== 'undefined') {
    // Your existing Meta Pixel code here
    fbq('track', 'Lead', {
        // ... your parameters
    });
}
</script>
```

### Step 6: Test Your Setup

#### A. Use GTM Preview Mode

1. **Click "Preview" in GTM**
2. **Enter your website URL**: `http://localhost:8000`
3. **Click "Connect"**
4. **Navigate your site** and trigger events
5. **Verify tags fire** in the GTM debugger

#### B. Check Meta Events Manager

1. **Go to**: Meta Events Manager
2. **Select your pixel**
3. **View "Test Events"**
4. **Perform actions** on your site
5. **Verify events** appear in real-time

### Step 7: Publish Your Changes

1. **Click "Submit" in GTM**
2. **Version Name**: "Meta Pixel Implementation v1.0"
3. **Description**: "Added Meta Pixel tracking via GTM with privacy compliance"
4. **Publish**

## 💻 Updated Website Code

Now update your React components to use GTM dataLayer instead of direct Meta Pixel calls:

### Updated Analytics Utility (GTM-based)

```javascript
// resources/js/Utils/gtmAnalytics.js

/**
 * Push events to GTM dataLayer for Meta Pixel tracking
 * @param {string} event - Event name
 * @param {Object} parameters - Event parameters
 */
export const pushToGTM = (event, parameters = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event,
            ...parameters
        });
    }
};

/**
 * Track program enrollment via GTM
 * @param {string} program_name - Name of the program
 * @param {string} program_type - Type of program
 * @param {number} value - Monetary value
 */
export const trackEnrollmentGTM = (program_name, program_type, value = 0) => {
    pushToGTM('enrollment', {
        program_name,
        program_type,
        value,
        timestamp: new Date().getTime()
    });
};

/**
 * Track demo start via GTM
 * @param {string} program_name - Name of the program
 * @param {string} program_type - Type of program
 */
export const trackDemoStartGTM = (program_name, program_type) => {
    pushToGTM('demo_start', {
        program_name,
        program_type,
        timestamp: new Date().getTime()
    });
};

/**
 * Track lesson completion via GTM
 * @param {string} lesson_name - Name of the lesson
 * @param {string} program_name - Name of the program
 * @param {number} lesson_level - Lesson level
 * @param {number} completion_time - Time in seconds
 */
export const trackLessonCompletionGTM = (lesson_name, program_name, lesson_level, completion_time) => {
    pushToGTM('lesson_complete', {
        lesson_name,
        program_name,
        lesson_level,
        completion_time,
        timestamp: new Date().getTime()
    });
};

/**
 * Track contact form submission via GTM
 * @param {string} form_name - Name of the form
 * @param {string} form_location - Form location
 */
export const trackFormSubmissionGTM = (form_name, form_location) => {
    pushToGTM('form_submit', {
        form_name,
        form_location,
        timestamp: new Date().getTime()
    });
};

/**
 * Track quiz completion via GTM
 * @param {string} quiz_name - Quiz name
 * @param {number} quiz_score - Score achieved
 * @param {number} quiz_max_score - Maximum possible score
 * @param {string} program_name - Program name
 */
export const trackQuizCompletionGTM = (quiz_name, quiz_score, quiz_max_score, program_name) => {
    pushToGTM('quiz_complete', {
        quiz_name,
        quiz_score,
        quiz_max_score,
        program_name,
        timestamp: new Date().getTime()
    });
};

/**
 * Set user consent for Meta tracking
 * @param {boolean} consent - User consent
 * @param {number} age - User age
 */
export const setMetaConsentGTM = (consent, age = null) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('meta_tracking_consent', consent.toString());
        
        if (age !== null) {
            localStorage.setItem('user_age', age.toString());
            
            // Auto-deny consent for children under 13 (COPPA)
            if (age < 13) {
                localStorage.setItem('meta_tracking_consent', 'false');
            }
        }
    }
};
```

### Example Usage in React Components

```javascript
// In your enrollment component
import { trackEnrollmentGTM, setMetaConsentGTM } from '@/Utils/gtmAnalytics';

const EnrollmentComponent = ({ program }) => {
    const handleEnrollment = () => {
        // This will trigger Meta Pixel Lead event via GTM
        trackEnrollmentGTM(program.name, program.type, program.price);
        
        // Your enrollment logic...
    };

    const handleConsentGiven = (userAge) => {
        setMetaConsentGTM(true, userAge);
    };

    return (
        <div>
            <button onClick={handleEnrollment}>
                Enroll in {program.name}
            </button>
        </div>
    );
};
```

## 🔍 Testing & Validation

### GTM Debug Console

When in Preview mode, you'll see:
- **Tags**: Which tags fired
- **Variables**: What data was captured
- **Data Layer**: Events pushed from your website

### Meta Events Manager

- **Test Events**: Real-time event monitoring
- **Overview**: Event summary and trends
- **Diagnostics**: Event quality and issues

### Browser Console Testing

```javascript
// Test if GTM dataLayer is working
console.log(window.dataLayer);

// Manually trigger an event
window.dataLayer.push({
    event: 'enrollment',
    program_name: 'Test Program',
    program_type: 'math',
    value: 99
});
```

## 🎯 Advantages of GTM-Based Meta Pixel

### 1. **Centralized Management**
- All tracking codes in one place
- Easy updates without code changes
- Version control for tracking changes

### 2. **Enhanced Privacy Controls**
- Conditional firing based on consent
- Easy compliance with GDPR/COPPA
- Granular control over data collection

### 3. **Better Debugging**
- GTM Preview mode for testing
- Clear visibility into what's tracking
- Easy troubleshooting

### 4. **Advanced Targeting**
- Complex trigger conditions
- Multiple event parameters
- Custom audience creation

### 5. **Performance Benefits**
- Asynchronous loading
- Reduced code on website
- Better page load speeds

## 📋 Implementation Checklist

### GTM Configuration:
- [ ] Meta Pixel base code tag created
- [ ] All data layer variables configured
- [ ] Event-specific tags for enrollment, demos, etc.
- [ ] Privacy consent checks implemented
- [ ] All tags tested in Preview mode

### Website Updates:
- [ ] Direct Meta Pixel code removed from HTML
- [ ] GTM-based tracking functions implemented
- [ ] React components updated to use GTM dataLayer
- [ ] Consent management integrated

### Testing & Validation:
- [ ] GTM Preview shows tags firing correctly
- [ ] Meta Events Manager shows events
- [ ] Privacy controls working as expected
- [ ] All educational events tracking properly

### Go Live:
- [ ] GTM container published
- [ ] Real-time testing completed
- [ ] Meta Pixel Helper shows green status
- [ ] Events flowing to Meta for optimization

This GTM-based approach gives you much more control and flexibility while maintaining privacy compliance for your educational platform! 🎓✨