import { Observable, Scene, Sound, StandardMaterial, Color3 } from "babylonjs"

const SPATIAL_AUDIO_SOUND_NAME = "sa_track";
const SPATIAL_AUDIO_MATERIAL_NAME = "sa_mat";

class SpatialSound{
    readyToPlay: boolean = false;
    constructor(private readonly _sound: Sound) {}
    public play(): void {
        if (!this.readyToPlay) {
            new Error("Attempted to start SpatialSound before it completed loading");
        }

        this._sound.play();
    }

    public dispose(): void {
        this._sound.dispose();
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
            this._spatialSounds.set(audioFile, new SpatialSound(sound));
        }
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