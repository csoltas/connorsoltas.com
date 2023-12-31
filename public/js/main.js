// Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiY3NvbHRhcyIsImEiOiJjbG5rcWl3NG0xMXFlMmxxaTBicm9qMDdkIn0.PY_DA5dycIZoG0rhiDyDjQ";

// Colormap domain and color scale
ephColormapDomain = [12.87,31.99];
cmNYT = chroma.scale([
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

// Map styles for toggle
let mapStyles = {
  before: '/santurce.json',
  after: '/style-thematic-v2.json'
};

// Map EPH datasets for slider
let ephDataSets = {
  1: '/eph_data_1_071922/10am_pst.json',
  2: '/eph_data_1_071922/11am_pst.json',
  3: '/eph_data_1_071922/12pm_pst.json',
  4: '/eph_data_1_071922/01pm_pst.json',
  5: '/eph_data_1_071922/02pm_pst.json',
  6: '/eph_data_1_071922/03pm_pst.json',
  7: '/eph_data_1_071922/04pm_pst.json',
  8: '/eph_data_1_071922/05pm_pst.json',
  9: '/eph_data_1_071922/06pm_pst.json',
  10: '/eph_data_1_071922/07pm_pst.json',
  11: '/eph_data_1_071922/08pm_pst.json',
  12: '/eph_data_1_071922/09pm_pst.json',
  13: '/eph_data_1_071922/10pm_pst.json',
  14: '/eph_data_1_071922/11pm_pst.json',
  15: '/eph_data_1_071922/12am+1_pst.json',
  16: '/eph_data_1_071922/01am+1_pst.json',
  17: '/eph_data_1_071922/02am+1_pst.json',
  18: '/eph_data_1_071922/03am+1_pst.json',
  19: '/eph_data_1_071922/04am+1_pst.json',
  20: '/eph_data_1_071922/05am+1_pst.json',
  21: '/eph_data_1_071922/06am+1_pst.json',
  22: '/eph_data_1_071922/07am+1_pst.json',
  23: '/eph_data_1_071922/08am+1_pst.json',
  24: '/eph_data_1_071922/09am+1_pst.json',
}

// Create aliases for the needed deck classes
const {DeckGL, MapboxLayer, MapboxOverlay, H3HexagonLayer, PostProcessEffect} = deck;

function updateHeader(url) {
  const header = document.getElementById('header-container');
  
  if (url === '/home') {
    header.style.display = 'none'; // Hide the header on the home page
  } else {
    header.style.removeProperty('display'); // Show the header on other pages

    // Load the header HTML
    fetch(`/content/header-content.html`)
      .then(response => response.text())
      .then(html => {
        header.innerHTML = html;

        // De-emphasize the current nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === url) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
      });
    }
}

function addMap() {
  
  // 1. Create the mapbox map with our stylesheet
  const map = new mapboxgl.Map({
    container: document.getElementById('carto-heatmap'), // NOTE: this needs be called AFTER case-study-content.html is loaded into the DOM
    style: '/style-thematic-v2.json', // replace stylesheet here
    center: [-122.2, 37.7],
    zoom: 9,
    pitch: 0,
    maxZoom: 13,
    minZoom: 8.5,
    maxBounds: [[-124.0237, 36.2207], [-120.7423, 38.9021]],
    preserveDrawingBuffer: true // needs to be true to allow PNG capture (see Mapbox GL JS docs)
  });

  // 2. Create and style H3HexagonLayer from hex data provided
  const hexLayer = new MapboxOverlay({
    interleaved: true,
    layers: [
      new H3HexagonLayer({
        id: "deckgl-hexLayer",
        data: '/10pm_pst.json', // replace hex data file here
        extruded: false,
        filled: true,
        stroked: false,
        getFillColor: d => cmNYT(d.eph_predict).rgb(), // use for EPH data
        getHexagon: d => d.hex_id,
        opacity: 0.2,
        beforeId: "building-shadow"  // the layer after the highest road layer
      })
    ]   
  });

  // 3. Add H3HexagonLayer to the mapbox map when the map loads
  map.on('load', () => {
    map.addControl(hexLayer);
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
  });

  // 4. Add listeners for controls
  const styleToggles = document.querySelectorAll('#map-style-toggles > input');
  const timeSlider = document.getElementById('map-data-slider-time');
  const colorSlider = document.getElementById('map-data-slider-color');
  const sliderLabels = document.querySelectorAll('.slider-label');
  const toggleLabels = document.querySelectorAll('#map-style-toggles > label');

  styleToggles.forEach((toggle, index) => {
    toggle.addEventListener('change', function () {
      map.setStyle(mapStyles[this.value]);
      toggleLabels.forEach(label => { label.classList.toggle('enabled'); });
      sliderLabels.forEach(label => { label.classList.toggle('disabled'); });
      timeSlider.toggleAttribute("disabled");
      colorSlider.toggleAttribute("disabled");
      hexLayer.setProps({
        layers: [
          new H3HexagonLayer({
            visible: this.value == 'after' ? true : false,
            id: "deckgl-hexLayer",
            data: '/10pm_pst.json', // replace hex data file here
            extruded: false,
            filled: true,
            stroked: false,
            getFillColor: d => cmNYT(d.eph_predict).rgb(), // use for EPH data
            getHexagon: d => d.hex_id,
            opacity: 0.2,
            beforeId: "building-shadow"  // the layer after the highest road layer
          })
        ]
      })
    })
  });

  timeSlider.addEventListener('input', function() {
    cmNYT.classes(colorSlider.value);
    hexLayer.setProps({
      layers: [
        new H3HexagonLayer({
          id: "deckgl-hexLayer",
          data: ephDataSets[this.value],
          extruded: false,
          filled: true,
          stroked: false,
          // getFillColor: d => cmNYT(d.eph_predict).rgb(),
          getFillColor: d => cmNYT(d.eph_predict).rgb(),
          getHexagon: d => d.hex_id,
          opacity: 0.2,
          beforeId: "building-shadow"
        })
      ]
    })
  });

  colorSlider.addEventListener('change', function() {
    cmNYT.classes(this.value);
    hexLayer.setProps({
      layers: [
        new H3HexagonLayer({
          id: "deckgl-hexLayer",
          data: ephDataSets[timeSlider.value],
          extruded: false,
          filled: true,
          stroked: false,
          getFillColor: d => cmNYT(d.eph_predict).rgb(),
          getHexagon: d => d.hex_id,
          opacity: 0.2,
          beforeId: "building-shadow"
        })
      ]
    })
  });
}

function loadPage(url) {  
  updateHeader(url);
  
  fetch(`/content${url}-content.html`)
    .then(response => response.text())
    .then(html => {

      // Add the HTML to the page and change the title
      document.getElementById('main-container').innerHTML = html; 
      document.title = pageTitles[url];
      
      // Add the map if we're on project 2
      if (url == "/work/2") { addMap(); }

      // Add listeners to handle navigation
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const dest = this.getAttribute('href');
          history.pushState({pageURL: dest}, "", dest);
          loadPage(dest);
        });
      }); 
    })
    .catch(error => {
      console.error('Error during fetch operation:', error);
    });
}

