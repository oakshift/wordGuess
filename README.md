# 🧩 Adivinha a Palavra

Jogo de anagramas para aulas de português como língua estrangeira. Os alunos veem uma imagem e têm de descobrir a palavra correspondente, organizando as letras baralhadas nos espaços corretos.

## Como jogar

1. Escolhe um tema no menu (ex: Animais, Família, Cores)
2. Observa a imagem apresentada
3. Clica nas letras baralhadas para as colocar nos espaços
4. Clica num espaço preenchido para devolver a letra
5. A resposta é verificada automaticamente quando todos os espaços estiverem preenchidos

## Tecnologias

- **Frontend:** HTML5 + Bootstrap 5 + Vanilla JS
- **Dados:** Google Sheets (publicado como CSV)
- **Imagens:** Google Drive
- **Hosting:** GitHub Pages

## Configurar o Google Sheet

Cria uma folha com as seguintes colunas:

| palavra | tema | imagem | ativo |
|---------|------|--------|-------|
| gato | Animais | (ID do ficheiro no Google Drive) | TRUE |
| casa | Casa | (ID do ficheiro no Google Drive) | TRUE |

### Publicar o Sheet

`Ficheiro → Partilhar → Publicar na Web → Folha1 → CSV → Publicar`

Copia o URL gerado e cola-o em `js/config.js`:

```js
const CONFIG = {
  csvUrl: 'URL_DO_CSV_AQUI',
};
```

### Adicionar imagens (Google Drive)

1. Faz upload da imagem para o Google Drive
2. Clica com o botão direito → **Obter link** → "Qualquer pessoa com o link"
3. O link tem o formato `https://drive.google.com/file/d/`**FILEID**`/view`
4. Copia apenas o **FILEID** e cola na coluna `imagem` do Sheet

## Estrutura do projeto

```
wordGuess/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── config.js   ← URL do Google Sheet
    └── game.js
```

## Adicionar palavras novas

Basta abrir o Google Sheet e adicionar uma nova linha com a palavra, o tema, o ID da imagem e colocar `TRUE` na coluna `ativo`. As alterações ficam disponíveis no jogo em poucos minutos, sem tocar no código.
