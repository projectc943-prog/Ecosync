/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: '#0a0a0c',
                    deep: '#121217',
                    blue: '#3b82f6',
                    neon: '#10b981',
                    accent: '#8b5cf6',
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate")
    ],
}
