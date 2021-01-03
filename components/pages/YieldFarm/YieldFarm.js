import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants";
import Text from "../../core/Text";
import styled, { ThemeContext } from "styled-components";
import { Layout } from "../../layout/Layout";
import { Button } from "../../core/Button";
import { useYieldFarm, useYieldFarms } from "./hooks";
import { useContext, useEffect, useState } from "react";
import { TokenPairContext } from "../../../context/TokenPair";
import { divOrZero, humanizeTokenAmount, tokenAmountToBig } from "../../../utils/utils";
import { useRouter } from "next/router";
import Skeleton from "react-loading-skeleton";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.larger};
    display: grid;
    row-gap: ${PIXEL_SIZING.large};
`;

const StyledTable = styled.table`
    width: 100%; 
    border-spacing: ${PIXEL_SIZING.small}; 
    position: relative;

    @media (max-width: 1100px) {
        th:nth-child(4), td:nth-child(4) {
            display:none;
        }
    }

    @media (max-width: 900px) {
        th:nth-child(3), td:nth-child(3) {
            display:none;
        }
    }
`;

const StyledRow = styled.tr`
    box-shadow: ${({ theme }) => theme.colors.boxShadow};
    border-radius: ${PIXEL_SIZING.miniscule};

    td {
        text-align: center;
        padding: ${PIXEL_SIZING.small};
        max-width: ${CONTAINER_SIZING.tiny};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

export const YieldFarm = () => {
    const [farms, isLoading] = useYieldFarms();

    return (
        <Layout>
            <Container>
                <Text primary bold>Liquidity Farms</Text>

                <StyledTable>
                    <tr>
                        <th><Text secondary>Pool Name</Text></th>
                        <th><Text secondary>APR</Text></th>
                        <th><Text secondary>Yield Per Block</Text></th>
                        <th><Text secondary>Total Annual Yield</Text></th>
                        <th></th>
                    </tr>

                    {
                        ((!farms || farms.length === 0) && !isLoading) ?
                            <Text 
                                secondary 
                                style={{ top: CONTAINER_SIZING.tiny }} 
                                className={"center-absolute"}
                            >
                                No farms to show
                            </Text>
                        :
                            farms?.map(farm => 
                                <FarmRow 
                                    key={farm.tokenContract}
                                    farm={farm}
                                />    
                            )
                    }
                </StyledTable>

                {
                    isLoading &&
                        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
                            <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                            <Skeleton style={{ height: PIXEL_SIZING.larger, width: "100%" }}/>
                        </div>
                }
            </Container>
        </Layout>
    );
};

const FarmRow = ({ farm }) => {
    const { 
        tokenContract, 
        yieldPerBlock, 
        annualYield, 
        annualAPR, 
        token0Address, 
        token1Address,
        marketContract
    } = farm;

    const { tokens, ifexToken } = useContext(TokenPairContext);
    const [token0, setToken0] = useState();
    const [token1, setToken1] = useState();
    const [APR, setAPR] = useState();
    const theme = useContext(ThemeContext);
    const router = useRouter();

    useEffect(() => {
        const token0 = tokens.find(({ address }) => address === token0Address);
        const token1 = tokens.find(({ address }) => address === token1Address);

        setToken0(token0);
        setToken1(token1);

        ifexToken.contract.balanceOf(marketContract).then(rawMarketBalance => {
            const marketBalance = tokenAmountToBig(rawMarketBalance, ifexToken);
            const APR = divOrZero(annualYield, marketBalance).mul(100).toFixed(2);
            setAPR(APR);
        });
    }, []);

    return (
        <StyledRow>
            <td>{token0?.symbol}-{token1?.symbol} Swap</td>
            <td style={{ color: theme.colors.positive, fontWeight: "bold" }}>
                {
                    APR ?
                        `${APR}%`
                        : <Skeleton height={PIXEL_SIZING.medium} width={PIXEL_SIZING.huge}/>
                }
            </td>
            <td>{yieldPerBlock.toFixed(2)} IFEX</td>
            <td>{annualYield.toFixed(2)} IFEX</td>
            <td>
                <Button
                    style={{ width: "100%" }}
                    onClick={() => {
                        router.push({ 
                            pathname: "/app/swap",
                            query: { 
                                ...router.query,
                                assetTokenName: token0.name,
                                baseTokenName: token1.name,
                            }
                        });
                    }}
                >
                    Start Farming
                </Button>
            </td>
        </StyledRow>
    );
};