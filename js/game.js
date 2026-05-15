class WordGame {
  constructor() {
    this.allWords = [];
    this.filteredWords = [];
    this.currentIndex = 0;
    this.score = 0;
    this.total = 0;
    this.scrambled = [];
    this.wordBoxes = [];
    this.tileUsed = [];
    this.boxToTile = [];
    this.answered = false;
  }

  async init() {
    if (!CONFIG.csvUrl) {
      this.showConfigError();
      return;
    }
    try {
      const response = await fetch(CONFIG.csvUrl);
      if (!response.ok) throw new Error('Não foi possível carregar o ficheiro CSV.');
      const text = await response.text();
      this.allWords = this.parseCSV(text);
      if (this.allWords.length === 0) {
        this.showLoadError('Nenhuma palavra encontrada. Verifica se o Sheet tem palavras com "ativo" = TRUE.');
        return;
      }
      this.setupThemeFilter();
      this.setupControls();
      this.startGame();
    } catch (e) {
      this.showLoadError(e.message);
    }
  }

  setupControls() {
    document.getElementById('clear-btn').addEventListener('click', () => this.clearBoxes());
    document.getElementById('next-btn').addEventListener('click', () => this.nextWord());
  }

  // CSV parsing

  parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = this.parseCSVLine(line);
        const row = {};
        headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
        return row;
      })
      .filter(row => {
        const v = (row.ativo || '').toUpperCase();
        return v === 'TRUE' || v === 'VERDADEIRO' || v === '1';
      });
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === ',' && !inQuotes) { result.push(current); current = ''; }
      else { current += line[i]; }
    }
    result.push(current);
    return result;
  }

  // Theme filter

  setupThemeFilter() {
    const select = document.getElementById('theme-select');
    const themes = [...new Set(this.allWords.map(w => w.tema).filter(Boolean))].sort();
    themes.forEach(theme => {
      const opt = document.createElement('option');
      opt.value = theme;
      opt.textContent = theme;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => this.filterByTheme(select.value));
  }

  filterByTheme(theme) {
    this.filteredWords = theme === 'all'
      ? [...this.allWords]
      : this.allWords.filter(w => w.tema === theme);
    this.shuffle(this.filteredWords);
    this.currentIndex = 0;
    this.score = 0;
    this.total = 0;
    this.loadCurrentWord();
  }

  startGame() {
    this.filterByTheme('all');
  }

  // Word loading & rendering

  loadCurrentWord() {
    if (this.filteredWords.length === 0) {
      document.getElementById('word-boxes').innerHTML = '<p class="text-muted text-center w-100">Sem palavras neste tema.</p>';
      document.getElementById('letter-tiles').innerHTML = '';
      document.getElementById('word-counter').textContent = '';
      return;
    }
    const wordData = this.filteredWords[this.currentIndex];
    const word = wordData.palavra.toUpperCase().trim();
    this.scrambled = this.getScrambled(word);
    this.wordBoxes = new Array(word.length).fill(null);
    this.tileUsed = new Array(this.scrambled.length).fill(false);
    this.boxToTile = new Array(word.length).fill(null);
    this.answered = false;

    this.renderImage(wordData.imagem);
    this.renderBoxes();
    this.renderTiles();
    this.updateCounter();
    this.hideFeedback();
    this.updateNextButton();
  }

  getScrambled(word, attempt = 0) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (attempt < 10 && word.length > 2 && letters.join('') === word) {
      return this.getScrambled(word, attempt + 1);
    }
    return letters;
  }

  renderImage(imageInput) {
    const spinner = document.getElementById('loading-spinner');
    const img = document.getElementById('game-image');
    const url = this.processImageUrl(imageInput);

    if (!url) {
      spinner.classList.add('d-none');
      img.classList.add('d-none');
      return;
    }

    img.classList.add('d-none');
    spinner.classList.remove('d-none');

    img.onload = () => {
      spinner.classList.add('d-none');
      img.classList.remove('d-none');
    };
    img.onerror = () => {
      spinner.classList.add('d-none');
      img.classList.add('d-none');
    };
    img.src = url;
  }

  renderBoxes() {
    const container = document.getElementById('word-boxes');
    container.innerHTML = '';
    const answer = this.wordBoxes.join('');
    const correct = this.answered && answer === this.filteredWords[this.currentIndex].palavra.toUpperCase().trim();

    this.wordBoxes.forEach((letter, i) => {
      const box = document.createElement('div');
      let cls = 'letter-box';
      if (letter) {
        if (this.answered) cls += correct ? ' correct' : ' wrong';
        else cls += ' filled';
      }
      box.className = cls;
      box.textContent = letter || '';
      if (letter && !this.answered) {
        box.addEventListener('click', () => this.clickBox(i));
        box.title = 'Clica para devolver a letra';
      }
      container.appendChild(box);
    });
  }

  renderTiles() {
    const container = document.getElementById('letter-tiles');
    container.innerHTML = '';
    this.scrambled.forEach((letter, i) => {
      const btn = document.createElement('button');
      btn.className = 'letter-tile' + (this.tileUsed[i] ? ' used' : '');
      btn.textContent = letter;
      btn.disabled = this.tileUsed[i] || this.answered;
      btn.addEventListener('click', () => this.clickTile(i));
      container.appendChild(btn);
    });
  }

  // Interaction

  clickTile(tileIndex) {
    if (this.tileUsed[tileIndex] || this.answered) return;
    const emptyBox = this.wordBoxes.findIndex(b => b === null);
    if (emptyBox === -1) return;
    this.wordBoxes[emptyBox] = this.scrambled[tileIndex];
    this.tileUsed[tileIndex] = true;
    this.boxToTile[emptyBox] = tileIndex;
    this.renderBoxes();
    this.renderTiles();
    if (this.wordBoxes.every(b => b !== null)) {
      setTimeout(() => this.checkAnswer(), 150);
    }
  }

  clickBox(boxIndex) {
    if (this.answered || this.wordBoxes[boxIndex] === null) return;
    const tileIndex = this.boxToTile[boxIndex];
    this.tileUsed[tileIndex] = false;
    this.wordBoxes[boxIndex] = null;
    this.boxToTile[boxIndex] = null;
    this.renderBoxes();
    this.renderTiles();
  }

  checkAnswer() {
    const answer = this.wordBoxes.join('');
    const correct = this.filteredWords[this.currentIndex].palavra.toUpperCase().trim();
    this.answered = true;
    this.total++;
    this.renderBoxes();
    this.renderTiles();
    if (answer === correct) {
      this.score++;
      this.showSuccessFeedback();
    } else {
      this.showErrorFeedback(this.filteredWords[this.currentIndex].palavra);
    }
    this.updateCounter();
    this.updateNextButton();
  }

  clearBoxes() {
    if (this.answered) return;
    const len = this.filteredWords[this.currentIndex]?.palavra.length || 0;
    this.wordBoxes = new Array(len).fill(null);
    this.tileUsed = new Array(this.scrambled.length).fill(false);
    this.boxToTile = new Array(len).fill(null);
    this.renderBoxes();
    this.renderTiles();
  }

  nextWord() {
    if (this.currentIndex >= this.filteredWords.length - 1) {
      this.shuffle(this.filteredWords);
      this.currentIndex = 0;
      this.score = 0;
      this.total = 0;
    } else {
      this.currentIndex++;
    }
    this.loadCurrentWord();
  }

  // UI helpers

  updateNextButton() {
    const btn = document.getElementById('next-btn');
    const isLast = this.currentIndex >= this.filteredWords.length - 1;
    btn.innerHTML = isLast
      ? '<i class="bi bi-arrow-repeat"></i> Recomeçar'
      : 'Próxima <i class="bi bi-arrow-right"></i>';
  }

  showSuccessFeedback() {
    const fb = document.getElementById('feedback');
    fb.className = 'feedback success bounce';
    fb.innerHTML = '<i class="bi bi-check-circle-fill"></i> Muito bem! Acertaste!';
    fb.classList.remove('d-none');
    setTimeout(() => fb.classList.remove('bounce'), 400);
  }

  showErrorFeedback(correctWord) {
    const fb = document.getElementById('feedback');
    fb.className = 'feedback error shake';
    fb.innerHTML = `<i class="bi bi-x-circle-fill"></i> Quase! A palavra era <strong>${correctWord.toUpperCase()}</strong>`;
    fb.classList.remove('d-none');
    setTimeout(() => fb.classList.remove('shake'), 400);
  }

  hideFeedback() {
    const fb = document.getElementById('feedback');
    fb.className = 'feedback d-none';
    fb.innerHTML = '';
  }

  updateCounter() {
    document.getElementById('score').textContent = `${this.score} / ${this.total}`;
    document.getElementById('word-counter').textContent =
      `Palavra ${this.currentIndex + 1} de ${this.filteredWords.length}`;
  }

  // Image URL processing — handles Google Drive share links or raw file IDs
  processImageUrl(input) {
    if (!input || !input.trim()) return '';
    const s = input.trim();
    const match = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w500`;
    if (!s.includes('/') && !s.startsWith('http')) {
      return `https://drive.google.com/thumbnail?id=${s}&sz=w500`;
    }
    return s;
  }

  // Error states

  showConfigError() {
    document.querySelector('.game-card').innerHTML = `
      <div class="error-card">
        <i class="bi bi-gear-fill" style="font-size:3rem;display:block;margin-bottom:1rem"></i>
        <h4>Configuração necessária</h4>
        <p>Abre o ficheiro <code>js/config.js</code> e substitui o <code>csvUrl</code> pelo URL do teu Google Sheet.</p>
      </div>`;
  }

  showLoadError(msg) {
    document.getElementById('loading-spinner').classList.add('d-none');
    document.querySelector('.game-card').innerHTML = `
      <div class="error-card">
        <i class="bi bi-exclamation-triangle-fill" style="font-size:3rem;display:block;margin-bottom:1rem"></i>
        <h4>Erro ao carregar dados</h4>
        <p>${msg}</p>
        <p class="small">Verifica se o URL do CSV está correto e se o Sheet está publicado na web.</p>
      </div>`;
  }

  // Utils

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

const game = new WordGame();
document.addEventListener('DOMContentLoaded', () => game.init());
