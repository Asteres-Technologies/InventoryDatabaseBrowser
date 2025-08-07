// Global variables
let technologyData = [];
let filteredData = [];
let isDataLoaded = false;
let listenersInitialized = false;
let techNotes = {}; // { [techName]: noteString }
let techSurveyResponses = {}; // { [techName]: { questionKey: responseValue } }
let surveyConfig = window.surveyConfig;

// --- Side Viewer element references ---
const sideViewer = document.getElementById('sideViewer');
const sideViewerContent = document.getElementById('sideViewerContent');
const sideViewerCloseBtn = document.getElementById('sideViewerCloseBtn');
const sideViewerOverlay = document.getElementById('sideViewerOverlay');

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
const exportResultsBtn = document.getElementById('exportResultsBtn');
const importResultsBtn = document.getElementById('importResultsBtn');
const importResultsFile = document.getElementById('importResultsFile');


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

    // Add click event to show side viewer
    card.addEventListener('click', function() {
        const techKey = tech['Technology Name'];
        let content = '';
        content += renderTechDetails(tech);
        content += renderNotesSection(techKey);
        content += renderSurveySection(techKey);
        // Add action buttons:
        content += `
        <div class="viewer-button-row">
            <button id="saveNotesSurveyBtn" class="btn btn--primary viewer-save-btn">Save Notes & Survey</button>
            <button id="exportSurveyBtn" class="btn btn--outline viewer-export-btn">Export All Surveys/Notes</button>
        </div>
        `;


        showSideViewer(content);

        // Attach event listeners:
        setTimeout(() => {
            // Save button
            const saveBtn = document.getElementById('saveNotesSurveyBtn');
            if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                saveTechNotesAndSurvey(tech);
                saveBtn.textContent = 'Saved!';
                setTimeout(() => { saveBtn.textContent = 'Save Notes & Survey'; }, 1200);
            });
            }
            // Export
            const exportBtn = document.getElementById('exportSurveyBtn');
            if (exportBtn) {
            exportBtn.addEventListener('click', exportAllSurveyData);
            }

            // Notes: update the in-memory state as you type (for instant recall if you switch cards)
            const notesArea = document.getElementById('viewerNotesArea');
            if (notesArea) {
            notesArea.addEventListener('input', () => {
                techNotes[techKey] = notesArea.value;
            });
            }
            // Survey: update in-memory as soon as you select any radio
            const surveyForm = document.getElementById('surveyForm');
            if (surveyForm) {
            surveyForm.addEventListener('change', () => {
                saveTechNotesAndSurvey(tech); // Autosave on any change (optional, or just update in-memory state here)
            });
            }
        }, 0);
    });

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

function exportAllSurveyData() {
    const techNotesExport = {};
    const techSurveyResponsesExport = {};

    technologyData.forEach(tech => {
        const key = tech['Technology Name'];
        techNotesExport[key] = techNotes[key] || "";
        techSurveyResponsesExport[key] = techSurveyResponses[key] || {};
    });

    const result = {
        techNotes: techNotesExport,
        techSurveyResponses: techSurveyResponsesExport
    };

    const jsonBlob = new Blob([JSON.stringify(result, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'technology_survey_results.json';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        link.remove();
    }, 250);
}

function saveTechNotesAndSurvey(tech) {
    const techKey = tech['Technology Name'];
    // Save notes
    const area = document.getElementById('viewerNotesArea');
    if (area) techNotes[techKey] = area.value;

    // Save survey
    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        const formEls = surveyForm.elements;
        let vals = {};

        for (let el of formEls) {
            if (el.type === 'radio' && el.checked) {
                vals[el.name] = el.value;
            }
            // Multi-select for Operational Environment Flexibility
            if (el.type === 'checkbox' && el.name === "Operational Environment Flexibility") {
                if (!vals[el.name]) vals[el.name] = [];
                if (el.checked) vals[el.name].push(el.value);
            }
            if (el.tagName === "SELECT") {
                vals[el.name] = el.value;
            }
        }
        techSurveyResponses[techKey] = { ...techSurveyResponses[techKey], ...vals };
    }
    const saveBtn = document.getElementById('saveNotesBtn');
    if (saveBtn) {
        saveBtn.textContent = 'Saved!';
        setTimeout(() => { saveBtn.textContent = 'Save Notes & Survey'; }, 1200);
    }
}




function handleImportResultsSelect(e) {
    console.log("IMPORT handler called"); 
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsed = JSON.parse(event.target.result);
            console.log("Loaded parsed JSON:", parsed); 
            //Check for expected structure
            if (!parsed.techNotes || !parsed.techSurveyResponses) {
                console.error("Invalid import format. Expected 'techNotes' and 'techSurveyResponses' keys.");
                alert("Invalid import format. Please ensure the file contains 'techNotes' and 'techSurveyResponses'.");
                return;
            }
            // Assign to correct variable!
            techNotes = parsed.techNotes || {};
            techSurveyResponses = parsed.techSurveyResponses || {};
            displayResults();
        } catch (err) {
            console.error("Error parsing import JSON", err);
        }
    }
    reader.readAsText(file);
}

function unescapeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}


// UI Helpers
function showSideViewer(htmlContent) {
    sideViewerContent.innerHTML = htmlContent;
    sideViewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

function closeSideViewer() {
    sideViewer.classList.add('hidden');
    sideViewerContent.innerHTML = '';
    document.body.style.overflow = ''; // Restore scroll
}

function renderTechDetails(tech) {
    console.log(tech)
    return `
        <h2>${escapeHtml(tech['Technology Name'] || 'Untitled')}</h2>
        <div><strong>Producer:</strong> ${escapeHtml(tech['Tech Producer'] || '')}</div>
        <div><strong>Description:</strong> ${escapeHtml(tech['Description'] || '')}</div>
        <div><strong>TRL:</strong> ${escapeHtml(tech['TRL'] || '')}</div>
    `;
}

function renderNotesSection(techKey) {
    const noteVal = techNotes[techKey] || '';
    return `
    <div class="viewer-section-title" style="margin-top:1.1em;">Notes</div>
    <textarea id="viewerNotesArea" class="viewer-notes-area" placeholder="Your notes about this technology...">${escapeHtml(noteVal)}</textarea>
    <button id="saveNotesBtn" class="btn btn--primary viewer-save-btn" style="margin-top:18px;">Save Notes</button>
    `;
}

function renderSurveySection(techKey) {
    const surveyVals = techSurveyResponses[techKey] || {};
    let html = `<form id="surveyForm">`;

    Object.entries(surveyConfig).forEach(([attrKey, attrObj]) => {
        html += `<div class="viewer-section viewer-survey-section">`;
        // ---- TITLE ----
        html += `<div class="viewer-section-title">${escapeHtml(attrKey)}</div>`;

        // ---- DEFINITION & SCALEDESCRIPTION ----
        if (attrKey === "Operational Environment Flexibility") {
            // Show definition as HTML (not escaped) for OEF
            html += `<div style="font-size:0.98em;color:var(--color-text-secondary);margin-bottom:0.44em;">${attrObj.definition || ''}</div>`;
        } else {
            // Show escaped definition, and unescaped HTML scaleDescription if present
            html += `<div style="font-size:0.98em;color:var(--color-text-secondary);margin-bottom:0.44em;">${escapeHtml(attrObj.definition || '')}</div>`;
            if (attrObj.scaleDescription) {
                html += `<div style="font-size:0.93em;color:var(--color-text-secondary);margin-bottom:0.9em;">${attrObj.scaleDescription}</div>`;
            }
        }

        // ---- INPUT UI ----
        if (attrKey === "Operational Environment Flexibility" && attrObj.categories) {
            // MULTI-SELECT CHECKBOXES
            let checkedVals = [];
            if (Array.isArray(surveyVals[attrKey])) {
                checkedVals = surveyVals[attrKey].map(String);
            } else if (typeof surveyVals[attrKey] === "string" && surveyVals[attrKey]) {
                checkedVals = surveyVals[attrKey].split(',').map(s => s.trim());
            }
            html += `<div class="survey-group">
                <span class="survey-question-label">Applicable Environments (select all that apply):</span>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">`;
            attrObj.categories.forEach((cat, idx) => {
                const val = (idx + 1).toString();
                html += `
                    <label style="display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" name="${attrKey}" value="${val}" ${checkedVals.includes(val) ? "checked" : ""}>
                        <span style="font-size:0.98em;"><b>${val}</b> - ${escapeHtml(cat)}</span>
                    </label>
                `;
            });
            html += `</div></div>`;
        } else {
            // NUMERIC RATING 0-10 RADIO BUTTONS
            const scale = attrObj.scaleValues || [0,1,2,3,4,5,6,7,8,9,10];
            const savedVal = typeof surveyVals[attrKey] !== "undefined" ? surveyVals[attrKey] : 0;

            html += `<div class="survey-group"><div class="survey-likert">`;
            scale.forEach(v => {
                const id = `${attrKey}_v${v}`;
                html += `
                    <div>
                        <input type="radio" name="${attrKey}" id="${id}" value="${v}" ${savedVal == v ? "checked" : ""}>
                        <label for="${id}">${v}</label>
                    </div>
                `;
            });
            html += `</div></div>`;
        }
        html += `</div>`; // .viewer-section
    });

    html += `</form>`;
    return html;
}




sideViewerCloseBtn.addEventListener('click', closeSideViewer);
sideViewerOverlay.addEventListener('click', closeSideViewer);
exportResultsBtn.addEventListener('click', exportAllSurveyData);
importResultsBtn.addEventListener('click', () => importResultsFile.click());
importResultsFile.addEventListener('change', handleImportResultsSelect);