import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#ef4444',
                surface: '#121212',
                surfaceLight: '#1e1e1e',
            },
            animation: {
                'vip-sheen': 'vip-sheen 3s infinite',
                'marquee': 'marquee 25s linear infinite',
            },
            keyframes: {
                'vip-sheen': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                'marquee': {
                    '0%': { transform: 'translateY(0%)' },
                    '100%': { transform: 'translateY(-50%)' },
                }
            }
        },
    },

    plugins: [forms],
};
