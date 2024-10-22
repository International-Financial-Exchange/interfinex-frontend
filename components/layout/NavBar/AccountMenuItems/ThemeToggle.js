import { PIXEL_SIZING } from "../../../../utils/constants";
import styled, { ThemeContext } from "styled-components";
import { useContext } from "react";
import { THEME_OPTIONS } from "../../../../context/Theme";



const MoonIcon = () => {
    return (
        <svg 
            version="1.1" 
            id="Capa_1" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: PIXEL_SIZING.large, width: PIXEL_SIZING.large }}
            viewBox="0 0 312.999 312.999" 
            className={"theme-toggle-icon"}
        >
            <g>
                <g>
                    <path 
                        d="M305.6,178.053c-3.2-0.8-6.4,0-9.2,2c-10.4,8.8-22.4,16-35.6,20.8c-12.4,4.8-26,7.2-40.4,7.2c-32.4,0-62-13.2-83.2-34.4
                        c-21.2-21.2-34.4-50.8-34.4-83.2c0-13.6,2.4-26.8,6.4-38.8c4.4-12.8,10.8-24.4,19.2-34.4c3.6-4.4,2.8-10.8-1.6-14.4
                        c-2.8-2-6-2.8-9.2-2c-34,9.2-63.6,29.6-84.8,56.8c-20.4,26.8-32.8,60-32.8,96.4c0,43.6,17.6,83.2,46.4,112s68.4,46.4,112,46.4
                        c36.8,0,70.8-12.8,98-34c27.6-21.6,47.6-52.4,56-87.6C314.4,184.853,311.2,179.253,305.6,178.053z M244.4,261.653
                        c-23.2,18.4-52.8,29.6-85.2,29.6c-38,0-72.4-15.6-97.2-40.4c-24.8-24.8-40.4-59.2-40.4-97.2c0-31.6,10.4-60.4,28.4-83.6
                        c12.4-16,28-29.2,46-38.4c-2,4.4-4,8.8-5.6,13.6c-5.2,14.4-7.6,29.6-7.6,45.6c0,38,15.6,72.8,40.4,97.6s59.6,40.4,97.6,40.4
                        c16.8,0,32.8-2.8,47.6-8.4c5.2-2,10.4-4,15.2-6.4C274,232.453,260.8,248.853,244.4,261.653z"
                    />
                </g>
            </g>
        </svg>
    )
};

const SunIcon = () => {
    return (
        <svg 
            version="1.1" 
            id="Capa_1" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 302.4 302.4" 
            className={"theme-toggle-icon"}
            style={{ height: PIXEL_SIZING.large, width: PIXEL_SIZING.large }}
        >
            <g>
                <g>
                    <path d="M204.8,97.6C191.2,84,172,75.2,151.2,75.2s-40,8.4-53.6,22.4c-13.6,13.6-22.4,32.8-22.4,53.6s8.8,40,22.4,53.6
                        c13.6,13.6,32.8,22.4,53.6,22.4s40-8.4,53.6-22.4c13.6-13.6,22.4-32.8,22.4-53.6S218.8,111.2,204.8,97.6z M190.4,190.4
                        c-10,10-24,16-39.2,16s-29.2-6-39.2-16s-16-24-16-39.2s6-29.2,16-39.2s24-16,39.2-16s29.2,6,39.2,16s16,24,16,39.2
                        S200.4,180.4,190.4,190.4z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M292,140.8h-30.8c-5.6,0-10.4,4.8-10.4,10.4c0,5.6,4.8,10.4,10.4,10.4H292c5.6,0,10.4-4.8,10.4-10.4
                        C302.4,145.6,297.6,140.8,292,140.8z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M151.2,250.8c-5.6,0-10.4,4.8-10.4,10.4V292c0,5.6,4.8,10.4,10.4,10.4c5.6,0,10.4-4.8,10.4-10.4v-30.8
                        C161.6,255.6,156.8,250.8,151.2,250.8z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M258,243.6l-22-22c-3.6-4-10.4-4-14.4,0s-4,10.4,0,14.4l22,22c4,4,10.4,4,14.4,0S262,247.6,258,243.6z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M151.2,0c-5.6,0-10.4,4.8-10.4,10.4v30.8c0,5.6,4.8,10.4,10.4,10.4c5.6,0,10.4-4.8,10.4-10.4V10.4
                        C161.6,4.8,156.8,0,151.2,0z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M258.4,44.4c-4-4-10.4-4-14.4,0l-22,22c-4,4-4,10.4,0,14.4c3.6,4,10.4,4,14.4,0l22-22C262.4,54.8,262.4,48.4,258.4,44.4z"
                        />
                </g>
            </g>
            <g>
                <g>
                    <path d="M41.2,140.8H10.4c-5.6,0-10.4,4.8-10.4,10.4s4.4,10.4,10.4,10.4h30.8c5.6,0,10.4-4.8,10.4-10.4
                        C51.6,145.6,46.8,140.8,41.2,140.8z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M80.4,221.6c-3.6-4-10.4-4-14.4,0l-22,22c-4,4-4,10.4,0,14.4s10.4,4,14.4,0l22-22C84.4,232,84.4,225.6,80.4,221.6z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M80.4,66.4l-22-22c-4-4-10.4-4-14.4,0s-4,10.4,0,14.4l22,22c4,4,10.4,4,14.4,0S84.4,70.4,80.4,66.4z"/>
                </g>
            </g>
        </svg>
    );
};

const Container = styled.div`
    margin-right: ${PIXEL_SIZING.small};
    transition: all 0.1s ease-out;

    &:active {
        transform: scale(0.95);
    }

    .theme-toggle-icon {
        path {
            fill: ${({ theme }) => theme.colors.textSecondary};
        }
    }

    &:hover {
        cursor: pointer;
        .theme-toggle-icon {
            path {
                fill: ${({ theme }) => theme.colors.textPrimary};
            }
        }
    }
`;

export const ThemeToggle = () => {
    const { selectedTheme, setTheme } = useContext(ThemeContext);

    return (
        <Container
            onClick={() => {
                const nextTheme = selectedTheme === THEME_OPTIONS.light ?
                    THEME_OPTIONS.dark
                    : THEME_OPTIONS.light;
                setTheme(nextTheme);
            }}
        >
            {
                selectedTheme === THEME_OPTIONS.light ?
                    <MoonIcon/>
                    : <SunIcon/>
            }
        </Container>
    );
};