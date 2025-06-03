import '../style.css';
import { SectorManager } from './sectorManager.js';
import { PortfolioVisualizer } from './portfolioVisualizer.js';
import { formatCurrency } from './utils.js';
import { ThemeManager } from './themeManager.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Create instances of our main components
  const sectorManager = new SectorManager();
  const visualizer = new PortfolioVisualizer(document.getElementById('visualization'));
  const themeManager = new ThemeManager()
  // Set up event listeners
  setupEventListeners(sectorManager, visualizer);

  // Populate selector management default total investment
  const totalInvestmentInput = document.getElementById('total-investment');
  if (!totalInvestmentInput.value) {
    totalInvestmentInput.value = sectorManager.getTotalInvestment();
  }
  // Initial render
  renderUI(sectorManager, visualizer);
});

function setupEventListeners(sectorManager, visualizer) {
  const totalInvestmentInput = document.getElementById('total-investment');
  const totalBorrowInput = document.getElementById('total-borrow');
  const addButton = document.getElementById('add-sector-btn');
  const sectorSelect = document.getElementById('sector-select');
  const subsectionSelect = document.getElementById('subsection-select');
  const percentageInput = document.getElementById('percentage-input');
  const selectedSectorsContainer = document.getElementById('selected-sectors');
  const subsectionWrapper = document.querySelector('.subsection-wrapper');

  const borrowSectorSelect = document.getElementById('borrow-sector-select');
  const borrowSubsectionSelect = document.getElementById('borrow-subsection-select');
  const borrowPercentageInput = document.getElementById('borrow-percentage-input');
  const addBorrowBtn = document.getElementById('add-borrow-btn');
  const borrowAllocationsList = document.getElementById('borrow-allocations-list');

  // Total investment input
  totalInvestmentInput.addEventListener('change', () => {
    const amount = parseFloat(totalInvestmentInput.value);
    if (amount > 0) {
      sectorManager.setTotalInvestment(amount);
      renderUI(sectorManager, visualizer);
    }
  });

  // Listen for changes in total investment input
  totalInvestmentInput.addEventListener('input', () => {
    const amount = parseFloat(totalInvestmentInput.value);
    if (amount > 0) {
      sectorManager.setTotalInvestment(amount);
      renderUI(sectorManager, visualizer);
    }
  });

  // Sector type selection
  sectorSelect.addEventListener('change', () => {
    const selectedType = sectorSelect.value;
    if (selectedType) {
      updateSubsectionSelect(selectedType);
      console.log(`Selected sector type: ${selectedType}`);

      subsectionWrapper.classList.add('visible');
    } else {
      subsectionWrapper.classList.remove('visible');
    }
  });

  // Add sector button
  addButton.addEventListener('click', () => {
    const sectorType = sectorSelect.value;
    const subsection = subsectionSelect.value;
    const percentage = parseFloat(percentageInput.value);
    const totalInvestment = sectorManager.getTotalInvestment();

    if (!totalInvestment) {
      showError('Please enter a total investment amount first');
      return;
    }

    if (!sectorType || !subsection) {
      showError('Please select both a sector type and subsection');
      return;
    }

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      showError('Please enter a valid percentage between 0 and 100');
      return;
    }

    const currentTotal = sectorManager.getTotalPercentage();
    if (currentTotal + percentage > 100) {
      showError('Total allocation cannot exceed 100%');
      return;
    }

    // Add the sector
    sectorManager.addSector(sectorType, subsection, percentage);

    // Reset inputs
    sectorSelect.selectedIndex = 0;
    subsectionSelect.selectedIndex = 0;
    percentageInput.value = '';
    subsectionWrapper.classList.remove('visible');

    // Update UI
    renderUI(sectorManager, visualizer);
  });

  // Handle sector removal
  selectedSectorsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-sector-btn')) {
      const sectorId = e.target.dataset.id;
      sectorManager.removeSector(sectorId);
      renderUI(sectorManager, visualizer);
    }
  });

  // Handle borrow allocation controls from Total borrow input
  totalBorrowInput.addEventListener('input', () => {
    const amount = parseFloat(totalBorrowInput.value) || 0;
    if (isNaN(amount) || amount < 0) {
      showError('Please enter a valid borrow amount');
      return;
    }

    // Vérifier que le montant ne dépasse pas 80% du total des prêts
    const totalLending = sectorManager.getTotalAllocationByType('lending');
    if (amount > totalLending * 0.80) {
      showError(`Borrow amount ($${formatCurrency(amount)}) cannot exceed 80% ($${formatCurrency(totalLending * 0.80)}) of total investment in lending sectors ($${formatCurrency(totalLending)})`);
      totalBorrowInput.value = totalLending * 0.80; // Reset à la valeur max autorisée
      return;
    }

    sectorManager.setTotalBorrow(amount);
    // Afficher/masquer la section d'allocation des emprunts
    toggleBorrowAllocationSection(amount > 0);
    renderUI(sectorManager, visualizer);
  });

  totalBorrowInput.addEventListener('change', () => {
    const amount = parseFloat(totalBorrowInput.value) || 0;

    sectorManager.setTotalBorrow(amount);
    renderUI(sectorManager, visualizer);
  });

  // Gestion du sélecteur de secteur d'emprunt
  borrowSectorSelect.addEventListener('change', () => {
    const selectedType = borrowSectorSelect.value;
    if (selectedType) {
      updateBorrowSubsectionSelect(selectedType);
    }
  });

  // Bouton d'ajout d'allocation d'emprunt
  addBorrowBtn.addEventListener('click', () => {
    const sectorType = borrowSectorSelect.value;
    const subsection = borrowSubsectionSelect.value;
    const percentage = parseFloat(borrowPercentageInput.value);

    if (!sectorType || !subsection) {
      showError('Please select both a sector type and subsection');
      return;
    }

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      showError('Please enter a valid percentage between 0 and 100');
      return;
    }

    const currentTotal = sectorManager.getTotalBorrowPercentage();
    if (currentTotal + percentage > 100) {
      showError('Total borrow allocation cannot exceed 100%');
      return;
    }

    // Ajouter l'allocation
    sectorManager.addBorrowAllocation(sectorType, subsection, percentage);

    // Reset des inputs
    borrowSectorSelect.selectedIndex = 0;
    borrowSubsectionSelect.innerHTML = '<option value="" disabled selected>Select subsection</option>';
    borrowPercentageInput.value = '';

    // Mettre à jour l'interface
    renderUI(sectorManager, visualizer);
  });

  // Gestion de la suppression des allocations d'emprunt
  borrowAllocationsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-borrow-btn')) {
      const allocationId = e.target.dataset.id;
      sectorManager.removeBorrowAllocation(allocationId);
      renderUI(sectorManager, visualizer);
    }
  });
  // const borrowContainer = document.getElementById('borrow-allocation-controls');
  // borrowContainer.addEventListener('input', (e) => {
  //   if (e.target.classList.contains('percentage-input-small')) {
  //     const sectorType = e.target.dataset.sectorType;
  //     const percentage = parseFloat(e.target.value) || 0;
  //     const subsectionSelect = borrowContainer.querySelector(`select[data-sector-type="${sectorType}"]`);
  //     const subsection = subsectionSelect.value;

  //     if (subsection && percentage > 0) {
  //       // Vérifier que le total ne dépasse pas 100%
  //       const currentTotal = sectorManager.getTotalBorrowPercentage();
  //       const existingAllocation = sectorManager.getAllBorrowAllocations().find(
  //         alloc => alloc.type === sectorType
  //       );
  //       const existingPercentage = existingAllocation?.percentage || 0;

  //       if (currentTotal - existingPercentage + percentage > 100) {
  //         showError('Total borrow allocation cannot exceed 100%');
  //         e.target.value = existingPercentage;
  //         return;
  //       }

  //       sectorManager.addBorrowAllocation(sectorType, subsection, percentage);
  //       updateBorrowSummary(sectorManager);
  //       renderUI(sectorManager, visualizer);
  //     }
  //   }
  // });

  // borrowContainer.addEventListener('change', (e) => {
  //   if (e.target.classList.contains('sector-subsection-select')) {
  //     const sectorType = e.target.dataset.sectorType;
  //     const subsection = e.target.value;
  //     const percentageInput = borrowContainer.querySelector(`input[data-sector-type="${sectorType}"]`);
  //     const percentage = parseFloat(percentageInput.value) || 0;

  //     if (subsection && percentage > 0) {
  //       sectorManager.addBorrowAllocation(sectorType, subsection, percentage);
  //       updateBorrowSummary(sectorManager);
  //       renderUI(sectorManager, visualizer);
  //     }
  //   }
  // });
}

