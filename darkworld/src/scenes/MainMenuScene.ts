import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height * 0.3, 'Dark World', {
            fontSize: '64px',
            color: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const startText = this.add.text(width / 2, height * 0.6, 'Click to Start', {
            fontSize: '32px',
            color: '#aaaaaa',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        this.input.once('pointerdown', () => {
            this.scene.start('WorldMapScene');
            this.scene.launch('UIScene');
        });
    }
}
