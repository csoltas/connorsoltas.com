// function loadHeader() {
//   // Load the header HTML
//   fetch(`../content/header-content.html`)
//     .then(response => response.text())
//     .then(html => {
//       document.getElementById('header-container').innerHTML = html;
//     });
// }

// function updateMainContainer() {
//   const header = document.querySelector("header");
//   const mainContainer = document.querySelector("main");
//   mainContainer.style.minHeight = `calc(100vh - ${header.offsetHeight}px)`;
// }

// function updateCarousel(carouselId, index) {
//   const slidesContainer = document.querySelector(`#${carouselId} .slides-container`);
//   const slideHeaders = document.querySelectorAll(`#${carouselId} .carousel-slide > h3 > a`);
//   const slideParagraphs = document.querySelectorAll(`#${carouselId} .carousel-slide > p`);
//   const translateXDistance = document.querySelector('main').offsetWidth + 160;

//   // Update carousel position
//   slidesContainer.style.transform = `translateX(-${index * translateXDistance}px)`;

//   // Remove active styling from all slide headers and paragraphs
//   slideHeaders.forEach((h) => h.classList.remove('active'));
//   slideParagraphs.forEach((p) => p.classList.remove('active'));

//   // Add active styling to the clicked header and its corresponding paragraph
//   slideHeaders[index].classList.add('active');
//   slideParagraphs[index].classList.add('active');

//   // Update the carousel controller text
//   const prevLink = document.querySelector(`#${carouselId} .prev-slide`);
//   const nextLink = document.querySelector(`#${carouselId} .next-slide`);
//   const currentSlideSpan = document.querySelector(`#${carouselId} .current-slide`);
//   currentSlideSpan.textContent = index + 1;

//   // Determine which arrow links should be active
//   prevLink.classList.toggle('enabled', index > 0);
//   nextLink.classList.toggle('enabled', index < slideHeaders.length - 1);

//   carouselIndices[carouselId] = index; // Update the global index
// }

// function updateCarouselMediaSlide(carouselId) {
//   const carouselMediaSlide = document.querySelector(`#${carouselId}-media > img`);
//   const carouselMediaAsset = carouselMedia[carouselId][carouselIndices[carouselId]];

//   console.log(carouselMediaAsset.width);

//   carouselMediaSlide.src = carouselMediaAsset.src;
//   carouselMediaSlide.width = carouselMediaAsset.width;
// }

// function addCarouselListeners(carouselId) {  
//   const slideHeaders = document.querySelectorAll(`#${carouselId} .carousel-slide > h3 > a`);
//   const prevLink = document.querySelector(`#${carouselId} .prev-slide`);
//   const nextLink = document.querySelector(`#${carouselId} .next-slide`);
//   // updateCarouselMediaSlide(carouselId); // initialize the carousel media

//   slideHeaders.forEach((header, index) => {
//     header.addEventListener('click', (e) => {
//       e.preventDefault();
//       updateCarousel(carouselId, index);
//       updateCarouselMediaSlide(carouselId);
//     })
//   });

//   prevLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     const currentCarouselIndex = carouselIndices[carouselId];
//     if (currentCarouselIndex > 0) {
//         updateCarousel(carouselId, currentCarouselIndex - 1);
//         updateCarouselMediaSlide(carouselId);
//     }
//   });

//   nextLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     const currentCarouselIndex = carouselIndices[carouselId];
//     if (currentCarouselIndex < slideHeaders.length - 1) {
//         updateCarousel(carouselId, currentCarouselIndex + 1);
//         updateCarouselMediaSlide(carouselId);
//     }
//   });
// }

// function loadPage(page) {
//   loadHeader();
//   updateMainContainer();
  
//   fetch(`../content/case-study-2-content.html`)
//     .then(response => response.text())
//     .then(html => {
//       document.getElementById('main-container').innerHTML = html;
//       // addCarouselListeners('carousel1');
//       // addCarouselListeners('carousel2');
//     });
// }

// Load the case study content
// loadPage('case-study-2');