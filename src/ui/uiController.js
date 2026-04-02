export class UIController {
    constructor(game) {
        this.game = game;
    }

    setupUI() {
        document.getElementById('respawnBoss').addEventListener('click', () => {
            this.game.respawnBoss();
            document.getElementById('victoryModal').style.display = 'none';
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('victoryModal').style.display = 'none';
        });

        document.querySelectorAll('.character-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                if (index < this.game.characters.length) {
                    this.game.switchCharacter(index);
                }
            });
        });
    }

    updateCharacterUI() {
        const player = this.game.player;
        if (!player) return;

        document.getElementById('currentCharName').textContent = player.name;
        document.getElementById('currentCharPortrait').textContent = player.icon;
        document.getElementById('currentCharPortrait').style.background =
            `linear-gradient(135deg, ${this.game.rgbToHex(player.elementColor)} 0%, ${this.game.rgbToHex(this.game.darkenColor(player.elementColor))} 100%)`;

        const healthPercent = (player.health / player.maxHealth) * 100;
        document.getElementById('playerHealth').style.width = healthPercent + '%';
        document.getElementById('playerHealthText').textContent = `${Math.round(player.health)}/${player.maxHealth}`;

        const energyPercent = (player.energy / player.maxEnergy) * 100;
        document.getElementById('playerEnergy').style.width = energyPercent + '%';
        document.getElementById('playerEnergyText').textContent = `${Math.round(player.energy)}/${player.maxEnergy}`;
    }

    updateBossUI() {
        const boss = this.game.boss;
        if (!boss) return;

        const bossInfo = document.getElementById('bossInfo');

        if (boss.isAlive) {
            bossInfo.style.display = 'block';
            document.getElementById('bossName').textContent = boss.name;

            const healthPercent = (boss.health / boss.maxHealth) * 100;
            document.getElementById('bossHealth').style.width = healthPercent + '%';
            document.getElementById('bossHealthText').textContent = `${Math.round(boss.health)}/${boss.maxHealth}`;
        } else {
            bossInfo.style.display = 'none';
        }
    }

    updateSkillUI() {
        const player = this.game.player;
        if (!player) return;

        const skillE = document.getElementById('skillECooldown');
        if (player.skillCooldown > 0) {
            const seconds = Math.ceil(player.skillCooldown / 60);
            skillE.style.display = 'flex';
            skillE.textContent = seconds;
        } else {
            skillE.style.display = 'none';
        }

        const skillQ = document.getElementById('skillQ');
        if (player.energy >= player.maxEnergy) {
            skillQ.style.borderColor = '#ffd700';
            skillQ.style.boxShadow = '0 0 20px rgba(255,215,0,0.8)';
        } else {
            skillQ.style.borderColor = 'rgba(255,255,255,0.5)';
            skillQ.style.boxShadow = 'none';
        }
    }

    updateCharacterSlotsUI() {
        this.game.characters.forEach((char, index) => {
            const slot = document.querySelector(`[data-index="${index}"]`);
            const icon = document.getElementById(`char${index}`);
            const element = document.getElementById(`element${index}`);
            const cooldown = document.getElementById(`cooldown${index}`);

            icon.textContent = char.icon;
            icon.style.background = `linear-gradient(135deg, ${this.game.rgbToHex(char.elementColor)} 0%, ${this.game.rgbToHex(this.game.darkenColor(char.elementColor))} 100%)`;

            element.textContent = char.element.substring(0, 1);
            element.classList.add(`element-${char.element.toLowerCase()}`);

            if (index === this.game.currentCharacterIndex) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }

            if (char.switchCooldown > 0) {
                const seconds = Math.ceil(char.switchCooldown / 1000);
                cooldown.style.display = 'flex';
                cooldown.textContent = seconds;
            } else {
                cooldown.style.display = 'none';
            }

            if (char.health <= 0) {
                slot.style.opacity = '0.3';
                slot.style.pointerEvents = 'none';
            } else {
                slot.style.opacity = '1';
                slot.style.pointerEvents = 'auto';
            }
        });
    }

    showDamageNumber(position, damage, isCrit) {
        const screenPos = position.clone().project(this.game.camera);
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
}
