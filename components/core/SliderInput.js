import { withStyles, } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import Tooltip from "@material-ui/core/Tooltip";
import { THEMES } from "../../context/Theme";

const StyledSlider = withStyles({
    root: {
        color: THEMES.light.primary,
    },
    thumb: {
        backgroundColor: "currentColor",
    },
})(Slider);

export const SliderInput = props => {
    return (
        <StyledSlider
            valueLabelDisplay="auto" 
            aria-label="slider"
            {...props}
        />
    );
};