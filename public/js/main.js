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
    preserveDrawingBuffer: true, // needs to be true to allow PNG capture (see Mapbox GL JS docs)
    useWebGl2: true,
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
      // sliderLabels.forEach(label => { label.classList.toggle('disabled'); });
      // timeSlider.toggleAttribute("disabled");
      // colorSlider.toggleAttribute("disabled");
      hexLayer.setProps({
        layers: [
          new H3HexagonLayer({
            // visible: this.value == 'after' ? true : false,
            visible: true,
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

function calculateNavOffset(url) {
  if (url != "/home") {
    const nav = document.querySelector('div.links');
    const navWidth = nav.offsetWidth;
    const link1Width = nav.children[0].offsetWidth;
    const link2Width = nav.children[1].offsetWidth; // This value is not used
    const link3Width = nav.children[2].offsetWidth;
    switch(url) {
      case "/about":
        return (navWidth - link1Width)/2;
      case "/work":
      case "/work/1":
      case "/work/2":
      case "/work/3":
      case "/work/4":
      case "/work/5":
        return (link3Width - link1Width)/2;
      case "/contact":
        return (link3Width - navWidth)/2;
    }
  }
}

async function handleNavEvent(e) {
  e.preventDefault();

  // Set nav destination
  const src = window.location.pathname;
  const dest = this.getAttribute('href');
  history.pushState({pageURL: dest}, "", dest);

  // Get state data for pre-fetch animation
  const prefetchStart = await Flip.getState(".animate-prefetch", {props: 'opacity, color'});

  // Update the DOM to pre-fetch final state
  const prefetchElements = document.querySelectorAll('.animate-prefetch');
  const nav = document.getElementById('nav');
  const flipParams = {
    // Todo: A static object containing params for each distinct animation "paths" - i.e. each pair of (src, dest) pages
    // prefetch "animate-to" class (leaving-home, returning-home, leaving)
    // prefetch duration
    // postfetch "animate-from" class (entering, ...more?)
    // postfetch duration
    // new navOffset
  }

  let flipDuration = 1
    onEnterDuration = 0.5;
  if (src == "/home") {
    prefetchElements.forEach(element => element.classList.add('leaving-home'));
    nav.style.left = calculateNavOffset(dest) + "px";
    flipDuration = 0.8;
    onEnterDuration = 0.5;
  } else if (dest == "/home") {
    prefetchElements.forEach(element => element.classList.add('returning-home'));
    nav.style.left = "0px";
    flipDuration = 0.8;
    onEnterDuration = 0;
  } else {
    prefetchElements.forEach(element => element.classList.add('leaving'));
    nav.style.left = calculateNavOffset(dest) + "px";
    flipDuration = 0.3;
    onEnterDuration = 0.5;
  }

  // Perform the pre-fetch animation
  await Flip.from(prefetchStart, {
    duration: flipDuration,
    ease: 'power2.inOut',
    nested: true,
  });

  // Get state data for post-fetch animation
  const postfetchStart = await Flip.getState(".animate-postfetch", {props: 'opacity, color'});

  // Fetch new content and update the DOM with it
  await loadPage(dest);

  // Peform the post-fetch animation
  Flip.from(postfetchStart, {
    targets: ".animate-postfetch",
    duration: 0.3,
    ease: 'power2.inOut',
    onEnter: elements => gsap.from(elements, {opacity:0, duration: onEnterDuration}),
  });
}

function handleIntrapageEvent(e) {
  e.preventDefault();
  if (this.id == "article-number") {
    console.log('article number: ', this.innerHTML);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }
}

function showNavLinksOnHover() {
  document.querySelectorAll('header .nav-link').forEach(el => el.style.opacity = "1");
}

function hideNavLinksOnHover() {
  if (!Flip.isFlipping("#nav"))
    document.querySelectorAll('header #nav .nav-link:not(.current)').forEach(el => el.style.opacity = "0");
}

async function loadPage(url) {  
  
  return fetch(`/content${url}-content.html`)
    
    // Add the HTML to the page and change the title
    .then(response => response.text())
    .then(html => {
      document.getElementById('content-container').innerHTML = html;
      document.querySelector('div.links').style.left = calculateNavOffset(url) + "px";
      document.title = pageTitles[url];
    }).catch(error => {
      console.error('Error during fetch operation:', error);
    })
    
    // Add interactivity and perform animations
    .then(() => {
      
      // Add the map if we're on project 2
      if (url == "/work/3") { addMap(); }

      // Add listeners to handle navigation and perform animations
      const header = document.querySelector('header');
      const navLinks = document.querySelectorAll('a:not(.intrapage)');
      const intrapageLinks = document.querySelectorAll('a.intrapage');
      console.log("intrapage links: ", intrapageLinks);
      header.addEventListener('mouseenter', showNavLinksOnHover);
      header.addEventListener('mouseleave', hideNavLinksOnHover);
      navLinks.forEach(link => link.addEventListener('click', handleNavEvent));
      intrapageLinks.forEach(link => link.addEventListener('click', handleIntrapageEvent));
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
  "/work/4": "/work/4",
  "/work/5": "/work/5",
  "/contact": "/contact"
};

let pageTitles = {
  "/home": "Connor Soltas",
  "/about": "Connor Soltas - About",
  "/work": "Connor Soltas - Work",
  "/work/1": "Connor Soltas - Building a prototyping tool to enable new ideas",
  "/work/2": "Connor Soltas - Building a prototyping tool to enable new ideas",
  "/work/3": "Connor Soltas - Vision-setting and vision-enabling",
  "/work/4": "Connor Soltas - Rapid results on an aggressive timeline",
  "/work/5": "Connor Soltas - What does pricing do for users?",
  "/contact": "Connor Soltas - Contact",
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

// On project pages, adjust the height of the header as the user scrolls
window.addEventListener('scroll', () => {
  var dottedLine = document.getElementById('connector-header-to-main');
  const articleNumber = document.getElementById('article-number');
  var newHeight = 128 - window.scrollY;
  if (newHeight <= 24) {
    articleNumber.style.display = 'block';
    dottedLine.style.height = '8px';
  } else {
    articleNumber.style.display = 'none';
    dottedLine.style.height = newHeight + 'px';
  }
});