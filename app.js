// Global variables
let technologyData = [];
let filteredData = [];
let isDataLoaded = false;
let listenersInitialized = false;


// Sample data for demonstration
const sampleData = [
    {
        "Technology Name": "Orbital Assembly Robot",
        "Tech Producer": "AstroBuild Systems",
        "Description": "A robotic system designed for in-space assembly of large-scale structures, enabling construction in orbit with precision and reliability.",
        "Existing Technology": "No",
        "Level One Category": "Space Manufacturing",
        "Level Two Category": "In-Space Assembly",
        "Level Three Category": "Robotic Systems",
        "TRL": "5",
        "Level One Functional Category": "Construction",
        "Level Two Functional Category": "Automated Assembly"
    },
    {
        "Technology Name": "Servicing & Refueling Module",
        "Tech Producer": "OrbitServe Technologies",
        "Description": "A modular spacecraft designed for servicing satellites, performing repairs, and refueling operations to extend operational lifetimes.",
        "Existing Technology": "Yes",
        "Level One Category": "Space Servicing",
        "Level Two Category": "Maintenance & Refueling",
        "Level Three Category": "Modular Systems",
        "TRL": "7",
        "Level One Functional Category": "Satellite Maintenance",
        "Level Two Functional Category": "In-Orbit Refueling"
    }
];

// DOM elements
let uploadArea = document.getElementById('uploadArea');
let fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const controlsSection = document.getElementById('controlsSection');
const resultsSection = document.getElementById('resultsSection');
const technologyGrid = document.getElementById('technologyGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');

// Filter elements
const keywordSearch = document.getElementById('keywordSearch');
const levelOneFilter = document.getElementById('levelOneFilter');
const levelTwoFilter = document.getElementById('levelTwoFilter');
const levelThreeFilter = document.getElementById('levelThreeFilter');
const functionalOneFilter = document.getElementById('functionalOneFilter');
const functionalTwoFilter = document.getElementById('functionalTwoFilter');
const trlFilter = document.getElementById('trlFilter');
const existingTechFilter = document.getElementById('existingTechFilter');
const clearFilters = document.getElementById('clearFilters');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSampleData();
});



