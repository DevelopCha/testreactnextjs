import Phaser from 'phaser';

export class InteractionScene extends Phaser.Scene {
    private container!: Phaser.GameObjects.Container;
    private npcData: any;

    constructor() {
        super('InteractionScene');
    }

    init(data: any) {
        this.npcData = data;
    }

    create() {
        const { width, height } = this.scale;

        // 1. Dim Background
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setInteractive(); // Block clicks through

        // 2. Dialog Panel
        const panelWidth = 600;
        const panelHeight = 400;
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x2d2d2d)
            .setStrokeStyle(4, 0xaa8855);

        this.container = this.add.container(width / 2, height / 2, [panel]);

        // 3. NPC Info
        const infoText = this.add.text(-panelWidth / 2 + 20, -panelHeight / 2 + 20, this.npcData.location.toUpperCase(), {
            fontSize: '32px', color: '#ffd700', fontStyle: 'bold'
        });
        this.container.add(infoText);

        // Portrait Logic
        let portraitKey = 'npc'; // Default
        const loc = this.npcData.location.toLowerCase();

        if (loc.includes('blacksmith')) portraitKey = 'portrait_blacksmith';
        else if (loc.includes('guild')) portraitKey = 'portrait_guild';
        else if (loc.includes('magic')) portraitKey = 'portrait_mage';
        else if (loc.includes('alchemy')) portraitKey = 'portrait_mage'; // Reuse mage for now or generic
        else if (loc.includes('castle') || loc.includes('mansion')) portraitKey = 'portrait_noble';

        // Portrait Image (Left side)
        const portrait = this.add.image(-panelWidth / 2 + 150, 0, portraitKey).setDisplaySize(200, 200);
        this.container.add(portrait);

        // Dialog Bubble (Right side)
        const bubbleX = 50;
        const bubbleY = -50;
        const bubbleWidth = 300;
        const bubbleHeight = 150;

        const bubble = this.add.rectangle(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 0xffffff)
            .setStrokeStyle(2, 0x000000);
        this.container.add(bubble);

        const descText = this.add.text(bubbleX - 140, bubbleY - 60, `[${this.npcData.npcName}]\nHello, adventurer. Welcome to the ${this.npcData.location}. How can I help you today?`, {
            fontSize: '18px', color: '#000000', wordWrap: { width: 280 }
        });
        this.container.add(descText);

        // 4. Action Buttons (Bottom)
        const actions = ['Talk', 'Trade', 'Quest', 'Leave'];
        actions.forEach((action, index) => {
            const btn = this.createButton(0, 50 + (index * 60), action, () => this.handleAction(action));
            this.container.add(btn);
        });

        // Close on 'Leave' or BG click (optional, but requested popup style)
        bg.on('pointerdown', () => {
            // this.close();
        });
    }

    createButton(x: number, y: number, text: string, callback: () => void) {
        const btnWidth = 200;
        const btnHeight = 50;

        const btnBg = this.add.rectangle(x, y, btnWidth, btnHeight, 0x555555)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => btnBg.setFillStyle(0x777777))
            .on('pointerout', () => btnBg.setFillStyle(0x555555))
            .on('pointerdown', () => btnBg.setFillStyle(0x333333))
            .on('pointerup', () => {
                btnBg.setFillStyle(0x777777);
                callback();
            });

        const btnText = this.add.text(x, y, text, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        return [btnBg, btnText];
    }

    handleAction(action: string) {
        if (action === 'Leave') {
            this.close();
        } else {
            console.log(`Action selected: ${action}`);
            // Logic for other actions
        }
    }

    close() {
        this.scene.stop();
        this.scene.resume('TownMapScene');
    }
}
