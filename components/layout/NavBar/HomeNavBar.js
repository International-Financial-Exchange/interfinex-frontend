import Text from "../../core/Text";
import Link from "next/link";
import { Button } from "../../core/Button";
import Span from "../../core/Span";
import { PIXEL_SIZING } from "../../../utils/constants";

export default props => {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", }}>
            <div 
                style={{ 
                    display: "grid", 
                    gridTemplateColumns: "auto 1fr", 
                    alignItems: "center",
                    width: "fit-content", 
                    columnGap: PIXEL_SIZING.small 
                }}
            >
                <img
                    height={20}
                    src={"/logo.png"}
                />
                <Text bold>v0.9 Beta</Text>
                {/* <Text>
                    Total Invested: <Span bold>$183.76 million</Span>
                </Text>

                <Text>
                    Total 24h Volume: <Span bold>$1.43 billion</Span>
                </Text> */}
            </div>

            <div>
                <Link href={"/app/swap"}>
                    <Button>
                        Go to App
                    </Button>
                </Link>
            </div>
        </div>
    );
};