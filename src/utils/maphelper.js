/* Map Helper */

const MAP_X_PI = (Math.PI * 3000 / 180); //角度转弧度后 乘以 三千

//确保颜色的值在 0-255 之间
function ensureColor(val) {
    return (val < 0 ? 0 : (val > 255 ? 255 : val));
}

//计算两点之间距离。单位：米
function getDistanceBetween(lat1, lng1, lat2, lng2) {
    if(!lat1 || !lng1 || !lat2 || !lng2){
        return -1;
    }
    
	var EARTH_RADIUS = 2 * 6378245.0; //地球直径，单位：米
	var radLat1 = (lat1 * Math.PI / 180.0); //角度转成弧度
	var radLat2 = (lat2 * Math.PI / 180.0);
	var aaaa = (radLat1 - radLat2) / 2;
	var bbbb = ((lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0)) / 2;
	var cccc = Math.asin(Math.sqrt(Math.pow(Math.sin(aaaa), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(bbbb), 2)));
	
	return Math.round(cccc * EARTH_RADIUS);
}

//转纬度专用，参见：https://www.jianshu.com/p/557153c254b7
function transformLat(lng, lat) {
    let ret = 0;
    ret += (-100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng)));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

//转经度专用，参见：https://www.jianshu.com/p/557153c254b7
function transformLng(lng, lat) {
    let ret = 0;
    ret += (300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng)));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
}

//geojson 转百度坐标系
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

//GCJ-02 转 WGS-84，参见：https://www.jianshu.com/p/557153c254b7
export function gcj02ToWGS84(lnglat){
    let lng = lnglat[0];
    let lat = lnglat[1];
    let eee = 0.00669342162296594323; // 扁率
    let rrr = 6378245.0; //地球半径
    let dlat = transformLat(lng - 105.0, lat - 35.0);
    let dlng = transformLng(lng - 105.0, lat - 35.0);
    let radlat = lat / 180.0 * Math.PI;
    let magic = 1- eee * Math.pow(Math.sin(radlat), 2);
    let sqrtmagic = Math.sqrt(magic);
    let mglng = lng + (dlng * 180.0) / (rrr / sqrtmagic * Math.cos(radlat) * Math.PI);
    let mglat = lat + (dlat * 180.0) / ((rrr * (1 - eee)) / (magic * sqrtmagic) * Math.PI);
    
    return [lng * 2 - mglng, lat * 2 - mglat];
}