// fonction pour mettre à jour le select des sous-sections d'emprunt
function updateBorrowSubsectionSelect(sectorType) {
  const borrowSubsectionSelect = document.getElementById('borrow-subsection-select');
  const sectorTypes = SectorManager.getSectorTypes();
  const subsections = sectorTypes[sectorType].subsections;

  // Clear current options
  borrowSubsectionSelect.innerHTML = '<option value="" disabled selected>Select subsection</option>';

  // Add new options
  Object.entries(subsections).forEach(([value, { name }]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    borrowSubsectionSelect.appendChild(option);
  });
}

function updateSubsectionSelect(sectorType) {
  const subsectionSelect = document.getElementById('subsection-select');
  const sectorTypes = SectorManager.getSectorTypes();
  const subsections = sectorTypes[sectorType].subsections;

  // Clear current options
  subsectionSelect.innerHTML = '<option value="" disabled selected>Select a subsection</option>';

  // Add new options
  Object.entries(subsections).forEach(([value, { name }]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    subsectionSelect.appendChild(option);
  });
}

function renderUI(sectorManager, visualizer) {

  const totalInvestmentInput = document.getElementById('total-investment');
  if (!totalInvestmentInput.value) {
    totalInvestmentInput.value = sectorManager.getTotalInvestment();
  }
  renderSelectedSectors(sectorManager);
  renderBorrowAllocations(sectorManager); 
  updateTotalAllocation(sectorManager);
  updateBorrowSummary(sectorManager);
  visualizer.render(sectorManager.getAllSectors(), sectorManager.getTotalBorrow(), sectorManager.getAllBorrowAllocations());
}

