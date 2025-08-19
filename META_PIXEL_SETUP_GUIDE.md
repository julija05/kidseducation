# Meta Pixel (Facebook Pixel) Setup Guide for Educational Platform

## 🎯 What is Meta Pixel?

Meta Pixel (formerly Facebook Pixel) is a tracking code that helps you:
- Measure the effectiveness of your advertising
- Build audiences for ad targeting
- Unlock additional advertising tools like lookalike audiences
- Track conversions from Facebook and Instagram ads

## ⚠️ CRITICAL: Privacy Compliance for Children's Platform

**Your platform serves children, so you MUST follow strict privacy guidelines:**

### COPPA Compliance (Children under 13):
- ❌ **DO NOT** track children under 13 without explicit parental consent
- ❌ **DO NOT** collect personal information from children
- ✅ **DO** implement age verification before tracking
- ✅ **DO** provide clear opt-out mechanisms

### GDPR Compliance (EU users):
- ✅ **DO** obtain explicit consent before tracking
- ✅ **DO** provide clear privacy policies
- ✅ **DO** allow users to withdraw consent
- ✅ **DO** implement data minimization

## 🚀 Step-by-Step Setup

### Step 1: Create Your Meta Pixel

1. **Go to Meta Business Manager**: https://business.facebook.com
2. **Navigate to Events Manager**:
   - Business Settings → Data Sources → Pixels
3. **Create a Pixel**:
   - Click "Add" → "Create a Pixel"
   - Name: "Abacoding Educational Platform"
   - Website URL: your domain
4. **Get Your Pixel ID**: You'll receive an ID like `123456789012345`

### Step 2: Add Pixel ID to Your Environment

Add your Meta Pixel ID to the `.env` file:

```env
META_PIXEL_ID=123456789012345
```

**The pixel code is already implemented in your website and will automatically load when you add the ID.**

### Step 3: Set Up Privacy-Compliant Tracking

#### Option A: Use Privacy-Compliant Functions (Recommended for Kids Platform)

```javascript
import { 
    setUserConsent, 
    trackEnrollmentPrivacy,
    trackDemoStartPrivacy 
} from '@/Utils/privacyCompliantTracking';

// Set user consent after age verification
setUserConsent(true, 16); // Age 16, consent given
setUserConsent(false, 10); // Age 10, automatically blocks tracking

// Track events (only if consent is given and age-appropriate)
trackEnrollmentPrivacy('Mental Arithmetic Mastery', 'math');
```

#### Option B: Direct Meta Pixel Functions (Use with caution)

```javascript
import { 
    trackMetaEnrollment,
    trackMetaDemoStart,
    trackMetaLessonCompletion 
} from '@/Utils/metaPixel';

// Only use if you've verified user consent and age
trackMetaEnrollment('Mental Arithmetic Mastery', 'math');
```

## 📊 Event Tracking Setup

### Standard Events (Facebook's predefined events):

#### 1. Lead Generation (Program Enrollments)
```javascript
import { trackMetaEnrollment } from '@/Utils/metaPixel';

const handleEnrollment = () => {
    trackMetaEnrollment('Mental Arithmetic Mastery', 'math', 99);
    // Your enrollment logic
};
```

#### 2. Demo Starts (InitiateCheckout)
```javascript
import { trackMetaDemoStart } from '@/Utils/metaPixel';

const handleDemoStart = () => {
    trackMetaDemoStart('Coding Adventures', 'programming');
    // Your demo logic
};
```

#### 3. Contact Form (Lead)
```javascript
import { trackMetaFormSubmission } from '@/Utils/metaPixel';

const handleContactSubmit = () => {
    trackMetaFormSubmission('Contact Form', 'Contact Page');
    // Your form logic
};
```

### Custom Events (Your specific tracking needs):

#### 1. Lesson Completion
```javascript
import { trackMetaLessonCompletion } from '@/Utils/metaPixel';

const handleLessonComplete = () => {
    trackMetaLessonCompletion('Basic Addition', 'Mental Arithmetic', 1, 180);
};
```

