/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "!./node_modules/**",
        "!./dist/**"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                status: {
                    blue: '#2563EB',
                    green: '#16A34A',
                    red: '#DC2626',
                    yellow: '#CA8A04',
                    gray: '#4B5563'
                },
                brand: {
                    primary: '#2563EB', // Blue 600
                    accent: '#7C3AED',  // Violet 600
                }
            }
        },
    },
    plugins: [],
}
