function updateCSS(page) {
  
  // Remove any existing page-specific stylesheet
  const existingCSS = document.getElementById('page-specific-css');
  if (existingCSS) {
    existingCSS.remove();
  }

  // Create a new link element for the stylesheet
  const link = document.createElement('link');
  link.id = 'page-specific-css';
  link.rel = 'stylesheet';
  link.type = 'text/css';

  // Set the href attribute based on the page
  link.href =  `css/${page}.css`;

  // Append the new link element to the head
  document.head.appendChild(link);
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
  // Prevent the default link behavior
  event.preventDefault(); 
  const page = event.target.getAttribute('href');
  loadPage(page);
}

document.body.addEventListener('click', function (event) {
  // Check if the clicked element has the 'nav-link' or 'name-link class
  console.log(event.target.id);

  if (event.target.id != 'contact' 
    && (event.target.classList.contains('nav-link') || event.target.classList.contains('name-link'))) {
    handleNavClick(event);
  }
});

// Load the home page content by default
loadPage('home');