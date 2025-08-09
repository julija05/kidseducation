<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * Display a listing of user's reviews.
     */
    public function index()
    {
        $user = Auth::user();
        $reviews = $user->reviews()->with('reviewable')->orderBy('created_at', 'desc')->get();

        return $this->createView('Student/Reviews/Index', [
            'reviews' => $reviews
        ]);
    }

    /**
     * Show the form for creating a new review for a program.
     */
    public function create(Program $program)
    {
        $user = Auth::user();

        // Check if user is enrolled and approved in this program
        $enrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment) {
            return redirect()->route('programs.show', $program->slug)
                ->with('error', 'You must be enrolled and approved in this program to leave a review.');
        }

        // Check if user already reviewed this program
        $existingReview = $user->reviews()
            ->where('reviewable_type', Program::class)
            ->where('reviewable_id', $program->id)
            ->first();

        if ($existingReview) {
            return redirect()->route('programs.show', $program->slug)
                ->with('error', 'You have already reviewed this program.');
        }

        return $this->createView('Student/Reviews/Create', [
            'program' => [
                'id' => $program->id,
                'name' => $program->translated_name,
                'description' => $program->translated_description,
                'slug' => $program->slug,
            ]
        ]);
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request, Program $program)
    {
        $user = Auth::user();

        // Validate enrollment
        $enrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->where('approval_status', 'approved')
            ->first();

        if (!$enrollment) {
            return back()->with('error', 'You must be enrolled and approved in this program to leave a review.');
        }

        // Check for existing review
        $existingReview = $user->reviews()
            ->where('reviewable_type', Program::class)
            ->where('reviewable_id', $program->id)
            ->first();

        if ($existingReview) {
            return back()->with('error', 'You have already reviewed this program.');
        }

        // Validate the request
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        // Create the review
        $review = $user->reviews()->create([
            'reviewable_type' => Program::class,
            'reviewable_id' => $program->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_approved' => true, // Auto-approve for now
        ]);

        return redirect()->route('programs.show', $program->slug)
            ->with('success', 'Thank you for your review! It has been posted.');
    }

    /**
     * Show the form for editing the specified review.
     */
    public function edit(Review $review)
    {
        $user = Auth::user();

        // Check ownership
        if ($review->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $program = $review->reviewable;

        return $this->createView('Student/Reviews/Edit', [
            'review' => $review,
            'program' => [
                'id' => $program->id,
                'name' => $program->translated_name,
                'slug' => $program->slug,
            ]
        ]);
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Review $review)
    {
        $user = Auth::user();

        // Check ownership
        if ($review->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Validate the request
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        // Update the review
        $review->update($validated);

        return redirect()->route('programs.show', $review->reviewable->slug)
            ->with('success', 'Your review has been updated.');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        $user = Auth::user();

        // Check ownership
        if ($review->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $programSlug = $review->reviewable->slug;
        $review->delete();

        return redirect()->route('programs.show', $programSlug)
            ->with('success', 'Your review has been deleted.');
    }
}