<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\HomeworkAssignmentStatus;
use App\Models\PracticeRun;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

/**
 * AchievementService - builds the student's Achievements page data.
 *
 * Badges are derived from data the platform already tracks:
 *   - Skill Mastery  -> lesson/level completion (LessonProgress),
 *   - Practice       -> stored Mental Accelerator runs (PracticeRun),
 *   - Homework       -> completed homework assignments.
 *
 * Categories the platform has no data source for yet (Streaks, Challenges) are
 * returned as locked badges so the page shows the full journey ahead without
 * pretending they can be earned.
 */
class AchievementService
{
    // Thresholds that unlock the count-based badges. Named constants keep the
    // badge definitions readable and the "X to go" hints in sync.
    private const FLASH_MASTER_RUNS = 10;

    private const CENTURY_CORRECT_ROUNDS = 100;

    private const HOMEWORK_HERO_COUNT = 5;

    // Soft background tokens used for each earned badge's icon circle.
    private const COLOR_BLUE = 'aba-blue-soft';

    private const COLOR_CORAL = 'aba-coral-soft';

    private const COLOR_GREEN = 'aba-green-soft';

    private const COLOR_YELLOW = 'aba-yellow-soft';

    private const COLOR_PURPLE = 'aba-purple-soft';

    public function __construct(
        private ProgramService $programService
    ) {}

    /**
     * Build the full Achievements payload for a student's enrollment.
     *
     * @return array{summary: array, categories: array<int, array>}
     */
    public function buildForStudent(User $user, Enrollment $enrollment): array
    {
        $categories = [
            $this->skillMasteryCategory($user, $enrollment),
            $this->practiceCategory($user),
            $this->homeworkCategory($user),
            $this->streaksCategory(),
            $this->challengesCategory(),
        ];

        return [
            'summary' => $this->summarize($categories),
            'categories' => $this->stripInternalFields($categories),
        ];
    }

    /**
     * Skill Mastery badges, derived from lesson and level completion.
     */
    private function skillMasteryCategory(User $user, Enrollment $enrollment): array
    {
        $program = $enrollment->program;
        $levelProgress = $program
            ? $this->programService->calculateLevelProgressForUser($program, $user)
            : [];

        $completedLessons = array_sum(array_column($levelProgress, 'completed'));
        $overallProgress = (int) round($enrollment->progress ?? 0);

        $badges = [];

        // First lesson finished.
        $badges[] = $this->badge([
            'key' => 'skill-getting-started',
            'name' => 'Getting Started',
            'icon' => '🌱',
            'color' => self::COLOR_GREEN,
            'earned' => $completedLessons > 0,
            'hint' => 'Complete your first lesson',
        ]);

        // One badge per level in the program, earned when the level is finished.
        foreach ($levelProgress as $level) {
            $levelNumber = $level['level'];
            $badges[] = $this->badge([
                'key' => "skill-level-{$levelNumber}",
                'name' => "Level {$levelNumber} Master",
                'icon' => (string) $levelNumber,
                'color' => self::COLOR_BLUE,
                'earned' => (bool) $level['isCompleted'],
                'hint' => "Finish all Level {$levelNumber} lessons",
                'progress' => (int) round($level['progress']),
            ]);
        }

        // Whole-program completion.
        $badges[] = $this->badge([
            'key' => 'skill-program-champion',
            'name' => 'Program Champion',
            'icon' => '👑',
            'color' => self::COLOR_YELLOW,
            'earned' => $overallProgress >= 100,
            'hint' => 'Complete every lesson in your program',
            'progress' => $overallProgress,
        ]);

        return [
            'key' => 'skill',
            'title' => 'Skill Mastery',
            'subtitle' => 'Earned by leveling up your program',
            'badges' => $badges,
        ];
    }

