import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('map', '/assets/map_realistic.png'); // Use new realistic map
        this.load.image('hero', '/assets/hero.png');
        this.load.image('npc', '/assets/npc.png');

        // Portraits
        this.load.image('portrait_blacksmith', '/assets/portrait_blacksmith.png');
        this.load.image('portrait_guild', '/assets/portrait_guildmaster.png');
        this.load.image('portrait_mage', '/assets/portrait_mage.png');
        this.load.image('portrait_noble', '/assets/portrait_noble.png');
    }

    create() {
        // Initialize Sound Manager
        // import { SoundManager } from '../systems/SoundManager';
        SoundManager.getInstance().init(this);

        this.scene.start('MainMenuScene');
    }
}
