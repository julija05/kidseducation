<?php

namespace App\Console\Commands;

use App\Models\LessonResource;
use App\Models\ResourceProposal;
use Illuminate\Console\Command;

/**
 * Fix lesson resources that were created with incorrect field mapping from proposals
 * This fixes resources where youtube_url or resource_type were used instead of resource_url and type
 */
class FixBrokenLessonResources extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'resources:fix-broken {--dry-run : Show what would be fixed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix lesson resources created from proposals with incorrect field mapping';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        $this->info('Searching for broken lesson resources...');

        // Find resources that might be broken (created recently and missing key fields)
        $brokenResources = LessonResource::whereNull('type')
            ->orWhereNull('resource_url')
            ->get();

        if ($brokenResources->isEmpty()) {
            $this->info('No broken resources found!');
            return 0;
        }

        $this->warn("Found {$brokenResources->count()} potentially broken resources.");

        $fixed = 0;
        foreach ($brokenResources as $resource) {
            // Try to find the proposal that created this resource
            $proposal = ResourceProposal::where('lesson_resource_id', $resource->id)
                ->where('proposal_type', 'resource_create')
                ->first();

            if (!$proposal) {
                $this->line("  - Resource #{$resource->id}: No proposal found, skipping");
                continue;
            }

            $changes = [];

            // Fix type field
            if (!$resource->type && $proposal->proposed_resource_type) {
                $newType = $this->mapResourceType($proposal->proposed_resource_type);
                $changes['type'] = $newType;
            }

            // Fix resource_url field
            if (!$resource->resource_url && $proposal->proposed_youtube_url) {
                $changes['resource_url'] = $proposal->proposed_youtube_url;
            }

            if (empty($changes)) {
                $this->line("  - Resource #{$resource->id}: No fixes needed");
                continue;
            }

            if ($dryRun) {
                $this->line("  - Resource #{$resource->id} ('{$resource->title}') would be updated:");
                foreach ($changes as $field => $value) {
                    $this->line("      {$field}: {$value}");
                }
            } else {
                $resource->update($changes);
                $this->info("  ✓ Fixed Resource #{$resource->id} ('{$resource->title}')");
                $fixed++;
            }
        }

        if ($dryRun) {
            $this->info("\nDry run complete. Run without --dry-run to apply fixes.");
        } else {
            $this->info("\n✓ Fixed {$fixed} resources!");
        }

        return 0;
    }

    /**
     * Map proposal resource type to LessonResource type
     *
     * @param string|null $proposalType
     * @return string
     */
    protected function mapResourceType(?string $proposalType): string
    {
        return match ($proposalType) {
            'youtube' => 'video',
            'pdf', 'word' => 'document',
            'other' => 'download',
            default => 'document',
        };
    }
}
