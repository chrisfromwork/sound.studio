import { Observable, Scene, Sound, StandardMaterial, Color3, Mesh, Vector3, Scalar } from "babylonjs"

const SPATIAL_AUDIO_SOUND_NAME = "sa_track";
const SPATIAL_AUDIO_MATERIAL_NAME = "sa_mat";
const SPATIAL_SOUND_REGION_DIMENSIONS = 5; // meters
const SPATIAL_SOUND_MAX_SPEED = 0.03;

class SpatialSound{
    readyToPlay: boolean = false;
    private _sphere: Mesh;
    private _direction: Vector3;

    constructor(private readonly _sound: Sound, private readonly _scene: Scene) {
        this._sphere = Mesh.CreateSphere("SpatialSound", 16, 0.5, this._scene);
        this._direction = new Vector3(
            Scalar.RandomRange(-1 * SPATIAL_SOUND_MAX_SPEED, SPATIAL_SOUND_MAX_SPEED),
            Scalar.RandomRange(-1 * SPATIAL_SOUND_MAX_SPEED, SPATIAL_SOUND_MAX_SPEED),
            Scalar.RandomRange(-1 * SPATIAL_SOUND_MAX_SPEED, SPATIAL_SOUND_MAX_SPEED));

        this._sound.setDirectionalCone(90, 180, 0);
        this._sound.setLocalDirectionToMesh(new Vector3(1, 0, 0));
        this._sound.attachToMesh(this._sphere);
    }

    public play(): void {
        if (!this.readyToPlay) {
            new Error("Attempted to start SpatialSound before it completed loading");
        }

        this._sound.play();
    }

    public dispose(): void {
        this._sound.dispose();
        this._sphere.dispose();
    }

    public updatePosition(): void {
        // TODO: more interesting movement
        // TODO: visualize sound cones
        const position = this._sphere.position.addInPlace(this._direction);
        if (Math.abs(position.x) > SPATIAL_SOUND_REGION_DIMENSIONS)
        {
            this._direction.x = position.x > 0 ? -1 * Math.abs(this._direction.x) : Math.abs(this._direction.x); 
        }

        if (Math.abs(position.y) > SPATIAL_SOUND_REGION_DIMENSIONS)
        {
            this._direction.y = position.y > 0 ? -1 * Math.abs(this._direction.y) : Math.abs(this._direction.y); 
        }

        if (Math.abs(position.z) > SPATIAL_SOUND_REGION_DIMENSIONS)
        {
            this._direction.z = position.z > 0 ? -1 * Math.abs(this._direction.z) : Math.abs(this._direction.z);
        }
    }
}

export class SpatialAudio
{
    playing: boolean = false;
    readyToStart: boolean = false;
    loadingMaterial: StandardMaterial;
    loaded: Observable<void> = new Observable<void>();

    private _spatialSounds: Map<string, SpatialSound> = new Map<string, SpatialSound>();
    private _readyToPlayCallback: (audioFile: string) => void;
    private _loadedSounds: number = 0;

    constructor(private readonly _audioFiles: Array<string>, private readonly _scene: Scene) {
        this.loadingMaterial = new StandardMaterial(SPATIAL_AUDIO_MATERIAL_NAME, this._scene);
        this.loadingMaterial.diffuseColor = new Color3(0, 0, 0);

        this._readyToPlayCallback = this.soundReady.bind(this);
        for (let i = 0; i < this._audioFiles.length; i++) {
            let audioFile = this._audioFiles[i];
            let sound = new Sound(SPATIAL_AUDIO_SOUND_NAME + i, audioFile, this._scene, () => {this._readyToPlayCallback(audioFile)}, { loop: true });
            this._spatialSounds.set(audioFile, new SpatialSound(sound, this._scene));
        }

        this._scene.getEngine().onBeginFrameObservable.add(() => {
            this._spatialSounds.forEach((spatialSound) => {
                spatialSound.updatePosition();
            });
        });
    }

    public play(): void {
        if (this.playing) {
            return;
        }
        
        if (!this.readyToStart) {
            new Error("Attempted to play SpatialAudio before it completed loading");
            return;
        }

        this._spatialSounds.forEach((spatialSound) => {
            spatialSound.play();
        });   

        this.playing = true;
    }

    public dispose(): void {
        this._spatialSounds.forEach((spatialSound) => {
            spatialSound.dispose();
        });
    }

    private soundReady(audioFile: string): void {
        const spatialSound = this._spatialSounds.get(audioFile);
        if (!!spatialSound) {
            spatialSound.readyToPlay = true;
            this._loadedSounds++;
            const loadingColor = this._loadedSounds / this._spatialSounds.size;
            this.loadingMaterial.diffuseColor = new Color3(loadingColor, loadingColor, loadingColor);
        }

        let allSoundsLoaded: boolean = true;
        this._spatialSounds.forEach((spatialSound) => {
            if (!spatialSound.readyToPlay) {
                allSoundsLoaded = false;
            }
        });

        if (allSoundsLoaded)
        {
            this.readyToStart = true;
            this.loaded.notifyObservers();
        }
    }
}