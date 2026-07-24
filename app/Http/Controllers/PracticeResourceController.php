<?php

namespace App\Http\Controllers;

use App\Models\PracticeResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PracticeResourceController extends Controller
{
    /**
     * Serve a practice resource's attached file to authorized users.
     *
     * Access is limited to the mentor who owns the group and to students who
     * belong to that group. PDFs are served inline so kids can read them in the
     * browser; other files download.
     */
    public function download(Request $request, PracticeResource $practiceResource): StreamedResponse
    {
        $user = Auth::user();

        // Parents browse via their child's view but must not pull files directly.
        if ($user?->hasRole('parent')) {
            abort(403);
        }

        abort_unless($this->userCanAccess($user, $practiceResource), 403);
        abort_unless($practiceResource->hasFile() && Storage::disk('private')->exists($practiceResource->file_path), 404);

        $disposition = $practiceResource->isPdf() ? 'inline' : 'attachment';

        return Storage::disk('private')->response(
            $practiceResource->file_path,
            $practiceResource->file_name,
            ['Content-Disposition' => $disposition.'; filename="'.$practiceResource->file_name.'"']
        );
    }

    /**
     * Whether the given user may access this practice resource's file.
     */
    private function userCanAccess($user, PracticeResource $practiceResource): bool
    {
        if (! $user) {
            return false;
        }

        $group = $practiceResource->learningGroup;

        if (! $group) {
            return false;
        }

        // The mentor who owns the group can always access its resources.
        if ($group->mentor_id === $user->id) {
            return true;
        }

        // Students see resources for the groups they belong to.
        return $group->students()->whereKey($user->id)->exists();
    }
}
