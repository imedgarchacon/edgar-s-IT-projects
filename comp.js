// Mobile nav toggle
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav__toggle');

if (toggle) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (nav && !nav.contains(e.target) && nav.classList.contains('open')) {
    nav.classList.remove('open');
  }
});

// Enhanced header scroll effect without changing nav active state
const header = document.querySelector('.header');
const navLinks = document.querySelectorAll('.nav__list a');

let ticking = false;

function updateHeader() {
  // Header no cambia estados activos del menú
  ticking = false;
}

function requestTick() {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
}

window.addEventListener('scroll', requestTick, { passive: true });

// Reveal on scroll with stagger
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ 
    if(e.isIntersecting){ 
      e.target.classList.add('visible'); 
      io.unobserve(e.target);
    } 
  });
},{ threshold: .1 });
revealEls.forEach(el=>io.observe(el));

// Enhanced parallax hero background
const heroBg = document.querySelector('.hero__bg');
let lastY = 0;
window.addEventListener('scroll', ()=>{
  const y = window.scrollY;
  const delta = (y - lastY)*0.05;
  lastY = y;
  if(heroBg){
    heroBg.style.transform = `translateY(${y*0.15}px) scale(1.08)`;
  }
}, { passive:true });

// Dynamic carousel with auto-play
const track = document.querySelector('.carousel__track');
const prev = document.querySelector('.carousel__btn.prev');
const next = document.querySelector('.carousel__btn.next');
let autoPlayInterval;

const step = () => track ? track.clientWidth * 0.8 : 0;
const scrollToNext = () => {
  if(track) {
    track.scrollBy({ left: step(), behavior: 'smooth' });
    if(track.scrollLeft >= track.scrollWidth - track.clientWidth) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }
};

prev && prev.addEventListener('click', ()=> {
  if(track) track.scrollBy({ left: -step(), behavior: 'smooth' });
  clearInterval(autoPlayInterval);
  setTimeout(() => startAutoPlay(), 5000);
});

next && next.addEventListener('click', ()=> {
  scrollToNext();
  clearInterval(autoPlayInterval);
  setTimeout(() => startAutoPlay(), 5000);
});

const startAutoPlay = () => {
  autoPlayInterval = setInterval(scrollToNext, 4000);
};

// Start auto-play after 3 seconds
setTimeout(startAutoPlay, 3000);

// Smooth anchor offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    if(id && id.length>1){
      const target = document.querySelector(id);
      if(target){
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top, behavior:'smooth' });
        nav && nav.classList.remove('open');
      }
    }
  });
});

// Add floating animation to cards
const cards = document.querySelectorAll('.card, .service, .member');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.animation = 'float 2s ease-in-out infinite';
  });
  card.addEventListener('mouseleave', () => {
    card.style.animation = 'none';
  });
});

// Enhanced form interactions
const formInputs = document.querySelectorAll('.form input, .form textarea');
formInputs.forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.style.transform = 'scale(1.02)';
  });
  input.addEventListener('blur', () => {
    input.parentElement.style.transform = 'scale(1)';
  });
});

// Initial loader transition with gold accent
document.addEventListener('DOMContentLoaded', ()=>{
  document.body.style.transition = 'background-color .6s ease';
  // Add a subtle gold glow effect on load
  setTimeout(() => {
    document.body.style.boxShadow = 'inset 0 0 100px rgba(255,179,0,.05)';
  }, 100);
});

// Add dynamic background particles
const createParticle = () => {
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: fixed;
    width: 4px;
    height: 4px;
    background: var(--gold);
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.3;
    animation: float 6s linear infinite;
  `;
  particle.style.left = Math.random() * 100 + 'vw';
  particle.style.top = '100vh';
  particle.style.animationDelay = Math.random() * 2 + 's';
  document.body.appendChild(particle);
  
  setTimeout(() => {
    particle.remove();
  }, 6000);
};

// Create particles periodically
setInterval(createParticle, 2000);

// Animated counters for statistics
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat__number');
  
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    updateCounter();
  });
};

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.section--stats');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statsObserver.observe(statsSection);
}

