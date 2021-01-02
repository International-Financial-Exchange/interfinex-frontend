import { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { AccountContext } from "../../../context/Account";
import { EthersContext } from "../../../context/Ethers";
import { NotificationsContext, NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from "../../../context/Notifications";
import { THEME_OPTIONS } from "../../../context/Theme";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants";
import { Avatar } from "../../core/Avatar";
import { FailCrossIcon } from "../../core/FailCrossIcon";
import { LinkIcon } from "../../core/LinkIcon";
import { ModalCard } from "../../core/ModalCard";
import { BarSpinner, CircleSpinner } from "../../core/Spinner";
import { SuccessTickIcon } from "../../core/SuccesTickIcon";
import Text from "../../core/Text";
import { Triangle } from "../../core/Triangle";
import { DropdownItem } from "../Dropdown";
import { DropdownTransitioner, SelectableDropdownItem } from "../DropdownTransitioner";
import { Modal } from "../Modal";

const Container = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 900px) {
        #account-eth-balance {
            display: none;
        }
    }

    @media (max-width: 1100px) {
        #nav-account-address {
            display: none;
        }
    }
`;

export const AccountMenuItems = () => {
    return (
        <Container>
            <AccountEthBalance/>
            <AccountAddress style={{ marginRight: PIXEL_SIZING.small }}/>
            <ThemeToggle/>
            <NotificationsPreview/>
            <OptionsMenu/>
        </Container>
    );
};

const MoonIcon = () => {
    return (
        <svg 
            version="1.1" 
            id="Capa_1" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: PIXEL_SIZING.large, width: PIXEL_SIZING.large }}
            viewBox="0 0 312.999 312.999" 
            className={"theme-toggle-icon"}
        >
            <g>
                <g>
                    <path 
                        d="M305.6,178.053c-3.2-0.8-6.4,0-9.2,2c-10.4,8.8-22.4,16-35.6,20.8c-12.4,4.8-26,7.2-40.4,7.2c-32.4,0-62-13.2-83.2-34.4
                        c-21.2-21.2-34.4-50.8-34.4-83.2c0-13.6,2.4-26.8,6.4-38.8c4.4-12.8,10.8-24.4,19.2-34.4c3.6-4.4,2.8-10.8-1.6-14.4
                        c-2.8-2-6-2.8-9.2-2c-34,9.2-63.6,29.6-84.8,56.8c-20.4,26.8-32.8,60-32.8,96.4c0,43.6,17.6,83.2,46.4,112s68.4,46.4,112,46.4
                        c36.8,0,70.8-12.8,98-34c27.6-21.6,47.6-52.4,56-87.6C314.4,184.853,311.2,179.253,305.6,178.053z M244.4,261.653
                        c-23.2,18.4-52.8,29.6-85.2,29.6c-38,0-72.4-15.6-97.2-40.4c-24.8-24.8-40.4-59.2-40.4-97.2c0-31.6,10.4-60.4,28.4-83.6
                        c12.4-16,28-29.2,46-38.4c-2,4.4-4,8.8-5.6,13.6c-5.2,14.4-7.6,29.6-7.6,45.6c0,38,15.6,72.8,40.4,97.6s59.6,40.4,97.6,40.4
                        c16.8,0,32.8-2.8,47.6-8.4c5.2-2,10.4-4,15.2-6.4C274,232.453,260.8,248.853,244.4,261.653z"
                    />
                </g>
            </g>
        </svg>
    )
};

const SunIcon = () => {
    return (
        <svg 
            version="1.1" 
            id="Capa_1" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 302.4 302.4" 
            className={"theme-toggle-icon"}
            style={{ height: PIXEL_SIZING.large, width: PIXEL_SIZING.large }}
        >
            <g>
                <g>
                    <path d="M204.8,97.6C191.2,84,172,75.2,151.2,75.2s-40,8.4-53.6,22.4c-13.6,13.6-22.4,32.8-22.4,53.6s8.8,40,22.4,53.6
                        c13.6,13.6,32.8,22.4,53.6,22.4s40-8.4,53.6-22.4c13.6-13.6,22.4-32.8,22.4-53.6S218.8,111.2,204.8,97.6z M190.4,190.4
                        c-10,10-24,16-39.2,16s-29.2-6-39.2-16s-16-24-16-39.2s6-29.2,16-39.2s24-16,39.2-16s29.2,6,39.2,16s16,24,16,39.2
                        S200.4,180.4,190.4,190.4z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M292,140.8h-30.8c-5.6,0-10.4,4.8-10.4,10.4c0,5.6,4.8,10.4,10.4,10.4H292c5.6,0,10.4-4.8,10.4-10.4
                        C302.4,145.6,297.6,140.8,292,140.8z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M151.2,250.8c-5.6,0-10.4,4.8-10.4,10.4V292c0,5.6,4.8,10.4,10.4,10.4c5.6,0,10.4-4.8,10.4-10.4v-30.8
                        C161.6,255.6,156.8,250.8,151.2,250.8z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M258,243.6l-22-22c-3.6-4-10.4-4-14.4,0s-4,10.4,0,14.4l22,22c4,4,10.4,4,14.4,0S262,247.6,258,243.6z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M151.2,0c-5.6,0-10.4,4.8-10.4,10.4v30.8c0,5.6,4.8,10.4,10.4,10.4c5.6,0,10.4-4.8,10.4-10.4V10.4
                        C161.6,4.8,156.8,0,151.2,0z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M258.4,44.4c-4-4-10.4-4-14.4,0l-22,22c-4,4-4,10.4,0,14.4c3.6,4,10.4,4,14.4,0l22-22C262.4,54.8,262.4,48.4,258.4,44.4z"
                        />
                </g>
            </g>
            <g>
                <g>
                    <path d="M41.2,140.8H10.4c-5.6,0-10.4,4.8-10.4,10.4s4.4,10.4,10.4,10.4h30.8c5.6,0,10.4-4.8,10.4-10.4
                        C51.6,145.6,46.8,140.8,41.2,140.8z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M80.4,221.6c-3.6-4-10.4-4-14.4,0l-22,22c-4,4-4,10.4,0,14.4s10.4,4,14.4,0l22-22C84.4,232,84.4,225.6,80.4,221.6z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M80.4,66.4l-22-22c-4-4-10.4-4-14.4,0s-4,10.4,0,14.4l22,22c4,4,10.4,4,14.4,0S84.4,70.4,80.4,66.4z"/>
                </g>
            </g>
        </svg>
    );
};

const ThemeToggleContainer = styled.div`
    margin-right: ${PIXEL_SIZING.small};
    transition: all 0.1s ease-out;

    &:active {
        transform: scale(0.95);
    }

    .theme-toggle-icon {
        path {
            fill: ${({ theme }) => theme.colors.textSecondary};
        }
    }

    &:hover {
        cursor: pointer;
        .theme-toggle-icon {
            path {
                fill: ${({ theme }) => theme.colors.textPrimary};
            }
        }
    }
