import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { uniqueId } from "lodash";
import ReactDOM from "react-dom";
import { PIXEL_SIZING, shade, dropinAnimation, CONTAINER_SIZING } from "../utils";
import styled, { ThemeContext } from "styled-components";
import { Cross } from "../components/core/Cross";
import Text from "../components/core/Text";
import { TextButton } from "../components/core/Button";

export const NOTIFICATION_TYPES = {
    success: "SUCCESS",
    error: "ERROR",
    info: "INFO",
    warn: "WARN",
};

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = ({ content, type, timeout = 1000 * 300 }) => {
        const id = uniqueId("notification");
        setNotifications(existing => 
            existing.concat({ 
                content, 
                type, 
                timestamp: Date.now(), 
                timeout,
                id, 
                deleteNotification: () => setNotifications(existing => existing.filter(({ id: _id }) => _id !== id))
            })
        );
    };

    const addTransactionNotification = useCallback(async ({ content, transactionPromise }) => {
        try {
            const tx = await transactionPromise;
            console.log("resolved", tx);
            addNotification({
                type: NOTIFICATION_TYPES.success,
                content: <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, width: "100%" }}>
                    <Text bold>
                        Successfully Sent Transaction
                    </Text>

                    <Text secondary>
                        {content}
                    </Text>

                    <TextButton>
                        Tx Id: {tx.hash.slice(0, 28)}...
                    </TextButton>
                </div>,
            });
        } catch {

        }
    }, []);
    
    return (
        <NotificationsContext.Provider
            value={{
                addNotification,
                addTransactionNotification,
            }}
        >
            { children }

            <div style={{ position: "fixed", bottom: PIXEL_SIZING.large, left: PIXEL_SIZING.large, display: "grid", rowGap: PIXEL_SIZING.small }}>
                {
                    notifications.map(notification => 
                        <Notification 
                            key={notification.id}
                            {...notification}
                        />
                    )
                }
            </div>
        </NotificationsContext.Provider>
    );
};

const NotificationContainer = styled.div`
    padding: ${PIXEL_SIZING.small};
    transition: all 0.1s ease-out;

    background-color: ${({ typeColor, }) => shade(typeColor, 0.85)};
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
`;

const Notification = ({ content, type, timestamp, deleteNotification, timeout }) => {
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
            onMouseOver={() => clearTimeout(timer)}
            onMouseLeave={() => setTimeout(() => {
                deleteNotification();
            }, timeout)}
        >
            { content }
            <div>
                <Cross
                    onClick={() => deleteNotification()}
                    style={{ height: PIXEL_SIZING.medium }}
                />
            </div>
        </NotificationContainer>
    );
};