#### 2. Quiz Results
```javascript
import { trackMetaQuizCompletion } from '@/Utils/metaPixel';

const handleQuizComplete = () => {
    trackMetaQuizCompletion('Level 1 Quiz', 8, 10, 'Mental Arithmetic');
};
```

#### 3. Resource Downloads
```javascript
import { trackMetaResourceDownload } from '@/Utils/metaPixel';

const handleDownload = () => {
    trackMetaResourceDownload('Lesson 1 Worksheet', 'pdf', 'Basic Addition');
};
```

## 🎯 Setting Up Facebook Ads Manager

### Step 1: Create Custom Conversions

1. **Events Manager → Custom Conversions → Create**
2. **Set up conversions for**:
   - Program Enrollments (Lead events)
   - Demo Starts (InitiateCheckout events)
   - Contact Form Submissions (Lead events)

### Step 2: Create Audiences

#### Lookalike Audiences:
1. **Audiences → Create Audience → Lookalike**
2. **Source**: People who enrolled in programs
3. **Location**: Your target countries
4. **Size**: 1-3% for precision

#### Custom Audiences:
1. **Website visitors** (all visitors)
2. **Demo users** (people who started demos)
3. **Engaged users** (lesson completions)

### Step 3: Set Up Attribution

1. **Events Manager → Data Sources → Pixels → Your Pixel**
2. **Settings → Attribution**
3. **Recommended for education**:
   - 7-day click attribution
   - 1-day view attribution

## 🔍 Testing Your Implementation

### 1. Meta Pixel Helper (Browser Extension)

1. **Install**: Meta Pixel Helper extension for Chrome
2. **Visit your website**
3. **Check**: Green checkmark = pixel working correctly

### 2. Events Manager Test Events

1. **Events Manager → Test Events**
2. **Enter your website URL**
3. **Perform actions** on your site
4. **Verify events** appear in real-time

### 3. Browser Console Testing

```javascript
// Check if Meta Pixel is loaded
console.log(typeof window.fbq); // Should return 'function'

// Check what events are being sent
window.fbq('track', 'PageView'); // Test event
```

## 📱 Integration Examples

### Complete Enrollment Flow with Privacy

```javascript
import React, { useState } from 'react';
import { trackEnrollmentPrivacy, setUserConsent } from '@/Utils/privacyCompliantTracking';

const EnrollmentForm = ({ program }) => {
    const [ageVerified, setAgeVerified] = useState(false);
    const [userAge, setUserAge] = useState('');

    const handleAgeVerification = () => {
        const age = parseInt(userAge);
        setUserConsent(age >= 13, age);
        setAgeVerified(true);
    };

    const handleEnrollment = () => {
        // This will only track if consent is appropriate for age
        trackEnrollmentPrivacy(program.name, program.type, program.price);
        
        // Your enrollment logic
        // ...
    };

    return (
        <div>
            {!ageVerified ? (
                <div>
                    <label>Please verify your age:</label>
                    <input 
                        type="number" 
                        value={userAge}
                        onChange={(e) => setUserAge(e.target.value)}
                        placeholder="Your age"
                    />
                    <button onClick={handleAgeVerification}>Verify Age</button>
                </div>
            ) : (
                <button onClick={handleEnrollment}>
                    Enroll in {program.name}
                </button>
            )}
        </div>
    );
};
```

### Lesson Component with Tracking

```javascript
import React, { useEffect, useState } from 'react';
import { trackMetaLessonCompletion } from '@/Utils/metaPixel';
import { canTrackUser } from '@/Utils/privacyCompliantTracking';

const LessonViewer = ({ lesson, program }) => {
    const [startTime] = useState(Date.now());

    const handleLessonComplete = () => {
        const completionTime = Math.round((Date.now() - startTime) / 1000);
        
        // Only track if user consent allows it
        if (canTrackUser()) {
            trackMetaLessonCompletion(
                lesson.name, 
                program.name, 
                lesson.level, 
                completionTime
            );
        }
        
        // Your completion logic
        // ...
    };

    return (
        <div>
            <h1>{lesson.name}</h1>
            {/* Lesson content */}
            <button onClick={handleLessonComplete}>
                Complete Lesson
            </button>
        </div>
    );
};
```

