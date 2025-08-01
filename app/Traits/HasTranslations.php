<?php

namespace App\Traits;

use Illuminate\Support\Facades\App;

trait HasTranslations
{
    /**
     * Get translated attribute value
     */
    public function getTranslatedAttribute(string $attribute): ?string
    {
        $translationsAttribute = $attribute . '_translations';
        $currentLocale = App::getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');
        
        // Get translations array
        $translations = $this->getAttribute($translationsAttribute);
        
        if (!$translations || !is_array($translations)) {
            // Fallback to original attribute if translations don't exist
            return $this->getAttribute($attribute);
        }
        
        // Try current locale first
        if (isset($translations[$currentLocale])) {
            return $translations[$currentLocale];
        }
        
        // Fallback to fallback locale
        if (isset($translations[$fallbackLocale])) {
            return $translations[$fallbackLocale];
        }
        
        // Last resort: return first available translation
        return !empty($translations) ? array_values($translations)[0] : $this->getAttribute($attribute);
    }
    
    /**
     * Set translated attribute value
     */
    public function setTranslatedAttribute(string $attribute, string $value, string $locale = null): void
    {
        $translationsAttribute = $attribute . '_translations';
        $locale = $locale ?? App::getLocale();
        
        $translations = $this->getAttribute($translationsAttribute) ?? [];
        $translations[$locale] = $value;
        
        $this->setAttribute($translationsAttribute, $translations);
    }
    
    /**
     * Get all translations for an attribute
     */
    public function getAllTranslations(string $attribute): array
    {
        $translationsAttribute = $attribute . '_translations';
        return $this->getAttribute($translationsAttribute) ?? [];
    }
    
    /**
     * Check if translation exists for attribute and locale
     */
    public function hasTranslation(string $attribute, string $locale): bool
    {
        $translations = $this->getAllTranslations($attribute);
        return isset($translations[$locale]) && !empty($translations[$locale]);
    }
}