import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext } from "../../../../context/Notifications";
import { TokenPairContext } from "../../../../context/TokenPair";
import { PIXEL_SIZING, TIMEFRAMES } from "../../../../utils/constants";
import { SubmitContext } from "../../../../utils/hooks";
import { parseTokenAmount } from "../../../../utils/utils";
import { DateTimeInput } from "../../../core/DateTimeInput";
import { InputAndLabel } from "../../../core/InputAndLabel";
import Text from "../../../core/Text";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { TokenAndLogo } from "../../../core/TokenAndLogo";

export const FixedPriceInput = forwardRef((props, ref) => {
    const { isSubmitted } = useContext(SubmitContext);
    const { ETHEREUM_TOKEN, contracts: { ILOFactory }} = useContext(EthersContext);
    const { assetToken = {}} = useContext(TokenPairContext);
    const { addTransactionNotification } = useContext(NotificationsContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [ethAmount, setEthAmount] = useState();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + TIMEFRAMES["1d"]));

    const tokensPerEth = assetTokenAmount / ethAmount;

    const validate = (name, description) => {
        const validations = {
            name: name && name.length <= 60,
            description: description && description.length <= 250,
            ethAmount: ethAmount > 0,
            assetTokenAmount: assetTokenAmount > 0,
            timerange: startDate.getTime() < endDate.getTime(),
        };

        return Object.values(validations).every(v => v);
    };

    useImperativeHandle(ref, () => ({
        Submit: async (approveIloFactory, {
            name, 
            description,
            percentageOfLiquidityToLock = 0,
            liquidityUnlockDate = 0,
            softCap = 0,
        }) => {
            if (!validate(name, description)) return Promise.reject("Invalid inputs");

            await approveIloFactory();
            await addTransactionNotification({
                content: `Create Fixed Price ILO for ${assetToken.name}`,
                transactionPromise: ILOFactory.createFixedPriceILO(
                    assetToken.address,
                    parseTokenAmount(assetTokenAmount, assetToken),
                    parseTokenAmount(tokensPerEth, assetToken),
                    Math.floor(startDate.getTime() / 1000),
                    Math.floor(endDate.getTime() / 1000),
                    parseTokenAmount(softCap, ETHEREUM_TOKEN),
                    percentageOfLiquidityToLock,
                    liquidityUnlockDate ? Math.floor(liquidityUnlockDate.getTime() / 1000) : 0,
                    name,
                    description,
                    { gasLimit: 900_000 },         
                )
            });
        },
    }));

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.medium }}>
                <InputAndLabel>
                    <Text>Amount of ETH to raise</Text>
                    <TokenAmountInput
                        token={ETHEREUM_TOKEN}
                        value={ethAmount}
                        onChange={e => setEthAmount(e.target.value)}
                        isError={isSubmitted && !ethAmount}
                        errorMessage={"ETH amount must be greater than 0"}
                    />
                </InputAndLabel>
                
                <InputAndLabel>
                    <Text>Amount of {assetToken.symbol} to sell</Text>
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