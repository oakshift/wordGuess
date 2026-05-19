# Adivinha a Palavra

Jogos interativos para aulas de português como língua estrangeira. Dois modos de jogo acessíveis pelo browser, geridos pela professora através do Google Sheets.

## Modos de jogo

### Palavras (`index.html`)
O aluno vê uma imagem e organiza letras baralhadas para descobrir a palavra correspondente.

1. Escolhe um tema no menu (ex: Animais, Família, Cores)
2. Observa a imagem apresentada
3. Clica nas letras baralhadas para as colocar nos espaços
4. Clica num espaço preenchido para devolver a letra
5. A resposta é verificada automaticamente quando todos os espaços estiverem preenchidos

### Frases (`frases.html`)
O aluno vê uma imagem e organiza palavras baralhadas para formar a frase correta.

1. Escolhe um tema no menu
2. Observa a imagem apresentada
3. Clica nas palavras baralhadas para as colocar por ordem
4. Clica numa palavra colocada para a devolver
5. A resposta é verificada automaticamente quando todos os espaços estiverem preenchidos

## Funcionalidades

- **Filtro por tema** — a professora define os temas no Sheet; o aluno filtra pelo tema da aula
- **Pontuação** — contador de respostas certas vs tentativas em tempo real
- **Repetição de erros** — palavras/frases erradas voltam a aparecer mais à frente na mesma sessão
- **Botão Limpar** — recomeça a tentativa sem avançar para a próxima
- **Navegação entre jogos** — botões no topo para mudar entre Palavras e Frases
- **Imagens do Google Drive** — cola o link completo do Drive no Sheet, o jogo extrai o ID automaticamente
- **Sem instalação** — corre no browser, funciona em computador e tablet

## Tecnologias

- **Frontend:** HTML5 + Bootstrap 5 + Vanilla JS
- **Dados:** Google Sheets (publicado como CSV)
- **Imagens:** Google Drive
- **Hosting:** GitHub Pages

## Configurar o Google Sheet

O Sheet tem dois separadores, um para cada jogo.

### Separador "Palavras"

| palavra | tema | imagem | ativo |
|---------|------|--------|-------|
| gato | Animais | (link do Google Drive) | TRUE |
| casa | Casa | (link do Google Drive) | TRUE |

### Separador "Frases"

| frase | tema | imagem | ativo |
|-------|------|--------|-------|
| O gato bebe leite | Animais | (link do Google Drive) | TRUE |
| A menina lê um livro | Escola | (link do Google Drive) | TRUE |

### Publicar o Sheet

Para cada separador: `Ficheiro → Partilhar → Publicar na Web → (escolher o separador) → CSV → Publicar`

Os URLs gerados são colocados em `js/config.js`:

```js
const CONFIG = {
  csvUrl:    'URL_DO_SEPARADOR_PALAVRAS',
  frasesUrl: 'URL_DO_SEPARADOR_FRASES',
};
```

### Adicionar imagens (Google Drive)

1. Faz upload da imagem para o Google Drive
2. Clica com o botão direito → **Obter link** → "Qualquer pessoa com o link"
3. Cola o link completo na coluna `imagem` — o jogo extrai o ID automaticamente

### Ativar ou desativar conteúdo

Para esconder temporariamente uma palavra ou frase sem a apagar, muda a coluna `ativo` de `TRUE` para `FALSE`.

## Estrutura do projeto

```
wordGuess/
├── index.html          ← Jogo de palavras
├── frases.html         ← Jogo de frases
├── css/
│   └── style.css
└── js/
    ├── config.js       ← URLs do Google Sheet
    ├── game.js         ← Lógica do jogo de palavras
    └── frases.js       ← Lógica do jogo de frases
```
