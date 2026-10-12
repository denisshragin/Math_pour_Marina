# Mathématiques pour Marina

A small static website of math exercises. Each exercise set has its own colors and background, and a dancer appears when an answer is right.

**Live site:** https://YOUR-USERNAME.github.io/math-site/

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

```
index.html        Home page (list of exercises)
exercise.html     Exercise page
css/style.css     Colors, themes and backgrounds
js/app.js         Exercise list and answer checking
exercises/        One .md file per exercise set
HOWTO.md          Detailed guide (in French)
```

## Add an exercise set

1. Create `exercises/my-set.md`:

   ```markdown
   # My set

   1. 12 ÷ 3 = ?

   2. 20 ÷ 4 = ?

   Answer: 4, 5
   ```

   The answers go on one `Answer:` line, in the same order as the questions.

2. Add a line to `EXERCISES` in `js/app.js`:

   ```javascript
   { file: 'my-set.md', title: 'My set', theme: 'dots', icon: '➗', dancer: '🦄' }
   ```

   Available themes: `candy`, `mental`, `pizza`, `dots`. To create a new one, copy a `[data-theme="..."]` block in `css/style.css`.

## Publish on GitHub Pages

1. Push the project to a public repository.
2. Go to **Settings → Pages**.
3. Choose **Deploy from a branch**, then **main** and **/ (root)**, and save.

File names are case-sensitive on GitHub, so make sure they match the names in `EXERCISES` exactly.
