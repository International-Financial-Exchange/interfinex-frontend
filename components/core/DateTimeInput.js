import { DateTimePicker } from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { THEMES } from "../../context/Theme";
import { PIXEL_SIZING } from "../../utils/constants";

const materialTheme = createMuiTheme({
    overrides: {
        MuiPickersToolbar: {
            toolbar: {
                backgroundColor: "#2A9D8F",
            },
        },
        MuiTabs: {
            scroller: {
                backgroundColor: "#2A9D8F",
            },

            indicator: {
                backgroundColor: "white",
            }
        },
        MuiPickersDay: {
            day: {
                color: "#2A9D8F",
            },
            daySelected: {
                backgroundColor: "#2A9D8F",
            },
            dayDisabled: {
                color: "#2A9D8F",
            },
            current: {
                color: "#2A9D8F",
            },
        },
        MuiPickersModal: {
            dialogAction: {
                color: "#2A9D8F",
            },
        },

        MuiButton: {
            textPrimary: {
                color: "#2A9D8F",
            }
        },

        MuiPickersClock: {
            pin: {
                backgroundColor: "#2A9D8F",
            },
        },
        MuiPickersClockPointer: {
            thumb: {
                borderColor:"#2A9D8F",
            },
            pointer: {
                backgroundColor: "#2A9D8F",
            }
        },

        MuiOutlinedInput: {
            root: {
                borderRadius: PIXEL_SIZING.miniscule,
            },
        },

        MuiFormHelperText: {
            contained: {
                margin: "0 !important",
            },
            error: {
                root: {
                    color: "#f00f30",
                }
            },
            root: {
                fontSize: "",
                fontFamily: ""
            }
        }
    },
});
  

export const DateTimeInput = ({ value, onChange, ...props }) => {
    return (
        <ThemeProvider theme={materialTheme}>
            <DateTimePicker
                {...props}
                showTodayButton
                inputVariant="outlined"
                value={value}
                onChange={onChange}
            />
        </ThemeProvider>
    );
}