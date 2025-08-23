<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'type',
        'data',
        'is_read',
        'related_model_type',
        'related_model_id',
        'created_by',
    ];

    protected $attributes = [
        'is_read' => false,
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function relatedModel()
    {
        return $this->morphTo('related_model', 'related_model_type', 'related_model_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function markAsRead(): bool
    {
        return $this->update(['is_read' => true]);
    }

    public function markAsUnread(): bool
    {
        return $this->update(['is_read' => false]);
    }
}
