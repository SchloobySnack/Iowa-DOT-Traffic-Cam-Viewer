module.exports = {
    theme: {
        extend: {
            colors: {
                'custom-red': '#FF0000',
            }
        }
    },
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["[data-theme=light]"],
                    "primary": "#FF0000",
                    "secondary": "#FF6666",
                    "accent": "#FF9999",
                    "neutral": "#3D4451",
                    "base-100": "#FFFFFF",
                    "base-200": "#F2F2F2",
                    "base-300": "#E5E5E5",
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
                    "primary": "#FF6666",
                    "secondary": "#FF9999",
                    "accent": "#FFCCCC",
                    "base-100": "#1F2937",
                    "base-200": "#111827",
                    "base-300": "#0F172A",
                },
            },
        ],
    },
}