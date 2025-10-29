# 📤 Guia para Subir no GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"New"** ou **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha os dados:
   - **Repository name**: `genshin-recriado-browser`
   - **Description**: `Genshin Impact recriado apenas com um arquivo .js para navegador`
   - **Public** ou **Private** (sua escolha)
   - ❌ NÃO marque "Add a README" (já temos um)
   - ❌ NÃO adicione .gitignore (já temos um)
5. Clique em **"Create repository"**

## Passo 2: Inicializar Git Localmente

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Navegar até a pasta
cd "C:\Users\TEMP.ADVENTISTAS.007\Downloads\genshin 2"

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "🎮 Versão inicial - Genshin Impact recriado no navegador

- 4 personagens jogáveis (Traveler, Diluc, Ganyu, Raiden)
- Sistema de combate completo (ataques, habilidades, supremos)
- Boss com IA inteligente e dois tipos de ataque
- Animações e efeitos visuais
- Partículas elementais
- Sistema de energia e troca de personagens"
```

## Passo 3: Conectar com o GitHub

Após criar o repositório no GitHub, você verá comandos. Use estes:

```powershell
# Adicionar o remote (SUBSTITUA 'seu-usuario' pelo seu username do GitHub)
git remote add origin https://github.com/seu-usuario/genshin-recriado-browser.git

# Renomear branch para main (se necessário)
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

## Passo 4: Verificar

1. Acesse seu repositório no GitHub
2. Você deve ver todos os arquivos:
   - ✅ index.html
   - ✅ style.css
   - ✅ game.js
   - ✅ README.md
   - ✅ .gitignore

## 🎉 Pronto! Seu projeto está no GitHub!

## 📝 Comandos Git Úteis

```powershell
# Ver status dos arquivos
git status

# Adicionar arquivos específicos
git add nome-do-arquivo

# Fazer commit
git commit -m "mensagem do commit"

# Enviar mudanças
git push

# Ver histórico
git log --oneline

# Criar uma nova branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main
```

## 🌐 Ativar GitHub Pages (Opcional)

Para jogar direto do GitHub:

1. No seu repositório, vá em **Settings**
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **main branch**
4. Clique em **Save**
5. Aguarde alguns minutos
6. Seu jogo estará disponível em:
   `https://seu-usuario.github.io/genshin-recriado-browser/`

## 🔗 Links Úteis

- [Documentação Git](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Boa sorte com seu projeto open source! 🚀**
