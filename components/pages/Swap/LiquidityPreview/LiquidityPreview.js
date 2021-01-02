import { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../../../utils/constants";
import { TextButton } from "../../../core/Button";
import { InfoBubble } from "../../../core/InfoBubble";
import { TextOption } from "../../../core/TextOption";
import { useYieldFarmInfo } from "../../YieldFarm/hooks";
import { SwapContext } from "../Swap";
import { TotalLiquidity } from "./TotalLiquidity";
import { YourLiquidity } from "./YourLiquidity";

const TAB_OPTIONS = {
    yourLiquidity: "YOUR_LIQUIDITY",
    totalLiquidity: "TOTAL_LIQUIDITY",
}

export const LiquidityPreview = () => {
    const [selectedTab, setSelectedTab] = useState(TAB_OPTIONS.yourLiquidity);
    const { account, liquidityToken, } = useContext(SwapContext);
    const [farmInfo, isFarmInfoLoading] = useYieldFarmInfo(liquidityToken, SwapContext);
    const [showMoreYieldInfo, setShowMoreYieldInfo] = useState(false);
    const theme = useContext(ThemeContext);

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
            <div style={{ display: "flex" }}>
                {
                    [
                        { value: TAB_OPTIONS.yourLiquidity, label: "Your Liquidity" },
                        { value: TAB_OPTIONS.totalLiquidity, label: "Total Liquidity" },
                    ].map(({ value, label }) => 
                        <TextOption 
                            onClick={() => setSelectedTab(value)}
                            selected={selectedTab === value}
                            style={{ width: "fit-content" }}
                        >
                            {label}
                        </TextOption>
                    )
                }
            </div>

            {
                selectedTab === TAB_OPTIONS.yourLiquidity ?
                    <YourLiquidity farmInfo={farmInfo} isFarmInfoLoading={isFarmInfoLoading}/>
                    : <TotalLiquidity/>
            }

            
            {
                true &&
                    <InfoBubble
                        style={{ 
                            display: "grid", 
                            rowGap: PIXEL_SIZING.small,
                        }}
                    >
                        <div style={{ fontWeight: "bold" }}>
                            {
                                account?.percentageOfPoolDeposited > 0 ?
                                    "👨‍🌾 You are Farming this liquidity pool"
                                    : "👨‍🌾 You can Farm this liquidity pool"
                            }
                        </div>
                        
                        <div style={{ width: "75%", display: "grid", rowGap: PIXEL_SIZING.miniscule }}>
                            <div style={{ display: "grid", gridTemplateColumns: "50% auto", }}>
                                <div>Annual APR:</div> 
                                <div style={{ color: theme.colors.positive, fontWeight: "bold" }}>
                                    {" " + farmInfo?.annualAPR.toFixed(2)}%
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "50% auto" }}>
                                <div>
                                    Annual Yield:
                                </div> 
                                <div style={{ fontWeight: "bold" }}>
                                    {" " + farmInfo?.annualYield.toFixed(2)} IFEX
                                </div>
                            </div>
                        </div>

                        <TextButton
                            onClick={() => setShowMoreYieldInfo(!showMoreYieldInfo)}
                            style={{ justifySelf: "right", color: "white" }}
                        >
                            Show {showMoreYieldInfo ? "Less" : "More"} Info
                        </TextButton>

                        {
                            showMoreYieldInfo &&
                                <div>
                                    Deposit liquidity into the pool and earn IFEX tokens every block. 
                                    The amount you earn is directly proportional to the amount you deposit into the pool.
                                    Happy farming!
                                </div>
                        }
                    </InfoBubble>
            }
        </div>
    );
};