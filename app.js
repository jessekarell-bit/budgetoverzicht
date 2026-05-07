// Initiele Data (6 afdelingen)
const defaultBudgetten = [
    { naam: "IT", manager: "Johan de Wit", startBudget: 15000, resterendBudget: 15000 },
    { naam: "HR", manager: "Sophie Jansen", startBudget: 8000, resterendBudget: 8000 },
    { naam: "Marketing", manager: "Kees van Dijk", startBudget: 12000, resterendBudget: 12000 },
    { naam: "Sales", manager: "Lotte Visser", startBudget: 20000, resterendBudget: 20000 },
    { naam: "Finance", manager: "Emma Bakker", startBudget: 10000, resterendBudget: 10000 },
    { naam: "Operations", manager: "Daan de Groot", startBudget: 25000, resterendBudget: 25000 }
];

// State variabelen
let budgetten = [];
let boekingen = [];

// DOM Elementen ophalen
const navAfdelingen = document.getElementById('nav-afdelingen');
const navBoekingen = document.getElementById('nav-boekingen');
const btnNieuweBoeking = document.getElementById('btn-nieuwe-boeking');

const sectieAfdelingen = document.getElementById('sectie-afdelingen');
const sectieBoekingen = document.getElementById('sectie-boekingen');

const tabelAfdelingen = document.getElementById('tabel-afdelingen');
const tabelBoekingen = document.getElementById('tabel-boekingen');

const modalBoeking = document.getElementById('modal-boeking');
const formBoeking = document.getElementById('form-boeking');
const inputAfdeling = document.getElementById('input-afdeling');
const inputBedrag = document.getElementById('input-bedrag');
const inputOmschrijving = document.getElementById('input-omschrijving');
const btnAnnuleer = document.getElementById('btn-annuleer');
const btnCloseModal = document.getElementById('btn-close-modal');
const formError = document.getElementById('form-error');
const formErrorText = document.getElementById('form-error-text');

// --- Hulpfuncties voor bedragen formateren ---
function formatCurrency(bedrag) {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(bedrag);
}

// --- App Initialisatie ---
function initApp() {
    loadFromLocalStorage();
    renderApp();
    setupEventListeners();
}

// --- Local Storage Logica ---
function loadFromLocalStorage() {
    const opgeslagenBudgetten = localStorage.getItem('budgetten');
    const opgeslagenBoekingen = localStorage.getItem('boekingen');

    if (opgeslagenBudgetten) {
        budgetten = JSON.parse(opgeslagenBudgetten);
    } else {
        budgetten = JSON.parse(JSON.stringify(defaultBudgetten)); // Deep copy
    }

    if (opgeslagenBoekingen) {
        boekingen = JSON.parse(opgeslagenBoekingen);
    } else {
        boekingen = [];
    }
}

function saveToLocalStorage() {
    localStorage.setItem('budgetten', JSON.stringify(budgetten));
    localStorage.setItem('boekingen', JSON.stringify(boekingen));
}

// --- Render Functies ---
function renderApp() {
    renderAfdelingen();
    renderBoekingen();
    populateDropdown();
}

function renderAfdelingen() {
    tabelAfdelingen.innerHTML = '';
    budgetten.forEach(afdeling => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";

        // Progress bar calculation
        const percentage = Math.max(0, (afdeling.resterendBudget / afdeling.startBudget) * 100);
        let barColor = 'bg-emerald-500';
        let textColor = 'text-slate-700';

        if (percentage < 20) {
            barColor = 'bg-red-500';
            textColor = 'text-red-600 font-bold';
        } else if (percentage < 50) {
            barColor = 'bg-amber-400';
        }

        tr.innerHTML = `
            <td class="p-4 font-medium text-slate-800">${afdeling.naam}</td>
            <td class="p-4 text-slate-600">${afdeling.manager}</td>
            <td class="p-4 text-slate-600">${formatCurrency(afdeling.startBudget)}</td>
            <td class="p-4">
                <div class="flex flex-col gap-1">
                    <span class="${textColor}">${formatCurrency(afdeling.resterendBudget)}</span>
                    <div class="w-full bg-slate-200 rounded-full h-1.5">
                        <div class="${barColor} h-1.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
            </td>
            <td class="p-4 text-center">
                <button class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-medium py-1.5 px-4 rounded-lg transition-colors border border-indigo-100" onclick="openModalFor('${afdeling.naam}')">
                    Afschrijven
                </button>
            </td>
        `;
        tabelAfdelingen.appendChild(tr);
    });
}

