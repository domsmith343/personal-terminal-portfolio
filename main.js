// Terminal Portfolio Main JS
// Particle background
const canvas = document.getElementById('particles-bg');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
function createParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5
    });
  }
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--border-color');
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(drawParticles);
}
createParticles();
drawParticles();
// Typing animation for whoami
function typeText(el, text, speed = 80, cb) {
  let i = 0;
  function type() {
    el.textContent = text.slice(0, i);
    if (i <= text.length) {
      i++;
      setTimeout(type, speed);
    } else if (cb) cb();
  }
  type();
}
document.addEventListener('DOMContentLoaded', function() {
  typeText(document.getElementById('whoami-typed'), 'whoami', 110);
  // Animate progress bars
  const skills = document.querySelectorAll('#skills progress');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const prog = entry.target;
        const max = prog.getAttribute('max');
        prog.value = 0;
        let val = 0;
        const step = () => {
          if (val < max) {
            val++;
            prog.value = val;
            requestAnimationFrame(step);
          }
        };
        step();
        observer.unobserve(prog);
      }
    });
  }, { threshold: 0.5 });
  skills.forEach(prog => observer.observe(prog));
});
// Project filter
window.filterProjects = function() {
  const input = document.getElementById('project-filter').value.toLowerCase();
  document.querySelectorAll('#projects li').forEach(li => {
    const keywords = li.querySelector('a').getAttribute('data-keywords');
    if (!input || keywords.includes(input)) {
      li.style.display = '';
    } else {
      li.style.display = 'none';
    }
  });
}
// Keyboard navigation for nav buttons
Array.from(document.querySelectorAll('.nav-btn')).forEach(btn => {
  btn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });
});
window.jumpToSection = function(id) {
  const el = document.getElementById(id+'-section') || document.getElementById(id);
  if (el) el.scrollIntoView({behavior:'smooth'});
}
// Copy to clipboard
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const button = event.target;
    const loading = button.querySelector('.loading');
    if (loading) loading.style.display = 'none';
    button.innerHTML = 'Copied!';
    setTimeout(() => {
      button.innerHTML = '<span class="loading"></span>';
      if (loading) loading.style.display = 'inline-block';
    }, 2000);
  });
}
// Contact form (dummy, no backend)
window.sendContact = function(e) {
  e.preventDefault();
  document.getElementById('contact-status').textContent = 'Sending...';
  setTimeout(() => {
    document.getElementById('contact-status').textContent = 'Message sent! (demo)';
    e.target.reset();
  }, 1200);
}
// Smooth theme transitions
window.toggleDarkMode = function() {
  document.body.classList.toggle('dark-mode');
  const icon = document.querySelector('.toggle-btn');
  icon.textContent = icon.textContent.includes('🌙') ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
  createParticles();
}
// Enhanced keyboard accessibility
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.body.classList.remove('dark-mode');
    createParticles();
  }
  // Alt+1/2/3 for nav
  if (e.altKey && e.key === '1') window.jumpToSection('projects');
  if (e.altKey && e.key === '2') window.jumpToSection('skills');
  if (e.altKey && e.key === '3') window.jumpToSection('contact');
});
// Back to top button
const backToTop = document.createElement('button');
backToTop.id = 'back-to-top';
backToTop.innerHTML = '↑';
backToTop.title = 'Back to Top';
backToTop.onclick = () => window.scrollTo({top:0,behavior:'smooth'});
document.body.appendChild(backToTop);
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});