    /**
     * Practice badges, derived from stored Mental Accelerator runs.
     */
    private function practiceCategory(User $user): array
    {
        // Oldest-first so the Nth run's timestamp is the moment a badge was earned.
        $runs = PracticeRun::query()
            ->where('user_id', $user->id)
            ->orderBy('created_at')
            ->get(['total_rounds', 'correct_rounds', 'created_at']);

        $totalRuns = $runs->count();
        $totalCorrectRounds = (int) $runs->sum('correct_rounds');
        $firstRun = $runs->first();
        $masterRun = $runs->get(self::FLASH_MASTER_RUNS - 1);
        $firstPerfectRun = $runs->first(
            fn (PracticeRun $run) => $run->total_rounds > 0 && $run->correct_rounds === $run->total_rounds
        );

        $practiceHref = $this->safeRoute('practice.index');

        $badges = [
            $this->badge([
                'key' => 'practice-first-flash',
                'name' => 'First Flash',
                'icon' => '⚡',
                'color' => self::COLOR_CORAL,
                'earned' => $totalRuns > 0,
                'earnedAt' => $firstRun?->created_at,
                'hint' => 'Finish your first practice run',
                'href' => $practiceHref,
            ]),
            $this->badge([
                'key' => 'practice-flash-master',
                'name' => 'Flash Master',
                'icon' => '🚀',
                'color' => self::COLOR_PURPLE,
                'earned' => $totalRuns >= self::FLASH_MASTER_RUNS,
                'earnedAt' => $masterRun?->created_at,
                'hint' => 'Complete '.self::FLASH_MASTER_RUNS.' practice runs',
                'progress' => $this->percentOf($totalRuns, self::FLASH_MASTER_RUNS),
                'href' => $practiceHref,
            ]),
            $this->badge([
                'key' => 'practice-sharp-shooter',
                'name' => 'Sharp Shooter',
                'icon' => '🎯',
                'color' => self::COLOR_YELLOW,
                'earned' => $firstPerfectRun !== null,
                'earnedAt' => $firstPerfectRun?->created_at,
                'hint' => 'Get every round right in one run',
                'href' => $practiceHref,
            ]),
            $this->badge([
                'key' => 'practice-century',
                'name' => 'Century Club',
                'icon' => '💯',
                'color' => self::COLOR_GREEN,
                'earned' => $totalCorrectRounds >= self::CENTURY_CORRECT_ROUNDS,
                'hint' => 'Answer '.self::CENTURY_CORRECT_ROUNDS.' rounds correctly',
                'progress' => $this->percentOf($totalCorrectRounds, self::CENTURY_CORRECT_ROUNDS),
                'href' => $practiceHref,
            ]),
        ];

        return [
            'key' => 'practice',
            'title' => 'Practice',
            'subtitle' => 'Earned in the Mental Accelerator',
            'badges' => $badges,
        ];
    }

    /**
     * Homework badges, derived from completed homework assignments.
     */
    private function homeworkCategory(User $user): array
    {
        $completedAt = $this->completedHomeworkDates($user);
        $completedCount = $completedAt->count();

        $badges = [
            $this->badge([
                'key' => 'homework-first',
                'name' => 'First Homework Done',
                'icon' => '📬',
                'color' => self::COLOR_GREEN,
                'earned' => $completedCount >= 1,
                'earnedAt' => $completedAt->first(),
                'hint' => 'Finish your first homework task',
            ]),
            $this->badge([
                'key' => 'homework-hero',
                'name' => 'Homework Hero',
                'icon' => '⭐',
                'color' => self::COLOR_PURPLE,
                'earned' => $completedCount >= self::HOMEWORK_HERO_COUNT,
                'earnedAt' => $completedAt->get(self::HOMEWORK_HERO_COUNT - 1),
                'hint' => 'Complete '.self::HOMEWORK_HERO_COUNT.' homework tasks',
                'progress' => $this->percentOf($completedCount, self::HOMEWORK_HERO_COUNT),
            ]),
        ];

        return [
            'key' => 'homework',
            'title' => 'Homework',
            'subtitle' => "Earned by finishing what's assigned",
            'badges' => $badges,
        ];
    }

    /**
     * Streak badges. There is no activity-streak tracking yet, so these are
     * always shown locked as a preview of what is coming.
     */
    private function streaksCategory(): array
    {
        return [
            'key' => 'streaks',
            'title' => 'Streaks',
            'subtitle' => 'Earned by showing up (coming soon)',
            'badges' => [
                $this->badge([
                    'key' => 'streak-seven-day',
                    'name' => '7-Day Streak',
                    'icon' => '🔥',
                    'color' => self::COLOR_YELLOW,
                    'earned' => false,
                    'hint' => 'Practice 7 days in a row',
                ]),
                $this->badge([
                    'key' => 'streak-early-bird',
                    'name' => 'Early Bird',
                    'icon' => '🌙',
                    'color' => self::COLOR_PURPLE,
                    'earned' => false,
                    'hint' => 'Practice before 9am, 5 times',
                ]),
            ],
        ];
    }