let path = window.location.pathname;

let routes = {
  "/": "/home",
  "/home": "/home",
  "/about": "/about",
  "/work": "/work",
  "/work/1": "/work/1",
  "/work/2": "/work/2",
  "/work/3": "/work/3",
  "/work/4": "/work/4" 
};

let pageTitles = {
  "/home": "Connor Soltas",
  "/about": "Connor Soltas - About",
  "/work": "Connor Soltas - Work",
  "/work/1": "Connor Soltas - Building a prototyping tool to enable new ideas",
  "/work/2": "Connor Soltas - Vision-setting and vision-enabling",
  "/work/3": "Connor Soltas - Rapid results on an aggressive timeline",
  "/work/4": "Connor Soltas - What does pricing do for users?",
  "/error": "Connor Soltas - page not found"
}

// Ensure the initial load is properly represented in browser history
if (!history.state) {
  const initialPageURL = routes[path];
  history.replaceState({ pageURL: initialPageURL }, '', initialPageURL);
}

// Actually do the initial page load (with error handling)
if (routes[path]) {
  loadPage(routes[path]);
} else {
  history.pushState({ pageURL: "/error" }, "", "/error");
  loadPage("/error");
}

// When back or forward button is clicked
window.addEventListener('popstate', function(event) {
  if(event.state) {
    loadPage(event.state.pageURL);
  }
});