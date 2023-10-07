function updateCSSandJS(page) {
  
  // Remove any existing page-specific stylesheet or javascript
  const existingPageSpecificCSSorJS = document.querySelectorAll('.page-specific');
  existingPageSpecificCSSorJS.forEach((tag, index) => {
    tag.remove();
  });

  // Create a new link element for the stylesheet
  const link = document.createElement('link');
  link.classList.add('page-specific');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href =  `css/${page}.css`;

  // Create a new script element for the javascript
  const script = document.createElement('script');
  script.classList.add('page-specific');
  script.src = `js/${page}.js`;

  // Append the new link element to the head and the new script element to the body
  document.head.appendChild(link);
  document.body.appendChild(script);
}

function updateHeaderContainer(page) {
  const headerContainer = document.getElementById('header-container');
  
  if (page === 'home') {
    headerContainer.style.display = 'none'; // Hide the header on the home page
  } else {
    headerContainer.style.display = 'block'; // Show the header on other pages

    // Load the header HTML
    fetch(`content/header-content.html`)
      .then(response => response.text())
      .then(html => {
        document.getElementById('header-container').innerHTML = html;

        // De-emphasize the current nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
      });
  }
}

function updateMainContainer() {
  const header = document.querySelector("header");
  const mainContainer = document.querySelector("main");
  mainContainer.style.minHeight = `calc(100vh - ${header.offsetHeight}px)`;
}

function loadPage(page) {
  updateCSS(page);
  updateHeaderContainer(page);
  updateMainContainer();
  
  fetch(`content/${page}-content.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('main-container').innerHTML = html; 
    });
}

function handleNavClick(event) {
  event.preventDefault(); 
  const page = event.target.getAttribute('href');
  loadPage(page);
}

// Add listener to handle navigation
document.body.addEventListener('click', function (event) {
  if (event.target.id != 'contact' 
    && (event.target.classList.contains('nav-link') || event.target.classList.contains('name-link'))) {
    handleNavClick(event);
  }
});

// Load the home page content by default
loadPage('home');