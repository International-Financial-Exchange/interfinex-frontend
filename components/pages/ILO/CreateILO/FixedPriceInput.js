import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import { EthersContext } from "../../../../context/Ethers";
import { TokenPairContext } from "../../../../context/TokenPair";
import { PIXEL_SIZING } from "../../../../utils/constants";
import { SubmitContext } from "../../../../utils/hooks";
import { DateTimeInput } from "../../../core/DateTimeInput";
import { InputAndLabel } from "../../../core/InputAndLabel";
import Text from "../../../core/Text";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { TokenAndLogo } from "../../../core/TokenAndLogo";

export const FixedPriceInput = forwardRef((props, ref) => {
    const { isSubmitted } = useContext(SubmitContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const { assetToken = {}} = useContext(TokenPairContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [ethAmount, setEthAmount] = useState();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const tokensPerEth = assetTokenAmount / ethAmount;

    useImperativeHandle(ref, () => ({
        Submit: ({
            name, 
            description,
            percentageOfLiquidityToLock = 0,
            liquidityUnlockDate = 0,
            softCap = 0,
        }) => {
            console.log(name, description, percentageOfLiquidityToLock);
        },
    }));

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.large }}>
                <InputAndLabel>
                    <Text>Amount of Ethereum to raise</Text>
                    <TokenAmountInput
                        token={ETHEREUM_TOKEN}
                        value={ethAmount}
                        onChange={e => setEthAmount(e.target.value)}
                        isError={isSubmitted && !ethAmount}
                        errorMessage={"ETH amount must be greater than 0"}
                    />
                </InputAndLabel>
                
                <InputAndLabel>
                    <Text>Amount of {assetToken.name} to sell</Text>
                    <TokenAmountInput
                        token={assetToken}
                        value={assetTokenAmount}
                        onChange={e => setAssetTokenAmount(e.target.value)}
                        isError={isSubmitted && !assetTokenAmount}
                        errorMessage={`${assetToken.symbol} amount must be greater than 0`}
                    />
                </InputAndLabel>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.small }}>
                <TokenAndLogo token={ETHEREUM_TOKEN}>
                    <Text>1 {ETHEREUM_TOKEN.symbol}</Text>
                </TokenAndLogo>
                <Text>=</Text>
                <TokenAndLogo token={assetToken}>
                    <Text>{Number.isNaN(tokensPerEth) ? 0 : tokensPerEth} {assetToken.symbol}</Text>
                </TokenAndLogo>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.medium }}>
                <InputAndLabel>
                    <Text>Start Date</Text>
                    <DateTimeInput
                        value={startDate}
                        onChange={setStartDate}
                    />
                </InputAndLabel>

                <InputAndLabel>
                    <Text>End Date</Text>
                    <DateTimeInput
                        value={endDate}
                        onChange={setEndDate}
                        minDateMessage={"End date must be after start date"}
                        minDate={startDate}
                    />
                </InputAndLabel>
            </div>
        </>
    );
});