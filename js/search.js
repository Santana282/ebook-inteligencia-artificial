// js/search.js

let searchIndex = null; // Almacenará el texto limpio de cada capítulo
let isIndexing = false;

// Inicializa los eventos del modal de búsqueda
export function initSearch(chapters, loadChapterCallback) {
    const btnSearch = document.getElementById('btn-search');
    const btnClose = document.getElementById('btn-close-search');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');

    btnSearch.addEventListener('click', async () => {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        input.focus();
        
        // Construir el índice si no existe
        if (!searchIndex && !isIndexing) {
            await buildIndex(chapters);
        }
    });

    btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    });

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) btnClose.click();
    });

    // Evento de escritura con un pequeño retraso (debounce)
    let timeout = null;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value.trim();
        timeout = setTimeout(() => performSearch(query, chapters, loadChapterCallback), 300);
    });
}

async function buildIndex(chapters) {
    isIndexing = true;
    const status = document.getElementById('search-status');
    status.textContent = 'Indexando contenido del libro...';
    
    searchIndex = [];
    
    try {
        const fetchPromises = chapters.map(async (ch, index) => {
            const response = await fetch(ch.file);
            if (!response.ok) return null;
            const html = await response.text();
            
            // Convertir HTML a texto plano
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const plainText = tempDiv.textContent || tempDiv.innerText || "";
            
            return {
                id: ch.id,
                title: ch.title,
                indexOffset: index, // Para navegar desde el resultado
                content: plainText.replace(/\s+/g, ' ') // Limpiar saltos de línea
            };
        });

        const results = await Promise.all(fetchPromises);
        searchIndex = results.filter(item => item !== null);
        status.textContent = '';
    } catch (error) {
        status.innerHTML = '<span style="color:red">Error al indexar el contenido.</span>';
    } finally {
        isIndexing = false;
    }
}

function performSearch(query, chapters, loadChapterCallback) {
    const resultsContainer = document.getElementById('search-results');
    const status = document.getElementById('search-status');
    resultsContainer.innerHTML = '';

    if (!query || query.length < 3) {
        status.textContent = 'Escribe al menos 3 caracteres para buscar.';
        return;
    }

    if (!searchIndex) {
        status.textContent = 'El índice aún se está construyendo...';
        return;
    }

    const regex = new RegExp(query, 'gi');
    let totalMatches = 0;

    searchIndex.forEach(chapter => {
        let match;
        // Encontrar todas las coincidencias en este capítulo
        while ((match = regex.exec(chapter.content)) !== null) {
            totalMatches++;
            if (totalMatches > 50) break; // Límite por rendimiento visual

            // Extraer un fragmento de contexto (snippet)
            const contextStart = Math.max(0, match.index - 40);
            const contextEnd = Math.min(chapter.content.length, match.index + query.length + 40);
            let snippet = chapter.content.substring(contextStart, contextEnd);
            
            // Añadir puntos suspensivos si no es el inicio/fin del texto
            if (contextStart > 0) snippet = '...' + snippet;
            if (contextEnd < chapter.content.length) snippet = snippet + '...';

            // Resaltar el término buscado de forma segura (sin inyectar HTML arbitrario)
            const highlightedSnippet = snippet.replace(regex, match => `<mark>${match}</mark>`);

            // Crear el elemento de resultado
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="result-chapter">${chapter.title}</div>
                <div class="result-snippet">${highlightedSnippet}</div>
            `;
            
            // Navegar al capítulo al hacer clic
            li.addEventListener('click', () => {
                document.getElementById('btn-close-search').click();
                loadChapterCallback(chapter.indexOffset);
            });

            resultsContainer.appendChild(li);
        }
    });

    if (totalMatches === 0) {
        status.textContent = `No se encontraron resultados para "${query}".`;
    } else {
        const limitMsg = totalMatches > 50 ? ' (Mostrando los primeros 50)' : '';
        status.textContent = `Se encontraron ${totalMatches} coincidencia(s)${limitMsg}.`;
    }
}