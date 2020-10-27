import styled from "styled-components";
import { useContext } from "react";
import { NotificationsContext } from "../../context/Notifications";
import { PIXEL_SIZING } from "../../utils";

export const LayoutContainer = styled.div`
    width: 1250px;
    justify-self: center;
    color: ${props => props.theme.colors.textPrimary};
`


export const Layout = props => {
    const { layoutNotifications } = useContext(NotificationsContext);

    return (
        <LayoutContainer {...props}>
            { layoutNotifications.map(({ content }) => content) }

            { props.children }
        </LayoutContainer>
    )
}