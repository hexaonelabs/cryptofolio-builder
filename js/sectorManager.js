import { generateId } from './utils.js';

const SUBSECTION = {
  CRYPTO_CRYPTO: 'Crypto/Crypto',
  CRYPTO_STABLE: 'Crypto/Stable',
  STABLE_STABLE: 'Stable/Stable',
  CUSTOM: 'Custom',
  CRYPTO: 'Crypto',
  STABLE: 'Stable',
  NFT: 'NFT'
};

// Define the sector types and their subsections
const SECTOR_TYPES = {
  borrow: {
    name: 'Borrow',
    color: 'var(--color-borrow)',
    subsections: {
      [SUBSECTION.CRYPTO]: { name: SUBSECTION.CRYPTO, color: 'var(--color-borrow-1)' },
      [SUBSECTION.STABLE]: { name: SUBSECTION.STABLE, color: 'var(--color-borrow-2)' },
    }
  },
  lp: {
    name: 'Liquidity Provider (LP)',
    color: 'var(--color-lp)',
    subsections: {
      [SUBSECTION.CRYPTO_CRYPTO]: { name: SUBSECTION.CRYPTO_CRYPTO, color: 'var(--color-lp-1)' },
      [SUBSECTION.CRYPTO_STABLE]: { name: SUBSECTION.CRYPTO_STABLE, color: 'var(--color-lp-2)' },
      [SUBSECTION.STABLE_STABLE]: { name: SUBSECTION.STABLE_STABLE, color: 'var(--color-lp-3)' },
      [SUBSECTION.CUSTOM]: { name: SUBSECTION.CUSTOM, color: 'var(--color-lp-4)' }
    }
  },
  lending: {
    name: 'Lending',
    color: 'var(--color-lending)',
    subsections: {
      [SUBSECTION.CRYPTO]: { name: SUBSECTION.CRYPTO, color: 'var(--color-lending-1)' },
      [SUBSECTION.STABLE]: { name: SUBSECTION.STABLE, color: 'var(--color-lending-2)' },
      [SUBSECTION.CUSTOM]: { name: SUBSECTION.CUSTOM, color: 'var(--color-lending-3)' }
    }
  },
  hodl: {
    name: 'HODL',
    color: 'var(--color-hodl)',
    subsections: {
      [SUBSECTION.CRYPTO]: { name: SUBSECTION.CRYPTO, color: 'var(--color-hodl-1)' },
      [SUBSECTION.STABLE]: { name: SUBSECTION.STABLE, color: 'var(--color-hodl-2)' },
      [SUBSECTION.CUSTOM]: { name: SUBSECTION.CUSTOM, color: 'var(--color-hodl-4)' }
    }
  },
  custom: {
    name: 'Custom Strategy',
    color: 'var(--color-custom)',
    subsections: {
      [SUBSECTION.CUSTOM]: { name: SUBSECTION.CUSTOM, color: 'var(--color-custom-1)' }
    }
  }
};

const EXAMPLE_10K_PORTFOLIO = [
  // {
  //   id: generateId(),
  //   type: 'lp',
  //   subsection: SUBSECTION.CRYPTO_CRYPTO,
  //   name: SECTOR_TYPES.lp.subsections[SUBSECTION.CRYPTO_CRYPTO].name,
  //   color: SECTOR_TYPES.lp.subsections[SUBSECTION.CRYPTO_CRYPTO].color,
  //   percentage: 30,
  // },
  //   {
  //   id: generateId(),
  //   type: 'lp',
  //   subsection: SUBSECTION.STABLE_STABLE,
  //   name: SECTOR_TYPES.lp.subsections[SUBSECTION.STABLE_STABLE].name,
  //   color: SECTOR_TYPES.lp.subsections[SUBSECTION.STABLE_STABLE].color,
  //   percentage: 5,
  // },
  {
    id: generateId(),
    type: 'lending',
    subsection: SUBSECTION.CRYPTO,
    name: SECTOR_TYPES.lending.subsections[SUBSECTION.CRYPTO].name,
    color: SECTOR_TYPES.lending.subsections[SUBSECTION.CRYPTO].color,
    percentage: 60,
  },
  {
    id: generateId(),
    type: 'lending',
    subsection: SUBSECTION.STABLE,
    name: SECTOR_TYPES.lending.subsections[SUBSECTION.STABLE].name,
    color: SECTOR_TYPES.lending.subsections[SUBSECTION.STABLE].color,
    percentage: 20,
  },
  {
    id: generateId(),
    type: 'hodl',
    subsection: SUBSECTION.CRYPTO,
    name: SECTOR_TYPES.hodl.subsections[SUBSECTION.CRYPTO].name,
    color: SECTOR_TYPES.hodl.subsections[SUBSECTION.CRYPTO].color,
    percentage: 15,
  },
  {
    id: generateId(),
    type: 'custom',
    subsection: SUBSECTION.CUSTOM,
    name: SECTOR_TYPES.custom.subsections[SUBSECTION.CUSTOM].name,
    color: SECTOR_TYPES.custom.subsections[SUBSECTION.CUSTOM].color,
    percentage: 5,
  }
];

export class SectorManager {
  constructor() {
    this.sectors = [];
    this.totalInvestment = 10000; // Default total investment amount
    this.borrowAllocations = [];
    this.totalBorrow = 0;
    this.initialzeWithExample();
    console.log('SectorManager initialized with example portfolio:', this.sectors);
  }

