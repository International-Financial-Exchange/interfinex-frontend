import styled from "styled-components";

export default styled.span`
    color: ${({ theme, positive, negative }) => 
        positive ? 
            theme.colors.positive
            : negative ? 
                theme.colors.negative
                : ''
    };
    font-weight: ${({ bold }) => bold ? "bold" : ''}
`