//BD-09 转 WGS-84，参见：https://www.jianshu.com/p/557153c254b7
export function bd09ToWGS84(pt){
    return gcj02ToWGS84(bd09ToGCJ02(pt));
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

//获取比较友好的距离，即带单位的距离信息，而不是一个纯数字
export function getFriendlyDistance(p1, p2){
    if(!p1 || !p2){
        return "1au"; //错误数据！一个天文单位
    }
    
    const dis = getDistanceBetween(p1.lat, p1.lng, p2.lat, p2.lng);
    if(dis < 0){
        return "0mm"; //错误数据！
    } else if(dis < 1000){
        return (dis.toFixed(0) + "m"); //小于一千米
    } else if(dis < 100000){
        return ((dis / 1000).toFixed(1) + "km");//保留一位小数
    } else {
        return ((dis / 1000).toFixed(0) + "km");//大于等于100公里，保留0位小数
    }
}

//添加地图自定义标记
export function myMarkerFlag(bdmap){
    if(!bdmap){
        return;
    }
    
    let isOpened = false;
    let eventListeners = {};
    let defCursor = null;
    let followLabel = null;
    let flagNth = 0;
    let timerID = 0;
    
    const ADD_FLAG_EVENT_NAME = "add-marker-flag";
    const CLICK_FLAG_EVENT_NAME = "click-marker-flag";
    const CLICK_LABEL_EVENT_NAME = "click-label-text";
    
    const startDrawFlag = function(evt){
        flagNth++;

        const lbl = new BMapGL.Label(`<span style="margin-right:5px" title="点击可编辑文本">标记${flagNth}</span><img alt="X" title="移除" src="images/marker_close_btn.gif" style="cursor:pointer;width:12px;height:12px" />`, {
            offset: new BMapGL.Size(-1, -26),
            enableMassClear: true,
            labelID: flagNth
        });
        const ico = new BMapGL.Icon("images/marker_flag_red.png", new BMapGL.Size(25, 25), {
            anchor: new BMapGL.Size(12, 25)
        });
        const mkr = new BMapGL.Marker(evt.latlng, {
            enableDragging: true,
            icon: ico,
            draggingCursor: "move",
            title: "按住可拖动标记"
        });
        
        lbl.setStyle({
            display: "inline-flex",
            alignItems: "center",
            transform: "translate(-50%, -100%)",
            padding: "2px 5px",
            cursor: "text"
        });
        lbl.addEventListener("click", function(exo){
            if(!exo.domEvent){
                return;
            }
            
            if(exo.domEvent.target.tagName === "IMG"){
                exo.target.map.removeOverlay(exo.target);
                exo.target.map.removeOverlay(exo.target._marker);
            } else {
                followLabel?.hide();
                fireEvent(CLICK_LABEL_EVENT_NAME, exo.target);
            }
        });
        
        mkr.setLabel(lbl);
        mkr.addEventListener("click", function(exo){
            //不是点击进来的，则移除标记！
            if(!exo.target){
                //这个 this 指向 mkr
                return !this.map.removeOverlay(this);
            }
            
            fireEvent(CLICK_FLAG_EVENT_NAME, exo.target);
        });
        
        bdmap.addOverlay(mkr);
        fireEvent(ADD_FLAG_EVENT_NAME, mkr);
    };
    
    const onAdd = function(evt){
        if(!isOpened){
            return;
        }
        
        if(evt.target.id === "mask"){//点击地图覆盖物才可以添加标记
            clearTimeout(timerID);
            timerID = setTimeout(startDrawFlag, 150, evt);
        }
    };
    
    const onMove = function(evt){
        if(!isOpened){
            return;
        }

        if(!followLabel.isVisible()){
            followLabel.show();
        }
        followLabel.setPosition(evt.latlng);
    };
    
    const fireEvent = function(event, args){
        if(eventListeners[event]?.length){
            const eeee = {
                currentTarget: null,
                returnValue: true,
                target: args,
                type: event
            };
            for(const listener of eventListeners[event]){
                listener(eeee);
            }
        }
    };
    
    /* ================ 开放的函数 ================ */
    
    const onOpen = function(){
        if(isOpened){
            return;
        }
        
        defCursor = bdmap.getDefaultCursor();
        followLabel = new BMapGL.Label("单击添加标记，双击结束", { offset: new BMapGL.Size(8, 8) });
        followLabel.hide();
        followLabel.setStyle({
            backgroundColor: "#fffbcc",
            border: "1px solid #e1e1e1",
            padding: "5px",
            borderRadius: "2px",
            color: "#703a04"
        });
        followLabel.setZIndex(8);
        
        bdmap.addEventListener("click", onAdd);
        bdmap.addEventListener("dblclick", onClose);
        bdmap.addEventListener("mousemove", onMove);
        bdmap.setDefaultCursor("crosshair");
        bdmap.disableDoubleClickZoom(); //关闭双击缩小
        bdmap.addOverlay(followLabel);
        
        isOpened = true;
    };
    
    const onClose = function(evt){
        if(!isOpened){
            return;
        }
        
        clearTimeout(timerID);
        
        if(evt?.domEvent){
            evt.domEvent.preventDefault();
            evt.domEvent.stopPropagation();
            evt.domEvent.stopImmediatePropagation();
        }
        
        bdmap.removeEventListener("click", onAdd);
        bdmap.removeEventListener("dblclick", onClose);
        bdmap.removeEventListener("mousemove", onMove);
        bdmap.setDefaultCursor(defCursor);
        bdmap.enableDoubleClickZoom(); //开启双击缩小
        bdmap.removeOverlay(followLabel);
        
        followLabel.destroy();
        followLabel = null;
        defCursor = null;
        isOpened = false;
        
        if(evt === true){
            flagNth = 0;
        }
    };
    
    const addEvent = function(event, listener) {
        if((typeof event === "string") && (typeof listener === "function")){
            if(!eventListeners[event]){
                eventListeners[event] = [];
            }
            eventListeners[event].push(listener);
        }
    };
    
    const removeEvent = function(event, listener) {
        if(eventListeners[event]?.length){
            if(!listener){
                eventListeners[event].splice(0);
            } else {
                const idx = eventListeners[event].findIndex(vx => vx===listener);
                if(idx >= 0){
                    eventListeners[event].splice(idx, 1);
                }
            }
        }
    };
    
    const clearAll = function(){
        onClose(true);
        
        for(const key in eventListeners){
            delete eventListeners[key];
        }
    };
    
    this.open = onOpen;
    this.close = onClose;
    this.clear = clearAll;
    this.addEventListener = addEvent;
    this.removeEventListener = removeEvent;
    
    return this;
}