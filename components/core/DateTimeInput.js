import { DateTimePicker } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { THEMES } from "../../context/Theme";
import { PIXEL_SIZING } from "../../utils/constants";

const materialTheme = createMuiTheme({
    overrides: {
        MuiPickersToolbar: {
            toolbar: {
                backgroundColor: THEMES.light.primary,
            },
        },
        MuiTabs: {
            scroller: {
                backgroundColor: THEMES.light.primary,
            },

            indicator: {
                backgroundColor: "white",
            }
        },
        MuiPickersDay: {
            day: {
                color: THEMES.light.primary,
            },
            daySelected: {
                backgroundColor: THEMES.light.primary,
            },
            dayDisabled: {
                color: THEMES.light.primary,
            },
            current: {
                color: THEMES.light.primary,
            },
        },
        MuiPickersModal: {
            dialogAction: {
                color: THEMES.light.primary,
            },
        },

        MuiButton: {
            textPrimary: {
                color: THEMES.light.primary,
            }
        },

        MuiPickersClock: {
            pin: {
                backgroundColor: THEMES.light.primary,
            },
        },
        MuiPickersClockPointer: {
            thumb: {
                borderColor:THEMES.light.primary,
            },
            pointer: {
                backgroundColor: THEMES.light.primary,
            }
        },

        MuiOutlinedInput: {
            root: {
                borderRadius: PIXEL_SIZING.miniscule,
            },

            notchedOutline: {
                borderColor: `${THEMES.light.highlight} !important`,
            },
        },
    },
});
  

export const DateTimeInput = ({ value, onChange }) => {
    return (
        <ThemeProvider theme={materialTheme}>
            <DateTimePicker
                inputVariant="outlined"
                value={value}
                onChange={onChange}
            />
        </ThemeProvider>
    );
}