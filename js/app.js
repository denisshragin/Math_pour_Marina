// Load exercise list on index page
function loadExerciseList() {
    const exerciseListDiv = document.getElementById('exercise-list');
    if (!exerciseListDiv) return;
    
    const exercises = [
        { file: 'problems-fr.md', title: 'Problèmes Mathématiques' },
        { file: 'calcul-mental.md', title: 'Calcul Mental' },
        { file: 'fractions.md', title: 'Fractions et Nombres' },
        { file: 'multiplication.md', title: 'Multiplication' }
    ];
    
    exercises.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `<h3>${ex.title}</h3>`;
        card.onclick = () => {
            window.location.href = `exercise.html?file=${ex.file}`;
        };
        exerciseListDiv.appendChild(card);
    });
}

// Parse markdown exercise and load it
async function loadExercise(filename) {
    const contentDiv = document.getElementById('exercise-content');
    
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
        contentDiv.innerHTML = `<p style="color: red;">Error loading exercise: ${error}</p>`;
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
                <button class="check-btn-small" onclick="checkSingleAnswer(${i})">Vérifier cette question</button>
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

function checkSingleAnswer(num) {
    const input = document.getElementById(`answer-${num}`);
    const ballerinaDiv = document.getElementById('ballerina');
    const userVal = parseFloat(input.value);
    const correctVal = parseFloat(window.correctAnswers[num - 1]);
    
    if (!isNaN(userVal) && Math.abs(userVal - correctVal) < 0.0001) {
        input.classList.add('correct');
        input.classList.remove('incorrect');
        // Show ballerina dance for correct answer
        ballerinaDiv.classList.remove('hidden');
        setTimeout(() => {
            ballerinaDiv.classList.add('hidden');
        }, 2000);
    } else if (input.value !== '') {
        input.classList.add('incorrect');
        input.classList.remove('correct');
    }
}

function checkAllAnswers() {
    const resultDiv = document.getElementById('result');
    const ballerinaDiv = document.getElementById('ballerina');
    
    let correct = 0;
    
    for (let i = 1; i <= window.numProblems; i++) {
        const input = document.getElementById(`answer-${i}`);
        const userVal = parseFloat(input.value);
        const correctVal = parseFloat(window.correctAnswers[i - 1]);
        
        if (!isNaN(userVal) && Math.abs(userVal - correctVal) < 0.0001) {
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
        resultDiv.innerHTML = `${correct} bonne(s) réponse(s) ! Continue comme ça ! 💃`;
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
