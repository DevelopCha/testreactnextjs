import Phaser from 'phaser';
import { TurnManager } from '../systems/TurnManager';
import { GameState } from '../systems/GameState';
import { CharacterManager } from '../systems/CharacterManager';

export class UIScene extends Phaser.Scene {
    private turnText!: Phaser.GameObjects.Text;
    private apText!: Phaser.GameObjects.Text;
    private modalContainer!: Phaser.GameObjects.Container;
    private tooltipContainer!: Phaser.GameObjects.Container;
    private tooltipText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const { width, height } = this.scale;

        // 1. Basic HUD
        this.turnText = this.add.text(20, 20, '', { fontSize: '20px', color: '#ffffff', stroke: '#000', strokeThickness: 4 });
        this.apText = this.add.text(20, 50, '', { fontSize: '20px', color: '#00ff00', stroke: '#000', strokeThickness: 4 });

        // Next Turn
        const nextBtn = this.add.rectangle(width - 100, 50, 140, 50, 0x444444)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => TurnManager.getInstance().advanceTime());
        this.add.text(width - 100, 50, 'Next Turn', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

        // 2. Right Side Menu
        this.createMenuIcon(width - 40, 150, '능력치', () => this.showStats());
        this.createMenuIcon(width - 40, 220, '인벤', () => this.showInventory());
        this.createMenuIcon(width - 40, 290, '기록', () => this.showLog());
        this.createMenuIcon(width - 40, 360, '정보', () => this.showInfoMenu());
        this.createMenuIcon(width - 40, 430, '옵션', () => console.log('Options'));

        // 3. Modal Container (Hidden)
        this.modalContainer = this.add.container(width / 2, height / 2).setVisible(false);

        // 4. Tooltip Container (Hidden, follows mouse roughly or fixed)
        this.createTooltip();

        // Subscriptions
        this.updateUI(TurnManager.getInstance().turnData);
        TurnManager.getInstance().subscribe((data: any) => this.updateUI(data));

        this.game.events.on('map-hover', (data: any) => this.updateTooltip(data));
    }

    createTooltip() {
        this.tooltipContainer = this.add.container(0, 0).setVisible(false).setDepth(1000);

        const bg = this.add.rectangle(0, 0, 200, 160, 0x000000, 0.8)
            .setStrokeStyle(2, 0xaaaaaa)
            .setOrigin(0, 0); // Top-left origin

        this.tooltipText = this.add.text(10, 10, '', {
            fontSize: '14px',
            color: '#ffffff',
            lineSpacing: 6
        });

        this.tooltipContainer.add([bg, this.tooltipText]);
    }

    updateTooltip(data: any) {
        if (!data) {
            this.tooltipContainer.setVisible(false);
            return;
        }

        const { x, y, cell, screenX, screenY } = data;

        this.tooltipContainer.setVisible(true);
        // Position near mouse but keep within bounds
        let tx = screenX + 20;
        let ty = screenY + 20;

        // Simple bounds check (assuming 800x600 or sim, adaptable)
        if (tx + 200 > this.scale.width) tx = screenX - 220;
        if (ty + 150 > this.scale.height) ty = screenY - 170;

        this.tooltipContainer.setPosition(tx, ty);

        // Content
        let content = `[${x}, ${y}]\n`;
        content += `Terrain: ${this.getTerrainName(cell.baseType)}\n`;
        content += `Height: ${cell.height}\n`;

        if (cell.featureType !== 0) content += `Feature: ${this.getFeatureName(cell.featureType)}\n`;
        if (cell.resourceType !== 0) content += `Resource: ${this.getResourceName(cell.resourceType)}\n`;
        if (cell.buildingType !== 0) content += `Building: ${this.getBuildingName(cell.buildingType)}\n`;
        if (cell.kingdomId) content += `Kingdom: ${cell.kingdomId}`;

        this.tooltipText.setText(content);

        // Adjust bg height dynamically?
        const bounds = this.tooltipText.getBounds();
        const bg = this.tooltipContainer.list[0] as Phaser.GameObjects.Rectangle;
        bg.setSize(bounds.width + 20, bounds.height + 20);
    }

    // Helpers to map enums to string (duplicating MapTypes logic or importing? Importing is better but enums are numbers at runtime)
    // We can rely on MapTypes exports if we import them.
    getTerrainName(type: number): string {
        switch (type) {
            case 0: return 'Ocean';
            case 1: return 'Grassland';
            case 2: return 'Desert';
            case 3: return 'Tundra';
            case 4: return 'Swamp';
            case 5: return 'Volcanic';
            case 6: return 'Plains';
            case 7: return 'Wasteland';
            default: return 'Unknown';
        }
    }

    getFeatureName(type: number): string {
        switch (type) {
            case 1: return 'Forest';
            case 2: return 'Mountain';
            case 3: return 'Lake';
            case 4: return 'Oasis';
            case 5: return 'Reef';
            case 6: return 'Ice';
            default: return '';
        }
    }

    getResourceName(type: number): string {
        switch (type) {
            case 1: return 'Iron';
            case 2: return 'Gold';
            case 3: return 'Wheat';
            default: return '';
        }
    }

    getBuildingName(type: number): string {
        switch (type) {
            case 1: return 'City';
            case 2: return 'Ruin';
            case 3: return 'Kingdom';
            case 4: return 'Tower';
            case 5: return 'Capital';
            default: return '';
        }
    }

    updateUI(data: any) {
        this.turnText.setText(`Year ${data.year} Month ${data.month}`);
        this.apText.setText(`AP: ${data.actionPoints} / ${data.maxActionPoints}`);
    }

    createMenuIcon(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.circle(x, y, 25, 0x333333).setStrokeStyle(2, 0xffffff);

        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => bg.setFillStyle(0x555555))
            .on('pointerout', () => bg.setFillStyle(0x333333))
            .on('pointerdown', onClick);

        this.add.text(x, y, label[0], { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        this.add.text(x, y + 35, label, { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
    }

    // --- Modals ---

    private hideModal() {
        this.modalContainer.removeAll(true);
        this.modalContainer.setVisible(false);
    }

    private createBaseModal(title: string) {
        this.hideModal();
        this.modalContainer.setVisible(true);

        const bg = this.add.rectangle(0, 0, 400, 500, 0x000000, 0.9).setStrokeStyle(4, 0x4444ff);
        this.modalContainer.add(bg);

        const titleText = this.add.text(0, -220, title, { fontSize: '24px', color: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.modalContainer.add(titleText);

        const closeBtn = this.add.text(180, -230, 'X', { fontSize: '24px', color: '#ff0000' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.hideModal());
        this.modalContainer.add(closeBtn);
    }

    // 1. STATS (Hero)
    private showStats() {
        this.createBaseModal('Character Stats');
        const hero = CharacterManager.getInstance().getHero();
        const economy = GameState.getInstance().economy;

        const text = `
Name: ${hero.name}
Level: ${hero.level} (${hero.job})
HP: ${hero.stats.hp} / ${hero.stats.maxHp}
Gold: ${economy.gold} G

Strength: ${hero.stats.str}
Dexterity: ${hero.stats.dex}
Intelligence: ${hero.stats.int}
        `;

        const content = this.add.text(-180, -180, text, { fontSize: '18px', color: '#fff', lineSpacing: 10 });
        this.modalContainer.add(content);
    }

    // 2. INVENTORY
    private showInventory() {
        this.createBaseModal('Inventory');
        const inv = GameState.getInstance().inventory;

        if (inv.length === 0) {
            this.modalContainer.add(this.add.text(0, 0, 'Empty', { color: '#888' }).setOrigin(0.5));
            return;
        }

        inv.forEach((slot, index) => {
            const y = -150 + (index * 40);
            const itemText = this.add.text(-180, y, `${slot.item.name} x${slot.count}`, { fontSize: '18px', color: '#fff' });

            if (slot.item.type === 'consumable') {
                const useBtn = this.add.text(140, y, '[USE]', { color: '#00ff00' })
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        if (GameState.getInstance().removeItem(slot.item.id, 1)) {
                            GameState.getInstance().addLog(`Used ${slot.item.name}`);
                            // Heal Hero logic would go here
                            this.showInventory();
                        }
                    });
                this.modalContainer.add(useBtn);
            }
            this.modalContainer.add(itemText);
        });
    }

    // 3. LOG
    private showLog() {
        this.createBaseModal('Adventure Log');
        const logs = GameState.getInstance().logs;
        const content = this.add.text(-180, -180, logs.join('\n'), { fontSize: '14px', color: '#ccc', wordWrap: { width: 360 } });
        this.modalContainer.add(content);
    }

    // 4. INFO MENU (Sub-menus)
    private showInfoMenu() {
        this.createBaseModal('Information');

        // Buttons: Character List, World Info
        this.createSubMenuButton(0, -100, 'Characters (인물)', () => this.showCharacterList());
        this.createSubMenuButton(0, -30, 'World Info (세계)', () => console.log('World Info'));
        this.createSubMenuButton(0, 40, 'History (역사)', () => console.log('History'));
    }

    private createSubMenuButton(x: number, y: number, label: string, onClick: () => void) {
        const bg = this.add.rectangle(x, y, 300, 50, 0x333333).setInteractive({ useHandCursor: true })
            .on('pointerover', () => bg.setFillStyle(0x555555))
            .on('pointerout', () => bg.setFillStyle(0x333333))
            .on('pointerdown', onClick);

        const text = this.add.text(x, y, label, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
        this.modalContainer.add([bg, text]);
    }

    // 4-1. CHARACTER LIST
    private showCharacterList() {
        this.createBaseModal('Known Characters');
        const npcs = CharacterManager.getInstance().getAllNPCs();

        if (npcs.length === 0) {
            this.modalContainer.add(this.add.text(0, 0, 'No characters met.', { color: '#888' }).setOrigin(0.5));
            return;
        }

        // Simple paginated list or scroll? Just top 10 for now.
        npcs.slice(0, 10).forEach((npc, index) => {
            const y = -180 + (index * 35);
            const info = `${npc.name} (${npc.job}, Lv.${npc.level}) - ${npc.locationName || 'Unknown'}`;
            const text = this.add.text(-180, y, info, { fontSize: '16px', color: '#aaa' });
            this.modalContainer.add(text);
        });

        if (npcs.length > 10) {
            this.modalContainer.add(this.add.text(0, 200, `...and ${npcs.length - 10} more.`, { color: '#888' }).setOrigin(0.5));
        }
    }
}
