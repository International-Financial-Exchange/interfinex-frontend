import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export default styled.div`
    color: ${({ theme, secondary }) => secondary ? theme.colors.textSecondary : theme.colors.textPrimary};
    font-size: ${({ primary }) => primary ? '28px' : '' };
`