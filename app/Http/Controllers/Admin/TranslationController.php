<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TranslationController extends Controller
{
    /**
     * Display translation management interface
     */
    public function index()
    {
        $programs = Program::with(['lessons.resources'])
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'translated_name' => $program->translated_name,
                    'name_translations' => $program->name_translations,
                    'description_translations' => $program->description_translations,
                    'lessons_count' => $program->lessons->count(),
                    'resources_count' => $program->lessons->sum(fn($lesson) => $lesson->resources->count()),
                ];
            });

        return Inertia::render('Admin/Translations/Index', [
            'programs' => $programs,
            'supported_locales' => config('app.supported_locales', ['en', 'mk']),
        ]);
    }

    /**
     * Update program translations
     */
    public function updateProgram(Request $request, Program $program)
    {
        $request->validate([
            'translations' => 'required|array',
            'translations.*.name' => 'required|string|max:255',
            'translations.*.description' => 'required|string',
        ]);

        $nameTranslations = [];
        $descriptionTranslations = [];

        foreach ($request->translations as $locale => $translation) {
            $nameTranslations[$locale] = $translation['name'];
            $descriptionTranslations[$locale] = $translation['description'];
        }

        $program->update([
            'name_translations' => $nameTranslations,
            'description_translations' => $descriptionTranslations,
        ]);

        return back()->with('success', 'Program translations updated successfully!');
    }

    /**
     * Update lesson translations
     */
    public function updateLesson(Request $request, Lesson $lesson)
    {
        $request->validate([
            'translations' => 'required|array',
            'translations.*.title' => 'required|string|max:255',
            'translations.*.description' => 'nullable|string',
            'translations.*.content_body' => 'nullable|string',
        ]);

        $titleTranslations = [];
        $descriptionTranslations = [];
        $contentBodyTranslations = [];

        foreach ($request->translations as $locale => $translation) {
            $titleTranslations[$locale] = $translation['title'];
            
            if (!empty($translation['description'])) {
                $descriptionTranslations[$locale] = $translation['description'];
            }
            
            if (!empty($translation['content_body'])) {
                $contentBodyTranslations[$locale] = $translation['content_body'];
            }
        }

        $lesson->update([
            'title_translations' => $titleTranslations,
            'description_translations' => !empty($descriptionTranslations) ? $descriptionTranslations : null,
            'content_body_translations' => !empty($contentBodyTranslations) ? $contentBodyTranslations : null,
        ]);

        return back()->with('success', 'Lesson translations updated successfully!');
    }

    /**
     * Update resource translations
     */
    public function updateResource(Request $request, LessonResource $resource)
    {
        $request->validate([
            'translations' => 'required|array',
            'translations.*.title' => 'required|string|max:255',
            'translations.*.description' => 'nullable|string',
        ]);

        $titleTranslations = [];
        $descriptionTranslations = [];

        foreach ($request->translations as $locale => $translation) {
            $titleTranslations[$locale] = $translation['title'];
            
            if (!empty($translation['description'])) {
                $descriptionTranslations[$locale] = $translation['description'];
            }
        }

        $resource->update([
            'title_translations' => $titleTranslations,
            'description_translations' => !empty($descriptionTranslations) ? $descriptionTranslations : null,
        ]);

        return back()->with('success', 'Resource translations updated successfully!');
    }

    /**
     * Get program details with all translations
     */
    public function showProgram(Program $program)
    {
        $program->load(['lessons.resources']);

        return Inertia::render('Admin/Translations/ProgramDetails', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'description' => $program->description,
                'name_translations' => $program->name_translations ?? [],
                'description_translations' => $program->description_translations ?? [],
                'lessons' => $program->lessons->map(function ($lesson) {
                    return [
                        'id' => $lesson->id,
                        'title' => $lesson->title,
                        'description' => $lesson->description,
                        'content_body' => $lesson->content_body,
                        'level' => $lesson->level,
                        'order_in_level' => $lesson->order_in_level,
                        'title_translations' => $lesson->title_translations ?? [],
                        'description_translations' => $lesson->description_translations ?? [],
                        'content_body_translations' => $lesson->content_body_translations ?? [],
                        'resources' => $lesson->resources->map(function ($resource) {
                            return [
                                'id' => $resource->id,
                                'title' => $resource->title,
                                'description' => $resource->description,
                                'type' => $resource->type,
                                'title_translations' => $resource->title_translations ?? [],
                                'description_translations' => $resource->description_translations ?? [],
                            ];
                        }),
                    ];
                }),
            ],
            'supported_locales' => config('app.supported_locales', ['en', 'mk']),
        ]);
    }
}