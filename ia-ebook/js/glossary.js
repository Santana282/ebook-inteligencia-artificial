// js/glossary.js

let glossaryData = null;

export async function initGlossary() {
    try {
        const response = await fetch('data/glossary.json');
        glossaryData = await response.json();
        setupGlossaryModal();
    } catch (error) {
        console.error("Error cargando el glosario:", error);
    }
}

// Llama a esta función cada vez que se carga un capítulo nuevo
export function bindGlossaryTerms(containerElement) {
    if (!glossaryData) return;

    // Solo buscar en elementos de texto para no romper etiquetas HTML estructurales
    const textElements = containerElement.querySelectorAll('p, li, blockquote');
    
    // Crear un array de términos a buscar, ordenados por longitud (más largos primero)
    // para evitar que "Learning" pise a "Deep Learning"
    const terms = Object.keys(glossaryData).sort((a, b) => b.length - a.length);
    
    // Construir la expresión regular global, ignorando mayúsculas/minúsculas
    // Se usa \b para asegurar que coincida con palabras completas
    const regexPattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');

    textElements.forEach(el => {
        // Ignorar si ya procesamos este elemento o si está dentro de un bloque de código
        if (el.closest('pre, code, .code-lab')) return;

        // Reemplazar texto por el span interactivo
        el.innerHTML = el.innerHTML.replace(regexPattern, (match) => {
            const key = match.toLowerCase();
            if (glossaryData[key]) {
                return `<span class="glossary-link" data-term="${key}" tabindex="0" role="button" aria-haspopup="dialog">${match}</span>`;
            }
            return match;
        });
    });

    // Añadir eventos a los nuevos enlaces generados
    containerElement.querySelectorAll('.glossary-link').forEach(link => {
        link.addEventListener('click', (e) => showGlossaryTerm(e.target.dataset.term));
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showGlossaryTerm(e.target.dataset.term);
            }
        });
    });
}

function setupGlossaryModal() {
    const modal = document.getElementById('glossary-modal');
    const btnClose = document.getElementById('btn-close-glossary');

    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    };

    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function showGlossaryTerm(termKey) {
    const data = glossaryData[termKey];
    if (!data) return;

    document.getElementById('glossary-term-title').textContent = data.term;
    document.getElementById('glossary-simple').textContent = data.simple;
    document.getElementById('glossary-tech').textContent = data.tech;
    document.getElementById('glossary-example').textContent = data.example;

    const modal = document.getElementById('glossary-modal');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    
    // Enfocar el botón de cerrar para accesibilidad
    document.getElementById('btn-close-glossary').focus();
}