import styled from "styled-components";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../utils";
import { Input } from "./Input";

const SlippageOption = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 2px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    height: ${CONTAINER_SIZING.microscopic};
    display: grid;
    align-content: center;
    justify-content: center;
    transition: all 0.08s ease-out;

    &:hover {
        cursor: pointer;
        border: 2px solid ${({ theme }) => theme.colors.primary};
    }
`;

export const SlippageSelect = ({ onChange, value }) => {
    const OPTIONS = [0.1, 0.75, 3];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", justifyItems: "center", columnGap: PIXEL_SIZING.small }}>
            {
                OPTIONS.map(option => 
                    <SlippageOption 
                        style={{ width: "100%", textAlign: "center" }}
                        selected={value === option}
                        onClick={() => onChange(option)}
                    >
                        <div style={{ height: "fit-content" }}>{option}%</div>
                    </SlippageOption>
                )
            }

            <Input
                style={{ width: CONTAINER_SIZING.miniscule }}
                onChange={e => onChange(e.target.value)}
                selected={!OPTIONS.includes(value)}
                placeholder={value + "%"}
            />
        </div>
    );
};
