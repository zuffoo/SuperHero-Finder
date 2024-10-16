const accessToken = '6d0644bebf90a57c691ca46b3f5cace8';
const heroesPerPage = 5;
let currentPage = 1;
let totalPages = 0;
let allHeroes = [];
let logs = [];

async function fetchRandomHeroes() {
    try {
        const response = await fetch(`https://superheroapi.com/api.php/${accessToken}/random/5`);
        const heroes = await response.json();
        allHeroes = heroes;
        displayHeroes(allHeroes);
        totalPages = Math.ceil(allHeroes.length / heroesPerPage);
        updatePaginationControls(currentPage, totalPages, 'initial');
        await insertLog('Hero API', 'fetchRandomHeroes', 'Buscou heróis aleatórios');
    } catch (error) {
        console.error('Erro ao buscar heróis aleatórios:', error);
    }
}

async function searchHero(page = 1) {
    const heroName = document.getElementById('hero-name').value.trim();

    if (heroName === '') {
        alert('Por favor, digite o nome de um herói.');
        return;
    }

    try {
        const response = await fetch(`https://superheroapi.com/api.php/${accessToken}/search/${heroName}`);
        const data = await response.json();
        await insertLog('Hero API', 'searchHero', `Buscou o herói: ${heroName}`);

        if (data.response === 'error') {
            document.getElementById('hero-info').innerHTML = '<p>Herói não encontrado!</p>';
        } else {
            let filteredHeroes = filterHeroes(data.results);
            let sortedHeroes = sortHeroes(filteredHeroes);

            const start = (page - 1) * heroesPerPage;
            const end = start + heroesPerPage;
            const paginatedResults = sortedHeroes.slice(start, end);

            displayHeroes(paginatedResults);
            totalPages = Math.ceil(sortedHeroes.length / heroesPerPage);
            updatePaginationControls(page, totalPages, 'search');
        }
    } catch (error) {
        console.error('Erro ao buscar o herói:', error);
    }
}

function displayHeroes(heroes) {
    const heroInfoDiv = document.getElementById('hero-info');
    heroInfoDiv.innerHTML = '';

    heroes.forEach(hero => {
        const heroCard = document.createElement('div');
        heroCard.className = 'hero-card';
        heroCard.innerHTML = `
            <img src="${hero.image.url}" alt="${hero.name}">
            <h2>${hero.name}</h2>
            <p>Inteligência: ${hero.powerstats.intelligence}</p>
            <p>Força: ${hero.powerstats.strength}</p>
            <p>Agilidade: ${hero.powerstats.speed}</p>
            <p>Tipo: ${hero.biography.alignment}</p>
        `;
        heroInfoDiv.appendChild(heroCard);
    });
}

function updatePaginationControls(currentPage, totalPages, action) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.disabled = (i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            if (action === 'search') {
                searchHero(currentPage);
            } else {
                displayHeroes(allHeroes.slice((currentPage - 1) * heroesPerPage, currentPage * heroesPerPage));
            }
        });
        paginationControls.appendChild(pageButton);
    }
}

async function insertLog(apiName, method, result) {
    const logEntry = {
        matricula: 428892,
        api: apiName,
        metodo: method,
        resultado: result
    };

    logs.push(logEntry);
    console.log('Log enviado:', logEntry);
}

function filterHeroes(heroes) {
    const type = document.getElementById('type-option').value;

    if (type === '') {
        return heroes;
    }

    const typeMap = {
        hero: 'good',
        villain: 'bad',
        antihero: 'neutral'
    };

    return heroes.filter(hero => hero.biography.alignment === typeMap[type]);
}

function sortHeroes(heroes) {
    const sortBy = document.getElementById('sort-option').value;
    return heroes.sort((a, b) => {
        const statA = parseInt(a.powerstats[sortBy]) || 0;
        const statB = parseInt(b.powerstats[sortBy]) || 0;
        return statB - statA;
    });
}

function toggleLogs() {
    const logsContainer = document.getElementById('logs-container');
    const logsInfo = document.getElementById('logs-info');

    logsInfo.innerHTML = '';

    logs.forEach((log, index) => {
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `
            <p>${log.api} | ${log.metodo} | ${log.resultado}</p>
            <button onclick="deleteLog(${index})">Excluir</button>
        `;
        logsInfo.appendChild(logEntry);
    });

    logsContainer.style.display = (logsContainer.style.display === 'none') ? 'block' : 'none';
}

function deleteLog(index) {
    logs.splice(index, 1);
    toggleLogs();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRandomHeroes();

    document.getElementById('search-btn').addEventListener('click', () => {
        searchHero(currentPage);
    });
    
    document.getElementById('type-option').addEventListener('change', () => {
        searchHero(currentPage);
    });
});
