// ------------------------------------------------------------
// EXERCISE LIST
// To add a new exercise: add a line here.
//   file   : the .md file in exercises/
//   title  : name shown on the home page
//   theme  : home | candy | mental | pizza | dots | gryffindor | bugs | dino | cats | diy  (see style.css)
//   icon   : emoji shown on the home page card
//   dancer : emoji that dances when an answer is right (optional)
// ------------------------------------------------------------
const EXERCISES = [
    { file: 'problems-fr.md',             title: 'Problèmes Mathématiques', theme: 'candy',      icon: '🍬', dancer: '🧙‍♀️' },
    { file: 'calcul-mental.md',           title: 'Calcul Mental',           theme: 'mental',     icon: '⚡', dancer: '🚀' },
    { file: 'fractions.md',               title: 'Fractions et Nombres',    theme: 'pizza',      icon: '🍕', dancer: '🍕' },
    { file: 'multiplication.md',          title: 'Multiplication',          theme: 'dots',       icon: '✖️', dancer: '🦄' },
    { file: 'problems-jardin.md',         title: 'Problèmes du Jardin',     theme: 'dots',       icon: '🍓', dancer: '🫘' },
    { file: 'problems-ballet.md',         title: 'Problèmes de Ballet',     theme: 'candy',      icon: '🩰', dancer: '💃' },
    { file: 'problems-cuisine.md',        title: 'Problèmes de Cuisine',    theme: 'pizza',      icon: '🧁', dancer: '👩‍🍳' },
    { file: 'problems-poudlard.md',       title: 'Problèmes à Poudlard',    theme: 'gryffindor', icon: '🦁', dancer: '🧙‍♂️' },
    { file: 'problems-marina-poudlard.md', title: 'Marina à Poudlard',      theme: 'gryffindor', icon: '🧙‍♀️', dancer: '🦉' },
    { file: 'problems-potions.md',        title: 'Potions Magiques',        theme: 'candy',      icon: '🧪', dancer: '🧙‍♀️' },
    { file: 'problems-hockey.md',         title: 'Problèmes de Hockey',     theme: 'mental',     icon: '🏒', dancer: '⛸️' },
    { file: 'problems-insectes.md',       title: "Problèmes d'Insectes",    theme: 'bugs',       icon: '🐞', dancer: '🦋' },
    { file: 'problems-dinosaures.md',     title: 'Problèmes de Dinosaures', theme: 'dino',       icon: '🦕', dancer: '🦖' },
    { file: 'problems-chats.md',          title: 'Problèmes de Chats',      theme: 'cats',       icon: '🐱', dancer: '😸' },
    { file: 'problems-bricolage.md',      title: 'Problèmes de Bricolage',  theme: 'diy',        icon: '🔨', dancer: '🛠️' }
];

const DEFAULT_THEME = 'home';
const DEFAULT_DANCER = '💃';

// Dancer emoji for the current page (changed per exercise in loadExercise)
let currentDancer = DEFAULT_DANCER;
let dancerTimer = null;

// Load exercise list on index page
function loadExerciseList() {
    const exerciseListDiv = document.getElementById('exercise-list');
    if (!exerciseListDiv) return;

    document.body.dataset.theme = DEFAULT_THEME;

    EXERCISES.forEach(ex => {
        // Each card is a real link (keyboard friendly) and carries its own theme colors
        const card = document.createElement('a');
        card.className = 'exercise-card';
        card.href = `exercise.html?file=${encodeURIComponent(ex.file)}`;
        card.dataset.theme = ex.theme || DEFAULT_THEME;

        const icon = document.createElement('span');
        icon.className = 'card-icon';
        icon.textContent = ex.icon || '📘';

        const title = document.createElement('h3');
        title.textContent = ex.title;

        card.appendChild(icon);
        card.appendChild(title);
        exerciseListDiv.appendChild(card);
    });
}

// Apply a theme (colors, background, dancer emoji)
function applyThemeValues(theme, dancer) {
    document.body.dataset.theme = theme || DEFAULT_THEME;
    currentDancer = dancer || DEFAULT_DANCER;

    // Big ballerina shown after "Vérifier toutes les réponses"
    const dress = document.querySelector('#ballerina .dress');
    if (dress) dress.textContent = currentDancer;
}

