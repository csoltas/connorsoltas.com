mapboxgl.accessToken = "pk.eyJ1IjoidWJlcmNhcnRvIiwiYSI6ImNqZG95YmM2aTByMjgycXFwbDQ1OTQ0M3oifQ.dVLqWkwIJWVRvAHvzES0Xg";
    
/**
 * WORKFLOW:
 *  1. Change data
 *    - Pull desired hexagon data using Python notebook: https://michelangelo-studio.uberinternal.com/session/44094e27-0672-4750-83a1-b31738a33b46/notebooks/earnings_heatmap.ipynb
 *    - Save hex data as JSON file and add that file to this directory
 *    - Edit data prop of hexLayer below
 *    - Edit city coordinates below to match the city that your new data is from
 *  2. Change data viz colors
 *    - Create new colormap using chroma.js
 *    - Edit getFillColor prop of hexLayer
 *    - Edit props of any additional data viz layers you've added
 *  3. Change base map stylesheet
 *    - Make design changes in designlabs/santurce.js (or similar file)
 *    - Run CartoInspector and log new stylesheet to the console
 *    - Copy/paste console output to new style.json file
 *    - Reference new style.json file in carto-heatmap-design.html
 **/

// Reusable params for SF screenshots
const screenshot_params = {
  center: [
    [9,[-122.2, 37.7]],
    [10,[-122.4, 37.7]],
    [11,[-122.4, 37.72]],
    [12,[-122.43, 37.78]],
    [15,[-122.39, 37.69]]
  ]
};

// Create the mapbox map with our stylesheet
const map = new mapboxgl.Map({
  container: document.getElementById('carto-heatmap-design'), // TODO: this needs be called AFTER case-study-content.html is loaded into the DOM
  style: './style-thematic-v4.json', // replace stylesheet here
  center: screenshot_params.center[2][1], // replace city coords here 
  zoom: screenshot_params.center[2][0],
  pitch: 0,
  preserveDrawingBuffer: true // needs to be true to allow PNG capture (see Mapbox GL JS docs)
});

// Create needed colormaps
const ephColormapDomain = [14,40]; //[20,44] //[26, 50] //[16.32,41.17]
const probColormapDomain = [0.5,1];
const ephColormapDomainNight = [37,27]; //[20,44] //[26, 50] //[16.32,41.17]
const surgeColormapDomain = [1,16];
const cmTest = chroma.scale('YlOrRd')
  .domain(ephColormapDomain);
const cmParv = chroma.scale([
  '#e7b200', 
  '#f83445', 
  '#7c3ec3', 
  '#141684'
]).domain(ephColormapDomain)
  .correctLightness();
const cmNYT = chroma.scale([
  '#F2DF91',
  '#F9C467',
  '#FFA83E',
  '#FF8B24',
  '#FD6A0B',
  '#F04F09',
  '#D8382E',
  '#C62833',
  '#AF1C43',
  '#8A1739',
  '#701547',
  '#4C0D3E'
]).mode('lch')
  .domain(ephColormapDomain);
const cmGray = chroma.scale()
  .mode('lch')
  .domain(ephColormapDomain);
const cmDemandHeatmapOld = chroma.scale([
  '#b1bbd9',
  '#a5b0d2',
  '#9aa6cb',
  '#8e9cc4',
  '#8391bc',
  '#7887b5',
  '#6d7dac',
  '#6373a4',
  '#596a9b',
  '#4f6092'
]).mode('lch')
.domain(ephColormapDomain);
const cmDemandHeatmapOldNight = chroma.scale([
  '#b1bbd9',
  '#a5b0d2',
  '#9aa6cb',
  '#8e9cc4',
  '#8391bc',
  '#7887b5',
  '#6d7dac',
  '#6373a4',
  '#596a9b',
  '#4f6092'
]).mode('lch')
.domain(ephColormapDomainNight);
const cmMariaCold = chroma.scale([
'#2F8A2E',
'#358235',
'#1E7C4B',
'#067464',
'#186B6A',
'#125D68',
'#104F65',
'#07425F',
'#04345F',
'#001F69',
'#130164',
'#1E015D'
]).mode('lch')
.domain(ephColormapDomain);
const cmMariaHotToCold = chroma.scale([
'#926E00',
'#986B05',
'#A56300',
'#B05A00',
'#BD4C07',
'#C74007',
'#D42320',
'#D42130',
'#D21D50',
'#CF2358',
'#C62981',
'#BD2A9F',
'#7C3EC3',
'#633495',
'#001F69',
'#130164'
]).mode('lch')
.domain(ephColormapDomain);
const cmViridis = chroma.scale('Viridis')
.domain(ephColormapDomain);
const cmInferno = chroma.scale([
  '#fcffa4',
  '#f7d13d',
  '#fb9b06',
  '#ed6925',
  '#cf4446',
  '#a52c60',
  '#781c6d',
  '#4a0c6b',
  '#1b0c41',
  '#000004'
])
.domain(ephColormapDomain);

// Create aliases for the needed deck classes
const {DeckGL, MapboxLayer, MapboxOverlay, H3HexagonLayer, PostProcessEffect} = deck;

// Create blur shader to be applied to deck instance
const blurEffect = new PostProcessEffect(triangleBlur, {
  radius: 20
});

// Create and style H3HexagonLayer from hex data provided
const hexLayer = new MapboxOverlay({
  interleaved: true,
  // effects: [blurEffect], // Not working yet
  layers: [
    new H3HexagonLayer({
      id: "deckgl-hexLayer",
      data: './10pm_pst.json', // replace hex data file here
      extruded: false,
      filled: true,
      stroked: false,
      getFillColor: d => cmNYT(d.eph_predict).rgb(), // use for EPH data
      // getFillColor: d => cmNYT(d.additive_surge).rgb(), // use for surge data
      getHexagon: d => d.hex_id,
      opacity: 0.1,
      beforeId: "building-shadow"  // the layer after the highest road layer
      // beforeId: "stream-intermittent-minor-CASING"  // the lowest water layer
    })
  ]   
});

// Add H3HexagonLayer to the mapbox map when the map loads
map.on('load', () => {
  map.addControl(hexLayer);
});