import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ThreeSystem {
    private static instance: ThreeSystem;

    public scene!: THREE.Scene;
    public camera!: THREE.PerspectiveCamera;
    public renderer!: THREE.WebGLRenderer;
    public controls!: OrbitControls;

    private isInitialized: boolean = false;

    private constructor() { }

    public static getInstance(): ThreeSystem {
        if (!ThreeSystem.instance) {
            ThreeSystem.instance = new ThreeSystem();
        }
        return ThreeSystem.instance;
    }

    public init(width: number, height: number) {
        if (this.isInitialized) return;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a); // Dark background, same as Phaser

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 50, 50); // High angle view
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.id = 'three-canvas';

        // Style to sit behind Phaser
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.zIndex = '-1'; // Behind Phaser

        const app = document.getElementById('app');
        if (app) {
            app.appendChild(this.renderer.domElement);
            // Ensure app handles relative positioning for absolute child
            app.style.position = 'relative';
            app.style.overflow = 'hidden'; // Clip excess
        } else {
            document.body.appendChild(this.renderer.domElement);
        }

        // Controls
        // Attach to document.body to capture events even if Phaser is on top (as long as Phaser allows propagation)
        // Or actually, we want the global window to handle rotation if the user drags "on the screen".
        this.controls = new OrbitControls(this.camera, document.body);
        // Important: OrbitControls usually attaches to the DOM element receiving events. 
        // Since Phaser is On Top, Phaser might block events.
        // We might need to set 'pointer-events: none' on Phaser canvas or manually pass events.
        // OR, we make Phaser transparent and let events pass through if Phaser doesn't catch them.
        // Actually, usually Phaser consumes input. 
        // A common trick is to attach controls to 'document' or 'window', but OrbitControls demands an HTMLElement.
        // Let's attach to document.body for now and see if it works, or maybe the existing 'app' div.
        // BUT, if Phaser canvas is on top, it blocks mouse events.
        // We will deal with this by setting `pointer-events: none` on Phaser canvas and making Phaser interactive objects enable pointer events? 
        // No, that breaks Phaser UI.
        // Better approach: Let Phaser canvas be z-index 1. Three canvas z-index 0.
        // If we want to control Three, we interact with the screen. 
        // If Phaser doesn't stop propagation, maybe it forces it through?
        // Actually, most robust way: 
        // Use a shared container div. 
        // Let's try attaching controls to the renderer.domElement, and we might need to swap z-indices or use a dedicated input layer.
        // For 'World Map', we want full 3D control. 
        // If clicking a UI element in Phaser, it should stop propagation.
        // If clicking "empty space", it works for Orbit.
        // Issue: Phaser canvas covers everything.
        // Hack: Listen to input on window and pass to Three?
        // Simpler: ThreeJS Canvas on TOP with pointer-events: none? No, then we can't drag.
        // ThreeJS Canvas on TOP, but transparent? Then Phaser is visible but non-interactive.

        // Solution: ThreeJS is Background. We need to verify if Phaser blocks events.
        // Usually Yes.
        // Let's rely on the user to click 'through' Phaser? No.

        // Let's set Phaser Game Canvas CSS capability "pointer-events: none" for the WorldMap scene? 
        // But we need to click the UI.

        // OK, for now, let's just initialize. We might need to tweak CSS later.
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

        // Lighting (Basic)
        this.addDefaultLights();

        this.isInitialized = true;
    }

    public resize(width: number, height: number) {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    public resetScene() {
        if (!this.scene) return;
        this.scene.clear();
        this.addDefaultLights();
    }

    private addDefaultLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        this.scene.add(dirLight);
    }

    public render() {
        if (!this.isInitialized) return;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public dispose() {
        if (this.renderer) {
            document.body.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        this.isInitialized = false;
    }
}
