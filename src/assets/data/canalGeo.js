/* 平陆运河路线 geoJSON，分为上段（沙坪河段）、下段（钦江段） */
const canalGeoJSON = {
    upperSection: [
        [109.07464281,22.64335071],
        [109.05075873,22.62001744],
        [109.03633529,22.61787001],
        [109.00720160,22.57299663],
        [108.98209610,22.54288687],
        [108.95063983,22.50294400],
        [108.93345224,22.43935823],
        [108.92290263,22.41097202],
        [108.92669430,22.39527728],
        [108.93653221,22.38528154],
        [108.94255131,22.35228259],
        [108.94722501,22.32670951],
        [108.93986428,22.32241260],
        [108.93959482,22.30728273],
        [108.93639611,22.29497105],
        [108.94761115,22.27907217],
        [108.95229065,22.27233445]
    ],
    lowerSection: [
        [108.95229065,22.27233445],
        [108.89381516,22.24323675],
        [108.81084999,22.16454407],
        [108.76702360,22.15801585],
        [108.76217389,22.14261667],
        [108.75406311,22.13691747],
        [108.72051819,22.10187627],
        [108.70709542,22.05435388],
        [108.65604407,22.01368458],
        [108.64225188,21.97002812],
        [108.62410475,21.93800466],
        [108.61230628,21.93833203],
        [108.60367057,21.92170721],
        [108.60808329,21.89313466],
        [108.63212225,21.88147788],
        [108.60343048,21.85945598],
        [108.54551054,21.76789685],
        [108.56933276,21.73510775],
        [108.58000469,21.73413780]
    ]
};

//不分段的运河单段数据
const canalSingleLine = [];

//运河沿途兴趣点
const canalPOIList = [
    {
        lngLat: [109.074643,22.643351],
        title: "平塘江入口",
        iconName1: "iconPingtangjiangEntrance",
        iconName2: "iconPingtangjiangEntranceWhite",
        iconAnchor: {x:0.866667,y:1.0}
    },
    {
        lngLat: [108.943913,22.449880],
        title: "马道枢纽",
        iconName1: "iconMadaoHub",
        iconName2: "iconMadaoHubWhite",
        iconAnchor: {x:0.166667,y:0.5}
    },
    {
        lngLat: [108.944580,22.323528],
        title: "企石枢纽",
        iconName1: "iconQishiHub",
        iconName2: "iconQishiHubWhite",
        iconAnchor: {x:0.833333,y:0.5}
    },
    {
        lngLat: [108.950503,22.280155],
        title: "陆屋镇",
        iconName1: "iconLuwuTown",
        iconName2: "iconLuwuTownWhite",
        iconAnchor: {x:0.166667,y:0.5}
    },
    {
        lngLat: [108.656038,22.002234],
        title: "青年枢纽",
        iconName1: "iconQingnianHub",
        iconName2: "iconQingnianHubWhite",
        iconAnchor: {x:0.166667,y:0.5}
    },
    {
        lngLat: [108.588925,21.732311],
        title: "钦州港",
        iconName1: "iconQinzhouPort",
        iconName2: "iconQinzhouPortWhite",
        iconAnchor: {x:0.133333,y:1.0}
    }
];

//获取运河的分段数据
export function getCanalGeoJSON(){
    return canalGeoJSON;
}

//合并数据成一条线段
export function combineCanalGeoJSON(){
    if(!canalSingleLine.length){
        //索引从 0 开始！！！
        for(let idx = 0; idx < canalGeoJSON.upperSection.length; idx++){
            canalSingleLine.push(canalGeoJSON.upperSection[idx]);
        }
        
        //索引从 1 开始！！！
        for(let idx = 1; idx < canalGeoJSON.lowerSection.length; idx++){
            canalSingleLine.push(canalGeoJSON.lowerSection[idx]);
        }
    }
    return canalSingleLine;
}

//上段的经纬度数量
export function getUpperSectionLength(){
    return canalGeoJSON.upperSection.length;
}

//获取运河沿途兴趣点
export function getCanalPOIList(){
    return canalPOIList;
}