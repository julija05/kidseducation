<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetDemoDuration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:set-duration {duration : Duration in minutes (e.g., 10) or "7days" for default}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set demo account duration for testing purposes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $duration = $this->argument('duration');

        if ($duration === '7days') {
            // Set back to 7 days (default)
            $this->setDemoDuration(7 * 24 * 60); // 7 days in minutes
            $this->info('Demo duration set to 7 days (default)');
        } else {
            // Set to specified minutes
            $minutes = (int) $duration;
            if ($minutes <= 0) {
                $this->error('Duration must be a positive number of minutes or "7days"');

                return 1;
            }

            $this->setDemoDuration($minutes);
            $this->info("Demo duration set to {$minutes} minutes for testing");
        }

        return 0;
    }

    private function setDemoDuration($minutes)
    {
        // Check if demo duration is set in config or if we need to modify the constant
        // For now, let's create a config value that can override the default
        $configPath = config_path('demo.php');

        $configContent = "<?php\n\nreturn [\n    'duration_minutes' => {$minutes},\n];\n";

        file_put_contents($configPath, $configContent);

        $this->info("Created config/demo.php with duration_minutes = {$minutes}");
        $this->warn('Note: You may need to clear config cache: php artisan config:clear');
    }
}
