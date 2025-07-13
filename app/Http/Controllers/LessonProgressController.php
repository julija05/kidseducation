<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonProgressRequest;
use App\Http\Requests\UpdateLessonProgressRequest;
use App\Models\LessonProgress;
use App\Repositories\Interfaces\LessonProgressRepositoryInterface;

class LessonProgressController extends Controller
{
    public function __construct(
        private LessonProgressRepositoryInterface $progressRepository
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Implement if needed
        return response()->json(['message' => 'Not implemented'], 501);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonProgressRequest $request)
    {
        // Handled by LessonController::start
        return response()->json(['message' => 'Use lessons.start endpoint'], 400);
    }

    /**
     * Display the specified resource.
     */
    public function show(LessonProgress $lessonProgress)
    {
        // Check if user can access this progress
        if ($lessonProgress->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json($lessonProgress);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLessonProgressRequest $request, LessonProgress $lessonProgress)
    {
        // Check if user can update this progress
        if ($lessonProgress->user_id !== auth()->id()) {
            abort(403);
        }

        $updatedProgress = $this->progressRepository->updateProgress($lessonProgress, $request->validated());

        return response()->json($updatedProgress);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LessonProgress $lessonProgress)
    {
        // Check if user can delete this progress
        if ($lessonProgress->user_id !== auth()->id()) {
            abort(403);
        }

        $lessonProgress->delete();

        return response()->json(['message' => 'Progress deleted successfully']);
    }
}
