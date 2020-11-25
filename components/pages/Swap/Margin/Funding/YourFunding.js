import { useContext } from "react";
import Skeleton from "react-loading-skeleton";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../../utils";
import { Card } from "../../../../core/Card";
import Text from "../../../../core/Text";
import { TextOption } from "../../../../core/TextOption";
import { TokenAndLogo } from "../../../../core/TokenAndLogo";
import { FundingContext } from "./FundingTab";

export const YourFunding = () => {
    const { selectedToken, account: _account } = useContext(FundingContext);
    const account = _account?.[selectedToken.address];

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, height: "fit-content", width: "100%" }}>
            <TextOption style={{ width: "fit-content" }} selected>
                Your Funding
            </TextOption>

            <Card style={{ height: "fit-content", width: "100%" }}>
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, }}>
                    <Text bold>Deposited Funding</Text>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                        <TokenAndLogo token={selectedToken}/>
                        {
                            !account || _account.isLoading ?
                                <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                : <Text secondary bold>{account.assetTokenDeposited.toFixed(4)} {selectedToken.symbol}</Text>
                        }
                    </div>
                </div>
            </Card>
        </div>
    );
};