document.addEventListener('DOMContentLoaded', () => {
    fetchContent();
    setupMobileMenu();
    setupScrollAnimations();
    setupParallax();
});

let testimonialsData = [];
let currentSlide = 0;
let carouselInterval;

async function fetchContent() {
    try {
        const response = await fetch('data/content.json');
        if (!response.ok) throw new Error('Failed to load content');
        const data = await response.json();

        renderHero(data.hero);
        renderAbout(data.about, data.skills);
        renderProjects(data.projects);
        renderServices(data.services);
        renderResources(data.resources);

        // Testimonials (Carousel)
        testimonialsData = data.testimonials || [];
        renderTestimonialsCarousel();
        startCarousel();

        renderFooterSocials(data.profile.social);
        setupContactValues(data.contact);
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

function renderHero(hero) {
    if (!hero) return;
    document.getElementById('hero-heading').textContent = hero.heading;
    document.getElementById('hero-subheading').textContent = hero.subheading;
    document.getElementById('hero-cta').textContent = hero.ctaText;
}

function renderAbout(about, skills) {
    // Text
    if (about) {
        document.getElementById('about-text').innerHTML = `
            <h3>${about.title}</h3>
            <p>${about.description}</p>
        `;
    }

    // Skills
    if (skills) {
        const skillsContainer = document.getElementById('skills-list');
        skillsContainer.innerHTML = skills.map(category => `
            <div class="skill-category fade-in-up">
                <h3>${category.category}</h3>
                <div class="skill-tags">
                    ${category.items.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!projects) return;

    container.innerHTML = projects.map(project => `
        <article class="project-card fade-in-up">
            <div class="project-img" style="background-image: url('${project.image || 'assets/placeholder-project.jpg'}')"></div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <div class="project-tech">
                    ${project.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
                </div>
                <p>${project.description}</p>
                <div class="project-links">
                    <a href="${project.link}" target="_blank" class="link-icon" title="Live Demo"><i class="fas fa-external-link-alt"></i></a>
                    <a href="${project.repo}" target="_blank" class="link-icon" title="GitHub Repo"><i class="fab fa-github"></i></a>
                </div>
            </div>
        </article>
    `).join('');
}

function renderServices(services) {
    const container = document.getElementById('services-grid');
    if (!services) return;

    container.innerHTML = services.map(service => `
        <div class="service-card fade-in-up">
            <div class="service-icon"><i class="fas fa-${service.icon || 'code'}"></i></div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function renderResources(resources) {
    const container = document.getElementById('resources-list');
    if (!resources || !resources.items) return;

    container.innerHTML = resources.items.map(item => `
        <div class="resource-item fade-in-up">
            <div class="resource-info">
                <i class="fas fa-file-download"></i>
                <div>
                    <strong>${item.name}</strong>
                    <div style="font-size: 0.8rem; color: #64748b;">${item.size}</div>
                </div>
            </div>
            <a href="${item.file}" class="btn primary-btn" download>Download</a>
        </div>
    `).join('');
}

function renderTestimonialsCarousel() {
    const track = document.getElementById('testimonials-track');
    const dotsContainer = document.getElementById('carousel-dots');

    if (testimonialsData.length === 0) return;

    // Render Cards
    track.innerHTML = testimonialsData.map(t => `
        <div class="testimonial-card-modern">
            <img src="${t.image || 'assets/placeholder-profile.png'}" alt="${t.name}" class="profile-pic">
            <div class="stars">
                ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
            </div>
            <p class="quote">${t.quote}</p>
            <div class="author">
                <h4>${t.name}</h4>
                <div class="review-source">
                    <img src="assets/google-logo.png" class="google-logo" alt="Google">
                    Google Review
                </div>
            </div>
        </div>
    `).join('');

    // Render Dots
    dotsContainer.innerHTML = testimonialsData.map((_, index) => `
        <div class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
    `).join('');
}

function goToSlide(index) {
    const track = document.getElementById('testimonials-track');
    const dots = document.querySelectorAll('.dot');

    currentSlide = index;
    const slideWidth = track.clientWidth; // or 100% since it's 1 per view

    // For simple 100% width sliding
    track.style.transform = `translateX(-${currentSlide * 102.8}%)`;

    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');

    // Reset timer
    clearInterval(carouselInterval);
    startCarousel();
}

function startCarousel() {
    carouselInterval = setInterval(() => {
        let next = currentSlide + 1;
        if (next >= testimonialsData.length) next = 0;
        goToSlide(next);
    }, 5000);
}

// Make global for onclick
window.goToSlide = goToSlide;

function renderFooterSocials(social) {
    const container = document.getElementById('footer-socials');
    if (!social) return;

    // Mapping keys to FontAwesome classes
    const icons = {
        linkedin: 'fab fa-linkedin',
        github: 'fab fa-github',
        twitter: 'fab fa-twitter',
        medium: 'fab fa-medium',
        email: 'fas fa-envelope'
    };

    let html = '';
    for (const [key, url] of Object.entries(social)) {
        if (url && url !== '#') {
            html += `<a href="${url}" target="_blank" title="${key}"><i class="${icons[key] || 'fas fa-link'}"></i></a>`;
        }
    }
    container.innerHTML = html;
}

function setupContactValues(contact) {
    if (!contact) return;

    const whatsappBtn = document.getElementById('whatsapp-btn');
    const form = document.getElementById('contact-form');

    // Handle WhatsApp Click
    whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const msg = document.getElementById('message').value;

        const text = `Hi, I'm ${name}. ${msg}`;
        const encodedText = encodeURIComponent(text);
        const phone = "8110813081"; // Replace with actual phone number from config if available or placeholder

        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    });

    // Handle Form Submit (Email mailto fallback)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const msg = document.getElementById('message').value;

        window.location.href = `mailto:haja0786308@gmail.com?subject=Portfolio Contact from ${name}&body=${msg} (Contact: ${email})`;
    });
}


// Mobile Menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });
}

// Scroll Animations (Intersection Observer)
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observer initial elements and try to observe dynamic ones after a slight delay
    // Since content loads async, we need to observe loaded elements

    // For static elements
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // For dynamic elements (hacky but simple: wait for fetch)
    // A better way is to call this observer code inside the render functions,
    // but we can use a MutationObserver on the main container or just add the class 'visible' immediately if observing changes
    // Alternatively, re-query valid elements after a delay
    setTimeout(() => {
        document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
    }, 500); // Wait for fetch
}

// Parallax Effect
function setupParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Hero Background
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.style.transform = `translateZ(-1px) scale(2) translateY(${scrolled * 0.5}px)`;
        }

        // Resources Background (if using background-attachment: fixed, no JS needed, but for custom parallax:)
        const resourcesSection = document.getElementById('resources');
        if (resourcesSection) {
            const speed = resourcesSection.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            // resourcesSection.style.backgroundPosition = `50% ${yPos}px`; // Simpler background position parallax
        }
    });
}
