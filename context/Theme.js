import { ThemeProvider } from "styled-components"
import { useState, createContext } from "react";

export const THEMES = {
    light: {
        primary: "#2A9D8F",
        secondary: "#F4A261",
        tertiary: "#E9C46A",
        textPrimary: "#003049",
        textSecondary: "#6c757d",
        highlight: "#e9ecef",
        unselected: "#f9f9f9",
        invert: "white",
        positive: "#28d76e",
        negative: "#f00f30",
        boxShadow: "10px 7px 55px -22px rgba(0,0,0,0.15)",
        primaryBoxShadow: "-1px 42px 97px 41px rgba(230,230,230,0.7)",
    },
};

export const Theme = ({ children }) => {
    const [theme, setTheme] = useState(THEMES.light);

    return (
        <ThemeProvider
            theme={{
                colors: theme,
                setTheme: theme => setTheme(theme)
            }}
        >
            { children }
        </ThemeProvider>
    );
}