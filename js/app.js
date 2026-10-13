// ------------------------------------------------------------
// EXERCISE LIST
// To add a new exercise: add a line here.
//   file   : the .md file in exercises/
//   title  : name shown on the home page
//   theme  : home | candy | mental | pizza | dots  (see style.css)
//   icon   : emoji shown on the home page card
//   dancer : emoji that dances when an answer is right (optional)
// ------------------------------------------------------------
const EXERCISES = [
    { file: 'problems-fr.md',    title: 'Problèmes Mathématiques', theme: 'candy',  icon: '🍬', dancer: '🧙‍♀️' },
    { file: 'calcul-mental.md',  title: 'Calcul Mental',           theme: 'mental', icon: '⚡', dancer: '🚀' },
    { file: 'fractions.md',      title: 'Fractions et Nombres',    theme: 'pizza',  icon: '🍕', dancer: '🍕' },
    { file: 'multiplication.md', title: 'Multiplication',          theme: 'dots',   icon: '✖️', dancer: '🦄' },
    { file: 'problems-jardin.md', title: 'Problèmes du Jardin', theme: 'dots', icon: '🍓', dancer: '🫘' },
    { file: 'problems-ballet.md', title: 'Problèmes de Ballet', theme: 'candy', icon: '🩰', dancer: '💃' },
    { file: 'problems-cuisine.md', title: 'Problèmes de Cuisine', theme: 'pizza', icon: '🧁', dancer: '👩‍🍳' },
    { file: 'problems-poudlard.md', title: 'Problèmes à Poudlard', theme: 'gryffindor', icon: '🪄', dancer: '🧙‍♂️' },
    { file: 'problems-marina-poudlard.md', title: 'Marina à Poudlard', theme: 'gryffindor', icon: '🧙‍♀️', dancer: '🦉' },
    { file: 'problems-potions.md', title: 'Potions Magiques', theme: 'candy', icon: '🧪', dancer: '🧙‍♀️' }
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

// Apply the theme (colors, background, dancer) of an exercise
function applyTheme(filename) {
    const ex = EXERCISES.find(e => e.file === filename);
    document.body.dataset.theme = (ex && ex.theme) || DEFAULT_THEME;
    currentDancer = (ex && ex.dancer) || DEFAULT_DANCER;

    // Big ballerina shown after "Vérifier toutes les réponses"
    const dress = document.querySelector('#ballerina .dress');
    if (dress) dress.textContent = currentDancer;
}

// Parse markdown exercise and load it
async function loadExercise(filename) {
    const contentDiv = document.getElementById('exercise-content');
    applyTheme(filename);

    try {
        const response = await fetch(`exercises/${filename}`);
        const text = await response.text();

        // Parse markdown
        const parsed = parseMarkdownExercise(text);
        contentDiv.innerHTML = parsed.html;

        // Generate answer inputs after each question
        generateAnswersAfterQuestions(parsed.problems.length);

        // Store correct answers
        window.correctAnswers = parsed.answers;
        window.numProblems = parsed.problems.length;
    } catch (error) {
        contentDiv.innerHTML = `<p style="color: red;">Error loading exercise: ${escapeHtml(String(error))}</p>`;
    }
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
