# dom@dev

My personal, non-work site: a small terminal you can poke around in. Plain HTML, CSS and JavaScript, with no framework and no build step.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## How it's put together

- `index.html` holds the window, the prompt, the tappable command chips and a no-JavaScript fallback with the basics.
- `main.js` holds the commands, a tiny pretend filesystem (`about.txt`, `now.txt`, `contact.txt`, `projects/`), tab completion, history and the background particles.
- `style.css` holds three themes (green, amber, light) that share the same color tokens.

To add a project, add an entry to the `projects` object in `main.js`. To add a command, add a function to `commands`.

Output is always built with `textContent`, never `innerHTML`, so anything a visitor types is shown as plain text.
