import styled from "styled-components";
import { useContext } from "react";
import { NotificationsContext } from "../../context/Notifications";
import { PIXEL_SIZING } from "../../utils/constants";

export const LayoutContainer = styled.div`
    max-width: 1250px;
    padding-left: ${PIXEL_SIZING.medium};
    padding-right: ${PIXEL_SIZING.medium};
    width: 100%;
    justify-self: center;
    color: ${props => props.theme.colors.textPrimary};

    @media (max-width: 420px) {
        padding: 0;
        transform-origin: center top;
        transform: scale(0.9);
    }
`;


export const Layout = ({ showNotifications = true, ...props}) => {
    const { layoutNotifications } = useContext(NotificationsContext);

    return (
        <LayoutContainer {...props}>
            { 
                showNotifications &&
                    layoutNotifications.map(({ content }) => content) 
            }

            { props.children }
        </LayoutContainer>
    )
}