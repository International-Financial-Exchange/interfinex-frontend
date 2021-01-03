import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

const Container = styled.div`
    display: flex; 
    position: relative;
`;

const SquareOption = styled.div`
    padding: ${PIXEL_SIZING.small};
    border-radius: ${PIXEL_SIZING.miniscule};
    margin-right: ${PIXEL_SIZING.small};

    &:hover {
        cursor: pointer;
        background-color: ${({ theme, selected }) => !selected ? theme.colors.highlight : ""};
    }
`;

const TabSquare = styled.div`
    position: absolute;
    border-radius: ${PIXEL_SIZING.miniscule};
    z-index: 2;
    transition: all 0.1s ease-out;
    box-shadow: ${({ theme }) => theme.colors.boxShadow};
`;

export const TabSquareNav = ({ items, selected, onChange, style, isHidden }) => {
    const [internalSelected, setInternalSelected] = useState(items[0].value);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState();
    const optionRefs = useRef({});

    const _selected = selected ?? internalSelected;

    useLayoutEffect(() => {
        setCoords({ 
            width: optionRefs.current[_selected]?.offsetWidth,
            height: optionRefs.current[_selected]?.offsetHeight,
            left: optionRefs.current[_selected]?.offsetLeft,
        });
    }, [_selected, mounted, isHidden]);

    return (
        <Container onLoad={() => setMounted(true)}>
            {
                items.map(({ label, value }) =>
                    <SquareOption
                        selected={value === _selected}
                        onClick={() => {
                            setInternalSelected(value);
                            onChange(value);
                        }}
                        ref={e => optionRefs.current[value] = e}
                    >
                        {label}
                    </SquareOption>
                )
            }

            <TabSquare
                style={{ 
                    ...coords,
                    bottom: 0,
                }}
            />
        </Container>
    );
};