  initialzeWithExample() {
    EXAMPLE_10K_PORTFOLIO.forEach(sector => {
      this.addSector(sector.type, sector.subsection, sector.percentage);
    });
  }
  
  setTotalInvestment(amount) {
    this.totalInvestment = amount;
    this.updateAllSectorAmounts();
  }

  // Update all sector amounts based on the current total investment
  updateAllSectorAmounts() {
    this.sectors.forEach(sector => {
      sector.amount = (sector.percentage / 100) * this.totalInvestment;
    });
  }

  getTotalInvestment() {
    return this.totalInvestment;
  }

  getTotalBorrow() {
    return this.totalBorrow;
  }
  
  /**
   * Add a new sector to the portfolio
   * @param {string} type - The sector type
   * @param {string} subsection - The subsection type
   * @param {number} percentage - The percentage allocated to this sector
   * @returns {Object} The newly created sector
   */
  addSector(type, subsection, percentage) {
    if (!SECTOR_TYPES[type]) {
      throw new Error(`Invalid sector type: ${type}`);
    }
    
    if (!SECTOR_TYPES[type].subsections[subsection]) {
      throw new Error(`Invalid subsection: ${subsection} for type: ${type}`);
    }
    
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    
    const amount = (percentage / 100) * this.totalInvestment;
    
    const newSector = {
      id: generateId(),
      type,
      subsection,
      name: SECTOR_TYPES[type].subsections[subsection].name,
      color: SECTOR_TYPES[type].subsections[subsection].color,
      percentage,
      amount
    };
    
    this.sectors.push(newSector);
    return newSector;
  }
  
  removeSector(id) {
    const initialLength = this.sectors.length;
    this.sectors = this.sectors.filter(sector => sector.id !== id);
    return this.sectors.length !== initialLength;
  }
  
  getAllSectors() {
    return [...this.sectors];
  }
  
  getTotalAllocation() {
    return this.sectors.reduce((total, sector) => total + sector.amount, 0);
  }
  
  getTotalPercentage() {
    return this.sectors.reduce((total, sector) => total + sector.percentage, 0);
  }

  getTotalAllocationByType(type) {
    return this.sectors
      .filter(sector => sector.type === type)
      .reduce((total, sector) => total + sector.amount, 0);
  }

  getTotalPercentageByType(type) {
    return this.sectors
      .filter(sector => sector.type === type)
      .reduce((total, sector) => total + sector.percentage, 0);
  }
  
  getSectorsByType() {
    return this.sectors.reduce((grouped, sector) => {
      if (!grouped[sector.type]) {
        grouped[sector.type] = [];
      }
      grouped[sector.type].push(sector);
      return grouped;
    }, {});
  }

  addBorrowAllocation(type, subsection, percentage) {
    if (!SECTOR_TYPES[type]) {
      throw new Error(`Invalid sector type: ${type}`);
    }
    
    if (!SECTOR_TYPES[type].subsections[subsection]) {
      throw new Error(`Invalid subsection: ${subsection} for type: ${type}`);
    }
    
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    
    const amount = (percentage / 100) * this.totalBorrow;
    
    const newBorrowAllocation = {
      id: generateId(),
      type,
      subsection,
      name: SECTOR_TYPES[type].subsections[subsection].name,
      color: SECTOR_TYPES[type].subsections[subsection].color,
      percentage,
      amount
    };
    
    this.borrowAllocations.push(newBorrowAllocation);
    
    // // Vérifier si une allocation existe déjà pour ce type/subsection
    // const existingIndex = this.borrowAllocations.findIndex(
    //   alloc => alloc.type === type && alloc.subsection === subsection
    // );
    
    // if (existingIndex !== -1) {
    //   // Remplacer l'allocation existante en gardant le même ID
    //   newBorrowAllocation.id = this.borrowAllocations[existingIndex].id;
    //   this.borrowAllocations[existingIndex] = newBorrowAllocation;
    // } else {
    //   this.borrowAllocations.push(newBorrowAllocation);
    // }
    
    return newBorrowAllocation;
  }

  /**
   * Supprimer une allocation d'emprunt
   */
  removeBorrowAllocation(id) {
    const initialLength = this.borrowAllocations.length;
    this.borrowAllocations = this.borrowAllocations.filter(alloc => alloc.id !== id);
    return this.borrowAllocations.length !== initialLength;
  }

  /**
   * Obtenir toutes les allocations d'emprunt
   */
  getAllBorrowAllocations() {
    return [...this.borrowAllocations];
  }

  /**
   * Obtenir le pourcentage total des allocations d'emprunt
   */
  getTotalBorrowPercentage() {
    return this.borrowAllocations.reduce((total, alloc) => total + alloc.percentage, 0);
  }

  /**
   * Obtenir le montant total des allocations d'emprunt
   */
  getTotalBorrowAllocation() {
    return this.borrowAllocations.reduce((total, alloc) => total + alloc.amount, 0);
  }

  /**
   * Mettre à jour les montants des allocations d'emprunt
   */
  updateAllBorrowAllocationAmounts() {
    this.borrowAllocations.forEach(alloc => {
      alloc.amount = (alloc.percentage / 100) * this.totalBorrow;
    });
  }

  setTotalBorrow(amount) {
    this.totalBorrow = amount || 0;
    this.updateAllBorrowAllocationAmounts();
    
    // Si le montant d'emprunt est 0, vider les allocations
    if (this.totalBorrow === 0) {
      this.borrowAllocations = [];
    }
  }
  
  static getSectorTypes() {
    return SECTOR_TYPES;
  }
}