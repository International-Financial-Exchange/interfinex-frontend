import { startCase } from "lodash";
import { useContext, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../../../../utils";
import { Card } from "../../../../core/Card";
import Text from "../../../../core/Text";
import { MarginContext } from "../../Swap";
import { FundingContext } from "./FundingTab";
import styled from "styled-components";

const StyledTable = styled.table`
    width: 100%;

    @media (max-width: 750px) {
        th:nth-child(4), td:nth-child(4) {
            display:none;
        }
    }

    @media (max-width: 500px) {
        th:nth-child(2), td:nth-child(2) {
            display:none;
        }
    }
`;

export const FundingStats = () => {
    const { MarginMarket } = useContext(FundingContext);
    const { funding: { stats: _stats, isLoading }} = useContext(MarginContext);
    const stats = _stats[MarginMarket.address];
    const theme = useContext(ThemeContext);

    return (
        <Card style={{ width: "100%", }}>
            <StyledTable>
                <tr>
                    <th><Text secondary>Interest Rate (Yield)</Text></th>
                    <th><Text secondary>Utilisation Rate</Text></th>
                    <th><Text secondary>Total Borrowed</Text></th>
                    <th><Text secondary>Total Reserves</Text></th>
                </tr>

                <tr>
                    {
                        isLoading ?
                            <>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Skeleton style={{ width: PIXEL_SIZING.huge, height: PIXEL_SIZING.larger }}/>
                                </td>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Skeleton style={{ width: PIXEL_SIZING.huge, height: PIXEL_SIZING.larger }}/>
                                </td>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Skeleton style={{ width: PIXEL_SIZING.huge, height: PIXEL_SIZING.larger }}/>
                                </td>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Skeleton style={{ width: PIXEL_SIZING.huge, height: PIXEL_SIZING.larger }}/>
                                </td>
                            </>
                        :
                            <>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Text primary bold style={{ color: theme.colors.positive }}>{(stats.interestRate * 100).toFixed(4)}%</Text>
                                </td>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Text primary bold>
                                        {
                                            Number.isNaN(stats.totalBorrowed / (stats.totalReserved + stats.totalBorrowed)) ? 
                                                0 
                                                : (stats.totalBorrowed / (stats.totalReserved + stats.totalBorrowed) * 100).toFixed(4)
                                        }%
                                    </Text>
                                </td>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Text primary bold>{stats.totalBorrowed.toFixed(4)}</Text>
                                </td>
                                <td style={{ textAlign: "center", padding: PIXEL_SIZING.small }}>
                                    <Text primary bold>{stats.totalReserved.toFixed(4)}</Text>
                                </td>
                            </>
                    }
                </tr>
            </StyledTable>
        </Card>
    );
}