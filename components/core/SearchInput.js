import styled from "styled-components";
import { Cross } from "./Cross";
import { useState } from "react";
import { Input } from "./Input";
import { PIXEL_SIZING } from "../../utils/constants";
import { SearchIcon } from "./SearchIcon";

export const SearchInput = ({ style, ...props }) => {
    return (
        <div style={{ position: "relative", ...style }}>
            <Input
                style={{ 
                    paddingRight: 44,
                    ...props.style,
                }}
                {...props}
            />

            <div style={{ position: "absolute", right: PIXEL_SIZING.small, top: "50%", transform: "translateY(-50%)" }}>
                {
                    props.value ? 
                        <Cross
                            style={{ height: PIXEL_SIZING.medium, }}
                            onClick={() => props.onChange({ target: { value: "" }})}
                        />
                    : 
                        <SearchIcon/>
                }
            </div>

        </div>
    );
};