<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminLessonResourceController extends Controller
{
    /**
     * Create a view response.
     */
    protected function createView(string $component, array $props = [])
    {
        return Inertia::render($component, $props);
    }

    public function index(Lesson $lesson)
    {
        $lesson->load(['resources' => function ($query) {
            $query->orderBy('order', 'asc'); // Changed from ordered() to orderBy()
        }]);

        return $this->createView('Admin/Lessons/Resources/Index', [
            'lesson' => $lesson,
            'resources' => $lesson->resources,
        ]);
    }

    public function create(Lesson $lesson)
    {
        return $this->createView('Admin/Lessons/Resources/Create', [
            'lesson' => $lesson,
        ]);
    }

    public function store(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,document,link,download,interactive,quiz',
            'language' => 'nullable|string|in:en,mk',
            'resource_url' => 'nullable|url',
            'file' => 'nullable|file|max:102400', // 100MB max
            'order' => 'required|integer|min:1',
            'is_downloadable' => 'boolean',
            'is_required' => 'boolean',
        ]);

        $resourceData = [
            'lesson_id' => $lesson->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'language' => $validated['language'] ?? 'en',
            'resource_url' => $validated['resource_url'],
            'order' => $validated['order'],
            'is_downloadable' => $validated['is_downloadable'] ?? false,
            'is_required' => $validated['is_required'] ?? true,
        ];

        // Handle file upload - FIXED TO USE LOCAL DISK
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('lesson-resources/' . $lesson->id); // Removed 'private' disk

            $resourceData['file_path'] = $path;
            $resourceData['file_name'] = $file->getClientOriginalName();
            $resourceData['file_size'] = $file->getSize();
            $resourceData['mime_type'] = $file->getMimeType();
        }

        LessonResource::create($resourceData);

        return redirect()
            ->route('admin.lessons.resources.index', $lesson)
            ->with('success', 'Resource created successfully.');
    }

    public function edit(Lesson $lesson, LessonResource $resource)
    {
        // Ensure resource has language field for backwards compatibility
        if (!isset($resource->language)) {
            $resource->language = 'en';
        }

        return $this->createView('Admin/Lessons/Resources/Edit', [
            'lesson' => $lesson,
            'resource' => $resource,
        ]);
    }

    public function update(Request $request, Lesson $lesson, LessonResource $resource)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,document,link,download,interactive,quiz',
            'language' => 'nullable|string|in:en,mk',
            'resource_url' => 'nullable|url',
            'file' => 'nullable|file|max:102400',
            'order' => 'required|integer|min:1',
            'is_downloadable' => 'boolean',
            'is_required' => 'boolean',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'language' => $validated['language'] ?? 'en',
            'resource_url' => $validated['resource_url'],
            'order' => $validated['order'],
            'is_downloadable' => $validated['is_downloadable'] ?? false,
            'is_required' => $validated['is_required'] ?? true,
        ];

        // Handle new file upload - FIXED TO USE LOCAL DISK
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($resource->file_path && Storage::exists($resource->file_path)) {
                Storage::delete($resource->file_path);
            }

            $file = $request->file('file');
            $path = $file->store('lesson-resources/' . $lesson->id); // Removed 'private' disk

            $updateData['file_path'] = $path;
            $updateData['file_name'] = $file->getClientOriginalName();
            $updateData['file_size'] = $file->getSize();
            $updateData['mime_type'] = $file->getMimeType();
        }

        $resource->update($updateData);

        return redirect()
            ->route('admin.lessons.resources.index', $lesson)
            ->with('success', 'Resource updated successfully.');
    }

    public function destroy(Lesson $lesson, LessonResource $resource)
    {
        // Delete associated file if exists - FIXED TO USE LOCAL DISK
        if ($resource->file_path && Storage::exists($resource->file_path)) {
            Storage::delete($resource->file_path);
        }

        $resource->delete();

        return redirect()
            ->route('admin.lessons.resources.index', $lesson)
            ->with('success', 'Resource deleted successfully.');
    }

    public function reorder(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'resources' => 'required|array',
            'resources.*.id' => 'required|exists:lesson_resources,id',
            'resources.*.order' => 'required|integer|min:1',
        ]);

        foreach ($validated['resources'] as $resourceData) {
            LessonResource::where('id', $resourceData['id'])
                ->where('lesson_id', $lesson->id)
                ->update(['order' => $resourceData['order']]);
        }

        return response()->json(['success' => true]);
    }

    // Quick method to add YouTube video
    public function addYouTubeVideo(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|url|regex:/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//',
            'is_required' => 'boolean',
        ]);

        LessonResource::create([
            'lesson_id' => $lesson->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => 'video',
            'resource_url' => $validated['youtube_url'],
            'order' => $lesson->resources()->max('order') + 1,
            'is_downloadable' => false,
            'is_required' => $validated['is_required'] ?? true,
            'metadata' => [
                'platform' => 'youtube',
                'added_via' => 'quick_add',
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'YouTube video added successfully.'
        ]);
    }
}
