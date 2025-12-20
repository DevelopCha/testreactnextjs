import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { CharacterManager } from '../systems/CharacterManager';
import { Character } from '../systems/CharacterFactory';

export class TownMapScene extends Phaser.Scene {
    private cityName: string = '';
    private localChars: Character[] = [];
    private interactionContainer!: Phaser.GameObjects.Container;

    constructor() {
        super('TownMapScene');
    }

    init(data: { cityName: string }) {
        this.cityName = data.cityName;
        this.localChars = CharacterManager.getInstance().getNPCsInCity(this.cityName);

        if (this.localChars.length === 0) {
            this.localChars = CharacterManager.getInstance().getAllNPCs().slice(0, 3);
        }
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0);
        this.add.text(width / 2, 50, `${this.cityName}에 오신 것을 환영합니다`, { fontSize: '32px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);

        // --- Facilities ---
        this.createFacilityBtn(200, 200, '장터 (상점)', 0x4444ff, () => this.openShop());
        this.createFacilityBtn(200, 300, '주점 (여관)', 0x44aa44, () => this.restAtInn());
        this.createFacilityBtn(200, 400, '길드 (모험가)', 0xaa4444, () => console.log('Guild'));

        // --- Characters ---
        this.add.text(width - 300, 150, '주변 인물:', { fontSize: '24px', color: '#fff' });

        this.localChars.forEach((char, index) => {
            const y = 200 + (index * 60);
            const btn = this.add.container(width - 300, y);

            const bg = this.add.rectangle(0, 0, 250, 50, 0x333333).setOrigin(0).setStrokeStyle(1, 0x888888)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => bg.setFillStyle(0x555555))
                .on('pointerout', () => bg.setFillStyle(0x333333))
                .on('pointerdown', () => this.openInteractionModal(char));

            const icon = this.add.circle(25, 25, 20, 0xff0000);
            const name = this.add.text(55, 15, `${char.name} (Lv.${char.level})`, { fontSize: '16px', color: '#fff' });

            btn.add([bg, icon, name]);
        });

        // EXIT
        this.add.rectangle(width / 2, height - 50, 200, 60, 0xcc0000)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('WorldMapScene');
                this.scene.launch('UIScene');
            });
        this.add.text(width / 2, height - 50, '도시 떠나기', { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

        this.createInteractionModal();
    }

    createInteractionModal() {
        const { width, height } = this.scale;
        this.interactionContainer = this.add.container(width / 2, height / 2).setVisible(false).setDepth(1000);

        const blocker = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setInteractive();
        const bg = this.add.rectangle(0, 0, 500, 600, 0x111111).setStrokeStyle(4, 0xffffff);

        this.interactionContainer.add([blocker, bg]);
    }

    openInteractionModal(char: Character) {
        this.interactionContainer.removeAll(true);
        this.createInteractionModal();
        this.interactionContainer.setVisible(true);

        const portrait = this.add.image(0, -150, 'unit_hero').setDisplaySize(128, 128);
        const nameText = this.add.text(0, -60, char.name, { fontSize: '32px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        const jobText = this.add.text(0, -20, `${char.job} (Lv.${char.level})`, { fontSize: '20px', color: '#aaaaaa' }).setOrigin(0.5);

        this.interactionContainer.add([portrait, nameText, jobText]);

        // Options
        this.createModalButton(0, 60, '1. 정보보기 (Info)', () => this.showCharacterInfo(char));
        this.createModalButton(0, 130, '2. 대화하기 (Talk)', () => this.showDialogue(char));
        // ATTACK BUTTON
        this.createModalButton(0, 200, '3. 공격하기 (Attack)', () => this.startCombat(char), 0xaa2222);
        this.createModalButton(0, 270, '4. 종료 (Exit)', () => this.interactionContainer.setVisible(false));
    }

    startCombat(char: Character) {
        // Create a confirmation modal manually since window.confirm blocks the thread
        const { width, height } = this.scale;

        const container = this.add.container(0, 0).setDepth(2000);
        const blocker = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setInteractive();

        const bg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x330000).setStrokeStyle(4, 0xff0000);
        const text = this.add.text(width / 2, height / 2 - 40, `${char.name}와(과)\n전투하시겠습니까?`, {
            fontSize: '24px', color: '#fff', align: 'center'
        }).setOrigin(0.5);
        const subtext = this.add.text(width / 2, height / 2 + 0, '(되돌릴 수 없습니다!)', {
            fontSize: '16px', color: '#ffaaaa'
        }).setOrigin(0.5);

        // YES Button
        const btnYes = this.add.rectangle(width / 2 - 80, height / 2 + 60, 120, 40, 0xcc0000).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                container.destroy();
                this.scene.stop('UIScene');
                this.scene.start('CombatScene', { enemy: char });
            });
        const textYes = this.add.text(width / 2 - 80, height / 2 + 60, '전투 시작', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

        // NO Button
        const btnNo = this.add.rectangle(width / 2 + 80, height / 2 + 60, 120, 40, 0x555555).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                container.destroy();
            });
        const textNo = this.add.text(width / 2 + 80, height / 2 + 60, '취소', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

        container.add([blocker, bg, text, subtext, btnYes, textYes, btnNo, textNo]);
    }

    createModalButton(x: number, y: number, label: string, onClick: () => void, color: number = 0x333333) {
        const btn = this.add.rectangle(x, y, 400, 60, color).setStrokeStyle(2, 0x888888)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => btn.setFillStyle(color + 0x222222))
            .on('pointerout', () => btn.setFillStyle(color))
            .on('pointerdown', onClick);

        const text = this.add.text(x, y, label, { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
        this.interactionContainer.add([btn, text]);
    }

    showCharacterInfo(char: Character) {
        this.interactionContainer.removeAll(true);
        this.createInteractionModal();
        this.interactionContainer.setVisible(true);

        const title = this.add.text(0, -200, `${char.name}의 정보`, { fontSize: '28px', color: '#fff' }).setOrigin(0.5);

        const info = `
        직업: ${char.job}
        레벨: ${char.level}
        체력: ${char.stats.hp} / ${char.stats.maxHp}
        근력: ${char.stats.str}
        민첩: ${char.stats.dex}
        지능: ${char.stats.int}
        `;

        const text = this.add.text(0, -50, info, { fontSize: '20px', color: '#ccc', align: 'center' }).setOrigin(0.5);
        this.createModalButton(0, 200, '돌아가기', () => this.openInteractionModal(char));
        this.interactionContainer.add([title, text]);
    }

    showDialogue(char: Character) {
        this.interactionContainer.removeAll(true);
        this.createInteractionModal();
        this.interactionContainer.setVisible(true);

        const portrait = this.add.image(0, -200, 'unit_hero').setDisplaySize(80, 80);
        const name = this.add.text(0, -140, char.name, { fontSize: '24px', color: '#ffd700' }).setOrigin(0.5);

        const greetings = [
            "반갑네, 모험가여.",
            "북쪽 폐허에 대한 소문 들어봤나?",
            "요즘 장사가 통 안 되는구만.",
            "나도 한때는 자네 같은 모험가였지."
        ];
        const msg = greetings[Math.floor(Math.random() * greetings.length)];

        const bubble = this.add.rectangle(0, 0, 450, 150, 0xffffff).setOrigin(0.5);
        const speech = this.add.text(0, 0, msg, { fontSize: '20px', color: '#000', wordWrap: { width: 400 } }).setOrigin(0.5);

        this.createModalButton(0, 200, '확인', () => this.openInteractionModal(char));
        this.interactionContainer.add([portrait, name, bubble, speech]);
    }

    createFacilityBtn(x: number, y: number, label: string, color: number, onClick: () => void) {
        const btn = this.add.rectangle(x, y, 300, 80, color)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => btn.setAlpha(0.8))
            .on('pointerout', () => btn.setAlpha(1))
            .on('pointerdown', onClick);

        this.add.text(x, y, label, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    }

    openShop() {
        GameState.getInstance().addLog("상점에 입장했습니다.");
        if (GameState.getInstance().removeGold(50)) {
            GameState.getInstance().addItem({ id: 'potion_hp', name: '회복 물약', description: '체력 50 회복', price: 50, type: 'consumable' });
            GameState.getInstance().addLog("회복 물약을 구매했습니다.");
            this.showFloatText("물약 구매 성공!");
        } else {
            GameState.getInstance().addLog("골드가 부족합니다.");
            this.showFloatText("골드 부족!");
        }
    }

    restAtInn() {
        if (GameState.getInstance().removeGold(20)) {
            CharacterManager.getInstance().getHero().stats.hp = CharacterManager.getInstance().getHero().stats.maxHp;
            GameState.getInstance().addLog("여관에서 휴식했습니다.");
            this.showFloatText("체력 완전 회복!");
        } else {
            GameState.getInstance().addLog("골드가 부족합니다.");
            this.showFloatText("골드 부족!");
        }
    }

    showFloatText(msg: string) {
        const text = this.add.text(this.scale.width / 2, this.scale.height - 150, msg, {
            fontSize: '28px', color: '#ffff00', stroke: '#000', strokeThickness: 4,
            backgroundColor: '#000000aa', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: text, y: text.y - 50, alpha: 0, duration: 2000,
            onComplete: () => text.destroy()
        });
    }
}
