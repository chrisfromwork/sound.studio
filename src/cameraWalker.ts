import { Camera, Vector3, Vector2 } from "babylonjs";
import { AdvancedDynamicTexture, Button, StackPanel } from "babylonjs-gui";

export class CameraWalker {
    private _walking: boolean = false;
    get walking(): boolean {
        return this._walking;
    }
    set walking(value: boolean) {
        this._walking = value;
    }

    constructor (private readonly _camera: Camera, private readonly _rangePos: Vector2, private readonly _rangeSize: Vector2, private readonly _speed: number) {
        this._camera.getScene().onBeforeRenderObservable.add(() => { this.updatePosition(); })
    }

    private updatePosition(): void {
        if (this._walking)
        {
            // const cameraRight = this._camera.getDirection(new Vector3(1, 0, 0));
            // const cameraUp = this._camera.getDirection(new Vector3(0, 1, 0));
            const cameraDirection = this._camera.getDirection(new Vector3(0, 0, 1));

            const newX = this._camera.position.x + this._speed * cameraDirection.x;
            if (newX > this._rangePos.x && newX < this._rangePos.x + this._rangeSize.x) {
                this._camera.position.x = newX;
            }

            const newZ = this._camera.position.z + this._speed * cameraDirection.z;
            if (newZ > this._rangePos.y && newZ < this._rangePos.y + this._rangeSize.y) {
                this._camera.position.z = newZ;
            }
        }
    }
}