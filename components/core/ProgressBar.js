import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

export const ProgressBar = ({ color, maxValue, currentValue, style }) => {
    const theme = useContext(ThemeContext);

    return (
        <div 
            style={{ 
                position: "relative",
                height: PIXEL_SIZING.small, 
                backgroundColor: theme.colors.highlight, 
                borderRadius: PIXEL_SIZING.microscopic,
                overflow: "hidden",
                ...style,
            }}
        >
            <div 
                style={{ 
                    height: "100%", 
                    width: `${currentValue > 0 ? (currentValue / maxValue * 100) : 0}%`, 
                    backgroundColor: color || theme.colors.positive, 
                    borderRadius: "inherit" 
                }}
            />
        </div>
    )
};