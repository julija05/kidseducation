<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class News extends Model
{
    /** @use HasFactory<\Database\Factories\NewsFactory> */
    use HasFactory;
    
    protected $fillable = [
        'title', 
        'content', 
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
        return self::CATEGORIES[$this->category] ?? $this->category;
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
