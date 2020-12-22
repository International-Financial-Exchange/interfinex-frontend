import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Card } from "../../../core/Card";
import styled from "styled-components";
import { IloContext } from "./ILOItem";
import { useContext } from "react";
import Text from "../../../core/Text";
import { shade } from "../../../../utils/utils";
import Skeleton from "react-loading-skeleton";

const StyledTable = styled.table`
    border-collapse: separate;
    border-spacing: 0 ${PIXEL_SIZING.tiny};
    width: 100%;
    position: relative;

    @media (max-width: 1000px) {
        th:nth-child(4), td:nth-child(4) {
            display:none;
        }
    }
`;

const Row = styled.tr`
    background-color: ${({ theme, positive }) => shade(positive ? theme.colors.positive : theme.colors.negative, 0.9)};
    color: ${({ theme, positive }) => positive ? theme.colors.positive : theme.colors.negative};
    margin-top: ${PIXEL_SIZING.medium};
    border-radius: ${PIXEL_SIZING.miniscule};
    font-weight: bold;
    transition: all 0.1s ease-out;

    &:hover { 
        cursor: pointer;
        transform: scale(1.02);
    }

    td {
        padding: ${PIXEL_SIZING.tiny};
        text-align: center;
        border: none;
        max-width: ${CONTAINER_SIZING.miniscule};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:first-child {
            border-radius: ${PIXEL_SIZING.miniscule} 0 0 ${PIXEL_SIZING.miniscule};
        }
        
        &:last-child {
            border-radius: 0 ${PIXEL_SIZING.miniscule} ${PIXEL_SIZING.miniscule} 0;
        }
    }
`;

const Container = styled(Card)`
    width: 100%;
    height: ${CONTAINER_SIZING.medium};
    padding-top: 0;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: auto;
`;

export const ILOHistory = () => {
    const { ilo } = useContext(IloContext);

    const {
        assetToken
    } = ilo || {};

    return (
        <Container>
            <StyledTable>
                <tr>
                    <th style={{ padding: PIXEL_SIZING.small }}>
                        <Text secondary>Event</Text>
                    </th>
                    <th>
                        <Text secondary>ETH Invested</Text>
                    </th>
                    <th>
                        <Text secondary>{assetToken?.symbol} Bought</Text>
                    </th>
                    <th>
                        <Text secondary>User</Text>
                    </th>
                    <th>
                        <Text secondary>Timestamp</Text>
                    </th>
                </tr>

                <Row 
                    positive
                    onClick={() => window.open(`https://etherscan.io/tx/${txId}`)}
                >
                    <td>{"Deposit"}</td>
                    <td>{"102.0000"}</td>
                    <td>{"102.0000"}</td>
                    <td>{"0x093812081209381092389012830912832731817"}</td>
                    <td>{new Date().toLocaleTimeString()}</td>
                </Row>
            </StyledTable>

            {
                false &&
                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, height: "fit-content" }}>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                    </div>
            }
        </Container>
    );
};