// Apply the theme of a listed exercise file
function applyTheme(filename) {
    const ex = EXERCISES.find(e => e.file === filename);
    applyThemeValues(ex && ex.theme, ex && ex.dancer);
}

// Show an exercise from its markdown text
function renderExercise(text) {
    const parsed = parseMarkdownExercise(text);
    document.getElementById('exercise-content').innerHTML = parsed.html;
    generateAnswersAfterQuestions(parsed.problems.length);
    window.correctAnswers = parsed.answers;
    window.numProblems = parsed.problems.length;
}

// Load an exercise file from exercises/
async function loadExercise(filename) {
    applyTheme(filename);
    try {
        const response = await fetch(`exercises/${filename}`);
        renderExercise(await response.text());
    } catch (error) {
        document.getElementById('exercise-content').innerHTML =
            `<p style="color: red;">Error loading exercise: ${escapeHtml(String(error))}</p>`;
    }
}

// ------------------------------------------------------------
// PERSONALIZED EXERCISES: the child enters a name and picks a theme
// X, Y = plural nouns used in the questions, shop = something to buy.
// To add a theme: add an entry here and a [data-theme] block in style.css.
// ------------------------------------------------------------
const GEN_THEMES = {
    candy:      { label: "Bonbons d'Halloween 🍬", dancer: '🧙‍♀️', X: 'bonbons',     Y: 'jujubes',    shop: 'sucettes' },
    mental:     { label: 'Calcul mental ⚡',        dancer: '🚀',   X: 'étoiles',     Y: 'points',     shop: 'cahiers' },
    pizza:      { label: 'Pizza 🍕',                dancer: '🍕',   X: 'tomates',     Y: 'olives',     shop: 'parts de pizza' },
    dots:       { label: 'Billes et jetons 🔵',     dancer: '🦄',   X: 'billes',      Y: 'jetons',     shop: 'stylos' },
    gryffindor: { label: 'Poudlard 🦁',             dancer: '🧙‍♂️', X: 'plumes',      Y: 'parchemins', shop: 'chaudrons' },
    bugs:       { label: 'Insectes 🐞',             dancer: '🦋',   X: 'coccinelles', Y: 'abeilles',   shop: 'loupes' },
    dino:       { label: 'Dinosaures 🦖',           dancer: '🦖',   X: 'œufs',        Y: 'fossiles',   shop: 'figurines' },
    cats:       { label: 'Chats 🐱',                dancer: '😸',   X: 'photos de chats', Y: 'jouets', shop: 'coussins' },
    diy:        { label: 'Bricolage 🔨',            dancer: '🛠️',   X: 'clous',       Y: 'vis',        shop: 'planches' }
};

// Small seeded random generator: same seed = same exercise
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Build an exercise in the same markdown format as the .md files
// (questions never use he/she, so any name works)
function generateMarkdown(name, themeKey, seed) {
    const t = GEN_THEMES[themeKey] || GEN_THEMES.candy;
    const rand = mulberry32(seed);
    const r = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
    const de = w => (/^[aeiouyéèêàâîôûœ]/i.test(w) ? "d'" : 'de ') + w;
    const N = name, X = t.X, Y = t.Y, shop = t.shop, dX = de(X);
    const q = [];
    let a, b, c, d, k;

    a = r(12, 45); b = r(11, 38);
    q.push([`${N} compte ${a} ${X} le matin et ${b} ${X} l'après-midi. Combien ${dX} y a-t-il en tout ?`, a + b]);
    a = r(45, 95); b = r(12, a - 15);
    q.push([`${N} a ${a} ${X}. ${N} en perd ${b}. Combien ${dX} reste-t-il ?`, a - b]);
    c = r(3, 9); d = r(6, 12);
    q.push([`${N} range ses ${X} dans ${c} boîtes. Chaque boîte contient ${d} ${X}. Combien ${dX} y a-t-il en tout ?`, c * d]);
    c = r(3, 8); k = r(4, 9);
    q.push([`${N} partage ${c * k} ${X} également entre ${c} amis. Combien ${dX} chaque ami reçoit-il ?`, k]);
    k = r(8, 25);
    q.push([`Il y a ${2 * k} ${X}. ${N} en prend la moitié. Combien ${dX} cela représente-t-il ?`, k]);
    a = r(20, 40); b = r(15, 35); c = r(10, 35);
    q.push([`${N} a ${a} ${X} et ${b} ${Y}. Puis ${c} d'entre eux s'en vont. Combien en reste-t-il ?`, a + b - c]);
    d = r(8, 10) * 10; a = r(d - 70, d - 12);
    q.push([`${N} veut collectionner ${d} ${X} et en a déjà ${a}. Combien ${dX} manque-t-il ?`, d - a]);
    c = r(3, 9); d = r(4, 12);
    q.push([`${N} achète ${c} ${shop} à ${d} dollars pièce. Combien de dollars cela coûte-t-il en tout ?`, c * d]);
    c = r(3, 8); d = r(6, 10); k = r(3, 15);
    q.push([`${N} a ${c} paquets de ${d} ${X} et ${k} ${X} en plus. Combien ${dX} y a-t-il en tout ?`, c * d + k]);
    a = r(90, 150); b = r(20, 40); c = r(15, 35);
    q.push([`${N} a ${a} ${X}. ${N} en donne ${b}, puis ${c} de plus. Combien ${dX} reste-t-il ?`, a - b - c]);

    return `# Problèmes pour ${N}\n\n` +
        q.map((p, i) => `${i + 1}. ${p[0]}`).join('\n\n') +
        `\n\nAnswer: ${q.map(p => p[1]).join(', ')}\n`;
}

