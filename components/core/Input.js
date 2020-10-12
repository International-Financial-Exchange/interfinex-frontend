import styled, { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../utils";
import { forwardRef, useContext } from "react";
import Text from "./Text";

const InputContainer = styled.input`
    border-radius: ${PIXEL_SIZING.miniscule};
    border: 1px solid ${({ theme, isError, selected }) => isError ? 
        theme.colors.negative 
        : selected ?
            theme.colors.primary
            : theme.colors.highlight
    };
    padding: ${PIXEL_SIZING.small};
    font-size: ${PIXEL_SIZING.small};
    width: 100%;

    &:focus {
        border: 1px solid ${({ theme, isError }) => isError ? theme.colors.negative : theme.colors.primary};
    }
`;

export const Input = forwardRef(({ errorMessage, ...props }, ref) => {
    const theme = useContext(ThemeContext);

    return (
        <>
            <InputContainer 
                ref={ref} 
                {...props}
            />

            {
                props.isError &&    
                    <div style={{ marginTop: PIXEL_SIZING.microscopic }}>
                        <Text style={{ color: theme.colors.negative }}>
                            { errorMessage }
                        </Text>
                    </div>
            }
        </>
    )
});