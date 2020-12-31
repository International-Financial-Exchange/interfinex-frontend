import { useEffect, useState } from "react";
import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";
import { shade } from "../../utils/utils";
import { Card } from "./Card";

const Container = styled.div`
    display: flex;
`;

const StyledRadioOption = styled(Card)`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: ${PIXEL_SIZING.tiny};
    align-items: center;
    margin-right: ${PIXEL_SIZING.small};
    padding: ${PIXEL_SIZING.small};

    border-color: ${({ theme, selected }) => selected && theme.colors.primary};
    background-color: ${({ theme, selected }) => selected && "rgba(42,157,143, 0.07)"};

    &:last-child {
        margin-right: 0;
    }

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary};
        cursor: pointer;
    }
`;

export const RadioInput = ({ options = [], value: propsValue, onChange, ...props }) => {
    const [_value, setValue] = useState(options[0]?.value);

    const value = propsValue ?? _value;

    return (
        <Container {...props}>
            {
                options.map(({ label, value: optionValue }) => 
                    <StyledRadioOption 
                        onClick={() => {
                            setValue(optionValue);
                            onChange(optionValue);
                        }}
                        selected={value === optionValue}
                    >
                        <input 
                            style={{ margin: 0 }}
                            type="radio" 
                            checked={value === optionValue}
                        />
                        {label}
                    </StyledRadioOption>
                )
            }
        </Container>
    );
}