// Show a personalized exercise (called from exercise.html)
function loadGenerated(name, themeKey, seed) {
    const key = GEN_THEMES[themeKey] ? themeKey : 'candy';
    name = (name || 'Toi').replace(/\s+/g, ' ').trim().slice(0, 20);
    seed = parseInt(seed, 10) || (Date.now() % 1000000000);
    applyThemeValues(key, GEN_THEMES[key].dancer);
    renderExercise(generateMarkdown(name, key, seed));

    const again = document.createElement('a');
    again.className = 'back-link';
    again.style.cssText = 'display:block;text-align:center;margin-bottom:0';
    again.href = `exercise.html?name=${encodeURIComponent(name)}&theme=${key}&seed=${Date.now() % 1000000000}`;
    again.textContent = '🔄 Nouvelle série';
    document.getElementById('exercise-content').appendChild(again);
}

// Home page form: name + theme -> exercise.html
function initGenerator() {
    const form = document.getElementById('gen-form');
    if (!form) return;
    const nameInput = document.getElementById('gen-name');
    const select = document.getElementById('gen-theme');
    Object.entries(GEN_THEMES).forEach(([key, t]) => select.add(new Option(t.label, key)));

    const preview = () => { document.body.dataset.theme = select.value; };
    try {
        nameInput.value = localStorage.getItem('genName') || '';
        const saved = localStorage.getItem('genTheme');
        if (saved && GEN_THEMES[saved]) { select.value = saved; preview(); }
    } catch (e) { /* storage unavailable: fine */ }
    select.addEventListener('change', preview);

    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = nameInput.value.replace(/\s+/g, ' ').trim().slice(0, 20);
        if (!name) return;
        try { localStorage.setItem('genName', name); localStorage.setItem('genTheme', select.value); } catch (e) {}
        window.location.href = `exercise.html?name=${encodeURIComponent(name)}&theme=${select.value}&seed=${Date.now() % 1000000000}`;
    });
}

// Parse markdown - extract header, problems, and answer
function parseMarkdownExercise(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let problems = [];
    let answers = [];

    // Extract answer line
    const answerLineIndex = lines.findIndex(line => line.toLowerCase().startsWith('answer:'));
    if (answerLineIndex !== -1) {
        const answerText = lines[answerLineIndex].substring('answer:'.length).trim();
        answers = answerText.split(',').map(a => a.trim());
    }

    // Build HTML
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === answerLineIndex) continue; // Skip answer line

        // Headers
        if (line.startsWith('# ')) {
            html += `<h2>${escapeHtml(line.substring(2))}</h2>`;
        } else if (line.startsWith('## ')) {
            html += `<h3>${escapeHtml(line.substring(3))}</h3>`;
        } else if (line.match(/^\d+\./)) {
            // Problem line
            problems.push(line);
            // Show just the question text without the answer part in parentheses if present
            let cleanedLine = line.replace(/\(réponse.*?\)/gi, '').replace(/\(response.*?\)/gi, '').trim();
            html += `<div class="problem" id="problem-${problems.length}">${escapeHtml(cleanedLine)}</div>`;
        } else if (line.trim()) {
            html += `<p>${escapeHtml(line)}</p>`;
        }
    }

    return { html, problems, answers };
}

