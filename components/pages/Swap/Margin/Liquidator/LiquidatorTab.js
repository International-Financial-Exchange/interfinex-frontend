import { createContext, useContext, useEffect, useState } from "react";
import { TabSquareNav } from "../../../../core/TabSquareNav";
import { TokenAndLogo } from "../../../../core/TokenAndLogo";
import styled, { ThemeContext } from "styled-components";
import { CONTAINER_SIZING, FEE_RATE, humanizeTokenAmount, PIXEL_SIZING } from "../../../../../utils";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { MarginContext, Swap, SwapContext } from "../../Swap";
import Text from "../../../../core/Text";
import { getMarginPositions } from "../../networkRequests";
import { Button } from "../../../../core/Button";
import { inputToOutputAmount } from "../../TradePortal/BuySell";
import InfiniteScroll from "react-infinite-scroller";
import Skeleton from "react-loading-skeleton";
import { NotificationsContext } from "../../../../../context/Notifications";

const LiquidatorContext = createContext();

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    row-gap: ${PIXEL_SIZING.large};
    column-gap: ${PIXEL_SIZING.large};
`;

const usePositions = (MarginMarket, marginMarketAssetToken) => {
    const [positions, setPositions] = useState([]);
    const [gotAllPositions, setGotAllPositions] = useState(false);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState();
    const [_interestIndex, setInterestIndex] = useState();
    const { exchangeAssetTokenBalance, exchangeBaseTokenBalance } = useContext(SwapContext);
    const { baseToken, assetToken } = useContext(TokenPairContext);
    const [refresh, setRefresh] = useState(false);

    const _getMorePositions = async () => {
        setIsLoading(true);
        try {
            const interestIndex = _interestIndex ?? humanizeTokenAmount(
                await MarginMarket.interestIndex({ gasLimit: 1_000_000}), 
                { decimals: 18 }
            );

            console.log("fetching", MarginMarket.address);
            const rawPositions = await getMarginPositions({ marginMarketContract: MarginMarket.address, limit: 50, offset });
            const newPositions = rawPositions.map(({ 
                collateralisationRatio, 
                collateralAmount, 
                lastInterestIndex, 
                maintenanceMargin, 
                originalBorrowedAmount, 
                user 
            }) => {
                const borrowedAmount = originalBorrowedAmount * interestIndex / humanizeTokenAmount(lastInterestIndex, { decimals: 18 });
                const positionSize = inputToOutputAmount(
                    collateralAmount, 
                    marginMarketAssetToken.address === assetToken.address ? exchangeBaseTokenBalance : exchangeAssetTokenBalance,
                    marginMarketAssetToken.address === assetToken.address ? exchangeAssetTokenBalance : exchangeBaseTokenBalance,
                    FEE_RATE
                );
                const liquidationRatio = borrowedAmount / positionSize;


                return {
                    borrowedAmount: Number.isNaN(borrowedAmount) ? 0 : borrowedAmount,
                    positionSize,
                    collateralAmount,
                    liquidationRatio: Number.isNaN(borrowedAmount) ? 0 : liquidationRatio,
                    maintenanceMargin,
                    user,
                }
            });

            setPositions(existing => existing.concat(newPositions));
            setOffset(old => old + newPositions.length);
            setGotAllPositions(newPositions.length === 0);
            setIsLoading(false);
        } catch {
            setTimeout(() => {
                setIsLoading(false);
            }, 3000);
        }
    }

    const getMorePositions = async () => {
        if (isLoading || gotAllPositions || !MarginMarket) return;
        await _getMorePositions();
    }

    const refreshPositions = () => {
        setPositions([]);
        setGotAllPositions(false);
        setOffset(0);
        setRefresh(true);
    }

    useEffect(() => {
        if (refresh) {
            _getMorePositions();
            setRefresh(false);
        }
    }, [refresh]);

    useEffect(() => {
        setPositions([]);
        setGotAllPositions(false);
        setOffset(0);
    }, [MarginMarket.address]);

    return [positions, isLoading, getMorePositions, gotAllPositions];
};

const StyledTable = styled.table`
    width: 100%; 
    border-spacing: ${PIXEL_SIZING.small}; 
    position: relative;

    @media (max-width: 1100px) {
        th:nth-child(5), td:nth-child(5) {
            display:none;
        }
    }

    @media (max-width: 900px) {
        th:nth-child(3), td:nth-child(3) {
            display:none;
        }
    }

    @media (max-width: 700px) {
        th:nth-child(4), td:nth-child(4) {
            display:none;
        }
    }
