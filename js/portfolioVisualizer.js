import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export class PortfolioVisualizer {
  constructor(container) {
    this.container = container;
    this.margin = { top: 30, right: 150, bottom: 20, left: 12 };
  }

  render(sectors, totalBorrow = 0, borrowAllocations = []) {
    this.container.innerHTML = '';
    if (!sectors || sectors.length === 0) {
      this.showEmptyMessage();
      return;
    }

    const { width, height } = this.getDimensions();

    const { nodes, links } = this.processData(sectors, totalBorrow, borrowAllocations);

    const sankeyData = this.generateSankey(nodes, links, width, height);
    const sankeyNodes = sankeyData.nodes;
    const sankeyLinks = sankeyData.links;

    const svg = this.createSVG(width, height);

    this.drawNodes(svg, sankeyNodes);
    this.drawLinks(svg, sankeyLinks);
    this.drawLabels(svg, sankeyNodes);

    this.container.appendChild(svg.node());
  }

  getDimensions() {
    const containerRect = this.container.getBoundingClientRect();
    const maxWidth = Math.min(containerRect.width, window.innerWidth - 40); // 40px de marge

    return {
      width: maxWidth || 600,
      height: containerRect.height || 400
    };
  }

  createSVG(width, height) {
    return d3.create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-visualization';
    emptyMessage.textContent = 'Add sectors to see your portfolio visualization';
    this.container.appendChild(emptyMessage);
  }

  processData(sectors, totalBorrow = 0, borrowAllocations = []) {
    const nodes = [{
      id: 'portfolio',
      name: 'Total Portfolio',
      color: this.resolveColor('var(--color-portfolio)'),
      depth: 0
    }];
    const links = [];
    const categories = new Map();
    const existingSubsectors = new Set(); // Pour tracker les sous-secteurs existants

    // Si il y a un montant d'emprunt, créer le node Borrow
    if (totalBorrow > 0) {
      const borrowNode = {
        id: 'borrow',
        name: 'Borrow',
        color: this.resolveColor('var(--color-borrow)'),
        depth: 0
      };
      nodes.push(borrowNode);
    }

    // Manage `normal` sectors allocations
    sectors.forEach(sector => {
      // Sécurisation de la couleur
      const mainColor = this.resolveColor(sector.color || '#808080');
      if (!categories.has(sector.type)) {
        const categoryNode = {
          id: sector.type,
          name: sector.type,
          color: mainColor,
          depth: 1
        };
        categories.set(sector.type, categoryNode);
        nodes.push(categoryNode);

        // Lien portfolio -> catégorie
        links.push({
          source: 'portfolio',
          target: sector.type,
          value: 0
        });
      }

      // Mise à jour des valeurs
      const categoryLink = links.find(l => l.target === sector.type);
      categoryLink.value += sector.amount;

      // Création des sous-catégories
      const subsectorId = `${sector.type}-${sector.name}`;
      const subColor = this.adjustColor(mainColor, -0.2);
      const subsectorNode = {
        id: subsectorId,
        name: sector.name,
        color: subColor,
        depth: 2,
        showLabel: true // Toujours afficher le label pour les secteurs normaux
      };
      nodes.push(subsectorNode);
      existingSubsectors.add(subsectorId); // Ajouter à la liste des sous-secteurs existants

      // Lien catégorie -> sous-catégorie
      links.push({
        source: sector.type,
        target: subsectorId,
        value: sector.amount
      });
    });

    console.log('Processed sectors:', borrowAllocations);
    // manage borrow sectors allocations
    if (borrowAllocations && borrowAllocations.length > 0) {
      borrowAllocations.forEach(allocation => {
        const borrowCategoryId = `borrow-${allocation.type}`;
        const mainColor = this.resolveColor(allocation.color || '#808080');

        // Créer ou trouver la catégorie d'emprunt
        if (!categories.has(borrowCategoryId)) {
          const borrowCategoryNode = {
            id: borrowCategoryId,
            name: `${allocation.type}`,
            color: mainColor,
            depth: 1
          };
          categories.set(borrowCategoryId, borrowCategoryNode);
          nodes.push(borrowCategoryNode);

          // Lien borrow -> catégorie d'emprunt
          links.push({
            source: 'borrow',
            target: borrowCategoryId,
            value: 0
          });
        }

        // Mise à jour des valeurs
        const borrowCategoryLink = links.find(l => l.target === borrowCategoryId);
        if (borrowCategoryLink) {
          borrowCategoryLink.value += allocation.amount;
        }

        // Création des sous-catégories d'emprunt
        const borrowSubsectorId = `${allocation.type}-${allocation.name}`;

        // Vérifier si cette sous-section existe déjà dans les allocations normales
        const shouldShowLabel = !existingSubsectors.has(borrowSubsectorId);

        if (shouldShowLabel) {
          // Si cette sous-section n'existe pas encore, la créer normalement
          const subColor = this.adjustColor(mainColor, -0.2);
          const borrowSubsectorNode = {
            id: borrowSubsectorId,
            name: `${allocation.name}`,
            color: subColor,
            depth: 2,
            showLabel: true
          };
          nodes.push(borrowSubsectorNode);
          existingSubsectors.add(borrowSubsectorId);
        }

        // Lien catégorie d'emprunt -> sous-catégorie d'emprunt
        const existingLink = links.find(l => l.source === borrowCategoryId && l.target === borrowSubsectorId);
        if (existingLink) {
          existingLink.value += allocation.amount;
        } else {
          links.push({
            source: borrowCategoryId,
            target: borrowSubsectorId,
            value: allocation.amount
          });
        }
      });
    }
    return { nodes, links };
  }

  generateSankey(nodes, links, width, height) {
    const sankeyGenerator = sankey()
      .nodeId(d => d.id)
      .nodeWidth(40)
      .nodePadding(25)
      .extent([
        [this.margin.left, this.margin.top],
        [width - this.margin.right, height - this.margin.bottom]
      ]);

    return sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    });
  }

  drawNodes(svg, nodes) {
    svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => this.resolveColor(d.color))
      .attr('rx', 4)
      .attr('ry', 4);
  }

  drawLinks(svg, links) {
    svg.append('g')
      .attr('stroke-opacity', 0.25)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => this.adjustColor(d.target.color, 0.3))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none');
  }

  drawLabels(svg, nodes) {
    const portfolioTotal = nodes.find(d => d.id === 'portfolio')?.value || 1;
    const borrowTotal = nodes.find(d => d.id === 'borrow')?.value || 1;

    // Filtrer les nœuds pour lesquels on veut afficher les labels
    const nodesToLabel = nodes.filter(d => {
      // Toujours afficher les labels pour depth 0 et 1
      if (d.depth <= 1) return true;

      // Pour depth 2, afficher seulement si showLabel est true ET qu'il n'y a pas de merge borrow
      if (d.depth === 2) {
        return d.showLabel !== false && !d.hasBorrowMerge;
      }

      return true;
    });

    const labelGroup = svg.append('g')
      .selectAll('text')
      .data(nodesToLabel)
      .join('text')
      .attr('x', d => d.x1 + 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('text-anchor', 'start')
      .attr('fill', 'var(--color-text-primary)')
      .attr('font-family', 'sans-serif');

    // Nom sur la première ligne avec troncature si nécessaire
    labelGroup.append('tspan')
      .attr('x', d => d.x1 + 6)
      .attr('dy', 0)
      .attr('font-size', d => d.depth === 0 ? '1rem' : '0.75rem')
      .text(d => {
        const name = d.name.toUpperCase();
        // Tronquer si trop long
        return name.length > 15 ? name.substring(0, 12) + '...' : name;
      });

    // Prix sur la deuxième ligne
    labelGroup
      .append('tspan')
      .attr('x', d => d.x1 + 6)
      .attr('dy', '1.1em')
      .attr('font-size', '0.75rem')
      .text(d => {
        const amount = formatCurrency(d.value);
        // Déterminer le total de référence selon le contexte
        let referenceTotal;
        let ratio;

        if (d.id === 'portfolio') {
          // Pour le portfolio principal, utiliser son propre total
          referenceTotal = portfolioTotal;
          ratio = 100; // Le portfolio représente toujours 100% de lui-même
        } else if (d.id === 'borrow') {
          // Pour le nœud borrow principal, calculer par rapport au portfolio
          referenceTotal = borrowTotal;
          ratio = 100;
        } else if (d.id && d.id.startsWith('borrow-')) {
          // Pour les catégories et sous-catégories de borrow, utiliser le total borrow
          referenceTotal = borrowTotal;
          ratio = (d.value / referenceTotal) * 100;
        } else {
          // Pour les catégories et sous-catégories normales, utiliser le total portfolio
          referenceTotal = portfolioTotal;
          ratio = (d.value / referenceTotal) * 100;
        }
        return `${amount} (${ratio.toFixed(0)}%)`;
      });
  }

  // Fonction robuste pour résoudre la couleur
  resolveColor(color) {
    // Si c'est un objet couleur D3, retourne le format hex
    if (color && typeof color === 'object' && color.formatHex) {
      return color.formatHex();
    }
    // Si ce n'est pas une string, force la conversion
    if (typeof color !== 'string') {
      color = String(color || '');
    }
    if (color.startsWith('var(')) {
      const varName = color.replace('var(', '').replace(')', '').trim();
      const cssValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (d3.color(cssValue)) return cssValue;
      return '#cccccc';
    }
    if (d3.color(color)) return color;
    return '#cccccc';
  }

  // Ajustement de la luminosité (brighter/darker) avec fallback
  adjustColor(color, intensity) {
    const baseColor = this.resolveColor(color);
    const c = d3.color(baseColor);
    if (!c) return '#cccccc';
    // intensity positif => plus clair, négatif => plus foncé
    return intensity > 0 ? c.brighter(Math.abs(intensity)) : c.darker(Math.abs(intensity));
  }

}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
