// ========================================
// GENSHIN IMPACT - BROWSER EDITION
// Sistema de Combate Completo
// ========================================

class GenshinGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.boss = null;
        this.characters = [];
        this.currentCharacterIndex = 0;
        this.keys = {};
        this.mouse = { x: 0, y: 0, locked: false };
        this.particles = [];
        this.projectiles = [];
        this.elementalParticles = [];
        this.globalHitstopFrames = 0;
        this.lastImpactAt = 0;
        
        // Configurações de jogo
        this.config = {
            moveSpeed: 0.15,
            runSpeed: 0.25,
            jumpForce: 0.3,
            gravity: 0.015,
            cameraSensitivity: 0.002,
            // Feedback de impacto: valores baixos para manter responsivo
            hitstopFrames: 2,
            attackerEndLagFrames: 3,
            targetHitStunFrames: 4,
            critBonusFrames: 1,
            impactCooldownMs: 90
        };
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.setupWorld();
        this.setupCharacters();
        this.setupBoss();
        this.setupControls();
        this.setupUI();
        this.animate();
        
        // Esconder tela de loading
        setTimeout(() => {
            document.getElementById('loading-screen').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 500);
        }, 2000);
    }

    setupScene() {
        // Criar cena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        // Configurar câmera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);

        // Configurar renderer
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Luz direcional (sol)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(50, 50, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.far = 200;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        this.scene.add(sunLight);

        // Luz hemisférica
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x90ee90, 0.3);
        this.scene.add(hemisphereLight);
    }

    setupWorld() {
        // Chão
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x90ee90,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Adicionar variação ao terreno
        const positions = groundGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const wave = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
            positions.setZ(i, wave);
        }
        groundGeometry.computeVertexNormals();
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Adicionar árvores decorativas
        this.createTrees();
        
        // Adicionar pedras
        this.createRocks();
        
        // Skybox simples
        const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    createTrees() {
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * 150;
            const z = (Math.random() - 0.5) * 150;
            
            if (Math.abs(x) < 20 && Math.abs(z) < 20) continue; // Não spawnar perto do centro
            
            // Tronco
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(x, 1.5, z);
            trunk.castShadow = true;
            this.scene.add(trunk);
            
            // Copa
            const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(x, 4.5, z);
            foliage.castShadow = true;
            this.scene.add(foliage);
        }
    }

    createRocks() {
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 150;
            const z = (Math.random() - 0.5) * 150;
            
            if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
            
            const size = Math.random() * 1.5 + 0.5;
            const rockGeometry = new THREE.DodecahedronGeometry(size);
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, size / 2, z);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            this.scene.add(rock);
        }
    }

    setupCharacters() {
        // Definir 4 personagens com diferentes elementos e habilidades
        this.characters = [
            {
                name: "Traveler",
                element: "Anemo",
                elementColor: 0x69f0ae,
                icon: "🗡️",
                maxHealth: 10000,
                health: 10000,
                maxEnergy: 80,
                energy: 0,
                attackDamage: 500,
                skillDamage: 1500,
                burstDamage: 5000,
                skillCooldown: 0,
                skillMaxCooldown: 6,
                burstCooldown: 0,
                position: new THREE.Vector3(0, 1, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                onGround: false,
                mesh: null,
                endLagFrames: 0,
                hitStunFrames: 0
            },
            {
                name: "Diluc",
                element: "Pyro",
                elementColor: 0xff6b35,
                icon: "🔥",
                maxHealth: 12000,
                health: 12000,
                maxEnergy: 80,
                energy: 0,
                attackDamage: 600,
                skillDamage: 2000,
                burstDamage: 6000,
                skillCooldown: 0,
                skillMaxCooldown: 7,
                burstCooldown: 0,
                position: new THREE.Vector3(0, 1, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                onGround: false,
                mesh: null,
                endLagFrames: 0,
                hitStunFrames: 0
            },
            {
                name: "Ganyu",
                element: "Cryo",
                elementColor: 0x81d4fa,
                icon: "❄️",
                maxHealth: 9000,
                health: 9000,
                maxEnergy: 80,
                energy: 0,
                attackDamage: 800,
                skillDamage: 1800,
                burstDamage: 7000,
                skillCooldown: 0,
                skillMaxCooldown: 10,
                burstCooldown: 0,
                position: new THREE.Vector3(0, 1, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                onGround: false,
                mesh: null,
                endLagFrames: 0,
                hitStunFrames: 0
            },
            {
                name: "Raiden Shogun",
                element: "Electro",
                elementColor: 0xb388ff,
                icon: "⚡",
                maxHealth: 11000,
                health: 11000,
                maxEnergy: 90,
                energy: 0,
                attackDamage: 550,
                skillDamage: 1700,
                burstDamage: 8000,
                skillCooldown: 0,
                skillMaxCooldown: 8,
                burstCooldown: 0,
                position: new THREE.Vector3(0, 1, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                onGround: false,
                mesh: null,
                endLagFrames: 0,
                hitStunFrames: 0
            }
        ];

        // Criar mesh para cada personagem
        this.characters.forEach((char, index) => {
            char.mesh = this.createCharacterModel(char);
            char.mesh.visible = index === 0; // Apenas o primeiro visível
            this.scene.add(char.mesh);
        });

        this.player = this.characters[0];
        this.updateCharacterUI();
    }

    createCharacterModel(char) {
        const group = new THREE.Group();
        
        // Cor principal e secundária baseada no elemento
        const primaryColor = char.elementColor;
        const secondaryColor = this.lightenColor(char.elementColor);
        const darkColor = this.darkenColor(char.elementColor);
        
        // Cabeça
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        group.add(head);
        
        // Cabelo/Capacete (diferente para cada personagem)
        if (char.name === "Traveler") {
            // Cabelo loiro pontiagudo
            const hairGeometry = new THREE.ConeGeometry(0.4, 0.5, 8);
            const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.y = 1.7;
            hair.castShadow = true;
            group.add(hair);
        } else if (char.name === "Diluc") {
            // Cabelo vermelho rebelde
            const hairGeometry = new THREE.SphereGeometry(0.4, 8, 8);
            const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.y = 1.7;
            hair.scale.set(1, 1.3, 1);
            hair.castShadow = true;
            group.add(hair);
            
            // Rabo de cavalo
            const ponytailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 0.6, 6);
            const ponytail = new THREE.Mesh(ponytailGeometry, hairMaterial);
            ponytail.position.set(0, 1.4, -0.3);
            ponytail.rotation.x = 0.3;
            ponytail.castShadow = true;
            group.add(ponytail);
        } else if (char.name === "Ganyu") {
            // Cabelo azul com chifres
            const hairGeometry = new THREE.SphereGeometry(0.42, 8, 8);
            const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.y = 1.65;
            hair.castShadow = true;
            group.add(hair);
            
            // Chifres
            const hornGeometry = new THREE.ConeGeometry(0.08, 0.4, 6);
            const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b9d });
            const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
            horn1.position.set(0.25, 1.9, 0);
            horn1.rotation.z = -0.3;
            horn1.castShadow = true;
            group.add(horn1);
            
            const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
            horn2.position.set(-0.25, 1.9, 0);
            horn2.rotation.z = 0.3;
            horn2.castShadow = true;
            group.add(horn2);
        } else if (char.name === "Raiden Shogun") {
            // Cabelo roxo com trança
            const hairGeometry = new THREE.SphereGeometry(0.4, 8, 8);
            const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x9370db });
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.y = 1.7;
            hair.scale.set(1, 1.2, 1);
            hair.castShadow = true;
            group.add(hair);
            
            // Trança longa
            for (let i = 0; i < 3; i++) {
                const braidGeometry = new THREE.SphereGeometry(0.12, 8, 8);
                const braid = new THREE.Mesh(braidGeometry, hairMaterial);
                braid.position.set(0, 1.1 - i * 0.3, -0.3 - i * 0.1);
                braid.castShadow = true;
                group.add(braid);
            }
        }
        
        // Corpo (torso)
        const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: primaryColor,
            roughness: 0.5,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        body.castShadow = true;
        group.add(body);
        
        // Detalhes do corpo
        const beltGeometry = new THREE.CylinderGeometry(0.41, 0.41, 0.1, 8);
        const beltMaterial = new THREE.MeshStandardMaterial({ color: darkColor });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.35;
        belt.castShadow = true;
        group.add(belt);
        
        // Braços
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: secondaryColor });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.7, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        group.add(leftArm);
        char.leftArm = leftArm; // Guardar referência para animação
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 0.7, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        group.add(rightArm);
        char.rightArm = rightArm; // Guardar referência para animação
        
        // Mãos com armas/símbolos
        const handGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.65, 0.35, 0);
        leftHand.castShadow = true;
        group.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.65, 0.35, 0);
        rightHand.castShadow = true;
        group.add(rightHand);
        
        // Arma característica
        let weaponGeometry, weaponMaterial;
        if (char.name === "Diluc") {
            // Claymore grande
            weaponGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.05);
            weaponMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xff4500,
                emissive: 0xff0000,
                emissiveIntensity: 0.3,
                metalness: 0.8
            });
        } else if (char.name === "Ganyu") {
            // Arco
            weaponGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 6, Math.PI);
            weaponMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x4169e1,
                metalness: 0.6
            });
        } else if (char.name === "Raiden Shogun") {
            // Espada longa (katana)
            weaponGeometry = new THREE.BoxGeometry(0.08, 1.0, 0.03);
            weaponMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x9370db,
                emissive: 0x8a2be2,
                emissiveIntensity: 0.5,
                metalness: 0.9
            });
        } else {
            // Espada padrão
            weaponGeometry = new THREE.BoxGeometry(0.1, 0.9, 0.05);
            weaponMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xc0c0c0,
                metalness: 0.9
            });
        }
        
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        if (char.name === "Ganyu") {
            weapon.position.set(0.7, 0.7, 0);
            weapon.rotation.z = -Math.PI / 2;
        } else {
            weapon.position.set(0.7, 0.5, 0);
            weapon.rotation.z = -0.5;
        }
        weapon.castShadow = true;
        group.add(weapon);
        char.weapon = weapon; // Guardar para animação
        
        // Pernas
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.13, 0.7, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: darkColor });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.18, -0.05, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        char.leftLeg = leftLeg; // Guardar referência para animação
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.18, -0.05, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        char.rightLeg = rightLeg; // Guardar referência para animação
        
        // Pés
        const footGeometry = new THREE.BoxGeometry(0.18, 0.1, 0.25);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.18, -0.45, 0.05);
        leftFoot.castShadow = true;
        group.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.18, -0.45, 0.05);
        rightFoot.castShadow = true;
        group.add(rightFoot);
        
        // Capa/efeito elemental flutuante
        const auraGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: primaryColor,
            transparent: true,
            opacity: 0.3
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.position.y = 0.2;
        aura.rotation.x = Math.PI / 2;
        group.add(aura);
        char.aura = aura; // Guardar para animação
        
        // Adicionar propriedades de animação
        char.animationTime = 0;
        char.isAttacking = false;
        char.attackTime = 0;
        
        return group;
    }

    lightenColor(color) {
        const r = Math.min(255, ((color >> 16) & 0xff) * 1.3);
        const g = Math.min(255, ((color >> 8) & 0xff) * 1.3);
        const b = Math.min(255, (color & 0xff) * 1.3);
        return (r << 16) | (g << 8) | b;
    }

    setupBoss() {
        // Criar boss
        this.boss = {
            name: "Primo Geovishap",
            maxHealth: 50000,
            health: 50000,
            damage: 2000,
            position: new THREE.Vector3(0, 2, -15),
            velocity: new THREE.Vector3(0, 0, 0),
            state: "idle", // idle, attacking, cooldown, dead
            attackCooldown: 0,
            attackMaxCooldown: 120, // 2 segundos
            mesh: null,
            attackRange: 3,
            detectionRange: 30,
            moveSpeed: 0.05,
            isAlive: true,
            hitStunFrames: 0
        };

        // Criar mesh do boss (maior e mais imponente)
        const bodyGeometry = new THREE.SphereGeometry(2, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            emissive: 0x4b0000,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.7
        });
        this.boss.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.boss.mesh.position.copy(this.boss.position);
        this.boss.mesh.castShadow = true;
        this.scene.add(this.boss.mesh);

        // Adicionar espinhos ao boss
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const spikeGeometry = new THREE.ConeGeometry(0.3, 1.5, 4);
            const spikeMaterial = new THREE.MeshStandardMaterial({
                color: 0x4b0000,
                emissive: 0x8b0000,
                emissiveIntensity: 0.3
            });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(
                Math.cos(angle) * 1.8,
                Math.sin(angle) * 1.8,
                0
            );
            spike.rotation.z = -angle;
            spike.castShadow = true;
            this.boss.mesh.add(spike);
        }

        this.updateBossUI();
    }

    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Troca de personagens (1-4)
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                if (index < this.characters.length) {
                    this.switchCharacter(index);
                }
            }
            
            // Habilidades
            if (e.key.toLowerCase() === 'e') {
                this.useSkill();
            }
            if (e.key.toLowerCase() === 'q') {
                this.useBurst();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse controls
        document.addEventListener('mousemove', (e) => {
            if (this.mouse.locked) {
                this.mouse.x -= e.movementX * this.config.cameraSensitivity; // Invertido para rotação correta
                this.mouse.y += e.movementY * this.config.cameraSensitivity;
                this.mouse.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.mouse.y));
            }
        });

        // Mouse click - ataque normal
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.mouse.locked) { // Left click
                this.normalAttack();
            }
        });

        // Pointer lock
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('click', () => {
            if (!this.mouse.locked) {
                canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === canvas;
        });
    }

    setupUI() {
        // Modal buttons
        document.getElementById('respawnBoss').addEventListener('click', () => {
            this.respawnBoss();
            document.getElementById('victoryModal').style.display = 'none';
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('victoryModal').style.display = 'none';
        });

        // Character slots click
        document.querySelectorAll('.character-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                if (index < this.characters.length) {
                    this.switchCharacter(index);
                }
            });
        });
    }

    switchCharacter(index) {
        if (index === this.currentCharacterIndex) return;
        if (this.characters[index].health <= 0) return;

        // Cooldown de troca
        const cooldownTime = 1000; // 1 segundo
        if (this.characters[index].switchCooldown > 0) return;

        // Esconder personagem atual
        this.characters[this.currentCharacterIndex].mesh.visible = false;

        // Mudar para novo personagem
        this.currentCharacterIndex = index;
        this.player = this.characters[index];
        this.player.mesh.visible = true;

        // Copiar posição e velocidade
        this.player.position.copy(this.characters[0].position);
        this.player.velocity.copy(this.characters[0].velocity);

        // Sincronizar posições de todos os personagens
        this.characters.forEach(char => {
            char.position.copy(this.player.position);
        });

        // Aplicar cooldown a todos
        this.characters.forEach(char => {
            char.switchCooldown = cooldownTime;
        });

        // Efeito visual de troca
        this.createSwitchEffect();

        this.updateCharacterUI();
    }

    createSwitchEffect() {
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.1);
            const material = new THREE.MeshBasicMaterial({
                color: this.player.elementColor
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(this.player.position);
            
            const angle = (i / 20) * Math.PI * 2;
            const speed = 0.2;
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 0.3,
                Math.sin(angle) * speed
            );
            particle.life = 30;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    normalAttack() {
        if (!this.player || this.player.health <= 0) return;
        if (this.player.endLagFrames > 0 || this.player.hitStunFrames > 0) return;

        // Animação de ataque
        this.player.isAttacking = true;
        this.player.attackTime = 20; // frames de animação

        // Ataques diferentes por personagem
        if (this.player.name === "Traveler") {
            // Traveler: Projétil simples rápido
            const projectile = this.createProjectile(
                this.player.position.clone().add(new THREE.Vector3(0, 1, 0)),
                this.player.attackDamage,
                this.player.elementColor,
                0.8
            );
        } else if (this.player.name === "Diluc") {
            // Diluc: Onda de fogo em cone
            for (let i = -1; i <= 1; i++) {
                setTimeout(() => {
                    const direction = new THREE.Vector3();
                    this.camera.getWorldDirection(direction);
                    
                    // Adicionar spread ao cone
                    const angle = i * 0.3;
                    const rotatedDir = direction.clone();
                    rotatedDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                    
                    const projectile = this.createProjectile(
                        this.player.position.clone().add(new THREE.Vector3(0, 1, 0)),
                        this.player.attackDamage * 0.7,
                        0xff4500,
                        0.6,
                        rotatedDir
                    );
                }, Math.abs(i) * 50);
            }
        } else if (this.player.name === "Ganyu") {
            // Ganyu: Flecha carregada que causa dano em área
            const projectile = this.createProjectile(
                this.player.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
                this.player.attackDamage * 1.2,
                0x4169e1,
                1.0
            );
            projectile.isCharged = true;
            projectile.scale.set(1.5, 1.5, 1.5);
        } else if (this.player.name === "Raiden Shogun") {
            // Raiden: Corte rápido com rastro
            const projectile = this.createProjectile(
                this.player.position.clone().add(new THREE.Vector3(0, 1, 0)),
                this.player.attackDamage,
                0x9370db,
                1.2
            );
            
            // Criar rastro de corte
            for (let i = 1; i <= 3; i++) {
                setTimeout(() => {
                    const trail = this.createProjectile(
                        this.player.position.clone().add(new THREE.Vector3(0, 1, 0)),
                        this.player.attackDamage * 0.3,
                        0x9370db,
                        1.0
                    );
                    trail.scale.set(0.5, 0.5, 0.5);
                }, i * 50);
            }
        }

        // Adicionar partículas elementais (30% chance)
        if (Math.random() < 0.3) {
            this.addEnergy(5);
            this.spawnElementalParticle();
        }
    }

    useSkill() {
        if (!this.player || this.player.health <= 0) return;
        if (this.player.endLagFrames > 0 || this.player.hitStunFrames > 0) return;
        if (this.player.skillCooldown > 0) return;

        // Usar habilidade
        this.player.skillCooldown = this.player.skillMaxCooldown * 60; // Converter para frames

        // Habilidades únicas por personagem
        if (this.player.name === "Traveler") {
            // Traveler: Vórtice de vento que puxa inimigos
            this.createSkillEffect();
            const distance = this.player.position.distanceTo(this.boss.position);
            if (distance < 10 && this.boss.isAlive) {
                this.damageEnemy(this.boss, this.player.skillDamage, true);
                // Empurrar boss para cima
                this.boss.velocity.y = 0.2;
            }
        } else if (this.player.name === "Diluc") {
            // Diluc: Três cortes flamejantes em sequência
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.createSkillEffect();
                    
                    // Criar onda de fogo frontal
                    const direction = new THREE.Vector3();
                    this.camera.getWorldDirection(direction);
                    direction.y = 0;
                    direction.normalize();
                    
                    for (let j = 0; j < 5; j++) {
                        const offset = direction.clone().multiplyScalar(j * 2);
                        const firePos = this.player.position.clone().add(offset);
                        firePos.y = 1;
                        
                        // Criar explosão de fogo
                        for (let k = 0; k < 10; k++) {
                            const geometry = new THREE.SphereGeometry(0.3);
                            const material = new THREE.MeshBasicMaterial({
                                color: 0xff4500,
                                transparent: true,
                                opacity: 0.8
                            });
                            const fire = new THREE.Mesh(geometry, material);
                            fire.position.copy(firePos);
                            fire.position.x += (Math.random() - 0.5) * 2;
                            fire.position.z += (Math.random() - 0.5) * 2;
                            fire.velocity = new THREE.Vector3(
                                (Math.random() - 0.5) * 0.2,
                                Math.random() * 0.3,
                                (Math.random() - 0.5) * 0.2
                            );
                            fire.life = 20;
                            this.scene.add(fire);
                            this.particles.push(fire);
                        }
                        
                        // Checar colisão com boss
                        if (this.boss.isAlive) {
                            const dist = firePos.distanceTo(this.boss.position);
                            if (dist < 3) {
                                this.damageEnemy(this.boss, this.player.skillDamage / 3, true);
                            }
                        }
                    }
                }, i * 500);
            }
        } else if (this.player.name === "Ganyu") {
            // Ganyu: Flor de gelo que atrai inimigos e causa dano contínuo
            const iceFlowerPos = this.player.position.clone();
            iceFlowerPos.y = 1;
            
            // Criar flor de gelo
            const flowerGeometry = new THREE.OctahedronGeometry(1);
            const flowerMaterial = new THREE.MeshBasicMaterial({
                color: 0x4169e1,
                transparent: true,
                opacity: 0.6
            });
            const iceFlower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            iceFlower.position.copy(iceFlowerPos);
            this.scene.add(iceFlower);
            
            // Dano ao longo do tempo
            let flowerLife = 180; // 3 segundos
            const flowerInterval = setInterval(() => {
                flowerLife -= 6;
                iceFlower.rotation.y += 0.1;
                iceFlower.scale.multiplyScalar(1.01);
                iceFlower.material.opacity = flowerLife / 180 * 0.6;
                
                // Dano a cada tick
                if (this.boss.isAlive) {
                    const dist = iceFlower.position.distanceTo(this.boss.position);
                    if (dist < 5) {
                        this.damageEnemy(this.boss, this.player.skillDamage / 10);
                    }
                }
                
                if (flowerLife <= 0) {
                    clearInterval(flowerInterval);
                    this.scene.remove(iceFlower);
                    
                    // Explosão final
                    for (let i = 0; i < 30; i++) {
                        const geometry = new THREE.SphereGeometry(0.2);
                        const material = new THREE.MeshBasicMaterial({ color: 0x4169e1 });
                        const particle = new THREE.Mesh(geometry, material);
                        particle.position.copy(iceFlower.position);
                        particle.velocity = new THREE.Vector3(
                            (Math.random() - 0.5) * 0.3,
                            Math.random() * 0.3,
                            (Math.random() - 0.5) * 0.3
                        );
                        particle.life = 30;
                        this.scene.add(particle);
                        this.particles.push(particle);
                    }
                }
            }, 100);
        } else if (this.player.name === "Raiden Shogun") {
            // Raiden: Marca coordenada que causa dano quando ativada
            this.createSkillEffect();
            
            // Criar olho coordenado
            const eyeGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: 0x9370db,
                emissive: 0x8a2be2,
                emissiveIntensity: 1
            });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(this.boss.position.x, this.boss.position.y + 5, this.boss.position.z);
            eye.rotation.x = Math.PI / 2;
            this.scene.add(eye);
            
            // Raios caindo
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    // Criar raio
                    const lightningGeometry = new THREE.CylinderGeometry(0.1, 0.3, 5, 6);
                    const lightningMaterial = new THREE.MeshBasicMaterial({
                        color: 0x9370db,
                        emissive: 0x9370db,
                        emissiveIntensity: 2
                    });
                    const lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
                    lightning.position.copy(this.boss.position);
                    lightning.position.y += 2.5;
                    this.scene.add(lightning);
                    
                    // Dano
                    if (this.boss.isAlive) {
                        this.damageEnemy(this.boss, this.player.skillDamage / 5, true);
                    }
                    
                    setTimeout(() => this.scene.remove(lightning), 200);
                }, i * 300);
            }
            
            setTimeout(() => this.scene.remove(eye), 1500);
        }

        // Garantir partículas elementais
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.spawnElementalParticle(), i * 200);
        }

        this.updateSkillUI();
    }

    useBurst() {
        if (!this.player || this.player.health <= 0) return;
        if (this.player.endLagFrames > 0 || this.player.hitStunFrames > 0) return;
        if (this.player.energy < this.player.maxEnergy) return;

        // Usar supremo
        this.player.energy = 0;

        // Supremos únicos por personagem
        if (this.player.name === "Traveler") {
            // Traveler: Tornado massivo
            this.createBurstEffect();
            
            // Criar tornado
            for (let i = 0; i < 10; i++) {
                const height = i * 1;
                const radius = 3 - i * 0.2;
                const segments = 20;
                
                for (let j = 0; j < segments; j++) {
                    setTimeout(() => {
                        const angle = (j / segments) * Math.PI * 2;
                        const geometry = new THREE.SphereGeometry(0.3);
                        const material = new THREE.MeshBasicMaterial({
                            color: this.player.elementColor,
                            transparent: true,
                            opacity: 0.6
                        });
                        const particle = new THREE.Mesh(geometry, material);
                        particle.position.set(
                            this.player.position.x + Math.cos(angle) * radius,
                            this.player.position.y + height,
                            this.player.position.z + Math.sin(angle) * radius
                        );
                        particle.velocity = new THREE.Vector3(0, 0.1, 0);
                        particle.life = 60;
                        this.scene.add(particle);
                        this.particles.push(particle);
                    }, i * 50);
                }
            }
            
            if (this.boss.isAlive) {
                this.damageEnemy(this.boss, this.player.burstDamage, true);
            }
        } else if (this.player.name === "Diluc") {
            // Diluc: Fênix de fogo
            this.createBurstEffect();
            
            // Criar fênix que voa até o boss
            const phoenixGeometry = new THREE.ConeGeometry(0.8, 2, 8);
            const phoenixMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4500,
                emissive: 0xff0000,
                emissiveIntensity: 1
            });
            const phoenix = new THREE.Mesh(phoenixGeometry, phoenixMaterial);
            phoenix.position.copy(this.player.position);
            phoenix.position.y += 2;
            this.scene.add(phoenix);
            
            // Movimento até o boss
            let phoenixTime = 0;
            const phoenixInterval = setInterval(() => {
                phoenixTime += 0.05;
                
                // Mover em direção ao boss
                const direction = this.boss.position.clone().sub(phoenix.position);
                direction.normalize().multiplyScalar(0.5);
                phoenix.position.add(direction);
                phoenix.rotation.z = Math.atan2(direction.y, direction.x);
                
                // Rastro de fogo
                const trail = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4),
                    new THREE.MeshBasicMaterial({ color: 0xff6600 })
                );
                trail.position.copy(phoenix.position);
                trail.life = 15;
                this.scene.add(trail);
                this.particles.push(trail);
                
                // Checar colisão
                if (phoenix.position.distanceTo(this.boss.position) < 2) {
                    clearInterval(phoenixInterval);
                    this.scene.remove(phoenix);
                    
                    // Explosão massiva
                    for (let i = 0; i < 100; i++) {
                        const geometry = new THREE.SphereGeometry(0.3);
                        const material = new THREE.MeshBasicMaterial({ color: 0xff4500 });
                        const particle = new THREE.Mesh(geometry, material);
                        particle.position.copy(this.boss.position);
                        particle.velocity = new THREE.Vector3(
                            (Math.random() - 0.5) * 0.5,
                            Math.random() * 0.5,
                            (Math.random() - 0.5) * 0.5
                        );
                        particle.life = 40;
                        this.scene.add(particle);
                        this.particles.push(particle);
                    }
                    
                    if (this.boss.isAlive) {
                        this.damageEnemy(this.boss, this.player.burstDamage, true);
                    }
                }
            }, 50);
        } else if (this.player.name === "Ganyu") {
            // Ganyu: Chuva de gelo
            this.createBurstEffect();
            
            // Criar área de gelo
            const iceFieldGeometry = new THREE.CylinderGeometry(8, 8, 0.1, 32);
            const iceFieldMaterial = new THREE.MeshBasicMaterial({
                color: 0x4169e1,
                transparent: true,
                opacity: 0.3
            });
            const iceField = new THREE.Mesh(iceFieldGeometry, iceFieldMaterial);
            iceField.position.set(this.boss.position.x, 0.1, this.boss.position.z);
            this.scene.add(iceField);
            
            // Chuva de gelo
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const x = this.boss.position.x + (Math.random() - 0.5) * 16;
                    const z = this.boss.position.z + (Math.random() - 0.5) * 16;
                    
                    const icicleGeometry = new THREE.ConeGeometry(0.3, 2, 6);
                    const icicleMaterial = new THREE.MeshBasicMaterial({
                        color: 0x87ceeb,
                        transparent: true,
                        opacity: 0.8
                    });
                    const icicle = new THREE.Mesh(icicleGeometry, icicleMaterial);
                    icicle.position.set(x, 15, z);
                    icicle.rotation.x = Math.PI;
                    this.scene.add(icicle);
                    
                    // Cair
                    const fallInterval = setInterval(() => {
                        icicle.position.y -= 0.5;
                        
                        if (icicle.position.y <= 1) {
                            clearInterval(fallInterval);
                            this.scene.remove(icicle);
                            
                            // Explosão de gelo
                            for (let j = 0; j < 10; j++) {
                                const particle = new THREE.Mesh(
                                    new THREE.SphereGeometry(0.2),
                                    new THREE.MeshBasicMaterial({ color: 0x87ceeb })
                                );
                                particle.position.set(x, 1, z);
                                particle.velocity = new THREE.Vector3(
                                    (Math.random() - 0.5) * 0.3,
                                    Math.random() * 0.2,
                                    (Math.random() - 0.5) * 0.3
                                );
                                particle.life = 20;
                                this.scene.add(particle);
                                this.particles.push(particle);
                            }
                            
                            // Dano
                            if (this.boss.isAlive) {
                                const dist = new THREE.Vector3(x, 1, z).distanceTo(this.boss.position);
                                if (dist < 2) {
                                    this.damageEnemy(this.boss, this.player.burstDamage / 10);
                                }
                            }
                        }
                    }, 50);
                }, i * 100);
            }
            
            setTimeout(() => this.scene.remove(iceField), 5000);
        } else if (this.player.name === "Raiden Shogun") {
            // Raiden: Corte dimensional
            this.createBurstEffect();
            
            // Criar círculo mágico
            const circleGeometry = new THREE.RingGeometry(5, 6, 32);
            const circleMaterial = new THREE.MeshBasicMaterial({
                color: 0x9370db,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const magicCircle = new THREE.Mesh(circleGeometry, circleMaterial);
            magicCircle.position.copy(this.boss.position);
            magicCircle.position.y = 0.2;
            magicCircle.rotation.x = -Math.PI / 2;
            this.scene.add(magicCircle);
            
            // Múltiplos cortes
            for (let i = 0; i < 7; i++) {
                setTimeout(() => {
                    const angle = (i / 7) * Math.PI * 2;
                    
                    // Criar corte
                    const slashGeometry = new THREE.PlaneGeometry(10, 1);
                    const slashMaterial = new THREE.MeshBasicMaterial({
                        color: 0x9370db,
                        emissive: 0x8a2be2,
                        emissiveIntensity: 2,
                        transparent: true,
                        opacity: 0.8,
                        side: THREE.DoubleSide
                    });
                    const slash = new THREE.Mesh(slashGeometry, slashMaterial);
                    slash.position.copy(this.boss.position);
                    slash.position.y = 2;
                    slash.rotation.y = angle;
                    this.scene.add(slash);
                    
                    // Dano
                    if (this.boss.isAlive) {
                        this.damageEnemy(this.boss, this.player.burstDamage / 7, true);
                    }
                    
                    // Remover após animação
                    setTimeout(() => {
                        slash.material.opacity -= 0.1;
                        if (slash.material.opacity <= 0) {
                            this.scene.remove(slash);
                        }
                    }, 100);
                    
                    setTimeout(() => this.scene.remove(slash), 500);
                }, i * 200);
            }
            
            setTimeout(() => this.scene.remove(magicCircle), 1500);
        }

        this.updateCharacterUI();
        this.updateSkillUI();
    }

    createProjectile(position, damage, color, speed = 0.8, customDirection = null) {
        const geometry = new THREE.SphereGeometry(0.2);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1
        });
        const projectile = new THREE.Mesh(geometry, material);
        projectile.position.copy(position);

        // Direção baseada na câmera ou customizada
        const direction = customDirection || new THREE.Vector3();
        if (!customDirection) {
            this.camera.getWorldDirection(direction);
        }
        projectile.velocity = direction.multiplyScalar(speed);
        projectile.damage = damage;
        projectile.life = 120; // 2 segundos

        this.scene.add(projectile);
        this.projectiles.push(projectile);

        return projectile;
    }

    createSkillEffect() {
        // Criar explosão de partículas
        for (let i = 0; i < 50; i++) {
            const geometry = new THREE.SphereGeometry(0.15);
            const material = new THREE.MeshBasicMaterial({
                color: this.player.elementColor,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(this.player.position);
            
            const angle = (i / 50) * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI;
            const speed = Math.random() * 0.3 + 0.2;
            
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * Math.cos(elevation) * speed,
                Math.sin(elevation) * speed,
                Math.sin(angle) * Math.cos(elevation) * speed
            );
            particle.life = 40;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }

        // Onda de choque visual
        const shockwaveGeometry = new THREE.RingGeometry(0.1, 8, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: this.player.elementColor,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.position.copy(this.player.position);
        shockwave.position.y = 0.1;
        shockwave.rotation.x = -Math.PI / 2;
        shockwave.scale.set(0.1, 0.1, 0.1);
        shockwave.life = 30;
        shockwave.isShockwave = true;
        
        this.scene.add(shockwave);
        this.particles.push(shockwave);
    }

    createBurstEffect() {
        // Efeito massivo para o supremo
        for (let i = 0; i < 100; i++) {
            const geometry = new THREE.SphereGeometry(0.2);
            const material = new THREE.MeshBasicMaterial({
                color: this.player.elementColor,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                this.player.position.x + (Math.random() - 0.5) * 20,
                this.player.position.y + Math.random() * 10,
                this.player.position.z + (Math.random() - 0.5) * 20
            );
            
            const toCenter = this.player.position.clone().sub(particle.position).normalize();
            particle.velocity = toCenter.multiplyScalar(0.5);
            particle.life = 60;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }

        // Múltiplas ondas de choque
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const shockwaveGeometry = new THREE.RingGeometry(0.1, 15, 32);
                const shockwaveMaterial = new THREE.MeshBasicMaterial({
                    color: this.player.elementColor,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
                shockwave.position.copy(this.player.position);
                shockwave.position.y = 0.1 + i * 0.5;
                shockwave.rotation.x = -Math.PI / 2;
                shockwave.scale.set(0.1, 0.1, 0.1);
                shockwave.life = 40;
                shockwave.isShockwave = true;
                
                this.scene.add(shockwave);
                this.particles.push(shockwave);
            }, i * 100);
        }
    }

    spawnElementalParticle() {
        const geometry = new THREE.OctahedronGeometry(0.15);
        const material = new THREE.MeshBasicMaterial({
            color: this.player.elementColor,
            emissive: this.player.elementColor,
            emissiveIntensity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        
        // Spawnar perto do boss ou inimigo atingido
        const spawnPos = this.boss.position.clone();
        spawnPos.x += (Math.random() - 0.5) * 3;
        spawnPos.y += Math.random() * 2 + 1;
        spawnPos.z += (Math.random() - 0.5) * 3;
        
        particle.position.copy(spawnPos);
        particle.targetPlayer = true;
        particle.speed = 0.15;
        
        this.scene.add(particle);
        this.elementalParticles.push(particle);
    }

    addEnergy(amount) {
        if (!this.player) return;
        
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + amount);
        this.updateCharacterUI();
    }

    applyCombatImpact(attacker, target, isCrit = false) {
        const now = performance.now();
        if (now - this.lastImpactAt < this.config.impactCooldownMs) return;
        this.lastImpactAt = now;

        const bonus = isCrit ? this.config.critBonusFrames : 0;
        this.globalHitstopFrames = Math.max(
            this.globalHitstopFrames,
            this.config.hitstopFrames + bonus
        );

        if (attacker && attacker.endLagFrames !== undefined) {
            attacker.endLagFrames = Math.max(
                attacker.endLagFrames,
                this.config.attackerEndLagFrames + bonus
            );
        }

        if (target && target.hitStunFrames !== undefined) {
            target.hitStunFrames = Math.max(
                target.hitStunFrames,
                this.config.targetHitStunFrames + bonus
            );
        }
    }

    damageEnemy(enemy, damage, isCrit = false) {
        if (!enemy.isAlive) return;

        enemy.health -= damage;
        enemy.health = Math.max(0, enemy.health);

        // Mostrar número de dano
        this.showDamageNumber(enemy.position, damage, isCrit);

        // Efeito de hit
        this.createHitEffect(enemy.position, this.player.elementColor);

        // Feedback de impacto: atacante e alvo sofrem micro-travamento
        this.applyCombatImpact(this.player, enemy, isCrit);

        // Pequeno knockback para reforcar a sensacao de pancada
        if (enemy.velocity && this.player) {
            const pushDir = enemy.position.clone().sub(this.player.position);
            pushDir.y = 0;
            if (pushDir.lengthSq() > 0) {
                pushDir.normalize().multiplyScalar(0.08);
                enemy.velocity.x += pushDir.x;
                enemy.velocity.z += pushDir.z;
                enemy.velocity.y += 0.03;
            }
        }

        if (enemy.health <= 0) {
            enemy.isAlive = false;
            this.onBossDefeated();
        }

        this.updateBossUI();
    }

    showDamageNumber(position, damage, isCrit) {
        const screenPos = position.clone().project(this.camera);
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (screenPos.y * -0.5 + 0.5) * window.innerHeight;

        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number' + (isCrit ? ' critical' : '');
        damageEl.textContent = Math.round(damage);
        damageEl.style.left = x + 'px';
        damageEl.style.top = y + 'px';
        
        document.getElementById('damageNumbers').appendChild(damageEl);

        setTimeout(() => damageEl.remove(), 1000);
    }

    createHitEffect(position, color) {
        for (let i = 0; i < 15; i++) {
            const geometry = new THREE.SphereGeometry(0.1);
            const material = new THREE.MeshBasicMaterial({ color });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            particle.life = 20;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    onBossDefeated() {
        // Mostrar modal de vitória
        document.getElementById('victoryModal').style.display = 'block';

        // Efeito de explosão
        for (let i = 0; i < 100; i++) {
            const geometry = new THREE.SphereGeometry(0.2);
            const material = new THREE.MeshBasicMaterial({
                color: Math.random() * 0xffffff
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(this.boss.position);
            
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            particle.life = 60;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }

        // Esconder boss
        this.boss.mesh.visible = false;
    }

    respawnBoss() {
        this.boss.health = this.boss.maxHealth;
        this.boss.isAlive = true;
        this.boss.position.set(0, 2, -15);
        this.boss.mesh.position.copy(this.boss.position);
        this.boss.mesh.visible = true;
        this.boss.state = 'idle';
        this.updateBossUI();
    }

    updatePlayerMovement() {
        if (!this.player || this.player.health <= 0) return;

        const char = this.player;
        const speed = this.keys['shift'] ? this.config.runSpeed : this.config.moveSpeed;
        const movementLocked = char.endLagFrames > 0 || char.hitStunFrames > 0;

        // Calcular direção de movimento baseado na câmera
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

        // Aplicar movimento
        const movement = new THREE.Vector3();
        
        if (!movementLocked) {
            if (this.keys['w']) movement.add(forward);
            if (this.keys['s']) movement.sub(forward);
            if (this.keys['d']) movement.add(right);
            if (this.keys['a']) movement.sub(right);
        }

        if (movement.length() > 0) {
            movement.normalize().multiplyScalar(speed);
            char.velocity.x = movement.x;
            char.velocity.z = movement.z;
        } else {
            char.velocity.x *= 0.8;
            char.velocity.z *= 0.8;
        }

        // Pulo
        if (!movementLocked && this.keys[' '] && char.onGround) {
            char.velocity.y = this.config.jumpForce;
            char.onGround = false;
        }

        // Gravidade
        char.velocity.y -= this.config.gravity;

        // Atualizar posição
        char.position.add(char.velocity);

        // Colisão com chão
        if (char.position.y <= 1) {
            char.position.y = 1;
            char.velocity.y = 0;
            char.onGround = true;
        }

        // Atualizar mesh
        char.mesh.position.copy(char.position);

        // Sincronizar todos os personagens
        this.characters.forEach(c => {
            if (c !== char) {
                c.position.copy(char.position);
                c.mesh.position.copy(char.position);
            }
        });
    }

    updateBossAI() {
        if (!this.boss.isAlive || !this.player) return;

        const boss = this.boss;
        const player = this.player;

        const distance = boss.position.distanceTo(player.position);

        // Hitstun curto apos receber dano
        if (boss.hitStunFrames > 0) {
            boss.velocity.x *= 0.8;
            boss.velocity.z *= 0.8;
            boss.velocity.y -= this.config.gravity;
            boss.position.add(boss.velocity);

            if (boss.position.y <= 2) {
                boss.position.y = 2;
                boss.velocity.y = 0;
            }

            boss.mesh.position.copy(boss.position);
            boss.mesh.rotation.x += 0.01;
            return;
        }

        // Atualizar cooldown
        if (boss.attackCooldown > 0) {
            boss.attackCooldown--;
        }

        // Comportamento baseado na distância
        if (distance < boss.detectionRange) {
            // Atacar sempre que estiver no alcance de detecção
            if (boss.attackCooldown <= 0) {
                // Decidir tipo de ataque baseado na distância
                if (distance > 15) {
                    // Se muito longe, pular no jogador
                    this.bossJumpAttack();
                    boss.attackCooldown = boss.attackMaxCooldown * 2; // Cooldown maior para pulo
                } else {
                    // Ataque normal de projéteis
                    this.bossAttack();
                    boss.attackCooldown = boss.attackMaxCooldown;
                }
            }
            
            if (distance > boss.attackRange) {
                // Mover em direção ao jogador
                const direction = player.position.clone().sub(boss.position);
                direction.y = 0;
                direction.normalize();
                
                boss.velocity.x = direction.x * boss.moveSpeed;
                boss.velocity.z = direction.z * boss.moveSpeed;
                
                boss.state = 'chasing';
            } else {
                // Parar de se mover mas continuar atacando
                boss.velocity.x *= 0.9;
                boss.velocity.z *= 0.9;
                boss.state = 'attacking';
            }
        } else {
            // Idle
            boss.velocity.x *= 0.95;
            boss.velocity.z *= 0.95;
            boss.state = 'idle';
        }

        // Gravidade
        boss.velocity.y -= this.config.gravity;

        // Atualizar posição
        boss.position.add(boss.velocity);

        // Colisão com chão
        if (boss.position.y <= 2) {
            boss.position.y = 2;
            boss.velocity.y = 0;
        }

        // Atualizar mesh
        boss.mesh.position.copy(boss.position);
        
        // Rotacionar para o jogador
        if (boss.state === 'chasing') {
            const angle = Math.atan2(
                player.position.x - boss.position.x,
                player.position.z - boss.position.z
            );
            boss.mesh.rotation.y = angle;
        }

        // Animação de rotação dos espinhos
        boss.mesh.rotation.x += 0.01;
    }

    bossAttack() {
        // Criar ondas de choque na altura correta
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const geometry = new THREE.SphereGeometry(0.4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 1
            });
            const projectileMesh = new THREE.Mesh(geometry, material);
            
            const projectile = {
                mesh: projectileMesh,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * 0.15,
                    0, // Manter na altura do chão para acertar o jogador
                    Math.sin(angle) * 0.15
                ),
                damage: this.boss.damage,
                life: 120,
                isBossAttack: true
            };
            
            projectile.mesh.position.copy(this.boss.position);
            projectile.mesh.position.y = 1.0; // Altura do centro do jogador
            this.scene.add(projectile.mesh);
            this.projectiles.push(projectile);
        }

        // Efeito visual
        this.createHitEffect(this.boss.position, 0xff0000);
    }

    bossJumpAttack() {
        // Boss pula alto e cai perto do jogador
        const boss = this.boss;
        const player = this.player;
        
        // Calcular direção para o jogador
        const direction = player.position.clone().sub(boss.position);
        direction.y = 0;
        direction.normalize();
        
        // Aplicar velocidade de pulo
        boss.velocity.x = direction.x * 0.3;
        boss.velocity.z = direction.z * 0.3;
        boss.velocity.y = 0.5; // Força do pulo
        
        boss.state = 'jumping';
        
        // Efeito visual de preparação
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.2);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(boss.position);
            particle.position.y = 0.5;
            
            const angle = (i / 20) * Math.PI * 2;
            particle.velocity = new THREE.Vector3(
                Math.cos(angle) * 0.2,
                Math.random() * 0.1,
                Math.sin(angle) * 0.2
            );
            particle.life = 30;
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
        
        // Verificar quando o boss pousar
        const checkLanding = setInterval(() => {
            if (boss.position.y <= 2 && boss.state === 'jumping') {
                boss.state = 'landing';
                clearInterval(checkLanding);
                
                // Criar onda de choque ao pousar
                this.createLandingShockwave();
                
                // Dano em área ao redor do boss
                const distanceToPlayer = boss.position.distanceTo(player.position);
                if (distanceToPlayer < 5) {
                    this.damagePlayer(this.boss.damage * 1.5); // 50% mais dano
                }
            }
        }, 50);
    }

    createLandingShockwave() {
        // Onda de choque expandindo do ponto de impacto
        const shockwaveGeometry = new THREE.RingGeometry(0.5, 8, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.position.copy(this.boss.position);
        shockwave.position.y = 0.2;
        shockwave.rotation.x = -Math.PI / 2;
        shockwave.scale.set(0.1, 0.1, 0.1);
        
        this.scene.add(shockwave);
        
        // Animar expansão
        let expansionTime = 0;
        const expandInterval = setInterval(() => {
            expansionTime++;
            const scale = 0.1 + expansionTime * 0.3;
            shockwave.scale.set(scale, scale, scale);
            shockwave.material.opacity = 0.8 - (expansionTime / 30);
            
            if (expansionTime >= 30) {
                clearInterval(expandInterval);
                this.scene.remove(shockwave);
            }
        }, 50);
        
        // Pedras voando
        for (let i = 0; i < 15; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(0.3);
            const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.copy(this.boss.position);
            rock.position.y = 0.5;
            
            const angle = (i / 15) * Math.PI * 2;
            rock.velocity = new THREE.Vector3(
                Math.cos(angle) * 0.3,
                Math.random() * 0.4 + 0.2,
                Math.sin(angle) * 0.3
            );
            rock.angularVelocity = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            );
            rock.life = 60;
            rock.castShadow = true;
            
            this.scene.add(rock);
            this.particles.push(rock);
        }
        
        // Partículas de poeira
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.SphereGeometry(0.15);
            const material = new THREE.MeshBasicMaterial({
                color: 0x8b7355,
                transparent: true,
                opacity: 0.6
            });
            const dust = new THREE.Mesh(geometry, material);
            dust.position.copy(this.boss.position);
            dust.position.y = 0.5;
            
            dust.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            dust.life = 40;
            
            this.scene.add(dust);
            this.particles.push(dust);
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            proj.life--;
            if (proj.life <= 0) {
                this.scene.remove(proj.mesh || proj);
                this.projectiles.splice(i, 1);
                continue;
            }

            const position = proj.mesh ? proj.mesh.position : proj.position;
            const velocity = proj.velocity;
            
            position.add(velocity);

            // Checar colisão com boss (projéteis do player)
            if (!proj.isBossAttack && this.boss.isAlive) {
                const distance = position.distanceTo(this.boss.position);
                if (distance < 2.5) {
                    this.damageEnemy(this.boss, proj.damage);
                    this.scene.remove(proj.mesh || proj);
                    this.projectiles.splice(i, 1);
                }
            }

            // Checar colisão com player (projéteis do boss)
            if (proj.isBossAttack && this.player) {
                const distance = position.distanceTo(this.player.position);
                // Hitbox maior para melhor detecção
                if (distance < 1.5) {
                    this.damagePlayer(proj.damage);
                    this.scene.remove(proj.mesh || proj);
                    this.projectiles.splice(i, 1);
                    continue;
                }
            }

            // Remover se sair do mapa
            if (position.y < -10 || Math.abs(position.x) > 100 || Math.abs(position.z) > 100) {
                this.scene.remove(proj.mesh || proj);
                this.projectiles.splice(i, 1);
            }
        }
    }

    damagePlayer(damage) {
        if (!this.player) return;

        this.player.health -= damage;
        this.player.health = Math.max(0, this.player.health);

        // Efeito visual
        this.createHitEffect(this.player.position, 0xff0000);

        // Feedback de impacto quando o boss acerta o jogador
        this.applyCombatImpact(this.boss, this.player);

        // Pequeno knockback no jogador
        if (this.boss) {
            const pushDir = this.player.position.clone().sub(this.boss.position);
            pushDir.y = 0;
            if (pushDir.lengthSq() > 0) {
                pushDir.normalize().multiplyScalar(0.12);
                this.player.velocity.x += pushDir.x;
                this.player.velocity.z += pushDir.z;
                this.player.velocity.y += 0.05;
            }
        }

        // Flash de tela vermelha
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = 'rgba(255,0,0,0.3)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '9998';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 200);

        this.updateCharacterUI();

        if (this.player.health <= 0) {
            // Game over - trocar para próximo personagem vivo
            this.switchToNextAliveCharacter();
        }
    }

    switchToNextAliveCharacter() {
        for (let i = 0; i < this.characters.length; i++) {
            const nextIndex = (this.currentCharacterIndex + 1 + i) % this.characters.length;
            if (this.characters[nextIndex].health > 0) {
                this.switchCharacter(nextIndex);
                return;
            }
        }
        
        // Todos morreram - game over
        alert('Game Over! Todos os personagens foram derrotados.');
        location.reload();
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.life--;
            if (particle.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
                continue;
            }

            if (particle.isShockwave) {
                // Expandir onda de choque
                const scale = 1 + (40 - particle.life) * 0.1;
                particle.scale.set(scale, scale, scale);
                particle.material.opacity = particle.life / 40;
            } else if (particle.velocity) {
                // Mover partícula
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.01; // Gravidade
                
                // Atualizar opacidade se o material suportar
                if (particle.material.opacity !== undefined) {
                    particle.material.opacity = particle.life / 60;
                }
            }

            // Rotação
            if (particle.angularVelocity) {
                // Rotação customizada (para pedras)
                particle.rotation.x += particle.angularVelocity.x;
                particle.rotation.y += particle.angularVelocity.y;
                particle.rotation.z += particle.angularVelocity.z;
            } else {
                // Rotação padrão
                particle.rotation.x += 0.1;
                particle.rotation.y += 0.1;
            }
        }
    }

    updateElementalParticles() {
        for (let i = this.elementalParticles.length - 1; i >= 0; i--) {
            const particle = this.elementalParticles[i];
            
            if (!this.player) {
                this.scene.remove(particle);
                this.elementalParticles.splice(i, 1);
                continue;
            }

            // Mover em direção ao jogador
            const direction = this.player.position.clone().sub(particle.position);
            const distance = direction.length();
            
            if (distance < 1) {
                // Coletar partícula
                this.addEnergy(10);
                this.scene.remove(particle);
                this.elementalParticles.splice(i, 1);
            } else {
                direction.normalize().multiplyScalar(particle.speed);
                particle.position.add(direction);
                
                // Rotação
                particle.rotation.x += 0.1;
                particle.rotation.y += 0.1;
            }
        }
    }

    updateCamera() {
        if (!this.player) return;

        // Posição da câmera atrás do jogador
        const cameraDistance = 8;
        const cameraHeight = 3;

        const offset = new THREE.Vector3(
            Math.sin(this.mouse.x) * cameraDistance,
            cameraHeight + Math.sin(this.mouse.y) * cameraDistance * 0.5,
            Math.cos(this.mouse.x) * cameraDistance
        );

        const targetPos = this.player.position.clone().add(offset);
        
        // Suavizar movimento da câmera
        this.camera.position.lerp(targetPos, 0.1);
        this.camera.lookAt(this.player.position.clone().add(new THREE.Vector3(0, 1, 0)));
    }

    updateCooldowns() {
        // Atualizar cooldowns de habilidades
        if (this.player) {
            if (this.player.skillCooldown > 0) {
                this.player.skillCooldown--;
                if (this.player.skillCooldown === 0) {
                    this.updateSkillUI();
                }
            }
        }

        // Atualizar cooldowns de troca de personagem
        this.characters.forEach((char, index) => {
            if (char.endLagFrames > 0) {
                char.endLagFrames--;
            }

            if (char.hitStunFrames > 0) {
                char.hitStunFrames--;
            }

            if (char.switchCooldown > 0) {
                char.switchCooldown -= 16; // ~1 frame
                if (char.switchCooldown < 0) char.switchCooldown = 0;
            }
        });

        if (this.boss && this.boss.hitStunFrames > 0) {
            this.boss.hitStunFrames--;
        }

        this.updateCharacterSlotsUI();
    }

    updateCharacterUI() {
        if (!this.player) return;

        // Nome e retrato
        document.getElementById('currentCharName').textContent = this.player.name;
        document.getElementById('currentCharPortrait').textContent = this.player.icon;
        document.getElementById('currentCharPortrait').style.background = 
            `linear-gradient(135deg, ${this.rgbToHex(this.player.elementColor)} 0%, ${this.rgbToHex(this.darkenColor(this.player.elementColor))} 100%)`;

        // HP
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('playerHealth').style.width = healthPercent + '%';
        document.getElementById('playerHealthText').textContent = 
            `${Math.round(this.player.health)}/${this.player.maxHealth}`;

        // Energia
        const energyPercent = (this.player.energy / this.player.maxEnergy) * 100;
        document.getElementById('playerEnergy').style.width = energyPercent + '%';
        document.getElementById('playerEnergyText').textContent = 
            `${Math.round(this.player.energy)}/${this.player.maxEnergy}`;
    }

    updateBossUI() {
        if (!this.boss) return;

        const bossInfo = document.getElementById('bossInfo');
        
        if (this.boss.isAlive) {
            bossInfo.style.display = 'block';
            document.getElementById('bossName').textContent = this.boss.name;
            
            const healthPercent = (this.boss.health / this.boss.maxHealth) * 100;
            document.getElementById('bossHealth').style.width = healthPercent + '%';
            document.getElementById('bossHealthText').textContent = 
                `${Math.round(this.boss.health)}/${this.boss.maxHealth}`;
        } else {
            bossInfo.style.display = 'none';
        }
    }

    updateSkillUI() {
        if (!this.player) return;

        // Skill E
        const skillE = document.getElementById('skillECooldown');
        if (this.player.skillCooldown > 0) {
            const seconds = Math.ceil(this.player.skillCooldown / 60);
            skillE.style.display = 'flex';
            skillE.textContent = seconds;
        } else {
            skillE.style.display = 'none';
        }

        // Burst Q
        const skillQ = document.getElementById('skillQ');
        if (this.player.energy >= this.player.maxEnergy) {
            skillQ.style.borderColor = '#ffd700';
            skillQ.style.boxShadow = '0 0 20px rgba(255,215,0,0.8)';
        } else {
            skillQ.style.borderColor = 'rgba(255,255,255,0.5)';
            skillQ.style.boxShadow = 'none';
        }
    }

    updateCharacterSlotsUI() {
        this.characters.forEach((char, index) => {
            const slot = document.querySelector(`[data-index="${index}"]`);
            const icon = document.getElementById(`char${index}`);
            const element = document.getElementById(`element${index}`);
            const cooldown = document.getElementById(`cooldown${index}`);

            // Ícone e elemento
            icon.textContent = char.icon;
            icon.style.background = `linear-gradient(135deg, ${this.rgbToHex(char.elementColor)} 0%, ${this.rgbToHex(this.darkenColor(char.elementColor))} 100%)`;
            
            element.textContent = char.element.substring(0, 1);
            element.classList.add(`element-${char.element.toLowerCase()}`);

            // Highlight personagem ativo
            if (index === this.currentCharacterIndex) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }

            // Mostrar cooldown
            if (char.switchCooldown > 0) {
                const seconds = Math.ceil(char.switchCooldown / 1000);
                cooldown.style.display = 'flex';
                cooldown.textContent = seconds;
            } else {
                cooldown.style.display = 'none';
            }

            // Desabilitar se morto
            if (char.health <= 0) {
                slot.style.opacity = '0.3';
                slot.style.pointerEvents = 'none';
            } else {
                slot.style.opacity = '1';
                slot.style.pointerEvents = 'auto';
            }
        });
    }

    rgbToHex(color) {
        const hex = color.toString(16).padStart(6, '0');
        return `#${hex}`;
    }

    darkenColor(color) {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        
        return ((r * 0.6) << 16) | ((g * 0.6) << 8) | (b * 0.6);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Hitstop global para reforcar o impacto dos golpes
        if (this.globalHitstopFrames > 0) {
            this.globalHitstopFrames--;
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Atualizar física e lógica
        this.updatePlayerMovement();
        this.updatePlayerAnimation();
        this.updateBossAI();
        this.updateProjectiles();
        this.updateParticles();
        this.updateElementalParticles();
        this.updateCamera();
        this.updateCooldowns();

        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }

    updatePlayerAnimation() {
        if (!this.player) return;
        
        this.player.animationTime += 0.1;
        
        // Animação da aura (sempre rotacionando)
        if (this.player.aura) {
            this.player.aura.rotation.z += 0.02;
            this.player.aura.material.opacity = 0.2 + Math.sin(this.player.animationTime) * 0.1;
        }
        
        // Animação de ataque
        if (this.player.attackTime > 0) {
            this.player.attackTime--;
            
            const progress = 1 - (this.player.attackTime / 20);
            
            // Balanço da arma
            if (this.player.weapon) {
                if (this.player.name === "Ganyu") {
                    // Puxar arco
                    this.player.weapon.rotation.z = -Math.PI / 2 - progress * 0.5;
                } else {
                    // Corte com espada
                    this.player.weapon.rotation.z = -0.5 - Math.sin(progress * Math.PI) * 1.5;
                }
            }
            
            // Movimento dos braços
            if (this.player.rightArm) {
                this.player.rightArm.rotation.z = -0.3 - Math.sin(progress * Math.PI) * 0.8;
                this.player.rightArm.rotation.x = Math.sin(progress * Math.PI) * 0.5;
            }
            
        } else {
            // Animação idle
            if (this.player.weapon) {
                if (this.player.name === "Ganyu") {
                    this.player.weapon.rotation.z = -Math.PI / 2 + Math.sin(this.player.animationTime * 0.5) * 0.1;
                } else {
                    this.player.weapon.rotation.z = -0.5 + Math.sin(this.player.animationTime * 0.5) * 0.1;
                }
            }
            
            if (this.player.rightArm) {
                this.player.rightArm.rotation.z = -0.3 + Math.sin(this.player.animationTime * 0.5) * 0.1;
            }
            
            if (this.player.leftArm) {
                this.player.leftArm.rotation.z = 0.3 + Math.sin(this.player.animationTime * 0.5 + 1) * 0.1;
            }
        }
        
        // Animação de corrida/caminhada
        const movementSpeed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.z ** 2);
        if (movementSpeed > 0.01) {
            const runSpeed = this.keys['shift'] ? 2 : 1;
            
            if (this.player.leftLeg) {
                this.player.leftLeg.rotation.x = Math.sin(this.player.animationTime * runSpeed) * 0.5;
            }
            
            if (this.player.rightLeg) {
                this.player.rightLeg.rotation.x = Math.sin(this.player.animationTime * runSpeed + Math.PI) * 0.5;
            }
            
            // Balanço do corpo ao correr
            this.player.mesh.position.y = this.player.position.y + Math.abs(Math.sin(this.player.animationTime * runSpeed * 2)) * 0.1;
        } else {
            // Resetar pernas
            if (this.player.leftLeg) {
                this.player.leftLeg.rotation.x *= 0.9;
            }
            if (this.player.rightLeg) {
                this.player.rightLeg.rotation.x *= 0.9;
            }
            
            // Pequena animação de respiração
            this.player.mesh.position.y = this.player.position.y + Math.sin(this.player.animationTime * 0.5) * 0.05;
        }
    }
}

// Iniciar jogo quando a página carregar
window.addEventListener('load', () => {
    new GenshinGame();
});
