import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { cloneDeep, uniqueId } from "lodash";
import ReactDOM from "react-dom";
import styled, { ThemeContext } from "styled-components";
import { Cross } from "../components/core/Cross";
import Text from "../components/core/Text";
import { ArrowButton, TextButton } from "../components/core/Button";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../utils/constants";
import { hexToRgba, shade } from "../utils/utils";
import { useLocalStorage } from "../utils/hooks";
import { TransactionDescription } from "ethers/lib/utils";
import { EthersContext } from "./Ethers";
import { v4 as uuidv4 } from 'uuid';

export const NOTIFICATION_TYPES = {
    success: "SUCCESS",
    error: "ERROR",
    info: "INFO",
    warn: "WARN",
};

export const NOTIFICATION_CONTENT_TYPES = {
    transaction: "TRANSACTION",
};

export const NotificationsContext = createContext();

const useNotifications = () => {
    const [notifications, setNotifications] = useLocalStorage("notifications", []);
    const [listeners, setListeners] = useState({});
    const [displayNotifications, setDisplayNotifications] = useState([]);
    const { provider, } = useContext(EthersContext);

    const markAsRead = () => {
        setNotifications(existing => 
            existing.map(notification => ({ 
                ...notification, 
                isRead: true 
            }))
        );
    };

    const addTransactionListener = async notification => {
        const transaction = await provider.getTransaction(notification.additionalDetails.tx.hash);
        const res = await transaction.wait(1);

        setNotifications(existing => {
            const newArr = cloneDeep(existing);
            const index = newArr.findIndex(({ id }) => id === notification.id);

            newArr[index].additionalDetails.isLoading = false;
            newArr[index].type = res.status === 1 ? NOTIFICATION_TYPES.success : NOTIFICATION_TYPES.error;

            return newArr;
        });
    };

    useEffect(() => {
        notifications.forEach(notification => {
            if (
                notification.contentType === NOTIFICATION_CONTENT_TYPES.transaction 
                && notification.additionalDetails?.isLoading 
                && !listeners[notification.id]
            ) {
                setListeners(old => ({ ...old, [notification.id]: true }));
                addTransactionListener(notification);
            }
        });
    }, [notifications]);

    const addNotification = ({ textContent, contentType, type, timeout = 1000 * 7, additionalDetails }) => {
        const id = uuidv4();
        const notification = { 
            textContent, 
            contentType,
            type, 
            timestamp: Date.now(), 
            timeout,
            isRead: false,
            additionalDetails,
            id, 
            deleteNotification: () => setDisplayNotifications(existing => existing.filter(({ id: _id }) => _id !== id))
        };

        setDisplayNotifications(existing => existing.concat(notification));
        setNotifications(existing => existing.concat(notification));
    };


    return [
        notifications, 
        displayNotifications,
        setNotifications, 
        addNotification, 
        markAsRead
    ];
};

const Container = styled.div`
    position: fixed;
    bottom: ${PIXEL_SIZING.large};
    left: ${PIXEL_SIZING.large};
    display: grid;
    row-gap: ${PIXEL_SIZING.small};

    @media (max-width: 450px) {
        bottom: unset;
        top: 0;
        width: 100%;
        padding: ${PIXEL_SIZING.small};
        left: 50%;
        transform: translateX(-50%);
    }
`;

export const NotificationsProvider = ({ children }) => {
    const [notifications, displayNotifications, setNotifications, addNotification, markAsRead] = useNotifications();
    const [layoutNotifications, setLayoutNotifications] = useState([]);

    const addTransactionNotification = useCallback(async ({ content, transactionPromise }) => {
        try {
            const tx = await transactionPromise;
            addNotification({
                type: NOTIFICATION_TYPES.success,
                contentType: NOTIFICATION_CONTENT_TYPES.transaction,
                textContent: content,
                additionalDetails: {
                    tx,
                    isLoading: true,
                }
            });
        } catch (e) {
            console.log(e);
            addNotification({
                type: NOTIFICATION_TYPES.error,
                contentType: NOTIFICATION_CONTENT_TYPES.transaction,
                textContent: "Failed: " + content,
            });
        }
    }, [addNotification]);

    const addLayoutNotification = useCallback(({ content, type }) => {
        const id = uniqueId("layout-notification");
        const deleteNotification = () => setLayoutNotifications(existing => existing.filter(({ id: _id }) => _id !== id));
        setLayoutNotifications(existing => 
            existing.concat({ 
                id,
                content: <LayoutNotification 
                    content={content} 
                    type={type} 
                    timestamp={Date.now()} 
                    deleteNotification={deleteNotification}
                />, 
            })
        );

        return deleteNotification;
    }, []);
    
    return (
        <NotificationsContext.Provider
            value={{
                addNotification,
                addTransactionNotification,
                addLayoutNotification,
                layoutNotifications,
                markAsRead,
                notifications,
            }}
        >
            { children }

            <Container>
                {
                    displayNotifications.map(notification => 
                        <Notification 
                            key={notification.id}
                            notification={notification}
                        />
                    )
                }
            </Container>
        </NotificationsContext.Provider>
    );
};

