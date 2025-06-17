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

// Command handling
const commands = {
  help: () => {
    return `Available commands:
    help    - Show this help message
    about   - Learn more about me
    projects - View my projects
    clear   - Clear the terminal
    exit    - Exit the terminal (just kidding, you can't!)`;
  },
  about: () => {
    return `Hey there! I'm Dom Smith, a Full-Stack Developer passionate about creating 
    innovative web solutions. I specialize in JavaScript, Python, React, and Node.js.
    
    I love building user-friendly applications and solving complex problems.
    When I'm not coding, you can find me exploring new technologies and contributing
    to open-source projects.`;
  },
  projects: () => {
    return `Here are some of my projects:
    1. Portfolio Website - This terminal-style portfolio
    2. Sports Dashboard - Real-time sports data visualization
    3. Discord Bot (Nami & Robin) - Automated Discord server management
    4. AI Image Generator - AI-powered image creation tool`;
  },
  clear: () => {
    document.getElementById('terminal-output').innerHTML = '';
    return '';
  }
};

let commandHistory = [];
let historyIndex = -1;

function handleCommand(command) {
  const cmd = command.toLowerCase().trim();
  const output = document.getElementById('terminal-output');
  
  // Add command to output
  const commandElement = document.createElement('div');
  commandElement.className = 'command-response';
  commandElement.innerHTML = `<span style="color: var(--border-color)">➜</span> ${command}`;
  output.appendChild(commandElement);

  // Process command
  let response = '';
  if (commands[cmd]) {
    response = commands[cmd]();
  } else if (cmd === '') {
    response = '';
  } else {
    response = `Command not found: ${cmd}. Type 'help' to see available commands.`;
  }

  // Add response to output
  if (response) {
    const responseElement = document.createElement('div');
    responseElement.className = 'command-response';
    responseElement.textContent = response;
    output.appendChild(responseElement);
  }

  // Scroll to bottom
  output.scrollTop = output.scrollHeight;
  
  // Add to history
  if (cmd) {
    commandHistory.push(cmd);
    historyIndex = commandHistory.length;
  }
}

// Command input handling
document.addEventListener('DOMContentLoaded', function() {
  const commandInput = document.getElementById('command');
  
  commandInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      handleCommand(this.value);
      this.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        this.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        this.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        this.value = '';
      }
    }
  });

  // Focus command input
  commandInput.focus();
});