function generateAnswersAfterQuestions(numProblems) {
    for (let i = 1; i <= numProblems; i++) {
        const problemDiv = document.getElementById(`problem-${i}`);
        if (problemDiv) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'answer-input';
            inputDiv.innerHTML = `
                <label for="answer-${i}">Réponse ${i} :</label>
                <input type="number" id="answer-${i}" name="answer-${i}" step="any" placeholder="...">
                <button class="check-btn-small" onclick="checkSingleAnswer(${i}, this)">Vérifier la réponse</button>
            `;
            problemDiv.parentNode.insertBefore(inputDiv, problemDiv.nextSibling);
        }
    }
    // Add final check button
    const contentDiv = document.getElementById('exercise-content');
    const finalBtn = document.createElement('button');
    finalBtn.className = 'check-btn';
    finalBtn.textContent = 'Vérifier toutes les réponses';
    finalBtn.onclick = checkAllAnswers;
    contentDiv.appendChild(finalBtn);
}

// Is the value typed in the input equal to the expected answer?
function isCorrect(input, num) {
    const userVal = parseFloat(input.value);
    const correctVal = parseFloat(window.correctAnswers[num - 1]);
    return !isNaN(userVal) && Math.abs(userVal - correctVal) < 0.0001;
}

function checkSingleAnswer(num, button) {
    const input = document.getElementById(`answer-${num}`);

    // Only one small dancer at a time
    clearTimeout(dancerTimer);
    document.querySelectorAll('.dancer-small').forEach(d => d.remove());

    if (isCorrect(input, num)) {
        input.classList.add('correct');
        input.classList.remove('incorrect');

        // Small dancer next to the button for 2 seconds
        const dancer = document.createElement('span');
        dancer.className = 'dancer-small';
        dancer.textContent = currentDancer;
        button.parentNode.appendChild(dancer);
        dancerTimer = setTimeout(() => dancer.remove(), 2000);
    } else if (input.value !== '') {
        input.classList.add('incorrect');
        input.classList.remove('correct');
    } else {
        input.classList.remove('correct', 'incorrect');
    }
}

function checkAllAnswers() {
    const resultDiv = document.getElementById('result');
    const ballerinaDiv = document.getElementById('ballerina');

    // Remove all individual dancers
    clearTimeout(dancerTimer);
    document.querySelectorAll('.dancer-small').forEach(d => d.remove());

    let correct = 0;

    for (let i = 1; i <= window.numProblems; i++) {
        const input = document.getElementById(`answer-${i}`);

        if (isCorrect(input, i)) {
            input.classList.add('correct');
            input.classList.remove('incorrect');
            correct++;
        } else if (input.value !== '') {
            input.classList.add('incorrect');
            input.classList.remove('correct');
        }
    }

    // Show result
    resultDiv.classList.remove('hidden');
    if (correct === window.numProblems) {
        resultDiv.className = 'result success';
        resultDiv.innerHTML = `🎉 Parfait ! Tu as trouvé toutes les bonnes réponses !`;
        ballerinaDiv.classList.remove('hidden');
        setTimeout(() => {
            ballerinaDiv.classList.add('hidden');
        }, 4000);
    } else if (correct > 0) {
        resultDiv.className = 'result success';
        resultDiv.innerHTML = `${correct} bonne(s) réponse(s) ! Continue comme ça ! ${currentDancer}`;
        ballerinaDiv.classList.remove('hidden');
        setTimeout(() => {
            ballerinaDiv.classList.add('hidden');
        }, 3000);
    } else {
        resultDiv.className = 'result fail';
        resultDiv.innerHTML = `Essaie encore ! Tu peux y arriver !`;
        ballerinaDiv.classList.add('hidden');
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
