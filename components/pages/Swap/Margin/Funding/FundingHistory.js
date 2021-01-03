import { Card } from "../../../../core/Card";
import Text from "../../../../core/Text";
import styled from "styled-components";
import { useContext, useEffect, useState } from "react";
import { getFundingHistory } from "../networkRequests";
import { FundingContext } from "./FundingTab";
import InfiniteScroll from "react-infinite-scroller";
import { Spinner } from "../../../../core/Spinner";
import Skeleton from "react-loading-skeleton";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../../utils/constants";
import { hexToRgba, humanizeTokenAmount, shade, tokenAmountToBig } from "../../../../../utils/utils";

const Row = styled.tr`
    background-color: ${({ theme, positive }) => hexToRgba(positive ? theme.colors.positive : theme.colors.negative, 0.1)};
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

const Container = styled(Card)`
    width: 100%;
    height: ${CONTAINER_SIZING.medium};
    padding-top: 0;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: auto;
`;

const useFundingHistory = ({ marginMarketContract }) => {
    const [fundingEvents, setFundingEvents] = useState([]);
    const [gotAllFundingEvents, setGotAllFundingEvents] = useState(false);
    const [oldestEventTimestamp, setOldestEventTimestamp] = useState();
    const [isLoading, setIsLoading] = useState();

    const _getMoreFundingEvents = async () => {
        if (isLoading || gotAllFundingEvents || !marginMarketContract) return;

        setIsLoading(true);
        try {
            const fundingEvents = await getFundingHistory({ marginMarketContract, limit: 50, to: oldestEventTimestamp });
            setFundingEvents(existing => existing.concat(fundingEvents));
            setOldestEventTimestamp(fundingEvents.last()?.timestamp);
            setGotAllFundingEvents(fundingEvents.length === 0);
            setIsLoading(false);
        } catch {
            setTimeout(() => {
                setIsLoading(false);
            }, 3000);
        }
    }

    const getMoreFundingEvents = async () => {
        if (isLoading || gotAllFundingEvents || !marginMarketContract) return;
        await _getMoreFundingEvents();
    }

    const refreshFundingEvents = () => {
        setFundingEvents([]);
        setGotAllFundingEvents(false);
        _getMoreFundingEvents();
    }

    useEffect(() => {
        refreshFundingEvents();
    }, [marginMarketContract])

    return [fundingEvents, isLoading, getMoreFundingEvents, gotAllFundingEvents];
};

export const FundingHistory = () => {
    const { MarginMarket, selectedToken } = useContext(FundingContext);
    const [fundingEvents, isLoading, getMoreFundingEvents, gotAllFundingEvents] = useFundingHistory({ marginMarketContract: MarginMarket.address });

    return (
        <Container>
            <InfiniteScroll
                loadMore={getMoreFundingEvents}
                hasMore={!gotAllFundingEvents}
                useWindow={false}
            >
                <StyledTable>
                    <tr>
                        <th style={{ padding: PIXEL_SIZING.small }}>
                            <Text secondary>Event</Text>
                        </th>
                        <th>
                            <Text secondary>Volume ({selectedToken.symbol})</Text>
                        </th>
                        <th>
                            <Text secondary>Timestamp</Text>
                        </th>
                        <th>
                            <Text secondary>User</Text>
                        </th>
                    </tr>

                    {
                        (!fundingEvents || fundingEvents.length === 0) && !isLoading ?
                            <Text secondary style={{ top: CONTAINER_SIZING.tiny }} className={"center-absolute"}>No events to show</Text>
                            : fundingEvents.map(({ isDeposit, assetTokenAmount, timestamp, user, txId }) =>
                                <Row 
                                    positive={isDeposit}
                                    key={txId}
                                    onClick={() => window.open(`https://etherscan.io/tx/${txId}`)}
                                >
                                    <td>{isDeposit ? "Deposit" : "Withdraw"}</td>
                                    <td>{tokenAmountToBig(assetTokenAmount, selectedToken).toFixed(4)}</td>
                                    <td>{new Date(timestamp).toLocaleTimeString()}</td>
                                    <td>{user}</td>
                                </Row>
                            )
                    }
                </StyledTable>

                {
                    isLoading &&
                        <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny }}>
                            <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.large, width: "100%" }}/>
                        </div>
                }
            </InfiniteScroll>
        </Container>
    );
};