/* Map Helper */

//确保颜色的值在 0-255 之间
function ensureColor(val) {
    return (val < 0 ? 0 : (val > 255 ? 255 : val));
}

export function toBMapPoints(arr){
    if(!arr || !arr.length){
        return [];
    } else {
        return arr.map(vx => new BMapGL.Point(vx[0], vx[1]));
    }
}

//获取路线的渐变色
export function getPolylineColorList(startColor, endColor, ...pointLength) {
    //颜色的十六进制整数，如颜色 “#ff7656” 则十六进制整数为 0xff7656
    if (startColor < 0 || endColor < 0 || !pointLength) {
        return [];
    }

    let colorCount = 0;
    for (let idx = 0; idx < pointLength.length; idx++) {
        pointLength[idx] = Math.min(128, pointLength[idx]);
        colorCount += pointLength[idx];
    }

    if (!colorCount || colorCount <= 1) {
        return [];
    }

    const startRGB = [
        (startColor & 0xFFFFFF) >> 16,
        (startColor & 0xFFFF) >> 8,
        (startColor & 0xFF)
    ];
    const endRGB = [
        (endColor & 0xFFFFFF) >> 16,
        (endColor & 0xFFFF) >> 8,
        (endColor & 0xFF)
    ];
    const stepRGB = [
        (endRGB[0] - startRGB[0]) / (colorCount - 1),
        (endRGB[1] - startRGB[1]) / (colorCount - 1),
        (endRGB[2] - startRGB[2]) / (colorCount - 1)
    ];
    const prefixs = ["#000000", "#00000", "#0000", "#000", "#00", "#0", "#"];
    const outputColors = [];

    for (let idx = 0; idx < colorCount; idx++) {
        let rgbHex = ((startRGB[0] << 16) + (startRGB[1] << 8) + (startRGB[2] << 0)).toString(16);

        outputColors.push(prefixs[rgbHex.length] + rgbHex);

        startRGB[0] = ensureColor(startRGB[0] + stepRGB[0]);
        startRGB[1] = ensureColor(startRGB[1] + stepRGB[1]);
        startRGB[2] = ensureColor(startRGB[2] + stepRGB[2]);
    }

    if (pointLength.length > 1) {
        let outputList = [];
        let startIndex = 0;
        for (const vx of pointLength) {
            outputList.push(outputColors.slice(startIndex, startIndex + vx));
            startIndex += vx;
        }
        return outputList;
    } else {
        return outputColors;
    }
}