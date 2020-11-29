import styled from "styled-components";

export default styled.div`
    color: ${({ theme, secondary, }) => secondary ? theme.colors.textSecondary : theme.colors.textPrimary};
    font-weight: ${({ bold }) => bold ? "bold" : "normal"};
    font-size: ${({ primary }) => primary ? '28px' : '' };
`