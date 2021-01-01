import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";
import { shade } from "../../utils/utils";

const Container = styled.div`
    border-radius: ${PIXEL_SIZING.tiny};
    background-color: ${({ theme, selected }) => selected ? "rgba(42,157,143, 0.2)" : ""};
    color: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textSecondary};
    padding: ${PIXEL_SIZING.tiny};
    width: fit-content;
    user-select: none;
    display: flex;
    align-items: center;
    margin-right: ${PIXEL_SIZING.medium};
    font-weight: ${({ selected }) => selected ? "bold" : ""};
    white-space: nowrap;

    .filter-icon {
        path {
            fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textSecondary} !important;
        }
    }

    &:hover {
        .filter-icon {
            path {
                fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary} !important;
            }
        }

        cursor: pointer;
        color: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary};
        background-color: ${({ theme, selected }) => selected 
            ? "rgba(42,157,143, 0.2)"
            : shade(theme.colors.highlight, 0)
        };
    }
`;

export const FilterOption = ({ selected, icon, text, onClick }) => {
    return (
        <Container selected={selected} onClick={onClick}>
            {icon}
            <div style={{ marginLeft: PIXEL_SIZING.tiny }}>
                {text}
            </div>
        </Container>
    )
};