`;

export const ThemeToggle = () => {
    const { selectedTheme, setTheme } = useContext(ThemeContext);

    return (
        <ThemeToggleContainer
            onClick={() => {
                const nextTheme = selectedTheme === THEME_OPTIONS.light ?
                    THEME_OPTIONS.dark
                    : THEME_OPTIONS.light;
                setTheme(nextTheme);
            }}
        >
            {
                selectedTheme === THEME_OPTIONS.light ?
                    <MoonIcon/>
                    : <SunIcon/>
            }
        </ThemeToggleContainer>
    );
};

const AccountEthBalance = () => {
    const { ethBalance } = useContext(AccountContext);
    const theme = useContext(ThemeContext);

    return (
        <div 
            id={"account-eth-balance"}
            style={{ 
                border: `1px solid ${theme.colors.highlight}`, 
                padding: PIXEL_SIZING.small, 
                marginRight: PIXEL_SIZING.small,
                borderRadius: PIXEL_SIZING.tiny,
                userSelect: "none",
            }}
        >
            {ethBalance.toFixed(4)} ETH
        </div>
    );
};

const AccountAddressContainer = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    height: fit-content;
    border-radius: ${PIXEL_SIZING.tiny} 20px 20px ${PIXEL_SIZING.tiny};
    display: grid;
    grid-template-columns: 1fr auto;
    padding-left: ${PIXEL_SIZING.small};
    align-items: center;
    position: relative;
    user-select: none;
    max-width: 100%;
    column-gap: ${PIXEL_SIZING.small};
`;

