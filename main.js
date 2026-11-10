// dom@dev: a small terminal you can poke around in.
// Everything is plain DOM. Output is built with textContent, never innerHTML,
// so nothing a visitor types can turn into markup on the page.

(function () {
  "use strict";

  const EMAIL = "domsmith343@gmail.com";
  const GITHUB = "https://github.com/domsmith343";
  const LINKEDIN = "https://www.linkedin.com/in/dominicsmith343/";
  const THEMES = ["green", "amber", "light"];

  const out = document.getElementById("output");
  const screen = document.getElementById("screen");
  const form = document.getElementById("promptForm");
  const input = document.getElementById("cmd");
  const ps1Path = document.querySelector(".ps1 .path");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- The "filesystem" ----------
  // Each file is a list of lines; a line is a list of segments: a plain string,
  // or { t: text, c: class name, href: link }.
  const files = {
    "about.txt": [
      ["Hey, I'm ", { t: "Dom Smith", c: "acc b" }, "."],
      [""],
      ["By day I'm a Level 2 IT support analyst in Los Angeles: tickets, new-hire"],
      ["setups, and keeping attorneys happy. Before IT, I spent ten years at T-Mobile"],
      ["in business sales and frontline leadership."],
      [""],
      ["After hours I teach myself Python and front-end, run my own AI stack at home,"],
      ["and build little tools I actually use. This is the fun corner of the internet."],
      [""],
      [{ t: "try: ", c: "dim" }, { t: "ls projects", c: "acc" }, { t: "  or  ", c: "dim" }, { t: "neofetch", c: "acc" }],
    ],
    "now.txt": [
      [{ t: "what I'm up to", c: "acc b" }],
      ["- rebuilding this site (you're looking at it)"],
      ["- keeping Robin and Nami online on the Mac mini"],
      ["- managing six fantasy football teams, badly and with great confidence"],
    ],
    "contact.txt": [
      ["email     ", { t: EMAIL, href: "mailto:" + EMAIL }],
      ["github    ", { t: "github.com/domsmith343", href: GITHUB }],
      ["linkedin  ", { t: "linkedin.com/in/dominicsmith343", href: LINKEDIN }],
      [""],
      [{ t: "tip: ", c: "dim" }, { t: "copy email", c: "acc" }, { t: " puts my address on your clipboard", c: "dim" }],
    ],
  };

  const projects = {
    "self-hosted-ai.md": {
      name: "Self-hosted AI",
      blurb: "A private AI setup I can reach from anywhere.",
      lines: [
        ["A private LLM environment running on my own hardware, so my chats stay mine."],
        ["Ollama serves the models, Open WebUI is the front end, and Tailscale lets me"],
        ["reach it securely from my phone or laptop wherever I am."],
      ],
      stack: "Ollama · Open WebUI · Tailscale",
    },
    "robin-and-nami.md": {
      name: "Robin and Nami",
      blurb: "Two Discord bots I wrote and keep running at home.",
      lines: [
        ["Two Discord bots that bring LLM chat and a few API helpers into my servers."],
        ["Both run in Docker containers on a Mac mini at home."],
      ],
      stack: "Python · Docker · Mac mini",
    },
    "fantasy-command-center.md": {
      name: "Fantasy Command Center",
      blurb: "One dashboard for my six fantasy football teams.",
      lines: [
        ["A dashboard that pulls all six of my ESPN fantasy football teams into one"],
        ["place: matchups, player details, and alerts so I stop missing lineup changes."],
      ],
      stack: "ESPN Fantasy",
    },
    "this-site.md": {
      name: "This terminal",
      blurb: "The thing you're typing into right now.",
      lines: [
        ["Plain HTML, CSS and JavaScript. No framework, no build step."],
        ["Tab completes, the arrow keys walk your history, and there are a few"],
        ["easter eggs if you go looking."],
      ],
      stack: "HTML · CSS · JavaScript",
      link: { t: "source on GitHub", href: GITHUB + "/personal-terminal-portfolio" },
    },
  };

  let cwd = "~"; // "~" or "~/projects"
  const history = [];
  let historyIndex = 0;

  // ---------- Output helpers ----------
  function line(segments, cls) {
    const div = document.createElement("div");
    div.className = "ln" + (cls ? " " + cls : "");
    (Array.isArray(segments) ? segments : [segments]).forEach((seg) => {
      if (typeof seg === "string") {
        div.appendChild(document.createTextNode(seg));
        return;
      }
      const el = document.createElement(seg.href ? "a" : "span");
      el.textContent = seg.t;
      if (seg.c) el.className = seg.c;
      if (seg.href) {
        el.href = seg.href;
        if (!seg.href.startsWith("mailto:")) {
          el.target = "_blank";
          el.rel = "noopener";
        }
      }
      div.appendChild(el);
    });
    out.appendChild(div);
    return div;
  }
  const print = (lines) => lines.forEach((l) => line(l));
  const blank = () => line("");
  const scrollDown = () => { screen.scrollTop = screen.scrollHeight; };

  function echoCommand(text) {
    const div = line([
      { t: "dom@dev", c: "acc b" }, ":", { t: cwd, c: "acc2" }, "$ ",
    ], "echo");
    div.appendChild(document.createTextNode(text));
  }

  // ---------- Paths ----------
  function resolve(arg) {
    if (!arg) return cwd;
    let p = arg.replace(/\/+$/, "");
    if (p === "~" || p === "/" || p === "..") return "~";
    if (p.startsWith("~/")) return p;
    if (cwd === "~/projects" && p.startsWith("../")) p = p.slice(3);
    else if (cwd === "~/projects") return "~/projects/" + p;
    return "~/" + p;
  }
  function lookup(path) {
    if (path === "~" || path === "~/projects") return { dir: true };
    const name = path.replace(/^~\//, "");
    if (files[name]) return { file: files[name] };
    if (name.startsWith("projects/") && projects[name.slice(9)]) return { project: projects[name.slice(9)] };
    return null;
  }

  // ---------- Commands ----------
  const commands = {
    help() {
      print([
        [{ t: "commands", c: "acc b" }],
        ["  whoami            who's at the keyboard"],
        ["  ls [dir]          list files (try ls projects)"],
        ["  cat <file>        read a file, e.g. cat about.txt"],
        ["  open <project>    read about a project"],
        ["  cd <dir>          move around"],
        ["  contact           how to reach me"],
        ["  copy email        copy my email address"],
        ["  neofetch          system info, sort of"],
        ["  theme [name]      green, amber or light"],
        ["  history, clear, date, pwd, echo"],
        [""],
        [{ t: "tab completes · ↑ ↓ walk history · ctrl+l clears", c: "dim" }],
      ]);
    },
    whoami() {
      print([
        [{ t: "Dom Smith", c: "acc b" }, { t: " · Los Angeles", c: "dim" }],
        ["IT support analyst by day, home-lab tinkerer by night."],
        [{ t: "more: ", c: "dim" }, { t: "cat about.txt", c: "acc" }],
      ]);
    },
    ls(args) {
      const path = resolve(args[0]);
      const hit = lookup(path);
      if (!hit) return line([{ t: `ls: ${args[0]}: no such file or directory`, c: "err" }]);
      if (!hit.dir) return line(args[0]);
      if (path === "~") {
        line([{ t: "projects/", c: "acc2 b" }, "  about.txt  now.txt  contact.txt"]);
      } else {
        Object.entries(projects).forEach(([file, p]) => {
          line([{ t: file.padEnd(27), c: "acc" }, { t: p.blurb, c: "dim" }]);
        });
        blank();
        line([{ t: "read one with ", c: "dim" }, { t: "open fantasy-command-center", c: "acc" }]);
      }
    },
    cd(args) {
      const path = resolve(args[0] || "~");
      if (path === "~" || path === "~/projects") {
        cwd = path;
        ps1Path.textContent = cwd;
      } else if (lookup(path)) {
        line([{ t: `cd: not a directory: ${args[0]}`, c: "err" }]);
      } else {
        line([{ t: `cd: no such directory: ${args[0]}`, c: "err" }]);
      }
    },
    pwd() { line(cwd.replace("~", "/home/dom")); },
    cat(args) {
      if (!args[0]) return line([{ t: "cat: which file? try cat about.txt", c: "err" }]);
      const hit = lookup(resolve(args[0]));
      if (!hit) return line([{ t: `cat: ${args[0]}: no such file`, c: "err" }]);
      if (hit.dir) return line([{ t: `cat: ${args[0]}: is a directory`, c: "err" }]);
      if (hit.file) return print(hit.file);
      showProject(hit.project);
    },
    open(args) {
      if (!args[0]) return commands.ls(["projects"]);
      const key = args[0].replace(/^(\.\.\/)?(~\/)?(projects\/)?/, "").replace(/(\.md)?$/, ".md");
      if (projects[key]) return showProject(projects[key]);
      line([{ t: `open: no project called ${args[0]}. try ls projects`, c: "err" }]);
    },
    projects() { commands.ls(["projects"]); },
    about() { print(files["about.txt"]); },
    contact() { print(files["contact.txt"]); },
    copy(args) {
      if (args[0] !== "email") return line([{ t: "copy: try copy email", c: "err" }]);
      const done = () => line([{ t: "copied ", c: "acc" }, EMAIL]);
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(EMAIL).then(done, () => line(["couldn't reach the clipboard. it's ", { t: EMAIL, href: "mailto:" + EMAIL }]));
      } else {
        line(["no clipboard here. it's ", { t: EMAIL, href: "mailto:" + EMAIL }]);
      }
    },
    neofetch() {
      const art = [
        "  ██████  ",
        " ██    ██ ",
        " ██ >_ ██ ",
        " ██    ██ ",
        "  ██████  ",
      ];
      const info = [
        [{ t: "dom", c: "acc b" }, "@", { t: "dev", c: "acc b" }],
        [{ t: "----------", c: "dim" }],
        [{ t: "os       ", c: "acc2" }, "Los Angeles, CA"],
        [{ t: "role     ", c: "acc2" }, "IT support analyst, L2"],
        [{ t: "shell    ", c: "acc2" }, "self-taught Python + JS"],
        [{ t: "homelab  ", c: "acc2" }, "Mac mini · Docker · Tailscale"],
        [{ t: "ai       ", c: "acc2" }, "Ollama + Open WebUI"],
        [{ t: "leagues  ", c: "acc2" }, "6 fantasy teams"],
        [{ t: "theme    ", c: "acc2" }, currentTheme()],
      ];
      for (let i = 0; i < info.length; i++) {
        line([{ t: (art[i] || " ".repeat(10)) + "   ", c: "ascii" }, ...info[i]]);
      }
    },
    theme(args) {
      if (!args[0]) {
        return line(["theme: ", { t: currentTheme(), c: "acc" }, { t: "  (options: " + THEMES.join(", ") + ")", c: "dim" }]);
      }
      if (!THEMES.includes(args[0])) return line([{ t: `theme: unknown theme ${args[0]}. try ${THEMES.join(", ")}`, c: "err" }]);
      setTheme(args[0]);
      line(["theme set to ", { t: args[0], c: "acc" }]);
    },
    history() {
      history.forEach((h, i) => line([{ t: String(i + 1).padStart(4) + "  ", c: "dim" }, h]));
    },
    clear() { out.textContent = ""; },
    date() { line(new Date().toString()); },
    echo(args) { line(args.join(" ")); },
    // A few easter eggs
    sudo() { line([{ t: "nice try. this incident will be reported.", c: "warn" }]); },
    rm() { line([{ t: "rm: permission denied. the site likes being here.", c: "warn" }]); },
    exit() { line([{ t: "there's no leaving. but you can close the tab.", c: "dim" }]); },
    hello() { line("hey 👋 type help to look around."); },
    coffee() { line([{ t: "brewing… ☕ ", c: "acc" }, "done. back to the tickets."]); },
    vim() { line([{ t: "you are now trapped in vim. just kidding. :q", c: "dim" }]); },
  };
  const aliases = { hi: "hello", cls: "clear", man: "help", "?": "help", dir: "ls", emacs: "vim", nano: "vim" };

  function showProject(p) {
    line([{ t: p.name, c: "acc b" }]);
    print(p.lines);
    line([{ t: "stack  ", c: "dim" }, p.stack]);
    if (p.link) line([{ t: "link   ", c: "dim" }, { t: p.link.t, href: p.link.href }]);
  }

  function run(raw, { record = true } = {}) {
    const text = raw.trim();
    echoCommand(text);
    if (text && record) {
      history.push(text);
      historyIndex = history.length;
    }
    if (!text) return scrollDown();
    const [name, ...args] = text.split(/\s+/);
    const key = aliases[name.toLowerCase()] || name.toLowerCase();
    const fn = Object.prototype.hasOwnProperty.call(commands, key) ? commands[key] : null;
    if (fn) fn(args);
    else line([{ t: `${name}: command not found. type help`, c: "err" }]);
    scrollDown();
  }

  // ---------- Tab completion ----------
  function complete(value) {
    const parts = value.split(/\s+/);
    if (parts.length === 1) {
      const names = Object.keys(commands).filter((c) => c.startsWith(parts[0].toLowerCase()));
      return names.length === 1 ? names[0] + " " : names.length ? (line(names.join("  "), "dim"), value) : value;
    }
    const partial = parts[parts.length - 1];
    const inProjects = cwd === "~/projects" || partial.startsWith("projects/") || parts[0] === "open";
    const prefix = partial.startsWith("projects/") ? "projects/" : "";
    const pool = inProjects
      ? Object.keys(projects).map((f) => prefix + (parts[0] === "open" ? f.replace(/\.md$/, "") : f))
      : ["projects/", ...Object.keys(files)];
    const matches = pool.filter((p) => p.startsWith(partial));
    if (matches.length === 1) parts[parts.length - 1] = matches[0];
    else if (matches.length > 1) line(matches.join("  "), "dim");
    return parts.join(" ");
  }

  // ---------- Theme ----------
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function currentTheme() { return document.documentElement.dataset.theme || "green"; }
  function setTheme(name) {
    if (name === "green") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = name;
    try { localStorage.setItem("term-theme", name); } catch (e) {}
    themeMeta.content = getComputedStyle(document.documentElement).getPropertyValue("--window").trim();
    particles.recolor();
  }
  document.getElementById("themeBtn").addEventListener("click", () => {
    const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
    run("theme " + next);
  });

  // ---------- Input wiring ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) input.value = history[--historyIndex];
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyIndex = Math.min(historyIndex + 1, history.length);
      input.value = history[historyIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      input.value = complete(input.value);
      scrollDown();
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      commands.clear();
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      if (input.selectionStart !== input.selectionEnd) return; // let normal copy work
      e.preventDefault();
      echoCommand(input.value + "^C");
      input.value = "";
      scrollDown();
    }
  });
  document.querySelectorAll(".chips button").forEach((btn) => {
    btn.addEventListener("click", () => run(btn.dataset.cmd));
  });
  // Clicking the screen focuses the prompt, unless someone is selecting text or clicking a link.
  screen.addEventListener("click", (e) => {
    if (e.target.closest("a") || String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  // ---------- Background particles ----------
  const particles = (function () {
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    let dots = [];
    let color = "";
    let frame = null;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = innerWidth < 600 ? 22 : 45;
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
      }));
      draw(false);
    }
    function draw(move) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = color;
      for (const d of dots) {
        if (move) {
          d.x += d.dx; d.y += d.dy;
          if (d.x < 0 || d.x > innerWidth) d.dx *= -1;
          if (d.y < 0 || d.y > innerHeight) d.dy *= -1;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function loop() { draw(true); frame = requestAnimationFrame(loop); }
    // Animate only when it's welcome: not for reduced-motion visitors, not in a hidden tab.
    function update() {
      const run = !reduceMotion.matches && !document.hidden;
      if (run && frame === null) frame = requestAnimationFrame(loop);
      if (!run && frame !== null) { cancelAnimationFrame(frame); frame = null; draw(false); }
    }
    function recolor() {
      color = getComputedStyle(document.documentElement).getPropertyValue("--particle").trim();
      draw(false);
    }
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", update);
    reduceMotion.addEventListener("change", update);
    recolor();
    size();
    update();
    return { recolor };
  })();

  // ---------- Boot ----------
  themeMeta.content = getComputedStyle(document.documentElement).getPropertyValue("--window").trim();
  line([{ t: "Welcome to dom@dev.", c: "acc b" }]);
  line([{ t: "Type ", c: "dim" }, { t: "help", c: "acc" }, { t: " or tap a command below.", c: "dim" }]);

  // Type out "whoami" on load, like someone's at the keyboard. Instant for reduced motion.
  const intro = "whoami";
  if (reduceMotion.matches) {
    run(intro, { record: false });
  } else {
    let i = 0;
    (function typeNext() {
      input.value = intro.slice(0, ++i);
      if (i < intro.length) return setTimeout(typeNext, 90);
      setTimeout(() => { input.value = ""; run(intro, { record: false }); }, 250);
    })();
  }
  // Only grab focus on devices with a real keyboard, so phones don't pop one open.
  if (window.matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
})();
