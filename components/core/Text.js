import styled from "styled-components";

export default styled.div`
    color: ${({ theme, secondary, error }) => secondary ? 
        theme.colors.textSecondary 
        : error ? 
            theme.colors.negative
            : theme.colors.textPrimary
    };
    font-weight: ${({ bold }) => bold ? "bold" : "normal"};
    font-size: ${({ primary }) => primary ? '28px' : '' };
`