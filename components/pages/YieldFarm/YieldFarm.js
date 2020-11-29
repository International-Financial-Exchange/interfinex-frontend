import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants";
import Text from "../../core/Text";
import styled from "styled-components";
import { Layout } from "../../layout/Layout";
import { Button } from "../../core/Button";
import { useYieldFarm } from "./hooks";
import { useContext, useEffect, useState } from "react";
import { TokenPairContext } from "../../../context/TokenPair";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    row-gap: ${PIXEL_SIZING.large};
`;

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
`;

export const YieldFarm = () => {
    const [farms, isLoading] = useYieldFarm();

    console.log("farms", farms);

    return (
        <Layout>
            <Container>
                <Text primary>Liquidity Farms</Text>

                <StyledTable>
                    <tr>
                        <th><Text secondary>Pool Name</Text></th>
                        <th><Text secondary>APR</Text></th>
                        <th><Text secondary>Yield Per Block</Text></th>
                        <th><Text secondary>Total Annual Yield</Text></th>
                        <th></th>
                    </tr>

                    {
                        farms?.map(farm => 
                            <FarmRow 
                                key={farm.tokenContract}
                                farm={farm}
                            />    
                        )
                    }
                </StyledTable>
            </Container>
        </Layout>
    );
};

const FarmRow = ({ farm }) => {
    const { tokenContract, yieldPerBlock, annualYield, annualAPR, token0Address, token1Address } = farm;
    const { tokens } = useContext(TokenPairContext);
    const [token0, setToken0] = useState();
    const [token1, setToken1] = useState();

    useEffect(() => {
        const token0 = tokens.find(({ address }) => address === token0Address);
        const token1 = tokens.find(({ address }) => address === token1Address);

        setToken0(token0);
        setToken1(token1);

        // TODO: Create the contract and get the balance of the pool
        // Use this to calculate the APR (exactly the same as in your liquidity)
    }, []);

    return (
        <StyledRow>
            <td>{token0?.symbol}-{token1?.symbol} Swap</td>
            <td>{annualAPR}%</td>
            <td>{yieldPerBlock} IFEX</td>
            <td>{annualYield} IFEX</td>
            <td>
                <Button
                    style={{ width: "100%" }}
                >
                    Start Farming
                </Button>
            </td>
        </StyledRow>
    );
};