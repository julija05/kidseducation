import { usePage } from '@inertiajs/react';

export const useTranslation = () => {
    const { locale } = usePage().props;
    
    const t = (key, replacements = {}) => {
        // Split the key by dots to navigate nested objects
        const keys = key.split('.');
        let value = locale.translations;
        
        // Navigate through the nested object
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Return the key if translation not found
                return key;
            }
        }
        
        // If value is not a string, return the key
        if (typeof value !== 'string') {
            return key;
        }
        
        // Replace placeholders with values
        let translatedValue = value;
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`:${placeholder}`, 'g');
            translatedValue = translatedValue.replace(regex, replacements[placeholder]);
        });
        
        return translatedValue;
    };
    
    return { t, locale: locale.current };
};