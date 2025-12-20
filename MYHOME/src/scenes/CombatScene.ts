import Phaser from 'phaser';
import { Character } from '../systems/CharacterFactory';
import { CharacterManager } from '../systems/CharacterManager';
import { GameState } from '../systems/GameState';

interface CombatUnit {
    name: string;
    maxHp: number;
    hp: number;
    maxAp: number;
    ap: number;
    str: number;
    isDefending: boolean;
}

export class CombatScene extends Phaser.Scene {
    private player!: CombatUnit;
    private enemy!: CombatUnit;
    private originalEnemyData!: Character;

    private logText!: Phaser.GameObjects.Text;
    private playerHud!: Phaser.GameObjects.Text;
    private enemyHud!: Phaser.GameObjects.Text;
    private actionContainer!: Phaser.GameObjects.Container;

    private isPlayerTurn: boolean = true;
    private isBattleOver: boolean = false;

    constructor() {
        super('CombatScene');
    }

    init(data: { enemy: Character }) {
        this.originalEnemyData = data.enemy;
        const hero = CharacterManager.getInstance().getHero();

        // Initialize Combat Units
        this.player = {
            name: hero.name,
            maxHp: hero.stats.maxHp,
            hp: hero.stats.hp,
            maxAp: 5,
            ap: 3, // Start with some AP
            str: hero.stats.str,
            isDefending: false
        };

        this.enemy = {
            name: data.enemy.name,
            maxHp: data.enemy.stats.maxHp,
            hp: data.enemy.stats.hp,
            maxAp: 5,
            ap: 3,
            str: data.enemy.stats.str,
            isDefending: false
        };

        this.isBattleOver = false;
        this.isPlayerTurn = true; // Player goes first for now
    }

    create() {
        console.log("CombatScene: Starting Create");
        const { width, height } = this.scale;

        // Reset Camera
        this.cameras.main.setScroll(0, 0);
        this.cameras.main.setBackgroundColor('#220000');
        this.cameras.main.fadeIn(500);

        // Background (Double check with explicit rect)
        this.add.rectangle(width / 2, height / 2, width, height, 0x330000).setDepth(-100);

        // --- HUD ---
        this.playerHud = this.add.text(50, 50, '', { fontSize: '24px', color: '#fff' });
        this.enemyHud = this.add.text(width - 250, 50, '', { fontSize: '24px', color: '#ffaaaa' });

        // Visual Avatars (Placeholder)
        this.add.circle(150, 300, 50, 0x0000ff); // Player
        this.add.text(150, 360, "YOU", { fontSize: '20px' }).setOrigin(0.5);

        this.add.circle(width - 150, 300, 50, 0xff0000); // Enemy
        this.add.text(width - 150, 360, "ENEMY", { fontSize: '20px' }).setOrigin(0.5);

        // --- Log ---
        const logBg = this.add.rectangle(width / 2, 150, 600, 100, 0x000000, 0.5);
        this.logText = this.add.text(width / 2, 150, '전투 시작! (Battle Start!)', { fontSize: '20px', color: '#fff', align: 'center' }).setOrigin(0.5);

        // --- Action Menu ---
        this.createActionMenu();

        this.updateHud();
    }

    createActionMenu() {
        const { width, height } = this.scale;
        this.actionContainer = this.add.container(width / 2, height - 100);

        // Actions: Attack(0), Defend(0), Heavy(3), Skill(2)
        this.createBtn(-240, 0, '공격 (AP +1)', 0x555555, () => this.playerAction('attack'));
        this.createBtn(-80, 0, '방어 (AP +2)', 0x4444aa, () => this.playerAction('defend'));
        this.createBtn(80, 0, '강공 (AP 3)', 0xaa4444, () => this.playerAction('heavy'));
        this.createBtn(240, 0, '스킬 (AP 2)', 0xaa44aa, () => this.playerAction('skill'));
    }

