import ScaleLoader from "react-spinners/ScaleLoader";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export const Spinner = props => {
    const theme = useContext(ThemeContext);

    return (
        <div {...props}>
            <ScaleLoader
                width={props.width}
                height={props.height ?? PIXEL_SIZING.medium}
                loading={props.isLoading}
                color={props.invert ? theme.colors.invert : theme.colors.primary}
            />
        </div>
    )
}