function renderBoekingen() {
    tabelBoekingen.innerHTML = '';

    if (boekingen.length === 0) {
        tabelBoekingen.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 italic">Nog geen boekingen geregistreerd in het systeem.</td></tr>`;
        return;
    }

    // Laatste boekingen bovenaan
    const sortedBoekingen = [...boekingen].reverse();

    sortedBoekingen.forEach(boeking => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
            <td class="p-4 text-sm text-slate-500">${boeking.datum}</td>
            <td class="p-4 font-medium text-slate-800">${boeking.afdeling}</td>
            <td class="p-4 text-slate-600">${boeking.manager}</td>
            <td class="p-4 font-semibold text-red-500 bg-red-50/50">- ${formatCurrency(boeking.bedrag)}</td>
            <td class="p-4 text-slate-600 text-sm">${boeking.omschrijving}</td>
            <td class="p-4 text-sm text-slate-500">
                <span class="bg-slate-100 px-2 py-1 rounded text-slate-600">${boeking.geboektDoor}</span>
            </td>
        `;
        tabelBoekingen.appendChild(tr);
    });
}

function populateDropdown() {
    inputAfdeling.innerHTML = '<option value="" disabled selected>Kies een afdeling uit de lijst</option>';
    budgetten.forEach(afdeling => {
        const option = document.createElement('option');
        option.value = afdeling.naam;
        option.textContent = `${afdeling.naam} (Resterend: ${formatCurrency(afdeling.resterendBudget)})`;
        inputAfdeling.appendChild(option);
    });
}

// --- Navigatie Logica ---
function toonAfdelingen() {
    sectieAfdelingen.classList.remove('hidden');
    sectieBoekingen.classList.add('hidden');

    navAfdelingen.classList.add('bg-indigo-800', 'shadow-inner');
    navAfdelingen.classList.remove('hover:bg-indigo-700');

    navBoekingen.classList.remove('bg-indigo-800', 'shadow-inner');
    navBoekingen.classList.add('hover:bg-indigo-700');
}

function toonBoekingen() {
    sectieAfdelingen.classList.add('hidden');
    sectieBoekingen.classList.remove('hidden');

    navAfdelingen.classList.remove('bg-indigo-800', 'shadow-inner');
    navAfdelingen.classList.add('hover:bg-indigo-700');

    navBoekingen.classList.add('bg-indigo-800', 'shadow-inner');
    navBoekingen.classList.remove('hover:bg-indigo-700');
}

// --- Modal Logica ---
function openModalFor(afdelingNaam = '') {
    formBoeking.reset();
    formError.classList.add('hidden');
    formErrorText.textContent = '';

    if (afdelingNaam) {
        inputAfdeling.value = afdelingNaam;
    }

    // Slight delay to ensure transition works smoothly
    modalBoeking.classList.remove('hidden');
}

function sluitModal() {
    modalBoeking.classList.add('hidden');
}

// --- De Kern Logica: Afschrijven ---
function bedragAfschrijven(e) {
    e.preventDefault(); // Voorkom page reload door form submit

    const afdelingNaam = inputAfdeling.value;
    const bedrag = parseFloat(inputBedrag.value);
    const omschrijving = inputOmschrijving.value.trim();

    // 1. Zoek de afdeling op
    let afdeling = budgetten.find(a => a.naam === afdelingNaam);

    if (!afdeling) {
        toonFout("Selecteer alstublieft een geldige afdeling uit de lijst.");
        return;
    }

    if (isNaN(bedrag) || bedrag <= 0) {
        toonFout("Voer een geldig bedrag in groter dan € 0,00.");
        return;
    }

    // 2. Voorkom negatief budget (De 'Logica' check)
    if (afdeling.resterendBudget < bedrag) {
        toonFout(`Onvoldoende budget op afdeling ${afdelingNaam}. Resterend budget is ${formatCurrency(afdeling.resterendBudget)}.`);
        return; // Stop de functie
    }

    // 3. Pas budget aan
    afdeling.resterendBudget -= bedrag;

    // 4. Log de wijziging in de lijst Boekingen
    const nu = new Date();
    const formatter = new Intl.DateTimeFormat('nl-NL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const nieuweBoeking = {
        datum: formatter.format(nu),
        afdeling: afdelingNaam,
        manager: afdeling.manager,
        bedrag: bedrag,
        omschrijving: omschrijving,
        geboektDoor: "Huidige Gebruiker" // In een echte app komt dit uit een login systeem
    };
    boekingen.push(nieuweBoeking);

    // 5. Update het scherm en sla op
    saveToLocalStorage();
    renderApp();

    // 6. Sluit de modal en geef visuele feedback door naar historie te gaan
    sluitModal();
    toonBoekingen();
}

function toonFout(bericht) {
    formErrorText.textContent = bericht;
    formError.classList.remove('hidden');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    navAfdelingen.addEventListener('click', toonAfdelingen);
    navBoekingen.addEventListener('click', toonBoekingen);

    btnNieuweBoeking.addEventListener('click', () => openModalFor());
    btnAnnuleer.addEventListener('click', sluitModal);
    btnCloseModal.addEventListener('click', sluitModal);

    // Sluit modal door buiten de modal te klikken
    modalBoeking.addEventListener('click', (e) => {
        if(e.target === modalBoeking) {
            sluitModal();
        }
    });

    formBoeking.addEventListener('submit', bedragAfschrijven);
}

// --- Start de Applicatie ---
document.addEventListener('DOMContentLoaded', initApp);