import Phaser from 'phaser';

export class SoundManager {
    private static instance: SoundManager;
    private scene!: Phaser.Scene;
    private music?: Phaser.Sound.BaseSound;

    private constructor() { }

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    init(scene: Phaser.Scene) {
        this.scene = scene;
    }

    playBGM(key: string) {
        if (!this.scene) return;

        // Stop previous music if playing
        if (this.music) {
            this.music.stop();
        }

        // Check if audio file exists in cache before playing
        if (this.scene.cache.audio.exists(key)) {
            this.music = this.scene.sound.add(key, { loop: true, volume: 0.5 });
            this.music.play();
        } else {
            console.warn(`Audio key '${key}' not found.`);
        }
    }

    playSound(key: string) {
        if (!this.scene) return;
        if (this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key);
        }
    }
}