const LayoutNotificationContainer = styled.div`
    padding: ${PIXEL_SIZING.small};
    transition: all 0.1s ease-out;

    background-color: ${({ typeColor, }) => hexToRgba(typeColor, 0.25)};
    border: 1px solid ${({ typeColor }) => typeColor};
    border-radius: ${PIXEL_SIZING.miniscule};
    position: relative;

    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    column-gap: ${PIXEL_SIZING.small};
    overflow: hidden;
    margin-top: ${PIXEL_SIZING.medium};

    &:hover {
        transform: scale(1.02);
    }
`;

const LayoutNotification = ({ content, type, timestamp, deleteNotification, }) => {
    const theme = useContext(ThemeContext);

    return (
        <LayoutNotificationContainer 
            typeColor={
                type === NOTIFICATION_TYPES.success ? 
                    theme.colors.positive
                    : type === NOTIFICATION_TYPES.error ?
                        theme.colors.negative
                        : type === NOTIFICATION_TYPES.info ?
                            theme.colors.highlight
                            : type === NOTIFICATION_TYPES.warn ?
                                theme.colors.warn
                                : theme.colors.primary
            }
        >
            <img
                src={"/warn.png"}
                style={{ height: PIXEL_SIZING.medium }}
            />

            <Text bold>{ content }</Text>

            <div>
                <TextButton onClick={deleteNotification}>
                    Dismiss
                </TextButton>
            </div>
        </LayoutNotificationContainer>
    );
};

const NotificationContainer = styled.div`
    padding: ${PIXEL_SIZING.small};
    transition: all 0.1s ease-out;

    background-color: ${({ typeColor, }) => hexToRgba(typeColor, 0.25)};
    border: 1px solid ${({ typeColor }) => typeColor};
    border-radius: ${PIXEL_SIZING.miniscule};
    color: ${({ theme }) => theme.colors.textPrimary};
    position: relative;

    width: ${CONTAINER_SIZING.medium};
    display: grid;
    grid-template-columns: 1fr auto;
    overflow: hidden;

    &:hover {
        transform: scale(1.1);
    }

    @media (max-width: 450px) {
        width: 100%;
    }
`;

const Notification = ({ notification }) => {
    const { textContent, type, contentType, additionalDetails, timestamp, deleteNotification, timeout } = notification;
    const [timer, setTimer] = useState();
    const theme = useContext(ThemeContext);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            deleteNotification();
        }, timeout);

        setTimer(timer);

        return () => clearTimeout(timer);
    }, []);

    return (
        <NotificationContainer 
            typeColor={
                type === NOTIFICATION_TYPES.success ? 
                    theme.colors.positive
                    : type === NOTIFICATION_TYPES.error ?
                        theme.colors.negative
                        : type === NOTIFICATION_TYPES.info ?
                            theme.colors.highlight
                            : theme.colors.primary
            }
            onMouseOver={() => {
                clearTimeout(timer);
            }}
            onMouseLeave={() => {
                const timer = setTimeout(() => {
                    deleteNotification();
                }, timeout);
                setTimer(timer);
            }}
        >
            {
                (() => {
                    switch (contentType) {
                        case NOTIFICATION_CONTENT_TYPES.transaction:
                            return type === NOTIFICATION_TYPES.success ?
                                <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, width: "100%" }}>
                                    <Text bold>
                                        Successfully Sent Transaction
                                    </Text>

                                    <Text secondary>
                                        {textContent}
                                    </Text>

                                    <ArrowButton 
                                        onClick={() => window.open(`https://etherscan.io/tx/${additionalDetails.tx.hash}`)}
                                    >
                                        View on etherscan
                                    </ArrowButton>
                                </div>
                            :
                                <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, width: "100%" }}>
                                    <Text bold>
                                        Failed to Send Transaction
                                    </Text>
                
                                    <Text secondary>
                                        {textContent}
                                    </Text>
                                </div>;
                        default:
                            console.warn("Unsupported notification contentType: ", contentType);
                            return null;
                    }
                })()
            }
            <div>
                <Cross
                    onClick={() => deleteNotification()}
                    style={{ height: PIXEL_SIZING.medium }}
                />
            </div>
        </NotificationContainer>
    );
};