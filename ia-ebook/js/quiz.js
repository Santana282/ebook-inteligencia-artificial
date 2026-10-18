// js/quiz.js

export async function initQuiz(chapterId) {
    const quizContainer = document.getElementById(`quiz-${chapterId}`);
    if (!quizContainer) return; // Si el capítulo no tiene cuestionario, salir.

    try {
        const response = await fetch('data/quizzes.json');
        const quizzes = await response.json();
        const quizData = quizzes[chapterId];

        if (quizData) {
            renderQuiz(quizContainer, quizData, chapterId);
        }
    } catch (error) {
        console.error("Error cargando el cuestionario:", error);
        quizContainer.innerHTML = `<p class="error-text">No se pudo cargar el cuestionario de este capítulo.</p>`;
    }
}

function renderQuiz(container, data, chapterId) {
    let html = `<div class="quiz-wrapper">
                    <h3>${data.title}</h3>
                    <form id="form-${chapterId}">`;

    data.questions.forEach((q, index) => {
        html += `
            <fieldset class="quiz-question" id="fieldset-${q.id}">
                <legend><strong>Pregunta ${index + 1}:</strong> ${q.text}</legend>
                <div class="options-group">`;
        
        q.options.forEach(opt => {
            const inputId = `${q.id}-${opt.value}`;
            html += `
                    <div class="quiz-option">
                        <input type="radio" id="${inputId}" name="${q.id}" value="${opt.value}">
                        <label for="${inputId}">${opt.text}</label>
                    </div>`;
        });

        html += `   </div>
                <div class="feedback-box" id="feedback-${q.id}" style="display: none;" aria-live="polite"></div>
            </fieldset>`;
    });

    html += `       <button type="submit" class="btn-primary" id="btn-submit-${chapterId}">Evaluar Respuestas</button>
                    <div id="quiz-result-${chapterId}" class="quiz-result-summary" style="display:none;" aria-live="assertive"></div>
                </form>
            </div>`;

    container.innerHTML = html;

    // Manejo del evento de envío
    document.getElementById(`form-${chapterId}`).addEventListener('submit', (e) => {
        e.preventDefault();
        evaluateQuiz(data, chapterId);
    });
}

function evaluateQuiz(data, chapterId) {
    const form = document.getElementById(`form-${chapterId}`);
    const formData = new FormData(form);
    let score = 0;
    let allAnswered = true;

    data.questions.forEach(q => {
        const userAnswer = formData.get(q.id);
        const feedbackBox = document.getElementById(`feedback-${q.id}`);
        const fieldset = document.getElementById(`fieldset-${q.id}`);
        
        if (!userAnswer) {
            allAnswered = false;
            fieldset.classList.add('unanswered');
            return;
        }

        fieldset.classList.remove('unanswered');
        feedbackBox.style.display = "block";
        
        // Deshabilitar inputs para evitar cambios posteriores a la evaluación
        form.querySelectorAll(`input[name="${q.id}"]`).forEach(input => input.disabled = true);

        if (userAnswer === q.correctAnswer) {
            score++;
            fieldset.classList.add('correct');
            feedbackBox.innerHTML = `✅ <strong>¡Correcto!</strong> ${q.explanation}`;
            feedbackBox.className = "feedback-box success";
        } else {
            fieldset.classList.add('incorrect');
            feedbackBox.innerHTML = `❌ <strong>Incorrecto.</strong> ${q.explanation}`;
            feedbackBox.className = "feedback-box error";
        }
    });

    if (!allAnswered) {
        alert("Por favor, responde a todas las preguntas antes de evaluar.");
        return;
    }

    // Ocultar botón y mostrar resumen
    document.getElementById(`btn-submit-${chapterId}`).style.display = "none";
    const resultBox = document.getElementById(`quiz-result-${chapterId}`);
    resultBox.style.display = "block";
    
    const percentage = (score / data.questions.length) * 100;
    resultBox.innerHTML = `<h4>Puntuación: ${score} de ${data.questions.length} (${percentage}%)</h4>`;

    // Guardar progreso en LocalStorage
    saveProgress(chapterId, percentage);
}

function saveProgress(chapterId, score) {
    let progress = JSON.parse(localStorage.getItem('ebookProgress')) || {};
    progress[chapterId] = {
        completed: score >= 60, // Criterio de aprobación
        score: score,
        date: new Date().toISOString()
    };
    localStorage.setItem('ebookProgress', JSON.stringify(progress));
    
    // Disparar evento para que app.js actualice la interfaz general si es necesario
    window.dispatchEvent(new Event('progressUpdated'));
}