import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { TownMapScene } from './scenes/TownMapScene';
import { UIScene } from './scenes/UIScene';
import { CombatScene } from './scenes/CombatScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'app',
    scene: [MainMenuScene, WorldMapScene, TownMapScene, UIScene, CombatScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    transparent: true,
    backgroundColor: 'rgba(0,0,0,0)'
};

new Phaser.Game(config);
