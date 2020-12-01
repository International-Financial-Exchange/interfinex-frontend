import { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";
import Text from "./Text";

const TabOption = styled(Text)`
    padding: ${PIXEL_SIZING.small};
    margin-bottom: ${PIXEL_SIZING.tiny};
    margin-right: ${PIXEL_SIZING.tiny};
    border-radius: ${PIXEL_SIZING.miniscule};
    height: fit-content;
    width: fit-content;
    color: ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.textSecondary};
    font-weight: ${({ selected }) => selected ? "bold" : ""};
    transition: background-color 0.07s ease-out;
    user-select: none;

    &:hover {
        cursor: pointer;
        background-color: ${({ theme }) => theme.colors.highlight}
    }
`;

const TabUnderline = styled.div`
    position: absolute;
    background-color: ${({ theme }) => theme.colors.primary};
    height: ${PIXEL_SIZING.microscopic};
    border-radius: ${PIXEL_SIZING.microscopic};
    transition: width 0.1s ease-out, left 0.1s ease-out;
    position: absolute;
    bottom: 0;
`;

export const TabNav = ({ items, selected, onChange, style, animate = true }) => {
    const [internalSelected, setInternalSelected] = useState(items[0].value);
    const [mounted, setMounted] = useState(false);
    const optionRefs = useRef({});

    const _selected = selected ?? internalSelected;

    // Use this so that we make sure the refs are populated;
    // Then we can accurately calculate the TabUnderline position.
    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div 
            style={{ 
                display: "flex", 
                position: "relative",
                ...style
            }}
        >
            {
                items.map(({ label, value }) =>
                    <TabOption
                        selected={value === _selected}
                        onClick={() => {
                            setInternalSelected(value);
                            onChange(value);
                        }}
                        ref={e => optionRefs.current[value] = e}
                    >
                        {label}
                    </TabOption>
                )
            }

            <TabUnderline
                style={{ 
                    width: optionRefs.current[_selected]?.offsetWidth,
                    left: optionRefs.current[_selected]?.offsetLeft,
                    transition: animate ? undefined : "none",
                    bottom: 0,
                }}
            />
        </div>
    );
};
