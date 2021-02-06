import { Mesh, Nullable, Scene, Sound, Vector2, Vector3 } from "babylonjs";

const SPATIAL_AUDIO_SOUND_NAME: string = "sa_track";
const QUAD_NUM_AUDIO_FILES: number = 4;

export class QuadAudio {
    private _loadedSounds: number = 0;
    private _sounds: Nullable<Array<Sound>> = null;
    private _boxes: Nullable<Array<Mesh>> = null;

    constructor(
        private readonly _audioFiles: Array<string>,
        private readonly _scene: Scene,
        private readonly _rangePos: Vector2,
        private readonly _rangeSize: Vector2) {

        try {
            this._soundReady = this._soundReady.bind(this);

            if (this._audioFiles.length != QUAD_NUM_AUDIO_FILES) {
                throw new Error("The wrong number of files was provided to QuadAudio");
            }

            this._sounds = new Array<Sound>(this._audioFiles.length);
            this._boxes = new Array<Mesh>(this._audioFiles.length);

            for (let i = 0; i < this._audioFiles.length; i++) {
                let audioFile = this._audioFiles[i];
                this._sounds[i] = new Sound(SPATIAL_AUDIO_SOUND_NAME + i, audioFile, this._scene, () => { this._soundReady(audioFile); }, { loop: true });
                
                this._boxes[i] = Mesh.CreateBox("Sound." + i, 0.03, this._scene);
                this._boxes[i].isVisible = false;
                this._sounds[i].attachToMesh(this._boxes[i]);
                this._sounds[i].setDirectionalCone(30, 60, 0);
                this._sounds[i].setLocalDirectionToMesh(new Vector3(0, 0, 1));
            }

            const center = new Vector3(this._rangePos.x + (this._rangeSize.x * 0.5), 0, this._rangePos.y + (this._rangeSize.y * 0.5));
            this._boxes[0].position = new Vector3(this._rangePos.x, 0, this._rangePos.y);
            this._boxes[0].lookAt(center);
            this._boxes[1].position = new Vector3(this._rangePos.x + this._rangeSize.x, 0, this._rangePos.y);
            this._boxes[1].lookAt(center);
            this._boxes[2].position = new Vector3(this._rangePos.x + this._rangeSize.x, 0, this._rangePos.y + this._rangeSize.y);
            this._boxes[2].lookAt(center);
            this._boxes[3].position = new Vector3(this._rangePos.x, 0, this._rangePos.y + this._rangeSize.y);
            this._boxes[3].lookAt(center);
            
        } catch (error) {
            console.log(error.stack);
        }
    }

    private _soundReady(audioFile: string): void {
        this._loadedSounds++;
        if (this._loadedSounds >= this._audioFiles.length) {
            console.log("sounds loaded:" + this._loadedSounds);
            this._play();
        }
    }

    private _play(): void {
        try {
            this._sounds?.forEach((sound) => {
                sound.play();
            });

        } catch (error) {
            console.log(error.stack);
        }
    }
}