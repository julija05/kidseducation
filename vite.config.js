import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        viteImagemin({
            gifsicle: {
                optimizationLevel: 7,
                interlaced: false,
            },
            mozjpeg: {
                quality: 80,
            },
            pngquant: {
                quality: [0.6, 0.8],
            },
            svgo: {
                plugins: [
                    {
                        name: 'removeViewBox',
                        active: false,
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor libraries
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-inertia': ['@inertiajs/react'],
                    'vendor-ui': ['framer-motion', 'lucide-react'],
                    
                    // Admin pages (largest components)
                    'admin': [
                        './resources/js/Pages/Admin/AdminDashboard/AdminDashboard.jsx',
                        './resources/js/Pages/Admin/Programs/AdminPrograms.jsx',
                        './resources/js/Pages/Admin/Enrollments/Index.jsx',
                        './resources/js/Pages/Admin/News/Index.jsx',
                    ],
                    
                    // Student dashboard and lesson components (only include existing files)
                    'student': [
                        './resources/js/Pages/Student/Quiz/Take.jsx',
                        './resources/js/Pages/Student/Quiz/Show.jsx',
                        './resources/js/Pages/Student/Quiz/Result.jsx',
                        './resources/js/Pages/Student/MySchedule.jsx',
                    ],
                    
                    // Quiz and lesson components
                    'quiz': [
                        './resources/js/Components/Quiz/QuestionBuilder.jsx',
                        './resources/js/Components/Quiz/FlashCardQuiz.jsx',
                        './resources/js/Components/Quiz/MultipleChoiceBuilder.jsx',
                        './resources/js/Components/Quiz/MentalArithmeticBuilder.jsx',
                    ],
                    
                    // Abacus simulator (likely large)
                    'abacus': ['./resources/js/Components/AbacusSimulator.jsx'],
                }
            }
        }
    }
});
