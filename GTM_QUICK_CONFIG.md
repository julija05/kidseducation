# GTM Quick Configuration for Meta Pixel

## 🎯 Quick Reference: Your Container ID & Pixel ID

- **GTM Container**: `GTM-N59RL7B8`
- **Meta Pixel ID**: `2032470714226764`
- **Website**: Abacoding Educational Platform

## ⚡ 5-Minute Setup Checklist

### Step 1: Base Meta Pixel Tag
```
Tag Name: Meta Pixel - Base Code
Tag Type: Custom HTML
Trigger: All Pages
```

**HTML Code**:
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

### Step 2: Create These Variables

| Variable Name | Type | Data Layer Variable Name |
|---------------|------|--------------------------|
| `DL - Program Name` | Data Layer Variable | `program_name` |
| `DL - Program Type` | Data Layer Variable | `program_type` |
| `DL - Event Value` | Data Layer Variable | `value` |
| `DL - Lesson Name` | Data Layer Variable | `lesson_name` |
| `DL - Lesson Level` | Data Layer Variable | `lesson_level` |
| `DL - Quiz Score` | Data Layer Variable | `quiz_score` |
| `DL - Form Name` | Data Layer Variable | `form_name` |
| `DL - Form Location` | Data Layer Variable | `form_location` |

### Step 3: Create These Event Tags

#### A. Program Enrollment (Lead Event)
```
Tag Name: Meta Pixel - Program Enrollment
Tag Type: Custom HTML
Trigger: Custom Event = "enrollment"
```

**HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
        content_name: {{DL - Program Name}},
        content_category: {{DL - Program Type}},
        value: {{DL - Event Value}},
        currency: 'USD'
    });
}
</script>
```

#### B. Demo Start (InitiateCheckout)
```
Tag Name: Meta Pixel - Demo Start
Tag Type: Custom HTML
Trigger: Custom Event = "demo_start"
```

**HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', {
        content_name: {{DL - Program Name}} + ' - Demo',
        content_category: {{DL - Program Type}},
        value: 0,
        currency: 'USD'
    });
}
</script>
```

#### C. Contact Form (Lead)
```
Tag Name: Meta Pixel - Contact Form
Tag Type: Custom HTML
Trigger: Custom Event = "form_submit"
```

**HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', {
        content_name: {{DL - Form Name}},
        content_category: 'Contact',
        source: {{DL - Form Location}}
    });
}
</script>
```

### Step 4: Create These Triggers

| Trigger Name | Trigger Type | Event Name |
|--------------|--------------|------------|
| `Enrollment Event` | Custom Event | `enrollment` |
| `Demo Start Event` | Custom Event | `demo_start` |
| `Form Submit Event` | Custom Event | `form_submit` |
| `Lesson Complete Event` | Custom Event | `lesson_complete` |
| `Quiz Complete Event` | Custom Event | `quiz_complete` |

## 🔧 Website Integration Code

### Import the GTM utilities:
```javascript
import { 
    trackEnrollmentViaGTM,
    trackDemoStartViaGTM,
    trackFormSubmissionViaGTM,
    setMetaTrackingConsent
} from '@/Utils/gtmMetaPixel';
```

### Usage Examples:

#### Program Enrollment:
```javascript
const handleEnrollment = () => {
    trackEnrollmentViaGTM('Mental Arithmetic Mastery', 'math', 99);
    // Your enrollment logic...
};
```

#### Demo Start:
```javascript
const handleDemoStart = () => {
    trackDemoStartViaGTM('Coding Adventures', 'programming');
    // Your demo logic...
};
```

#### Contact Form:
```javascript
const handleFormSubmit = () => {
    trackFormSubmissionViaGTM('Contact Form', 'Contact Page', 'contact');
    // Your form logic...
};
```

#### Set User Consent:
```javascript
const handleConsentGiven = (userAge) => {
    setMetaTrackingConsent(true, userAge);
};
```

## 🧪 Testing Steps

### 1. GTM Preview Mode
1. Click "Preview" in GTM
2. Enter your website URL
3. Navigate and trigger events
4. Verify tags fire in GTM debugger

### 2. Meta Events Manager
1. Go to Meta Events Manager
2. Select Test Events
3. Perform actions on your site
4. Check events appear real-time

### 3. Browser Console
```javascript
// Check dataLayer
console.log(window.dataLayer);

// Manual test
window.dataLayer.push({
    event: 'enrollment',
    program_name: 'Test Program',
    program_type: 'math',
    value: 99
});
```

## 🚀 Go Live

1. **Test everything** in Preview mode
2. **Submit version** in GTM with description
3. **Publish** the container
4. **Verify** with Meta Pixel Helper extension

## 🔍 Troubleshooting

### Common Issues:

**Tags not firing?**
- Check trigger conditions
- Verify event names match exactly
- Use GTM Preview mode

**No events in Meta?**
- Wait 15-20 minutes for processing
- Check Test Events in Meta Events Manager
- Verify Pixel ID is correct

**Variables showing undefined?**
- Check dataLayer variable names
- Ensure events push correct parameter names
- Use browser console to debug dataLayer

## 📊 Meta Ads Manager Setup

### Create Custom Conversions:
1. **Program Enrollments**: Lead events with `content_category` = program type
2. **Demo Starts**: InitiateCheckout events
3. **Contact Forms**: Lead events with `content_category` = "Contact"

### Create Audiences:
1. **Website Visitors**: All page views
2. **Demo Users**: InitiateCheckout events
3. **Enrolled Students**: Lead events (enrollments)
4. **Lookalike Audiences**: Based on enrolled students

This setup will give you comprehensive Meta Pixel tracking through GTM with full privacy compliance! 🎯