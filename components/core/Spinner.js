import ScaleLoader from "react-spinners/ScaleLoader";
import BarLoader from "react-spinners/BarLoader";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../utils";

// Should be used in most cases
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

// Used only in specific cases where traditional spinner is too overwhelming
export const BarSpinner = props => {
    const theme = useContext(ThemeContext);

    return (
        <div {...props}>
            <BarLoader
                width={props.width}
                height={props.height ?? PIXEL_SIZING.small}
                loading={props.isLoading}
                color={props.invert ? theme.colors.invert : theme.colors.primary}
            />
        </div>
    )
};