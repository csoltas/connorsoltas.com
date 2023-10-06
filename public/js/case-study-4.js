// Global index to track the active carousel slides
let carouselIndices = {
  carousel1: 0,
  carousel2: 0
}; 

// Global table of carousel images
let carouselMedia = {
  carousel1: [
    {
      src: "../img/statusquo.jpg",
      width: 375,
      // height: auto,
    },
    {
      src: "../img/figmahexgrid.png",
      width: 878,
      // height: 373,
    },
    {
      src: "../img/concept.png",
      width: 498,
    }
  ],
  carousel2: [
    // same structure as carousel1
  ],
  // add additional carousels if needed
}

// Global variables for Mapbox map
mapboxgl.accessToken = "pk.eyJ1IjoidWJlcmNhcnRvIiwiYSI6ImNqZG95YmM2aTByMjgycXFwbDQ1OTQ0M3oifQ.dVLqWkwIJWVRvAHvzES0Xg";
screenshot_params = {
  center: [
    [9,[-122.2, 37.7]],
    [10,[-122.4, 37.7]],
    [11,[-122.4, 37.72]],
    [12,[-122.43, 37.78]],
    [15,[-122.39, 37.69]]
  ]
};
ephColormapDomain = [14,40];
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
const {DeckGL, MapboxLayer, MapboxOverlay, H3HexagonLayer, PostProcessEffect} = deck; // Create aliases for the needed deck classes

function loadHeader() {
  // Load the header HTML
  fetch(`../content/header-content.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('header-container').innerHTML = html;
    });
}

function updateMainContainer() {
  const header = document.querySelector("header");
  const mainContainer = document.querySelector("main");
  mainContainer.style.minHeight = `calc(100vh - ${header.offsetHeight}px)`;
}

function updateCarousel(carouselId, index) {
  const slidesContainer = document.querySelector(`#${carouselId} .slides-container`);
  const slideHeaders = document.querySelectorAll(`#${carouselId} .carousel-slide > h3 > a`);
  const slideParagraphs = document.querySelectorAll(`#${carouselId} .carousel-slide > p`);
  const translateXDistance = document.querySelector('main').offsetWidth + 160;

  // Update carousel position
  slidesContainer.style.transform = `translateX(-${index * translateXDistance}px)`;

  // Remove active styling from all slide headers and paragraphs
  slideHeaders.forEach((h) => h.classList.remove('active'));
  slideParagraphs.forEach((p) => p.classList.remove('active'));

  // Add active styling to the clicked header and its corresponding paragraph
  slideHeaders[index].classList.add('active');
  slideParagraphs[index].classList.add('active');

  // Update the carousel controller text
  const prevLink = document.querySelector(`#${carouselId} .prev-slide`);
  const nextLink = document.querySelector(`#${carouselId} .next-slide`);
  const currentSlideSpan = document.querySelector(`#${carouselId} .current-slide`);
  currentSlideSpan.textContent = index + 1;

  // Determine which arrow links should be active
  prevLink.classList.toggle('enabled', index > 0);
  nextLink.classList.toggle('enabled', index < slideHeaders.length - 1);

  carouselIndices[carouselId] = index; // Update the global index
}

function updateCarouselMediaSlide(carouselId) {
  const carouselMediaSlide = document.querySelector(`#${carouselId}-media > img`);
  const carouselMediaAsset = carouselMedia[carouselId][carouselIndices[carouselId]];

  console.log(carouselMediaAsset.width);

  carouselMediaSlide.src = carouselMediaAsset.src;
  carouselMediaSlide.width = carouselMediaAsset.width;
}

function addCarouselListeners(carouselId) {  
  const slideHeaders = document.querySelectorAll(`#${carouselId} .carousel-slide > h3 > a`);
  const prevLink = document.querySelector(`#${carouselId} .prev-slide`);
  const nextLink = document.querySelector(`#${carouselId} .next-slide`);
  // updateCarouselMediaSlide(carouselId); // initialize the carousel media

  slideHeaders.forEach((header, index) => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      updateCarousel(carouselId, index);
      updateCarouselMediaSlide(carouselId);
    })
  });

  prevLink.addEventListener('click', (e) => {
    e.preventDefault();
    const currentCarouselIndex = carouselIndices[carouselId];
    if (currentCarouselIndex > 0) {
        updateCarousel(carouselId, currentCarouselIndex - 1);
        updateCarouselMediaSlide(carouselId);
    }
  });

  nextLink.addEventListener('click', (e) => {
    e.preventDefault();
    const currentCarouselIndex = carouselIndices[carouselId];
    if (currentCarouselIndex < slideHeaders.length - 1) {
        updateCarousel(carouselId, currentCarouselIndex + 1);
        updateCarouselMediaSlide(carouselId);
    }
  });
}

function addMap() {
  
  // 1. Create the mapbox map with our stylesheet
  const map = new mapboxgl.Map({
    container: document.getElementById('carto-heatmap'), // TODO: this needs be called AFTER case-study-content.html is loaded into the DOM
    style: '../style-thematic-v2.json', // replace stylesheet here
    center: screenshot_params.center[0][1], // replace city coords here 
    zoom: screenshot_params.center[0][0],
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
        data: '../10pm_pst.json', // replace hex data file here
        extruded: false,
        filled: true,
        stroked: false,
        getFillColor: d => cmNYT(d.eph_predict).rgb(), // use for EPH data
        getHexagon: d => d.hex_id,
        opacity: 0.1,
        beforeId: "building-shadow"  // the layer after the highest road layer
      })
    ]   
  });

  // 3. Add H3HexagonLayer to the mapbox map when the map loads
  map.on('load', () => {
    map.addControl(hexLayer);
  });
}

function loadPage(page) {
  loadHeader();
  updateMainContainer();
  
  fetch(`../content/case-study-4-content.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('main-container').innerHTML = html;
      // addCarouselListeners('carousel1');
      // addCarouselListeners('carousel2');
      addMap();
    });
}

// Load the case study content
loadPage('case-study-4');