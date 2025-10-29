<?php

namespace App\Contracts;

use App\Models\LessonResource;
use App\Models\User;

/**
 * Interface for resource access control
 * Follows the Interface Segregation Principle
 */
interface ResourceAccessInterface
{
    /**
     * Check if user can access a resource
     *
     * @param LessonResource $resource
     * @param User $user
     * @return bool
     */
    public function canAccess(LessonResource $resource, User $user): bool;

    /**
     * Validate access and throw exception if denied
     *
     * @param LessonResource $resource
     * @param User $user
     * @return void
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function validateAccess(LessonResource $resource, User $user): void;
}
