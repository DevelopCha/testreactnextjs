import * as THREE from 'three';

export class SkySystem {
    private scene: THREE.Scene;
    private skyMesh!: THREE.Mesh;
    private sunMesh!: THREE.Mesh;
    private moonMesh!: THREE.Mesh;
    private starPoints!: THREE.Points;
    private sunLight!: THREE.DirectionalLight;
    private moonLight!: THREE.DirectionalLight;
    private ambientLight!: THREE.AmbientLight;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.init();
    }

    private init() {
        // 1. Sky Sphere (Gradient)
        // We use a large sphere with back-side culling (inside view)
        const skyGeo = new THREE.SphereGeometry(2000, 32, 32);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize( vWorldPosition + offset ).y;
                    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
                }`,
            side: THREE.BackSide
        });
        this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.skyMesh);

        // 2. Sun
        // Bright yellow sphere
        const sunGeo = new THREE.SphereGeometry(20, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(this.sunMesh);

        // 3. Moon
        // Pale blue/white sphere
        const moonGeo = new THREE.SphereGeometry(15, 16, 16);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xddddff });
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        this.scene.add(this.moonMesh);

        // 4. Stars
        // Particle system
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const r = 1900; // Just inside sky sphere
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            sizes[i] = Math.random() * 2; // Varying size
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1)); // We can use this in shader if we want

        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, transparent: true, opacity: 0 }); // Star opacity handled dynamically
        this.starPoints = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starPoints);

        // 5. Lights
        // We manage our own lights instead of default ones
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        this.moonLight = new THREE.DirectionalLight(0x4444aa, 0.3);
        this.scene.add(this.moonLight);
    }

    public updateTime(timeOfDay: number) {
        // timeOfDay: 0=Morning, 1=Afternoon, 2=Evening, 3=Night

        const uniforms = (this.skyMesh.material as THREE.ShaderMaterial).uniforms;

        let sunPos = new THREE.Vector3();
        let moonPos = new THREE.Vector3();
        let topColor = new THREE.Color();
        let bottomColor = new THREE.Color();
        let sunIntensity = 0;
        let moonIntensity = 0;
        let ambientIntensity = 0;
        let ambientColor = new THREE.Color(0xffffff);
        let starOpacity = 0;

        const dist = 1500;

        switch (timeOfDay) {
            case 0: // Morning: Sun rising (East -> X+)
                sunPos.set(dist, 100, 0); // Low East
                moonPos.set(-dist, -100, 0);
                topColor.setHex(0x6699ff); // Light Blue
                bottomColor.setHex(0xffaa55); // Orange Horizon
                sunIntensity = 0.8;
                moonIntensity = 0;
                ambientIntensity = 0.6;
                starOpacity = 0;
                break;
            case 1: // Afternoon: Sun overhead
                sunPos.set(0, dist, 0); // High Noon
                moonPos.set(0, -dist, 0);
                topColor.setHex(0x0077ff); // Deep Blue
                bottomColor.setHex(0xffffff); // White/Haze
                sunIntensity = 1.2;
                moonIntensity = 0;
                ambientIntensity = 0.8;
                starOpacity = 0;
                break;
            case 2: // Evening: Sun setting (West -> X-)
                sunPos.set(-dist, 100, 0); // Low West
                moonPos.set(dist, -100, 0); // Moon rising?
                topColor.setHex(0x333366); // Darkening Blue
                bottomColor.setHex(0xff5533); // Red Horizon
                sunIntensity = 0.6;
                moonIntensity = 0.1; // Moon starts to show?
                ambientIntensity = 0.5;
                ambientColor.setHex(0xffccaa); // Warm tint
                starOpacity = 0.2; // Stars start to peek
                break;
            case 3: // Night: Moon overhead
                sunPos.set(0, -dist, 0); // Sun hidden
                moonPos.set(100, dist, 50); // Moon High (slightly offset)
                topColor.setHex(0x000022); // Black/Deep Blue
                bottomColor.setHex(0x001133); // Dark Horizon
                sunIntensity = 0;
                moonIntensity = 0.6; // Cold light
                ambientIntensity = 0.3;
                ambientColor.setHex(0xaaaaee); // Cool tint
                starOpacity = 1.0;
                break;
        }

        // Apply changes
        this.sunMesh.position.copy(sunPos);
        this.moonMesh.position.copy(moonPos);

        this.sunLight.position.copy(sunPos);
        this.sunLight.intensity = sunIntensity;

        this.moonLight.position.copy(moonPos);
        this.moonLight.intensity = moonIntensity;

        this.ambientLight.intensity = ambientIntensity;
        this.ambientLight.color.copy(ambientColor);

        uniforms.topColor.value.copy(topColor);
        uniforms.bottomColor.value.copy(bottomColor);

        (this.starPoints.material as THREE.PointsMaterial).opacity = starOpacity;
    }
}
