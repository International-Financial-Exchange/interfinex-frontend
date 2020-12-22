import Countdown from "react-countdown";
import Text from "./Text";

export const StyledCountdown = ({ date, ...props }) => {
    return (
        <Countdown
            date={date}
            renderer={({ days, hours, minutes, seconds, completed }) => {
                return <Text {...props}>
                    {
                        completed ? 
                            "0d 0h 0m 0s" 
                            : `${days}d ${hours}h ${minutes}m ${seconds}s`
                    }
                </Text>;
            }}
        />
    );
};