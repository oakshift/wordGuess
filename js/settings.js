// Turns each game on or off from the "Configuração" tab of the Google Sheet.
// Columns: jogo | ativo. If the tab is not configured, a row is missing or
// loading fails, the game stays enabled.
const GAMES = { palavras: 'index.html', frases: 'frases.html' };

async function loadGameSettings() {
  const enabled = { palavras: true, frases: true };
  if (!CONFIG.configUrl) return enabled;
  try {
    const response = await fetch(CONFIG.configUrl);
    if (!response.ok) return enabled;
    const lines = (await response.text()).trim().split(/\r?\n/).slice(1);
    lines.forEach(line => {
      const [jogo, ativo] = line.split(',').map(v => v.replace(/"/g, '').trim().toLowerCase());
      if (jogo in enabled) enabled[jogo] = ['true', 'verdadeiro', '1'].includes(ativo);
    });
  } catch (e) {
    // Keep the defaults
  }
  return enabled;
}

// Hides links to disabled games and returns whether the current game may start.
// If it is disabled, redirects to another enabled game or shows a message.
async function checkGameEnabled(current) {
  const enabled = await loadGameSettings();

  const nav = document.querySelector('.game-nav');
  nav.querySelectorAll('a[data-game]').forEach(a => {
    if (!enabled[a.dataset.game]) a.remove();
  });
  if (nav.querySelectorAll('a').length < 2) nav.classList.add('d-none');

  if (enabled[current]) return true;

  const other = Object.keys(GAMES).find(g => enabled[g]);
  if (other) {
    location.replace(GAMES[other]);
    return false;
  }

  document.querySelector('.text-center.mb-4 .d-flex').classList.add('d-none');
  document.getElementById('word-counter').textContent = '';
  document.querySelector('.game-card').innerHTML = `
    <div class="error-card">
      <i class="bi bi-pause-circle-fill" style="font-size:3rem;display:block;margin-bottom:1rem"></i>
      <h4>Jogo indisponível</h4>
      <p>De momento não há nenhum jogo ativo. Volta mais tarde!</p>
    </div>`;
  return false;
}
