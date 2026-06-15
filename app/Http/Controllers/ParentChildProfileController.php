<?php

namespace App\Http\Controllers;

use App\Constants\ApprovalStatus;
use App\Constants\EnrollmentStatus;
use App\Constants\EnrollmentType;
use App\Models\ChildProfile;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ParentChildProfileController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Parent/ChildProfiles/Create', [
            'programs' => Program::query()
                ->where('is_active', true)
                ->where('approval_status', ApprovalStatus::APPROVED)
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'price']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'child_name' => ['required', 'string', 'max:191'],
            'child_email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'child_password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'program_id' => [
                'required',
                Rule::exists('programs', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->where('approval_status', ApprovalStatus::APPROVED)
                ),
            ],
            'age' => ['nullable', 'integer', 'min:0', 'max:25'],
            'grade_class' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $childProfile = DB::transaction(function () use ($request, $validated) {
            $parent = $request->user();
            $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
            [$firstName, $lastName] = $this->splitName($validated['child_name']);

            $child = User::create([
                'name' => $validated['child_name'],
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $validated['child_email'],
                'password' => Hash::make($validated['child_password']),
                'language_preference' => $parent->language_preference ?? app()->getLocale(),
                'language_selected' => true,
            ]);
            $child->forceFill(['email_verified_at' => now()])->save();
            $child->assignRole($studentRole);

            $parent->children()->syncWithoutDetaching([$child->id]);

            $enrollment = Enrollment::create([
                'user_id' => $child->id,
                'program_id' => $validated['program_id'],
                'enrollment_type' => EnrollmentType::STUDENT,
                'enrolled_at' => now(),
                'status' => EnrollmentStatus::PAUSED,
                'approval_status' => ApprovalStatus::PENDING,
                'progress' => 0,
            ]);

            return $parent->childProfiles()->create([
                'child_user_id' => $child->id,
                'program_id' => $validated['program_id'],
                'enrollment_id' => $enrollment->id,
                'child_name' => $validated['child_name'],
                'age' => $validated['age'] ?? null,
                'grade_class' => $validated['grade_class'] ?? null,
                'status' => ChildProfile::STATUS_PENDING,
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->route('parent.child-profiles.pending', $childProfile)
            ->with('success', 'Child application submitted successfully.');
    }

    public function pending(Request $request, ChildProfile $childProfile): Response
    {
        abort_unless($childProfile->parent_user_id === $request->user()->id, 404);

        $childProfile->load(['program:id,name,description,price', 'enrollment:id,approval_status,status']);

        return Inertia::render('Parent/ChildProfiles/Pending', [
            'childProfile' => [
                'id' => $childProfile->id,
                'child_name' => $childProfile->child_name,
                'status' => $childProfile->status,
                'program' => $childProfile->program,
                'enrollment' => $childProfile->enrollment,
            ],
        ]);
    }

    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2);

        return [$parts[0], $parts[1] ?? ''];
    }
}