    /**
     * Challenge badges. Challenge mode does not exist yet, so these stay locked.
     */
    private function challengesCategory(): array
    {
        return [
            'key' => 'challenges',
            'title' => 'Challenges',
            'subtitle' => 'Earned in Challenge mode (coming soon)',
            'badges' => [
                $this->badge([
                    'key' => 'challenge-speed-round',
                    'name' => 'Speed Round Winner',
                    'icon' => '⚡',
                    'color' => self::COLOR_CORAL,
                    'earned' => false,
                    'hint' => 'Win a weekly speed round',
                ]),
                $this->badge([
                    'key' => 'challenge-boss-beater',
                    'name' => 'Boss Beater',
                    'icon' => '🐲',
                    'color' => self::COLOR_GREEN,
                    'earned' => false,
                    'hint' => 'Beat your first boss level',
                ]),
            ],
        ];
    }

    /**
     * Collect the completion timestamps of a student's completed homework,
     * oldest first, so the Nth completion dates the matching badge.
     *
     * @return \Illuminate\Support\Collection<int, Carbon>
     */
    private function completedHomeworkDates(User $user)
    {
        if (! Schema::hasTable('homework_assignment_statuses')) {
            return collect();
        }

        return HomeworkAssignmentStatus::query()
            ->where('student_id', $user->id)
            ->where('status', HomeworkAssignmentStatus::STATUS_COMPLETED)
            ->orderBy('completed_at')
            ->pluck('completed_at')
            ->filter()
            ->values();
    }

    /**
     * Normalize a single badge definition into the shape the page consumes.
     *
     * The raw earned-at Carbon is kept under `_earnedAt` for sorting the summary
     * and is stripped before the payload is returned to the client.
     */
    private function badge(array $definition): array
    {
        $earned = (bool) ($definition['earned'] ?? false);
        $earnedAt = $earned ? ($definition['earnedAt'] ?? null) : null;

        return [
            'key' => $definition['key'],
            'name' => $definition['name'],
            'icon' => $definition['icon'],
            'color' => $definition['color'],
            'earned' => $earned,
            'earnedAt' => $earnedAt instanceof Carbon ? $earnedAt->format('M d, Y') : null,
            'hint' => $definition['hint'] ?? null,
            // Only expose progress for locked badges that have measurable progress.
            'progress' => (! $earned && isset($definition['progress'])) ? $definition['progress'] : null,
            'href' => $definition['href'] ?? null,
            '_earnedAt' => $earnedAt instanceof Carbon ? $earnedAt : null,
        ];
    }

    /**
     * Build the summary card: how many badges are earned and the most recent one.
     */
    private function summarize(array $categories): array
    {
        $allBadges = collect($categories)->flatMap(fn (array $category) => $category['badges']);
        $earnedBadges = $allBadges->where('earned', true);

        // The latest badge is the earned one with the most recent timestamp;
        // badges without a timestamp (e.g. level mastery) fall back behind dated ones.
        $latest = $earnedBadges
            ->filter(fn (array $badge) => $badge['_earnedAt'] !== null)
            ->sortByDesc('_earnedAt')
            ->first() ?? $earnedBadges->first();

        return [
            'earned' => $earnedBadges->count(),
            'total' => $allBadges->count(),
            'percent' => $this->percentOf($earnedBadges->count(), $allBadges->count()),
            'latest' => $latest ? [
                'name' => $latest['name'],
                'icon' => $latest['icon'],
                'earnedAt' => $latest['earnedAt'],
            ] : null,
        ];
    }

    /**
     * Remove internal-only fields (the raw Carbon) before returning to the client.
     */
    private function stripInternalFields(array $categories): array
    {
        return array_map(function (array $category) {
            $category['badges'] = array_map(function (array $badge) {
                unset($badge['_earnedAt']);

                return $badge;
            }, $category['badges']);

            return $category;
        }, $categories);
    }

    /**
     * Percentage of a value against a target, clamped to 0-100.
     */
    private function percentOf(int $value, int $target): int
    {
        if ($target <= 0) {
            return 0;
        }

        return (int) min(100, round(($value / $target) * 100));
    }

    /**
     * Resolve a route name, returning null when it is unavailable so callers can
     * omit the link rather than crash.
     */
    private function safeRoute(string $name): ?string
    {
        try {
            return route($name);
        } catch (\Throwable) {
            return null;
        }
    }
}
