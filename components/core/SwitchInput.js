import { useContext } from "react";
import Switch from "react-switch";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";
import { sizingToInt } from "../../utils/utils";

export const SwitchInput = ({ value, onChange }) => {
    const theme = useContext(ThemeContext);

    return (
        <Switch
            checked={value}
            onChange={onChange}
            onColor={theme.colors.positive}
            uncheckedIcon={false}
            checkedIcon={false}
            height={sizingToInt(PIXEL_SIZING.medium)}
            width={sizingToInt(PIXEL_SIZING.large)}
            offColor={theme.colors.highlight}
        />
    );
}