import styled from "styled-components";

export default styled.div`
    border-radius: 4px;
    padding: 18px 48px;
    background-color: ${({ secondary, theme }) => secondary ? theme.colors.secondary : theme.colors.primary};
    color: ${({ theme }) => theme.colors.invert};
    width: fit-content;
    display: grid;
    align-items: center;
    justify-items: center;
    transition: transform 0.1s ease-out, opacity 0.08s ease-out;
    user-select: none;

    &:hover {
        cursor: pointer;
        opacity: 0.95;
    }

    &:active {
        transform: scale(0.95);
    }
`