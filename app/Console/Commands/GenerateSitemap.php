<?php

namespace App\Console\Commands;

use App\Models\News;
use App\Models\Program;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate sitemap.xml for the website';

    public function handle()
    {
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

        $baseUrl = config('app.url');
        $now = now()->toW3cString();

        // Static pages
        $staticPages = [
            '/' => ['priority' => '1.0', 'changefreq' => 'daily'],
            '/about' => ['priority' => '0.8', 'changefreq' => 'monthly'],
            '/contact' => ['priority' => '0.7', 'changefreq' => 'monthly'],
            '/programs' => ['priority' => '0.9', 'changefreq' => 'weekly'],
            '/articles' => ['priority' => '0.8', 'changefreq' => 'daily'],
            '/help' => ['priority' => '0.6', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $url => $settings) {
            $sitemap .= $this->createUrl($baseUrl . $url, $now, $settings['priority'], $settings['changefreq'], true);
        }

        // Programs
        try {
            $programs = Program::all();
            foreach ($programs as $program) {
                $slug = $program->slug ?? $program->id;
                $sitemap .= $this->createUrl(
                    $baseUrl . '/programs/' . $slug,
                    $program->updated_at->toW3cString(),
                    '0.8',
                    'weekly'
                );
            }
        } catch (\Exception $e) {
            $this->warn('Could not fetch programs: ' . $e->getMessage());
        }

        // Articles
        try {
            $articles = News::where('is_published', true)->get();
            foreach ($articles as $article) {
                $slug = $article->slug ?? $article->id;
                $sitemap .= $this->createUrl(
                    $baseUrl . '/articles/' . $slug,
                    $article->updated_at->toW3cString(),
                    '0.7',
                    'monthly'
                );
            }
        } catch (\Exception $e) {
            $this->warn('Could not fetch articles: ' . $e->getMessage());
        }

        // Article categories
        $categories = ['how_to_use', 'tutorials', 'updates', 'news'];
        foreach ($categories as $category) {
            $sitemap .= $this->createUrl(
                $baseUrl . '/articles?category=' . $category,
                $now,
                '0.6',
                'weekly'
            );
        }

        $sitemap .= '</urlset>';

        // Save sitemap
        Storage::disk('public')->put('../sitemap.xml', $sitemap);

        $this->info('Sitemap generated successfully at public/sitemap.xml');
        return 0;
    }

    private function createUrl($loc, $lastmod, $priority, $changefreq, $multilingual = false)
    {
        $url = "    <url>\n";
        $url .= "        <loc>{$loc}</loc>\n";
        $url .= "        <lastmod>{$lastmod}</lastmod>\n";
        $url .= "        <changefreq>{$changefreq}</changefreq>\n";
        $url .= "        <priority>{$priority}</priority>\n";
        
        // Add alternate language links for multilingual pages
        if ($multilingual) {
            $baseUrl = config('app.url');
            $path = str_replace($baseUrl, '', $loc);
            $url .= "        <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{$baseUrl}{$path}?lang=en\" />\n";
            $url .= "        <xhtml:link rel=\"alternate\" hreflang=\"mk\" href=\"{$baseUrl}{$path}?lang=mk\" />\n";
        }
        
        $url .= "    </url>\n";
        
        return $url;
    }
}