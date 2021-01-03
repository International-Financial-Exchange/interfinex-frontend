import { ethers, BigNumber } from "ethers";
import { formatUnits, parseEther } from "ethers/lib/utils";
import Big from "big.js";

export const sizingToInt = size => {
    return parseInt(size.slice(0, size.length - 2));
};

export const hasAllowance = allowance => allowance.gte(ethers.constants.MaxUint256.div(BigNumber.from('100')));

export const isZeroAddress = address => 
    address === ethers.constants.AddressZero;

Array.prototype.first = function() {
    return this[0] != null ? JSON.parse(JSON.stringify(this[0])) : this[0];
};

Array.prototype.last = function() {
    return this[this.length - 1] != null ? JSON.parse(JSON.stringify(this[this.length - 1])) : this[this.length - 1];
};

const hex2 = c => {
    c = Math.round(c);
    if (c < 0) c = 0;
    if (c > 255) c = 255;
    var s = c.toString(16);
    if (s.length < 2) s = "0" + s;
    return s;
}

const color = (r, g, b) => {
    return "#" + hex2(r) + hex2(g) + hex2(b);
}

export const shade = (col, light)=> {
    var r = parseInt(col.substr(1, 2), 16);
    var g = parseInt(col.substr(3, 2), 16);
    var b = parseInt(col.substr(5, 2), 16);
    if (light < 0) {
        r = (1 + light) * r;
        g = (1 + light) * g;
        b = (1 + light) * b;
    } else {
        r = (1 - light) * r + light * 255;
        g = (1 - light) * g + light * 255;
        b = (1 - light) * b + light * 255;
    }

    return color(r, g, b);
}

export const divOrZero = (bigNum1 = new Big(0), bigNum2 = new Big(0)) => {
    return (bigNum1.gt(0) && bigNum2.gt(0)) ? bigNum1.div(bigNum2) : new Big(0);
};

export const appendDecimalZeroes = (bigNum = new Big(0), decimals = 18) => {
    const strNum = bigNum.toFixed();
    const decimalsStr = strNum.split(".")[1]?.slice(0, decimals) ?? "";
    const requiredZeroes = new Array(decimals - decimalsStr.length).join("0");
    const paddedNum = strNum.split(".")[0]?.concat(".").concat(decimalsStr.concat(requiredZeroes));
    return paddedNum;
};

export const hexToRgba = (rawHex, alpha = 1) => {
    const hex = rawHex.slice(1);
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    console.log("hex", hex)
    console.log("rgba", `rgba(${[r, g, b].join()}, ${alpha})`);
    return `rgba(${[r, g, b].join()}, ${alpha})`;
}

export const tokenAmountToBig = (amount, token) => new Big(formatUnits(amount, token.decimals));

export const parseTokenAmount = (amount, token) => {
    const parsedAmount = appendDecimalZeroes(amount, token.decimals);
    return ethers.utils.parseUnits(parsedAmount, token.decimals).toString();
};

export const safeParseEther = amount => parseEther(parseFloat(amount).toFixed(18));

// DEPRECTED
// DO NOT USE THIS GOING FORWARD - REPLACE WITH tokenAmountToBig
export const humanizeTokenAmount = (amount, token) => {
    const strDecimalAmount = ethers.utils.formatUnits(amount, token.decimals);
    return parseFloat(strDecimalAmount.substr(0, strDecimalAmount.indexOf('.') + 6));
};

export const humanizeMultiplier = amount => parseFloat(ethers.utils.formatUnits(amount.toString(), 18));