    createBtn(x: number, y: number, label: string, color: number, callback: () => void) {
        const btn = this.add.rectangle(x, y, 140, 60, color).setInteractive({ useHandCursor: true })
            .on('pointerdown', callback)
            .on('pointerover', () => btn.setAlpha(0.8))
            .on('pointerout', () => btn.setAlpha(1));

        const text = this.add.text(x, y, label, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
        this.actionContainer.add([btn, text]);
    }

    updateHud() {
        this.playerHud.setText(`
${this.player.name}
HP: ${this.player.hp}/${this.player.maxHp}
AP: ${"⚡".repeat(this.player.ap)}
        `.trim());

        this.enemyHud.setText(`
${this.enemy.name}
HP: ${this.enemy.hp}/${this.enemy.maxHp}
AP: ${"⚡".repeat(this.enemy.ap)}
        `.trim());
    }

    log(msg: string) {
        this.logText.setText(msg);
        console.log(`[Combat] ${msg}`);
    }

    // --- Actions ---

    playerAction(type: string) {
        if (!this.isPlayerTurn || this.isBattleOver) return;

        let success = false;

        // Reset Defend status at start of action usage? 
        // No, Defend applies UNTIL next turn start.

        if (type === 'attack') {
            const dmg = Math.floor(this.player.str * 1.0);
            this.dealDamage(this.enemy, dmg);
            this.gainAp(this.player, 1);
            this.log(`당신은 공격했습니다! ${dmg} 피해.\n(AP 회복)`);
            success = true;
        }
        else if (type === 'defend') {
            this.player.isDefending = true;
            this.gainAp(this.player, 2);
            this.log(`당신은 방어태세를 갖춥니다.\n(피해감소, AP 대폭 회복)`);
            success = true;
        }
        else if (type === 'heavy') {
            if (this.player.ap >= 3) {
                this.player.ap -= 3;
                const dmg = Math.floor(this.player.str * 2.5);
                this.dealDamage(this.enemy, dmg);
                this.log(`강공! 강력한 일격! ${dmg} 피해.`);
                success = true;
            } else {
                this.log("AP가 부족합니다! (필요: 3)");
            }
        }
        else if (type === 'skill') {
            if (this.player.ap >= 2) {
                this.player.ap -= 2;
                const dmg = Math.floor(this.player.str * 1.5);
                this.dealDamage(this.enemy, dmg); // Multi-hit? Just simplified for now
                this.log(`스킬 사용! 연속 공격! ${dmg} 피해.`);
                success = true;
            } else {
                this.log("AP가 부족합니다! (필요: 2)");
            }
        }

        if (success) {
            this.endTurn();
        }
    }

    dealDamage(target: CombatUnit, amount: number) {
        let finalDmg = amount;
        if (target.isDefending) {
            finalDmg = Math.floor(amount * 0.5);
            // Defend expires after being hit? Or lasts whole round?
            // Usually lasts until their next turn.
        }

        // Clamp min damage
        if (finalDmg < 1) finalDmg = 1;

        target.hp -= finalDmg;
        if (target.hp < 0) target.hp = 0;

        this.updateHud();
        this.checkWinCondition();
    }

    gainAp(target: CombatUnit, amount: number) {
        target.ap += amount;
        if (target.ap > target.maxAp) target.ap = target.maxAp;
        this.updateHud();
    }

    checkWinCondition() {
        if (this.enemy.hp <= 0) {
            this.isBattleOver = true;
            this.log(`승리했습니다! 경험치 획득!`);

            // Apply rewards to GameState Hero
            const hero = CharacterManager.getInstance().getHero();
            hero.stats.hp = this.player.hp; // Persist HP loss
            GameState.getInstance().economy.exp += 50;
            GameState.getInstance().addGold(20);
            GameState.getInstance().addLog(`Defeated ${this.enemy.name}. +50 XP, +20 G`);

            this.time.delayedCall(2000, () => {
                this.scene.stop();
                this.scene.start('TownMapScene', { cityName: this.originalEnemyData.locationName || 'Unknown' });
                this.scene.launch('UIScene');
            });
        }
        else if (this.player.hp <= 0) {
            this.isBattleOver = true;
            this.log(`패배했습니다...`);

            const hero = CharacterManager.getInstance().getHero();
            hero.stats.hp = 1; // Survive with 1 HP

            this.time.delayedCall(2000, () => {
                this.scene.stop();
                this.scene.start('TownMapScene', { cityName: this.originalEnemyData.locationName || 'Unknown' });
                this.scene.launch('UIScene');
            });
        }
    }

    endTurn() {
        if (this.isBattleOver) return;

        this.isPlayerTurn = !this.isPlayerTurn;
        this.player.isDefending = false; // Reset player defend stats

        if (!this.isPlayerTurn) {
            // Enemy Turn
            this.actionContainer.setAlpha(0.5); // Disable UI visually
            this.time.delayedCall(1000, () => this.enemyAI());
        } else {
            // Player Turn Start
            this.actionContainer.setAlpha(1);
        }
    }

    enemyAI() {
        if (this.isBattleOver) return;
        this.enemy.isDefending = false;

        // Simple AI
        // If Low AP -> Attack or Defend
        // If High AP -> Heavy or Skill

        let action = 'attack';
        const roll = Math.random();

        if (this.enemy.ap >= 3 && roll < 0.6) {
            action = 'heavy';
        } else if (this.enemy.ap >= 2 && roll < 0.4) {
            action = 'skill';
        } else {
            // Build AP
            if (this.enemy.hp < this.enemy.maxHp * 0.3 && roll < 0.5) action = 'defend'; // Defensive if low HP
            else action = 'attack';
        }

        // Execute
        let dmg = 0;
        if (action === 'attack') {
            dmg = Math.floor(this.enemy.str * 1.0);
            this.dealDamage(this.player, dmg);
            this.gainAp(this.enemy, 1);
            this.log(`${this.enemy.name}의 공격! ${dmg} 피해.`);
        }
        else if (action === 'defend') {
            this.enemy.isDefending = true;
            this.gainAp(this.enemy, 2);
            this.log(`${this.enemy.name}이 방어합니다.`);
        }
        else if (action === 'heavy') {
            this.enemy.ap -= 3;
            dmg = Math.floor(this.enemy.str * 2.5);
            this.dealDamage(this.player, dmg);
            this.log(`${this.enemy.name}의 강공! ${dmg} 피해!`);
        }
        else if (action === 'skill') {
            this.enemy.ap -= 2;
            dmg = Math.floor(this.enemy.str * 1.5);
            this.dealDamage(this.player, dmg);
            this.log(`${this.enemy.name}의 스킬! ${dmg} 피해.`);
        }

        // End Enemy Turn
        this.endTurn();
    }
}
