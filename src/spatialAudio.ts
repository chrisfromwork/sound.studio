import { Observable, Scene, Sound, Mesh, Vector3, Scalar } from "babylonjs"

const SPATIAL_AUDIO_SOUND_NAME = "sa_track";
const SPATIAL_SOUND_REGION_DIMENSIONS = 5; // meters
const SPATIAL_SOUND_MAX_SPEED = 0.03;

class SpatialSound {
    isReadyToPlay: boolean = false;
    onPlaybackEndedObservable: Observable<SpatialSound> = new Observable<SpatialSound>();
    private _sphere?: Mesh;
    private _direction?: Vector3;

    constructor(private readonly _sound: Sound, private readonly _scene: Scene) {
        try {
            this._playbackEnded = this._playbackEnded.bind(this);
            this._sphere = Mesh.CreateSphere("SpatialSound", 16, 0.5, this._scene);
            this._direction = new Vector3(
                Scalar.RandomRange(-1 * SPATIAL_SOUND_MAX_SPEED, SPATIAL_SOUND_MAX_SPEED),
                Scalar.RandomRange(-1 * SPATIAL_SOUND_MAX_SPEED, SPATIAL_SOUND_MAX_SPEED),
                Scalar.RandomRange(-1 * SPATIAL_SOUND_MAX_SPEED, SPATIAL_SOUND_MAX_SPEED));
    
            this._sound.setDirectionalCone(90, 180, 0);
            this._sound.setLocalDirectionToMesh(new Vector3(1, 0, 0));
            this._sound.attachToMesh(this._sphere);
            this._sound.onEndedObservable.add(this._playbackEnded);
        } catch (error) {
            console.log(error.stack);
        }
    }

    public play(): void {
        try {
            this._sound.play();
        } catch (error) {
            console.log(error.stack);
        }
    }

    public dispose(): void {
        try {
            this._sound.dispose();
            this._sphere?.dispose();
        } catch (error) {
            console.log(error.stack);
        }
    }

    public updatePosition(): void {
        try {
            // TODO: more interesting movement
            // TODO: visualize sound cones
            if (!!this._direction) {
                const position = this._sphere?.position.addInPlace(this._direction) ?? Vector3.Zero();
                if (Math.abs(position.x) > SPATIAL_SOUND_REGION_DIMENSIONS) {
                    this._direction.x = position.x > 0 ? -1 * Math.abs(this._direction.x) : Math.abs(this._direction.x);
                }

                if (Math.abs(position.y) > SPATIAL_SOUND_REGION_DIMENSIONS) {
                    this._direction.y = position.y > 0 ? -1 * Math.abs(this._direction.y) : Math.abs(this._direction.y);
                }

                if (Math.abs(position.z) > SPATIAL_SOUND_REGION_DIMENSIONS) {
                    this._direction.z = position.z > 0 ? -1 * Math.abs(this._direction.z) : Math.abs(this._direction.z);
                }
            }
        } catch (error) {
            console.log(error.stack);
        }
    }

    private _playbackEnded(sound: Sound): void {
        try {
            this.onPlaybackEndedObservable.notifyObservers(this);
        } catch (error) {
            console.log(error.stack);
        }
    }
}

export class SpatialAudio {
    isPlaying: boolean = false;
    isReadyToPlay: boolean = false;
    onLoadingStateChangedObservable: Observable<number> = new Observable<number>();
    onLoadingCompletedObservable: Observable<SpatialAudio> = new Observable<SpatialAudio>();

    private _spatialSounds: Map<string, SpatialSound> = new Map<string, SpatialSound>();
    private _loadedSounds: number = 0;

    constructor(private readonly _audioFiles: Array<string>, private readonly _scene: Scene) {
        try {
            this._soundReady = this._soundReady.bind(this);

            for (let i = 0; i < this._audioFiles.length; i++) {
                let audioFile = this._audioFiles[i];
                let sound = new Sound(SPATIAL_AUDIO_SOUND_NAME + i, audioFile, this._scene, () => { this._soundReady(audioFile); }, { loop: true });
                this._spatialSounds.set(audioFile, new SpatialSound(sound, this._scene));
            }
    
            this._scene.getEngine().onBeginFrameObservable.add(() => {
                this._spatialSounds.forEach((spatialSound) => {
                    spatialSound.updatePosition();
                });
            });
        } catch (error) {
            console.log(error.stack);
        }
    }

    public play(): void {
        try {
            if (this.isPlaying) {
                return;
            }

            if (!this.isReadyToPlay) {
                new Error("Attempted to play SpatialAudio before it completed loading");
                return;
            }

            this._spatialSounds.forEach((spatialSound) => {
                spatialSound.play();
            });

            this.isPlaying = true;
        } catch (error) {
            console.log(error.stack);
        }
    }

    public dispose(): void {
        try {
            this._spatialSounds.forEach((spatialSound) => {
                spatialSound.dispose();
            });
        } catch (error) {
            console.log(error.stack);
        }
    }

    private _soundReady(audioFile: string): void {
        try {
            const spatialSound = this._spatialSounds.get(audioFile);
            if (!!spatialSound) {
                spatialSound.isReadyToPlay = true;
                this._loadedSounds++;
                const loadedPercentage = this._loadedSounds / this._spatialSounds.size;
                this.onLoadingStateChangedObservable.notifyObservers(loadedPercentage);
            }

            let allSoundsLoaded: boolean = true;
            this._spatialSounds.forEach((spatialSound) => {
                if (!spatialSound.isReadyToPlay) {
                    allSoundsLoaded = false;
                }
            });

            if (allSoundsLoaded) {
                this.isReadyToPlay = true;
                this.onLoadingCompletedObservable.notifyObservers(this);
            }
        } catch (error) {
            console.log(error.stack);
        }
    }
}