## 📊 Analyzing Your Data

### Events Manager Reports

1. **Overview**: Total events, top events, event trends
2. **Events**: Detailed breakdown by event type
3. **Attribution**: How events relate to ad campaigns

### Key Metrics for Educational Platform:

- **Lead Events**: Program enrollments, contact forms
- **Custom Events**: Lesson completions, quiz results
- **Audience Growth**: Website visitors, engaged learners
- **Conversion Rates**: Demo → Enrollment, Visitor → Lead

## 🛡️ Privacy Best Practices

### 1. Consent Management Implementation

```javascript
// Example consent banner component
const ConsentBanner = () => {
    const handleAccept = () => {
        setUserConsent(true);
        // Hide banner
    };

    const handleDecline = () => {
        setUserConsent(false);
        // Hide banner, disable tracking
    };

    return (
        <div className="consent-banner">
            <p>We use cookies to improve your experience and measure site performance.</p>
            <button onClick={handleAccept}>Accept</button>
            <button onClick={handleDecline}>Decline</button>
        </div>
    );
};
```

### 2. Age Verification System

```javascript
// Age gate component for COPPA compliance
const AgeGate = ({ onVerified }) => {
    const [birthDate, setBirthDate] = useState('');

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    };

    const handleSubmit = () => {
        const age = calculateAge(birthDate);
        setUserConsent(age >= 13, age);
        onVerified(age);
    };

    return (
        <div className="age-gate">
            <h2>Age Verification Required</h2>
            <label>Birth Date:</label>
            <input 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
            />
            <button onClick={handleSubmit}>Continue</button>
        </div>
    );
};
```

## 🚨 Common Issues & Solutions

### Issue: Pixel Not Firing
**Solution**: 
- Check Meta Pixel Helper extension
- Verify pixel ID in environment file
- Check browser console for errors

### Issue: Events Not Showing in Events Manager
**Solution**:
- Wait 15-20 minutes for data processing
- Check if events are firing in Test Events
- Verify event parameters are correct

### Issue: Privacy Compliance Concerns
**Solution**:
- Always use privacy-compliant tracking functions
- Implement proper age verification
- Provide clear consent mechanisms
- Regular privacy audit of tracking practices

## 📋 Implementation Checklist

### Technical Setup:
- [ ] Meta Pixel created in Business Manager
- [ ] Pixel ID added to environment file
- [ ] Pixel Helper shows green checkmark
- [ ] Test events appear in Events Manager

### Privacy Compliance:
- [ ] Age verification implemented
- [ ] Consent management system active
- [ ] Privacy policy updated
- [ ] COPPA compliance measures in place

### Event Tracking:
- [ ] Program enrollment tracking
- [ ] Demo start tracking
- [ ] Lesson completion tracking
- [ ] Contact form tracking
- [ ] Custom educational events

### Testing & Validation:
- [ ] All events tested in Test Events
- [ ] Pixel Helper validation passed
- [ ] Privacy controls tested
- [ ] Age restrictions verified

## 🎓 Educational Platform Specific Tips

### 1. Segment by Age Groups
Create separate audiences for different age groups to ensure appropriate targeting.

### 2. Focus on Parent Targeting
Since children can't legally consent to data collection, focus ads on parents.

### 3. Educational Content Marketing
Track engagement with educational content to optimize your advertising.

### 4. Seasonal Campaigns
Track enrollment patterns to optimize for back-to-school and summer learning periods.

Remember: **Privacy first, tracking second** - especially when working with children's data! 🛡️👶