import { useContext } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { PIXEL_SIZING } from "../../../../utils/constants";
import { Avatar } from "../../../core/Avatar";

const Container = styled.div`
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

export const AccountAddress = ({ primary, ...props }) => {
    const { address } = useContext(AccountContext);

    const addressToShow = !primary ? 
        `${address?.slice(0,4)}...${address?.slice(address.length - 4)}` 
        : address;

    return (
        <Container id={"nav-account-address"} {...props}>
            <div style={{ width: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", }}>
                {
                    addressToShow ?
                        addressToShow
                        : <Skeleton width={PIXEL_SIZING.huge} height={PIXEL_SIZING.medium}/>
                }
            </div>

            <Avatar style={{ height: 42, width: 42 }}/>
        </Container>
    );
};