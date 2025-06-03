export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Create theme toggle switch
    this.createToggleSwitch();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  createToggleSwitch() {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'theme-toggle';
    
    toggleContainer.innerHTML = `
      <label class="theme-switch">
        <input type="checkbox" ${this.currentTheme === 'dark' ? 'checked' : ''} aria-label="Basculer entre le mode clair et sombre">
        <span class="theme-slider">
          <svg class="sun-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
          <svg class="moon-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </span>
      </label>
    `;
    
    const checkbox = toggleContainer.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => this.toggleTheme());
    
    document.body.appendChild(toggleContainer);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update checkbox state
    const checkbox = document.querySelector('.theme-switch input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = theme === 'dark';
    }
  }
}