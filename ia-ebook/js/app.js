import { initSearch } from './search.js';
import { initQuiz } from './quiz.js';
import { initGlossary, bindGlossaryTerms } from './glossary.js'; // <-- Novedad

// --- ESTADO LOCAL ---
const state = {
    chapters: [],
    currentIndex: 0,
    theme: localStorage.getItem('theme') || 'light',
    fontSize: parseInt(localStorage.getItem('fontSize')) || 16
};

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    applyTheme(state.theme);
    applyFontSize(state.fontSize);
    
    await loadTOC();
    // Novedad: Inicializar servicios globales
    initSearch(state.chapters, loadChapter);
    await initGlossary(); // Esperamos a que cargue el JSON del glosario
    
    setupEventListeners();
    
    const savedId = localStorage.getItem('currentChapter');
    const targetIndex = state.chapters.findIndex(ch => ch.id === savedId);
    state.currentIndex = targetIndex !== -1 ? targetIndex : 0;
    
    loadChapter(state.currentIndex);
});

// --- FUNCIONES PRINCIPALES ---
async function loadTOC() {
    try {
        const response = await fetch('data/toc.json');
        state.chapters = await response.json();
        renderSidebar();
    } catch (error) {
        document.getElementById('reader-view').innerHTML = '<p style="color:red">Error cargando el índice del libro. Verifica las rutas.</p>';
    }
}

function renderSidebar() {
    const list = document.getElementById('toc-list');
    list.innerHTML = '';
    state.chapters.forEach((ch, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${ch.id}`;
        a.textContent = ch.title;
        a.dataset.index = index;
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            loadChapter(index);
            if(window.innerWidth <= 768) toggleSidebar(); // Auto-cerrar en móvil
        });
        
        li.appendChild(a);
        list.appendChild(li);
    });
}

async function loadChapter(index) {
    const chapter = state.chapters[index];
    if (!chapter) return;
    
    const reader = document.getElementById('reader-view');
    reader.innerHTML = '<div class="loader">Cargando contenido...</div>';
    
    try {
        const response = await fetch(chapter.file);
        if (!response.ok) throw new Error('Network error');
        const html = await response.text();
        
        reader.innerHTML = html;
        reader.scrollTop = 0; 
        
        state.currentIndex = index;
        localStorage.setItem('currentChapter', chapter.id);
        updateNavigationUI();
        
        // Novedad: Inicializar cuestionario si existe en el HTML cargado
        initQuiz(chapter.id);
        bindGlossaryTerms(reader);
        
    } catch (error) {
        reader.innerHTML = `
            <h2>Error 404</h2>
            <p>El capítulo "<b>${chapter.title}</b>" está en desarrollo o no se pudo cargar.</p>
            <p>Ruta buscada: <code>${chapter.file}</code></p>
        `;
    }
}

function updateNavigationUI() {
    // Actualizar botones Siguiente/Anterior
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    btnPrev.disabled = state.currentIndex === 0;
    btnNext.disabled = state.currentIndex === state.chapters.length - 1;
    
    document.getElementById('chapter-indicator').textContent = 
        `Sección ${state.currentIndex + 1} de ${state.chapters.length}`;
        
    // Resaltar en sidebar
    document.querySelectorAll('#toc-list a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`#toc-list a[data-index="${state.currentIndex}"]`);
    if(activeLink) activeLink.classList.add('active');
}

// --- EVENTOS E INTERFAZ ---
function setupEventListeners() {
    document.getElementById('btn-prev').addEventListener('click', () => loadChapter(state.currentIndex - 1));
    document.getElementById('btn-next').addEventListener('click', () => loadChapter(state.currentIndex + 1));
    
    // Tema
    document.getElementById('btn-theme').addEventListener('click', () => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });
    
    // Letra
    document.getElementById('btn-font-increase').addEventListener('click', () => applyFontSize(state.fontSize + 2));
document.getElementById('btn-font-decrease').addEventListener('click', () => applyFontSize(state.fontSize - 2));
    
    // Sidebar
    document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('close-sidebar').addEventListener('click', toggleSidebar);
    
    // Progreso de lectura (Scroll)
    const reader = document.getElementById('reader-view');
    reader.addEventListener('scroll', () => {
        const winScroll = reader.scrollTop;
        const height = reader.scrollHeight - reader.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('reading-progress-bar').style.width = scrolled + "%";
    });
}

function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.getElementById('btn-theme').textContent = theme === 'light' ? '🌓' : '☀️';
}

function applyFontSize(size) {
    if(size < 12 || size > 24) return;
    state.fontSize = size;
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
    localStorage.setItem('fontSize', size);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}