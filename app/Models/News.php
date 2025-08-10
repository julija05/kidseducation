<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class News extends Model
{
    /** @use HasFactory<\Database\Factories\NewsFactory> */
    use HasFactory;
    
    protected $fillable = [
        'title', 
        'content', 
        'title_en',
        'title_mk',
        'content_en',
        'content_mk',
        'image', 
        'category', 
        'slug', 
        'is_published', 
        'published_at'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Attributes that should be appended to the model's array form.
     */
    protected $appends = [
        'translated_title',
        'translated_content',
        'available_languages'
    ];

    const CATEGORIES = [
        'news' => 'News & Announcements',
        'how_to_use' => 'How to Use Platform',
        'tutorials' => 'Tutorials & Guides',
        'updates' => 'Platform Updates',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title);
            }
            if (empty($model->published_at) && $model->is_published) {
                $model->published_at = now();
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('title') && empty($model->slug)) {
                $model->slug = Str::slug($model->title);
            }
            if ($model->isDirty('is_published') && $model->is_published && empty($model->published_at)) {
                $model->published_at = now();
            }
        });
    }

    public function scopePublished($query)
    {
        try {
            return $query->where('is_published', true);
        } catch (\Exception $e) {
            // Column doesn't exist yet, return all records
            return $query;
        }
    }

    public function scopeByCategory($query, $category)
    {
        try {
            return $query->where('category', $category);
        } catch (\Exception $e) {
            // Column doesn't exist yet, filter by title containing category for basic functionality
            return $query->where('title', 'LIKE', '%' . str_replace('_', ' ', $category) . '%');
        }
    }

    public function getCategoryNameAttribute()
    {
        $keyMap = [
            'how_to_use' => 'how_to_use_platform',
            'tutorials' => 'tutorials_guides',
            'updates' => 'platform_updates',
            'news' => 'news_announcements'
        ];
        
        $key = $keyMap[$this->category] ?? null;
        if ($key && function_exists('__')) {
            $translation = __("app.articles.{$key}");
            // If translation key is returned literally, fall back to hardcoded value
            if ($translation === "app.articles.{$key}") {
                return self::CATEGORIES[$this->category] ?? ucfirst(str_replace('_', ' ', $this->category));
            }
            return $translation;
        }
        
        // Fallback to the hardcoded value if translation key doesn't exist
        return self::CATEGORIES[$this->category] ?? $this->category;
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    /**
     * Get the translated title for the current locale.
     */
    public function getTranslatedTitleAttribute()
    {
        $locale = app()->getLocale();
        $titleField = "title_{$locale}";
        
        // Check if translation field exists and has content
        if (Schema::hasColumn('news', $titleField) && !empty($this->$titleField)) {
            return $this->$titleField;
        }
        
        // Fallback to English
        if (Schema::hasColumn('news', 'title_en') && !empty($this->title_en)) {
            return $this->title_en;
        }
        
        // Final fallback to original title field
        return $this->title;
    }

    /**
     * Get the translated content for the current locale.
     */
    public function getTranslatedContentAttribute()
    {
        $locale = app()->getLocale();
        $contentField = "content_{$locale}";
        
        // Check if translation field exists and has content
        if (Schema::hasColumn('news', $contentField) && !empty($this->$contentField)) {
            return $this->$contentField;
        }
        
        // Fallback to English
        if (Schema::hasColumn('news', 'content_en') && !empty($this->content_en)) {
            return $this->content_en;
        }
        
        // Final fallback to original content field
        return $this->content;
    }

    /**
     * Get available languages for this article.
     */
    public function getAvailableLanguagesAttribute()
    {
        $languages = ['en']; // English is always available as fallback
        
        // Check which translation fields have content
        if (Schema::hasColumn('news', 'title_mk') && !empty($this->title_mk)) {
            $languages[] = 'mk';
        }
        
        return array_unique($languages);
    }

    /**
     * Check if article has translation for specific language.
     */
    public function hasTranslation($locale)
    {
        if ($locale === 'en') {
            return true; // English is default
        }
        
        $titleField = "title_{$locale}";
        $contentField = "content_{$locale}";
        
        return Schema::hasColumn('news', $titleField) && 
               !empty($this->$titleField) && 
               !empty($this->$contentField);
    }

    /**
     * Scope to filter articles that have translations for a specific language.
     */
    public function scopeWithTranslation($query, $locale)
    {
        if ($locale === 'en') {
            // English is default, check for title_en and content_en
            return $query->whereNotNull('title_en')
                        ->where('title_en', '!=', '')
                        ->whereNotNull('content_en')
                        ->where('content_en', '!=', '');
        }
        
        $titleField = "title_{$locale}";
        $contentField = "content_{$locale}";
        
        try {
            // Check if translation columns exist
            if (Schema::hasColumn('news', $titleField) && Schema::hasColumn('news', $contentField)) {
                return $query->whereNotNull($titleField)
                            ->where($titleField, '!=', '')
                            ->whereNotNull($contentField)
                            ->where($contentField, '!=', '');
            }
        } catch (\Exception $e) {
            // Columns don't exist, return empty query
        }
        
        return $query->whereRaw('1 = 0'); // No results
    }

    /**
     * Scope to filter articles that have Macedonian translations.
     */
    public function scopeHasMacedonianTranslation($query)
    {
        return $query->withTranslation('mk');
    }

    /**
     * Scope to filter articles that have English translations.
     */
    public function scopeHasEnglishTranslation($query)
    {
        return $query->withTranslation('en');
    }
}
