<?php

namespace App\Policies;

use App\Models\LessonResource;
use App\Models\User;

class LessonResourcePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admins can view all resources, students can view resources for enrolled programs
        return $user->hasRole('admin') || $user->hasRole('student');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LessonResource $lessonResource): bool
    {
        // Admins can view all resources
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Students can view resources if they're enrolled in the program
        if ($user->hasRole('student')) {
            $lesson = $lessonResource->lesson;
            if ($lesson && $lesson->program) {
                // Check if student is enrolled and approved for this program
                return $user->enrollments()
                    ->where('program_id', $lesson->program_id)
                    ->where('status', 'approved')
                    ->exists();
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LessonResource $lessonResource): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LessonResource $lessonResource): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LessonResource $lessonResource): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LessonResource $lessonResource): bool
    {
        return $user->hasRole('admin');
    }
}
