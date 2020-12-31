import { createContext, useState } from "react"
import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

const DropdownTransitionerContext = createContext();

export const DropdownTransitioner = ({ children }) => {
    const [currentChild, setCurrentChild] = useState(children);
    const [depthIndex, setDepthIndex] = useState(0); // If it's zero then don't show the "go back" button
    const [previousChild, setPreviousChild] = useState();

    const transitionToNewComponent = component => {
        setPreviousChild(currentChild);
        setDepthIndex(depthIndex + 1);
        setCurrentChild(component);
    };

    return (
        <DropdownTransitionerContext.Provider value={{ transitionToNewComponent }}>
            <div>
                {currentChild}
            </div>
        </DropdownTransitionerContext.Provider>
    );
};

const SelectableDropdownItemContainer = styled.div`
    padding: ${PIXEL_SIZING.small};
    border-radius: ${PIXEL_SIZING.microscopic};
    display: flex;
    align-items: center;

    transition: all 0.1s ease-out;
    user-select: none;

    &:active {
        transform: scale(0.95);
    }

    &:hover {
        cursor: pointer;
        background-color: ${({ theme }) => theme.colors.highlight};
    }

    .dropdown-transition-icon {
        path {
            fill: ${({ theme }) => theme.colors.textPrimary};
        }
    }
`;

export const SelectableDropdownItem = ({ Icon, children, ...props }) => {
    return (
        <SelectableDropdownItemContainer {...props}>
            {
                Icon &&
                    <div style={{ marginRight: PIXEL_SIZING.small }}>
                        {Icon}
                    </div>
            }
            {children}
        </SelectableDropdownItemContainer>
    );
};