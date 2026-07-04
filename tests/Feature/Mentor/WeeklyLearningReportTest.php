<?php

namespace Tests\Feature\Mentor;

use App\Models\LearningGroup;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesRoles;

class WeeklyLearningReportTest extends TestCase
{
    use CreatesRoles, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createRoles();
    }

    public function test_mentor_can_publish_week_one_group_report_with_child_note(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');
        $child = User::factory()->create();
        $child->assignRole('student');
        $group = $this->groupFor($mentor);
        $group->students()->attach($child);

        $response = $this->actingAs($mentor)->post(route('mentor.learning-groups.weekly-reports.store', $group), [
            'week_number' => 1,
            'child_user_id' => null,
            'what_we_learned' => 'Counting to one hundred.',
            'what_to_practice' => 'Ten minutes of number bonds.',
            'next_focus' => 'Two-digit addition.',
            'individual_notes' => [$child->id => 'Excellent participation.'],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('weekly_learning_reports', [
            'learning_group_id' => $group->id,
            'mentor_id' => $mentor->id,
            'child_user_id' => null,
            'week_number' => 1,
            'what_we_learned' => 'Counting to one hundred.',
        ]);
        $this->assertDatabaseHas('weekly_learning_report_notes', [
            'child_user_id' => $child->id,
            'note' => 'Excellent participation.',
        ]);
    }

    public function test_mentor_can_publish_report_for_one_student_but_not_student_outside_group(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');
        $child = User::factory()->create();
        $child->assignRole('student');
        $outsider = User::factory()->create();
        $outsider->assignRole('student');
        $group = $this->groupFor($mentor);
        $group->students()->attach($child);
        $payload = [
            'week_number' => 1,
            'what_we_learned' => 'Variables.',
            'what_to_practice' => 'Build a score counter.',
            'next_focus' => 'Conditions.',
        ];

        $this->actingAs($mentor)->post(route('mentor.learning-groups.weekly-reports.store', $group), [
            ...$payload,
            'child_user_id' => $outsider->id,
        ])->assertSessionHasErrors('child_user_id');

        $this->actingAs($mentor)->post(route('mentor.learning-groups.weekly-reports.store', $group), [
            ...$payload,
            'child_user_id' => $child->id,
            'individual_notes' => [$child->id => 'Ready for a challenge.'],
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('weekly_learning_reports', [
            'learning_group_id' => $group->id,
            'child_user_id' => $child->id,
            'individual_child_note' => 'Ready for a challenge.',
        ]);
    }

    public function test_parent_can_see_group_report_and_only_their_child_note(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');
        $parent = User::factory()->create();
        $parent->assignRole('parent');
        $child = User::factory()->create();
        $child->assignRole('student');
        $otherChild = User::factory()->create();
        $otherChild->assignRole('student');
        $parent->children()->attach($child);
        $group = $this->groupFor($mentor);
        $group->students()->attach([$child->id, $otherChild->id]);

        $this->actingAs($mentor)->post(route('mentor.learning-groups.weekly-reports.store', $group), [
            'week_number' => 1,
            'what_we_learned' => 'Patterns and sequences.',
            'what_to_practice' => 'Complete the pattern sheet.',
            'next_focus' => 'Number bonds.',
            'individual_notes' => [
                $child->id => 'Focused throughout the lesson.',
                $otherChild->id => 'Private note for another child.',
            ],
        ]);

        $response = $this->actingAs($parent)->get(route('parent.children.show', $child));

        $response->assertInertia(fn ($page) => $page
            ->where('child.weekly_reports.0.week_number', 1)
            ->where('child.weekly_reports.0.group_name', $group->name)
            ->where('child.weekly_reports.0.individual_child_note', 'Focused throughout the lesson.')
        );
        $response->assertDontSee('Private note for another child.');
    }

    public function test_mentor_can_filter_reports_by_group_student_and_date(): void
    {
        $mentor = User::factory()->create();
        $mentor->assignRole('mentor');
        $child = User::factory()->create();
        $child->assignRole('student');
        $otherChild = User::factory()->create();
        $otherChild->assignRole('student');
        $group = $this->groupFor($mentor);
        $otherGroup = $this->groupFor($mentor);
        $group->students()->attach($child);
        $otherGroup->students()->attach($otherChild);

        $this->actingAs($mentor)->post(route('mentor.learning-groups.weekly-reports.store', $group), [
            'week_number' => 1,
            'child_user_id' => $child->id,
            'what_we_learned' => 'Matching report.',
            'what_to_practice' => 'Matching practice.',
            'next_focus' => 'Matching focus.',
        ]);
        $this->actingAs($mentor)->post(route('mentor.learning-groups.weekly-reports.store', $otherGroup), [
            'week_number' => 2,
            'child_user_id' => $otherChild->id,
            'what_we_learned' => 'Excluded report.',
            'what_to_practice' => 'Excluded practice.',
            'next_focus' => 'Excluded focus.',
        ]);

        $response = $this->actingAs($mentor)->get(route('mentor.weekly-reports.index', [
            'group_id' => $group->id,
            'student_id' => $child->id,
            'date_from' => now()->subDay()->toDateString(),
            'date_to' => now()->addDay()->toDateString(),
        ]));

        $response->assertInertia(fn ($page) => $page
            ->component('Mentor/WeeklyReports/Index')
            ->has('reports', 1)
            ->where('reports.0.what_we_learned', 'Matching report.')
            ->where('filters.group_id', (string) $group->id)
            ->where('filters.student_id', (string) $child->id)
        );
        $response->assertDontSee('Excluded report.');
    }

    private function groupFor(User $mentor): LearningGroup
    {
        $program = Program::factory()->create(['is_active' => true]);

        return LearningGroup::create([
            'name' => 'Saturday Group',
            'program_id' => $program->id,
            'mentor_id' => $mentor->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(2)->toDateString(),
            'status' => LearningGroup::STATUS_ACTIVE,
            'max_students' => 10,
        ]);
    }
}