function renderSelectedSectors(sectorManager) {
  const container = document.getElementById('selected-sectors');
  const sectors = sectorManager.getAllSectors();

  // Clear current content
  container.innerHTML = '';

  if (sectors.length === 0) {
    container.innerHTML = '<p class="empty-message">No sectors added yet. Add your first sector above.</p>';
    return;
  }

  // Add each sector
  sectors.forEach(sector => {
    const sectorElement = document.createElement('div');
    sectorElement.className = 'sector-item';

    sectorElement.innerHTML = `
      <div class="sector-info">
        <div class="sector-color" style="background-color: ${sector.color};"></div>
        <span>
          <strong>${sector.type}</strong>:
          ${sector.name}
        </span>
      </div>
      <div class="sector-details">
        <span>${sector.percentage}% (${formatCurrency(sector.amount)})</span>
      </div>
      <div class="selector-actions">
        <button class="btn-danger remove-sector-btn" data-id="${sector.id}">X</button>
      </div>
    `;

    container.appendChild(sectorElement);
  });
}

function updateTotalAllocation(sectorManager) {
  const totalElement = document.getElementById('total-allocation');
  const remainingElement = document.getElementById('remaining-allocation');
  const totalPercentage = sectorManager.getTotalPercentage();
  const totalBorrowPercentage = sectorManager.totalBorrow > 0 ? (sectorManager.totalBorrow / sectorManager.totalInvestment) * 100 : 0;
  const remainingPercentage = (100 + totalBorrowPercentage) - (totalPercentage);

  totalElement.textContent = `${totalPercentage}% (${formatCurrency(sectorManager.getTotalAllocation())})`;
  remainingElement.textContent = `${remainingPercentage}%`;
}

function showError(message) {
  // Simple error notification
  alert(message);
}

function toggleBorrowAllocationSection(show) {
  const section = document.getElementById('borrow-allocation-section');
  section.style.display = show ? 'block' : 'none';
}

// fonction pour afficher les allocations d'emprunt
function renderBorrowAllocations(sectorManager) {
  const container = document.getElementById('borrow-allocations-list');
  const allocations = sectorManager.getAllBorrowAllocations();

  container.innerHTML = '';

  if (allocations.length === 0) {
    container.innerHTML = '<p class="empty-message">No borrow allocations added yet.</p>';
    return;
  }

  allocations.forEach(allocation => {
    const allocationElement = document.createElement('div');
    allocationElement.className = 'borrow-allocation-item';

    allocationElement.innerHTML = `
      <div class="borrow-allocation-info">
        <div class="sector-color" style="background-color: ${allocation.color};"></div>
        <span>
          <strong>${allocation.type}</strong>: ${allocation.name}
        </span>
      </div>
      <div class="borrow-allocation-details">
        <span>${allocation.percentage}% (${formatCurrency(allocation.amount)})</span>
      </div>
      <div class="sector-actions">
        <button class="btn-danger remove-borrow-btn" data-id="${allocation.id}">X</button>
      </div>
    `;

    container.appendChild(allocationElement);
  });
}

/**
 * Mettre à jour le résumé des allocations d'emprunt
 */
function updateBorrowSummary(sectorManager) {
  const totalElement = document.getElementById('total-borrow-allocation');
  const remainingElement = document.getElementById('remaining-borrow-allocation');

  const totalPercentage = sectorManager.getTotalBorrowPercentage();
  const remainingPercentage = 100 - totalPercentage;

  totalElement.textContent = `${totalPercentage.toFixed(1)}%`;
  remainingElement.textContent = `${remainingPercentage.toFixed(1)}%`;
}