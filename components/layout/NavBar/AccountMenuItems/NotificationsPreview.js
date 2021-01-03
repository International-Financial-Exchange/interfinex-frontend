import { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { NotificationsContext, NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from "../../../../context/Notifications";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { FailCrossIcon } from "../../../core/FailCrossIcon";
import { LinkIcon } from "../../../core/LinkIcon";
import { ModalCard } from "../../../core/ModalCard";
import { BarSpinner } from "../../../core/Spinner";
import { SuccessTickIcon } from "../../../core/SuccesTickIcon";
import Text from "../../../core/Text";
import { DropdownItem } from "../../Dropdown";
import { DropdownTransitioner } from "../../DropdownTransitioner";
import { Modal } from "../../Modal";
import { DropdownIconContainer } from "./AccountMenuItems";

const NotificationBell = props => {
    return (
        <svg 
            id="Layer_4" 
            enable-background="new 0 0 24 24" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g>
                <path 
                    d="m21.379 16.913c-1.512-1.278-2.379-3.146-2.379-5.125v-2.788c0-3.519-2.614-6.432-6-6.92v-1.08c0-.553-.448-1-1-1s-1 .447-1 1v1.08c-3.387.488-6 3.401-6 6.92v2.788c0 1.979-.867 3.847-2.388 5.133-.389.333-.612.817-.612 1.329 0 .965.785 1.75 1.75 1.75h16.5c.965 0 1.75-.785 1.75-1.75 0-.512-.223-.996-.621-1.337z"
                />
                <path 
                    d="m12 24c1.811 0 3.326-1.291 3.674-3h-7.348c.348 1.709 1.863 3 3.674 3z"
                />
            </g>
        </svg>
    );
};

export const NotificationPreviewContainer = styled(ModalCard)`
    width: ${CONTAINER_SIZING.medium};
    max-height: ${CONTAINER_SIZING.large}; 
    padding: ${PIXEL_SIZING.small}; 
    overflow: auto;

    @media (max-width: 1000px) {
        width: 100%;
    }
`;

export const NotificationsPreview = () => {
    const [showDropDown, setShowDropDown] = useState(false);
    const theme = useContext(ThemeContext);
    const { notifications, markAsRead } = useContext(NotificationsContext);

    useEffect(() => {
        if (showDropDown) {
            markAsRead();
        }
    }, [showDropDown]);

    const unreadNotificationsCount = notifications.reduce(
        (count, { isRead }) => isRead ? count : count + 1,
        0
    );

    return (
        <>
            <DropdownIconContainer
                onClick={() => setShowDropDown(!showDropDown)} 
                selected={showDropDown}
                style={{ marginRight: PIXEL_SIZING.small, position: "relative" }}
            >
                <NotificationBell 
                    style={{ height: 18, marginTop: "1%", }} 
                    className={"options-menu-icon"}
                />

                {
                    unreadNotificationsCount > 0 &&
                        <div 
                            style={{ 
                                backgroundColor: theme.colors.negative,
                                position: "absolute",
                                borderRadius: PIXEL_SIZING.small,
                                padding: PIXEL_SIZING.microscopic,
                                top: 0,
                                color: "white",
                                right: 0,
                                minWidth: PIXEL_SIZING.medium,
                                minHeight: PIXEL_SIZING.medium,
                                display: "grid",
                                alignItems: "center",
                                justifyItems: "center",
                                transform: "translate(30%, -30%)"
                            }}
                        >
                            {unreadNotificationsCount}
                        </div>
                }

            </DropdownIconContainer>

            <Modal
                isOpen={showDropDown}
                topRight
                onClose={() => setShowDropDown(false)}
                showBackdrop={false}
            >
                <NotificationPreviewContainer>
                    <DropdownTransitioner>
                        <ExpandedNotificationsPreview/>
                    </DropdownTransitioner>
                </NotificationPreviewContainer>
            </Modal>
        </>
    );
};

const TransactionNotificationItem = styled(DropdownItem)`
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    height: fit-content;
    align-items: start;
    column-gap: ${PIXEL_SIZING.small};
    row-gap: ${PIXEL_SIZING.tiny};
    padding: ${PIXEL_SIZING.small};

    &:hover {
        cursor: pointer;
        .tx-link-icon {
            path {
                fill: ${({ theme, }) =>  theme.colors.primary} !important;
                stroke: ${({ theme, }) =>  theme.colors.primary} !important;
            }
        }
    }
`;

const ExpandedNotificationsPreview = () => {
    const { notifications } = useContext(NotificationsContext);

    return (
        <div style={{ display: "grid", minHeight: CONTAINER_SIZING.tiny }}>
            {
                !notifications?.length ?
                    <Text 
                        secondary 
                        style={{
                            justifySelf: "center",
                            alignSelf: "center"
                        }}
                    >
                        No notifications to show
                    </Text>
                    : notifications.sort((a, b) => b.timestamp - a.timestamp).map(({ textContent, timestamp, contentType, additionalDetails, type }) => {
                        switch (contentType) {
                            case NOTIFICATION_CONTENT_TYPES.transaction:
                                return (
                                    <TransactionNotificationItem
                                        onClick={() => 
                                            additionalDetails?.tx && window.open(`https://etherscan.io/tx/${additionalDetails?.tx.hash}`)
                                        }
                                    >
                                        <Text secondary>{new Date(timestamp).toLocaleTimeString()}</Text>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            {
                                                additionalDetails?.tx &&
                                                    <LinkIcon style={{ marginRight: PIXEL_SIZING.small }} className={"tx-link-icon"}/>
                                            }

                                            {
                                                additionalDetails?.isLoading ?
                                                    <BarSpinner width={PIXEL_SIZING.large}/>
                                                    : type === NOTIFICATION_TYPES.success ?
                                                        <SuccessTickIcon/>
                                                        : <FailCrossIcon/>
                                            }
                                        </div>

                                        <Text style={{ gridColumn: "1/3" }}>{textContent}</Text>
                                    </TransactionNotificationItem>
                                );
                            default:
                                console.warn("Unsupported notification content type: ", contentType);
                                return null;
                        }
                    })
            }
        </div>
    );
};