function setupEventListeners() {
	if (listenersInitialized) {
		console.log("Listeners already initialized, skipping.");
		return;
	}
	listenersInitialized = true
	console.log("Setting Up Event Listeners...");
    // File upload listeners
    uploadArea.addEventListener('click', (e) => {
		console.log("Upload area clicked! Event:", e, uploadArea, document.readyState, listenersInitialized);
		fileInput.click();
	});

    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Search and filter listeners
    keywordSearch.addEventListener('input', debounce(applyFilters, 300));
    levelOneFilter.addEventListener('change', applyFilters);
    levelTwoFilter.addEventListener('change', applyFilters);
    levelThreeFilter.addEventListener('change', applyFilters);
    functionalOneFilter.addEventListener('change', applyFilters);
    functionalTwoFilter.addEventListener('change', applyFilters);
    trlFilter.addEventListener('change', applyFilters);
    existingTechFilter.addEventListener('change', applyFilters);
    clearFilters.addEventListener('click', clearAllFilters);
	
	let chooseFileButton = document.querySelector('.btn--primary');
	chooseFileButton.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		fileInput.click();
	});

	// fileInput should be re-grabbed if you use cloneNode:
	fileInput = document.getElementById('fileInput');
	fileInput.addEventListener('change', handleFileSelect);

}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showUploadStatus('Please select a valid Excel file (.xlsx or .xls)', 'error');
        return;
    }

    showUploadStatus('Processing file...', 'loading');
    showLoading(true);

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Look for "Inventory" sheet or use the first sheet
            let sheetName = 'Inventory';
            if (!workbook.Sheets[sheetName]) {
                sheetName = workbook.SheetNames[0];
            }
            
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                showUploadStatus('No data found in the Excel file', 'error');
                showLoading(false);
                return;
            }

            technologyData = jsonData;
            filteredData = [...technologyData];
            isDataLoaded = true;
            
            showUploadStatus(`Successfully loaded ${jsonData.length} technologies from ${file.name}`, 'success');
            initializeFilters();
            displayResults();
            showSections();
            showLoading(false);
            
        } catch (error) {
            console.error('Error processing file:', error);
            showUploadStatus('Error processing file. Please check the file format.', 'error');
            showLoading(false);
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function loadSampleData() {
    technologyData = [...sampleData];
    filteredData = [...technologyData];
    isDataLoaded = true;
    
    showUploadStatus(`Sample data loaded (${sampleData.length} technologies). Upload your own Excel file to replace this data.`, 'success');
    initializeFilters();
    displayResults();
    showSections();
    showLoading(false); // Fix: Ensure loading spinner is hidden for sample data
}

function showUploadStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
    uploadStatus.classList.remove('hidden');
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
        technologyGrid.classList.add('hidden');
        noResults.classList.add('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showSections() {
    controlsSection.classList.remove('hidden');
    resultsSection.classList.remove('hidden');
}

function initializeFilters() {
    // Extract unique values for each filter
    const levelOnes = [...new Set(technologyData.map(item => item['Level One Category']).filter(Boolean))].sort();
    const levelTwos = [...new Set(technologyData.map(item => item['Level Two Category']).filter(Boolean))].sort();
    const levelThrees = [...new Set(technologyData.map(item => item['Level Three Category']).filter(Boolean))].sort();
    const functionalOnes = [...new Set(technologyData.map(item => item['Level One Functional Category']).filter(Boolean))].sort();
    const functionalTwos = [...new Set(technologyData.map(item => item['Level Two Functional Category']).filter(Boolean))].sort();
    const trls = [...new Set(technologyData.map(item => item['TRL']).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));

    // Populate filter dropdowns
    populateSelect(levelOneFilter, levelOnes);
    populateSelect(levelTwoFilter, levelTwos);
    populateSelect(levelThreeFilter, levelThrees);
    populateSelect(functionalOneFilter, functionalOnes);
    populateSelect(functionalTwoFilter, functionalTwos);
    populateSelect(trlFilter, trls);
}

function populateSelect(selectElement, options) {
    // Clear existing options except the first one
    while (selectElement.children.length > 1) {
        selectElement.removeChild(selectElement.lastChild);
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

function applyFilters() {
    if (!isDataLoaded) return;

    const keyword = keywordSearch.value.toLowerCase().trim();
    const levelOne = levelOneFilter.value;
    const levelTwo = levelTwoFilter.value;
    const levelThree = levelThreeFilter.value;
    const functionalOne = functionalOneFilter.value;
    const functionalTwo = functionalTwoFilter.value;
    const trl = trlFilter.value;
    const existingTech = existingTechFilter.value;

    filteredData = technologyData.filter(item => {
        // Keyword search across multiple fields
        if (keyword) {
            const searchText = [
                item['Technology Name'],
                item['Tech Producer'],
                item['Description']
            ].join(' ').toLowerCase();
            
            if (!searchText.includes(keyword)) {
                return false;
            }
        }

        // Category filters
        if (levelOne && item['Level One Category'] !== levelOne) return false;
        if (levelTwo && item['Level Two Category'] !== levelTwo) return false;
        if (levelThree && item['Level Three Category'] !== levelThree) return false;
        if (functionalOne && item['Level One Functional Category'] !== functionalOne) return false;
        if (functionalTwo && item['Level Two Functional Category'] !== functionalTwo) return false;
        if (trl && item['TRL'] !== trl) return false;
        if (existingTech && item['Existing Technology'] !== existingTech) return false;

        return true;
    });

    displayResults();
}

function displayResults() {
    updateResultsCount();
    
    if (filteredData.length === 0) {
        technologyGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    technologyGrid.classList.remove('hidden');
    
    // Clear existing cards
    technologyGrid.innerHTML = '';
    
    // Create cards for filtered data
    filteredData.forEach(tech => {
        const card = createTechnologyCard(tech);
        technologyGrid.appendChild(card);
    });
	showLoading(false); 
}

function createTechnologyCard(tech) {
    const card = document.createElement('div');
    card.className = 'technology-card';

    const trlValue = tech['TRL'] || 'N/A';
    const existingTech = tech['Existing Technology'] || 'Unknown';
    const fullDescription = tech['Description'] || 'No description available';
    const truncated = fullDescription.length > 144;
    const shortDescription = truncated
        ? fullDescription.slice(0, 144) + "…"
        : fullDescription;

    // Build HTML
    card.innerHTML = `
        <div class="card-header">
            <h3 class="technology-name">${escapeHtml(tech['Technology Name'] || 'Unnamed Technology')}</h3>
            <p class="tech-producer">${escapeHtml(tech['Tech Producer'] || 'Unknown Producer')}</p>
        </div>
        <div class="card-description">
            ${truncated
                ? `<span class="desc-short">${escapeHtml(shortDescription)}
                        <button class="desc-toggle more-btn" style="background:none; border:none; color:#2066de; cursor:pointer">More</button>
                    </span>
                    <span class="desc-full" style="display:none">${escapeHtml(fullDescription)}
                        <button class="desc-toggle less-btn" style="background:none; border:none; color:#2066de; cursor:pointer">Less</button>
                    </span>`
                : `<span>${escapeHtml(fullDescription)}</span>`
            }
        </div>
        <div class="card-tags">
            <span class="tag tag--trl">TRL ${escapeHtml(trlValue)}</span>
            <span class="tag ${existingTech === 'Yes' ? 'tag--existing' : 'tag--emerging'}">
                ${existingTech === 'Yes' ? 'Existing' : 'Emerging'}
            </span>
        </div>
        <div class="card-categories">
            ${tech['Level One Category'] ? `
                <div class="category-group">
                    <div class="category-label">Technology Category</div>
                    <div class="category-value">${escapeHtml(tech['Level One Category'])}</div>
                    ${tech['Level Two Category'] ? `<div class="category-value">${escapeHtml(tech['Level Two Category'])}</div>` : ''}
                    ${tech['Level Three Category'] ? `<div class="category-value">${escapeHtml(tech['Level Three Category'])}</div>` : ''}
                </div>
            ` : ''}
            ${tech['Level One Functional Category'] ? `
                <div class="category-group">
                    <div class="category-label">Functional Category</div>
                    <div class="category-value">${escapeHtml(tech['Level One Functional Category'])}</div>
                    ${tech['Level Two Functional Category'] ? `<div class="category-value">${escapeHtml(tech['Level Two Functional Category'])}</div>` : ''}
                </div>
            ` : ''}
        </div>
    `;

    // Only add toggle behavior if truncated
    if (truncated) {
        const shortElem = card.querySelector('.desc-short');
        const fullElem = card.querySelector('.desc-full');
        shortElem.querySelector('.desc-toggle.more-btn').addEventListener('click', () => {
            shortElem.style.display = 'none';
            fullElem.style.display = '';
        });
        fullElem.querySelector('.desc-toggle.less-btn').addEventListener('click', () => {
            fullElem.style.display = 'none';
            shortElem.style.display = '';
        });
    }

    return card;
}


function updateResultsCount() {
    const count = filteredData.length;
    const total = technologyData.length;
    
    if (count === total) {
        resultsCount.textContent = `${count} technologies found`;
    } else {
        resultsCount.textContent = `${count} of ${total} technologies found`;
    }
}

function clearAllFilters() {
    keywordSearch.value = '';
    levelOneFilter.value = '';
    levelTwoFilter.value = '';
    levelThreeFilter.value = '';
    functionalOneFilter.value = '';
    functionalTwoFilter.value = '';
    trlFilter.value = '';
    existingTechFilter.value = '';
    
    applyFilters();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    text = String(text);  // <-- Ensure it's a string!
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
