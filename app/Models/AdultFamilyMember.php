<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdultFamilyMember extends Model
{
    /** @use HasFactory<\Database\Factories\AdultFamilyMemberFactory> */
    use HasFactory;

    public function user():BelongsTo
{
    return $this->belongsTo(User::class);
}

public function children():HasMany
{
    return $this->hasMany(Child::class);
}
}