const AccountAddress = ({ primary, ...props }) => {
    const { address } = useContext(AccountContext);

    const addressToShow = !primary ? 
        `${address?.slice(0,4)}...${address?.slice(address.length - 4)}` 
        : address;

    return (
        <AccountAddressContainer id={"nav-account-address"} {...props}>
            <div style={{ width: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", }}>
                {addressToShow}
            </div>

            <Avatar style={{ height: 42, width: 42 }}/>
        </AccountAddressContainer>
    );
};

const DropdownIconContainer = styled.div`
    height: 42px;
    width: 42px;
    background-color: ${({ theme}) => theme.colors.highlight};
    border-radius: 100px;
    display: grid;
    justify-items: center;
    align-items: center;
    border: 1px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.highlight};

    transition: all 0.07s ease-out;

    &:active {
        transform: scale(0.95);
    }

    &:hover {
        cursor: pointer;
        border: 1px solid ${({ theme }) => theme.colors.textPrimary};

        .options-menu-triangle {
            path {
                fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary} !important;
            }
        }
    }

    .options-menu-triangle {
        path {
            fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textSecondary} !important;
        }
    }
`;

const OptionsMenu = () => {
    const [showDropDown, setShowDropDown] = useState(false);

    return (
        <>
            <DropdownIconContainer onClick={() => setShowDropDown(!showDropDown)} selected={showDropDown}>
                <Triangle 
                    style={{ transform: "rotate(180deg)", height: 18, marginTop: "1%", }} 
                    className={"options-menu-triangle"}
                />
            </DropdownIconContainer>

            <Modal 
                isOpen={showDropDown}
                topRight
                onClose={() => setShowDropDown(false)}
                showBackdrop={false}
            >
                <ModalCard style={{ width: CONTAINER_SIZING.small, padding: PIXEL_SIZING.small }}>
                    <DropdownTransitioner>
                        <ExpandedOptionsMenu/>
                    </DropdownTransitioner>
                </ModalCard>
            </Modal>
        </>
    );
};

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

const NotificationsPreview = () => {
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
                    className={"options-menu-triangle"}
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
        <div>
            {
                notifications.sort((a, b) => b.timestamp - a.timestamp).map(({ textContent, timestamp, contentType, additionalDetails, type }) => {
                    switch (contentType) {
                        case NOTIFICATION_CONTENT_TYPES.transaction:
                            return (
                                <a href={`https://etherscan.io/tx/${additionalDetails?.tx.hash}`}>
                                    <TransactionNotificationItem>
                                        <Text secondary>{new Date(timestamp).toLocaleTimeString()}</Text>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            {
                                                additionalDetails?.isLoading ?
                                                    <BarSpinner width={PIXEL_SIZING.large} style={{ marginRight: PIXEL_SIZING.small, }}/>
                                                    : type === NOTIFICATION_TYPES.success ?
                                                        <SuccessTickIcon style={{ marginRight: PIXEL_SIZING.small }}/>
                                                        : <FailCrossIcon style={{ marginRight: PIXEL_SIZING.small }}/>
                                            }
                                            <LinkIcon className={"tx-link-icon"}/>
                                        </div>
                                        <Text style={{ gridColumn: "1/3" }}>{textContent}</Text>
                                    </TransactionNotificationItem>
                                </a>
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


const LogoutIcon = ({ className }) => {
    return (
        <svg 
            height={PIXEL_SIZING.medium} 
            width={PIXEL_SIZING.medium} 
            viewBox="0 0 512 512" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g id="Solid">
                <path 
                    d="m480.971 239.029-90.51-90.509a24 24 0 0 0 -33.942 0 24 24 0 0 0 0 33.941l49.54 49.539h-262.059a24 24 0 0 0 -24 24 24 24 0 0 0 24 24h262.059l-49.54 49.539a24 24 0 0 0 33.942 33.941l90.51-90.51a24 24 0 0 0 0-33.941z"/><path d="m304 392a24 24 0 0 0 -24 24v24h-208v-368h208v24a24 24 0 0 0 48 0v-32a40 40 0 0 0 -40-40h-224a40 40 0 0 0 -40 40v384a40 40 0 0 0 40 40h224a40 40 0 0 0 40-40v-32a24 24 0 0 0 -24-24z"
                />
            </g>
        </svg>
    );
}

const ExpandedOptionsMenu = () => {
    const { setSigner } = useContext(EthersContext);
    const { address } = useContext(AccountContext);

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, }}>
            <AccountAddress primary/>

            <SelectableDropdownItem 
                Icon={<LogoutIcon className={"dropdown-transition-icon"}/>}
                onClick={() => {
                    setSigner();
                }}
            >
                Disconnect Wallet
            </SelectableDropdownItem>
        </div>
    );
};