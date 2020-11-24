import { CONTAINER_SIZING, humanizeTokenAmount, PIXEL_SIZING, shade } from "../../../../../utils";
import { Card } from "../../../../core/Card";
import Text from "../../../../core/Text";
import styled from "styled-components";
import { useContext, useEffect, useState } from "react";
import { getFundingHistory } from "../../networkRequests";
import { FundingContext } from "./FundingTab";
import InfiniteScroll from "react-infinite-scroller";
import { Spinner } from "../../../../core/Spinner";

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

const useFundingHistory = ({ marginMarketContract }) => {
    const [fundingEvents, setFundingEvents] = useState([]);
    const [gotAllFundingEvents, setGotAllFundingEvents] = useState(false);
    const [oldestEventTimestamp, setOldestEventTimestamp] = useState();
    const [isLoading, setIsLoading] = useState();

    const getMoreFundingEvents = async () => {
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

    useEffect(() => {
        setFundingEvents([]);
        getMoreFundingEvents();
    }, [marginMarketContract]);

    return [fundingEvents, isLoading, getMoreFundingEvents, gotAllFundingEvents];
};

export const FundingHistory = () => {
    const { MarginMarket, selectedToken } = useContext(FundingContext);
    const [fundingEvents, isLoading, getMoreFundingEvents, gotAllFundingEvents] = useFundingHistory({ marginMarketContract: MarginMarket.address });
    console.log("funding", fundingEvents);

    return (
        <Card style={{ width: "100%", height: CONTAINER_SIZING.medium, paddingTop: 0 }}>
            <InfiniteScroll
                loadMore={getMoreFundingEvents}
                hasMore={!gotAllFundingEvents}
                useWindow={false}
            >
                <table style={{ borderCollapse: "separate", borderSpacing: `0 ${PIXEL_SIZING.tiny}`, width: "100%" }}>
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
                        fundingEvents.map(({ isDeposit, assetTokenAmount, timestamp, user, txId }) =>
                            <Row 
                                positive={isDeposit}
                                key={txId}
                                onClick={() => window.open(`https://etherscan.io/tx/${txId}`)}
                            >
                                <td>{isDeposit ? "Deposit" : "Withdraw"}</td>
                                <td>{humanizeTokenAmount(assetTokenAmount, selectedToken).toFixed(4)}</td>
                                <td>{new Date(timestamp).toLocaleTimeString()}</td>
                                <td>{user}</td>
                            </Row>
                        )
                    }
                </table>

                {
                    isLoading &&
                        <Spinner 
                            style={{ 
                                marginTop: PIXEL_SIZING.medium, 
                                marginBottom: PIXEL_SIZING.medium, 
                                marginLeft: "50%", 
                                transform: "translateX(-12px)" 
                            }}
                        />
                }
            </InfiniteScroll>
        </Card>
    );
};