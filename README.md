# 🎮 Genshin Recriado - Apenas com um arquivo .js para navegador

Uma recriação fiel das mecânicas de combate de Genshin Impact diretamente no navegador usando Three.js!

**✨ 100% JavaScript Vanilla - Sem frameworks, sem build tools, apenas abra o HTML!**

![Genshin Browser Edition](https://img.shields.io/badge/Status-Jogável-brightgreen)
![Tecnologia](https://img.shields.io/badge/Three.js-r128-blue)
![Licença](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Como Jogar

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/genshin-recriado-browser.git
cd genshin-recriado-browser
```

2. **Abra o arquivo**
   - Simplesmente abra `index.html` no seu navegador
   - Ou use um servidor local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (se tiver npx)
   npx serve
   ```

3. **Jogue!**
   - Clique no canvas para travar o mouse
   - Use WASD para mover
   - Ataque com mouse e habilidades com E e Q

## ✨ Características Implementadas

### 🎯 Sistema de Combate Completo
- **Ataques Normais** (LMB) - Projéteis únicos para cada personagem
- **Habilidades Elementais** (E) - Cooldown de 6-10 segundos
- **Supremos/Bursts** (Q) - Requer energia completa
- **Partículas Elementais** - Coletáveis para carregar energia do supremo

### 👥 4 Personagens Jogáveis Únicos

#### 1. **Traveler** (Anemo - Vento) 🗡️
- **Ataque Normal**: Projétil rápido de vento
- **Habilidade E**: Vórtice que puxa e levanta inimigos
- **Supremo Q**: Tornado massivo que causa dano contínuo
- **Stats**: 10.000 HP | 500 ATK | 1.500 Skill | 5.000 Burst

#### 2. **Diluc** (Pyro - Fogo) 🔥
- **Ataque Normal**: Cone de 3 ondas de fogo
- **Habilidade E**: Três cortes flamejantes consecutivos
- **Supremo Q**: Fênix de fogo que voa até o alvo
- **Stats**: 12.000 HP | 600 ATK | 2.000 Skill | 6.000 Burst

#### 3. **Ganyu** (Cryo - Gelo) ❄️
- **Ataque Normal**: Flecha carregada com dano aumentado
- **Habilidade E**: Flor de gelo que causa dano contínuo por 3 segundos
- **Supremo Q**: Chuva de gelo massiva em área grande
- **Stats**: 9.000 HP | 800 ATK | 1.800 Skill | 7.000 Burst

#### 4. **Raiden Shogun** (Electro - Elétrico) ⚡
- **Ataque Normal**: Corte rápido com rastros de energia
- **Habilidade E**: Olho coordenado que lança 5 raios
- **Supremo Q**: Cortes dimensionais múltiplos
- **Stats**: 11.000 HP | 550 ATK | 1.700 Skill | 8.000 Burst

### 🐉 Boss: Primo Geovishap
- **50.000 HP** para desafio prolongado
- **IA inteligente** que persegue o jogador
- **Ataque constante** - não precisa estar perto para atacar
- **Dois tipos de ataque:**
  - 🔴 **Projéteis em 8 direções** quando está perto
  - 🦘 **Salto destrutivo** quando está longe (>15m)
- **Impacto ao pousar:**
  - Onda de choque expandindo
  - Pedras voando com física realista
  - Dano em área de 5 unidades
  - 50% mais dano (3.000) no impacto
- **Sistema de respawn** após derrota
- **2.000 de dano** por hit normal

### 🎨 Visuais e Animações
- **Modelos 3D detalhados** - Cada personagem com aparência única
- **Armas características** - Claymore, arco, espadas
- **Animações fluidas** - Idle, corrida, ataque, habilidades
- **Efeitos de partículas** - Elementais coloridos por tipo
- **Auras rotativas** - Indicadores visuais de elemento
- **Números de dano** - Feedback visual de acertos

### 🌍 Mundo Aberto
- **Terreno com variações** naturais
- **30 árvores** decorativas espalhadas
- **20 pedras** para ambientação
- **Sistema de iluminação** realista
- **Névoa atmosférica** para profundidade

### 🎮 Controles

#### Movimento
- **W/A/S/D** - Movimentação
- **Espaço** - Pular
- **Shift** - Correr
- **Mouse** - Olhar ao redor (clique no canvas para travar)

#### Combate
- **Botão Esquerdo do Mouse** - Ataque Normal
- **E** - Habilidade Elemental
- **Q** - Supremo (requer energia cheia)

#### Personagens
- **1** - Traveler (Anemo)
- **2** - Diluc (Pyro)
- **3** - Ganyu (Cryo)
- **4** - Raiden Shogun (Electro)
- **Cooldown de 1 segundo** entre trocas

## 🎯 Como Jogar

1. **Abra o arquivo `index.html`** em um navegador moderno
2. **Aguarde o carregamento** (2 segundos)
3. **Clique no canvas** para travar o mouse
4. **Aproxime-se do boss** para iniciar o combate
5. **Use ataques normais** para gerar partículas elementais
6. **Colete as partículas** para carregar energia
7. **Use habilidades e supremos** para causar dano massivo
8. **Troque entre personagens** para combos elementais
9. **Derrote o boss** e escolha lutar novamente!

## 💡 Dicas de Estratégia

- **Colete partículas elementais** sempre que possível para carregar supremos
- **Alterne entre personagens** quando um estiver com cooldown
- **Use habilidades E** constantemente para gerar partículas
- **Guarde o supremo Q** para momentos críticos
- **Mantenha distância** quando o boss atacar
- **Os projéteis do boss** podem ser esquivados correndo lateralmente
- **Cada personagem** tem pontos fortes únicos - experimente todos!

## 🔧 Tecnologias Utilizadas

- **Three.js r128** - Engine 3D
- **JavaScript ES6+** - Lógica do jogo
- **CSS3** - Interface e animações
- **HTML5 Canvas** - Renderização

## 🎨 Melhorias Implementadas

### Personagens
✅ Modelos 3D detalhados com cabeça, corpo, braços, pernas
✅ Cabelos e acessórios únicos por personagem
✅ Armas características (claymore, arco, espadas)
✅ Auras elementais flutuantes

### Animações
✅ Idle com respiração
✅ Corrida com movimento de pernas
✅ Ataque com swing de arma
✅ Balanço de corpo ao correr

### Ataques Únicos
✅ Traveler - Projétil simples rápido
✅ Diluc - Cone de fogo em 3 direções
✅ Ganyu - Flecha carregada maior
✅ Raiden - Corte com rastros

### Habilidades Únicas
✅ Traveler - Vórtice de vento
✅ Diluc - Três cortes flamejantes em sequência
✅ Ganyu - Flor de gelo com dano contínuo
✅ Raiden - Olho coordenado com raios

### Supremos Únicos
✅ Traveler - Tornado massivo
✅ Diluc - Fênix de fogo rastreador
✅ Ganyu - Chuva de gelo em área
✅ Raiden - Cortes dimensionais múltiplos

### Correções
✅ Projéteis do boss ajustados para altura correta
✅ Hitbox aumentada para melhor detecção de colisão
✅ Boss ataca à distância, não precisa encostar

## 🎉 Divirta-se!

O jogo está completamente funcional e pronto para jogar. Explore, lute e domine o boss com estratégias únicas de cada personagem!

## 📦 Estrutura do Projeto

```
genshin-recriado-browser/
├── index.html          # Estrutura HTML e canvas
├── style.css          # Estilos da UI e HUD
├── game.js            # TODO o jogo em um único arquivo!
├── README.md          # Este arquivo
└── .gitignore         # Arquivos ignorados pelo Git
```

## 🛠️ Tecnologias

- **Three.js r128** - Engine 3D para renderização
- **JavaScript ES6+** - Lógica do jogo (classes, arrow functions)
- **CSS3** - Interface com gradientes e animações
- **HTML5 Canvas** - Renderização gráfica

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novas features
- Melhorar a documentação
- Adicionar novos personagens

## 🎮 Próximas Features (Ideias)

- [ ] Mais personagens jogáveis
- [ ] Sistema de reações elementais
- [ ] Diferentes tipos de boss
- [ ] Sistema de artefatos/equipamentos
- [ ] Multiplayer local
- [ ] Sons e música
- [ ] Mobile controls

## ⭐ Créditos

Inspirado no jogo Genshin Impact da miHoYo/HoYoverse.
Este é um projeto fan-made educacional e não tem afiliação oficial com o jogo original.

---

**Feito com ❤️ e JavaScript puro!**
