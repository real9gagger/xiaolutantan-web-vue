/* Map Helper */

const MAP_X_PI = (Math.PI * 3000 / 180); //角度转弧度后 乘以 三千

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

//百度坐标系 (BD-09) 转 火星坐标系 (GCJ-02)
export function bd09ToGCJ02(pt) {  
    let xx = pt.lng - 0.0065;
    let yy = pt.lat - 0.0060;
    let zz = Math.sqrt(xx * xx + yy * yy) - 0.00002 * Math.sin(yy * MAP_X_PI);
    let theta = Math.atan2(yy, xx) - 0.000003 * Math.cos(xx * MAP_X_PI);
    let g2_lnn = zz * Math.cos(theta);
    let g2_lat = zz * Math.sin(theta);
    return [g2_lnn, g2_lat];
}

//火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 将 GCJ-02 坐标转换成 BD-09 坐标
export function gcj02ToBD09(lnglat){
    let xx = lnglat[0];
    let yy = lnglat[1];
    let zz = Math.sqrt(xx * xx + yy * yy) + 0.00002 * Math.sin(yy * MAP_X_PI);
    let theta = Math.atan2(yy, xx) + 0.000003 * Math.cos(xx * MAP_X_PI);
    let tempLng = zz * Math.cos(theta) + 0.0065;
    let tempLat = zz * Math.sin(theta) + 0.0060;
    return [tempLng, tempLat];
}

//火星坐标系 (GCJ-02) 转百度地图经纬度点
export function gcj02ToMapPoint(lnglat){
    const ll = gcj02ToBD09(lnglat);
    return (new BMapGL.Point(ll[0], ll[1]));
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


//获取一组经纬度中的西南角和东北角经纬度
export function getLnglatViewPort(lnglats){
    if(!lnglats || !lnglats.length){
        return [];
    }
    
    let minlng = 360;
    let minlat = 360;
    let maxlng = -360;
    let maxlat = -360;
    
    for(const pp of lnglats){
    	if(pp[0] < minlng) minlng = pp[0];
    	else if(pp[0] > maxlng) maxlng = pp[0];
        
        if(pp[1] < minlat) minlat = pp[1];
    	else if(pp[1] > maxlat) maxlat = pp[1];
    }
    
    return [
        [minlng, minlat],
        [maxlng, maxlat]
    ];
}