`;

export const LiquidatorTab = ({ isSelected }) => {
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { marginMarkets, } = useContext(MarginContext);
    const [selectedToken, setSelectedToken] = useState(assetToken);

    const MarginMarket = marginMarkets[selectedToken.address];
    const [positions, isLoading, getMorePositions, gotAllPositions] = usePositions(MarginMarket, selectedToken);

    return (
        <LiquidatorContext.Provider value={{ MarginMarket, selectedToken, }}>
            <div style={{ display: !isSelected ? "none" : "" }}>
                <TabSquareNav
                    value={selectedToken.address}
                    onChange={tokenAddress => {
                        setSelectedToken([assetToken, baseToken].find(({ address }) => address === tokenAddress));
                    }}
                    isHidden={isSelected}
                    items={
                        [assetToken, baseToken].map(token => ({
                            label: <TokenAndLogo token={token}/>, 
                            value: token.address
                        }))
                    }
                />

                <Container>
                    <div>
                        <Text primary>Positions</Text>
                    </div>

                    <div style={{ maxHeight: CONTAINER_SIZING.huge, minHeight: CONTAINER_SIZING.medium, overflow: "scroll", padding: `0 ${PIXEL_SIZING.small}` }}>
                        <InfiniteScroll
                            loadMore={getMorePositions}
                            hasMore={!gotAllPositions}
                            useWindow={false}
                        >
                            <StyledTable>
                                <tr>
                                    <th><Text secondary>Liquidation Ratio</Text></th>
                                    <th><Text secondary>Position Size</Text></th>
                                    <th><Text secondary>Maintenance Margin</Text></th>
                                    <th><Text secondary>Borrowed Amount</Text></th>
                                    <th><Text secondary>User</Text></th>
                                    <th></th>
                                </tr>

                                {
                                    (!positions || positions.length === 0) && !isLoading ?
                                        <Text secondary style={{ top: CONTAINER_SIZING.tiny }} className={"center-absolute"}>
                                            No positions to show
                                        </Text>
                                        : positions.map(position =>   
                                            <PositionRow {...position} key={position.user}/>
                                        )
                                }
                            </StyledTable>

                            {
                                isLoading &&
                                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny }}>
                                        <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                                        <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                                        <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                                        <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                                    </div>
                            }
                        </InfiniteScroll>
                    </div>
                </Container>
            </div>
        </LiquidatorContext.Provider>
    );
};

const StyledRow = styled.tr`
    box-shadow: 0 0 14px 0 rgba(0, 0, 0, 0.1);
    border-radius: ${PIXEL_SIZING.miniscule};

    td {
        text-align: center;
        padding: ${PIXEL_SIZING.small};
        max-width: ${CONTAINER_SIZING.tiny};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

const PositionRow = ({ 
    liquidationRatio, 
    positionSize, 
    collateralAmount,
    maintenanceMargin, 
    borrowedAmount,
    user 
}) => {
    const theme = useContext(ThemeContext);
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { selectedToken, MarginMarket } = useContext(LiquidatorContext);
    const collateralToken = selectedToken.address === assetToken.address ? baseToken : assetToken;
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [isLoading, setIsLoading] = useState();

    return (
        <StyledRow>
            <td 
                style={{ 
                    color: liquidationRatio >= 1 
                        ? theme.colors.negative 
                        : liquidationRatio >= 0.85 ?
                            theme.colors.secondary
                            : theme.colors.positive, 
                    fontWeight: "bold" 
                }}
            >
                {(liquidationRatio * 100).toFixed(4)}%
            </td>
            <td>{collateralAmount.toFixed(4)} {collateralToken.symbol}</td>
            <td>{maintenanceMargin.toFixed(4)} {selectedToken.symbol}</td>
            <td>{borrowedAmount.toFixed(4)} {selectedToken.symbol}</td>
            <td>{user}</td>
            <td>
                <Button 
                    style={{ width: "100%" }}
                    requiresWallet
                    isLoading={isLoading}
                    onClick={async () => {
                        setIsLoading(true);
                        try {
                            await addTransactionNotification({
                                content: `Attempt to liquidate ${user} in ${selectedToken.symbol}-${collateralToken.symbol} margin market`,
                                transactionPromise: MarginMarket.liquidatePosition(user),
                            });
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    Liquidate
                </Button>
            </td>
        </StyledRow>
    );
};