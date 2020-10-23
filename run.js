
// BABYLON library populated through html (studio.js)
// STUDIO library populated through html (studio.js)

async function run() {
    try {
        var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);

        var numTracks = 5;
        var trackName = "cc1.resources/20201013.cmbarth/track";
        var trackExt = ".mp3";
        var tracks = new Array(numTracks);
        for (let i = 0; i < numTracks; i++)
        {
            tracks[i] = trackName + i + trackExt;
        }

        async function createSceneData() {
            const scene = new BABYLON.Scene(engine);
            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;
            const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
            sphere.position.y = 1;

            const env = scene.createDefaultEnvironment();

            try {
                const xr = await scene.createDefaultXRExperienceAsync({
                    floorMeshes: [env.ground]
                });
            } catch (error) {
                alert(error.stack);
            }

            const data = new Object();
            data.scene = scene;
            data.sphere = sphere;
            return data;
        };

        var initialized = false;
        function setupAudio(data) {
            if (initialized) {
                return;
            }

            console.log("Setting up audio!");
            const spatialAudio = new STUDIO.SpatialAudio(tracks, data.scene);

            const material = new BABYLON.StandardMaterial("CenterSphereMaterial", data.scene);
            data.sphere.material = material;
            data.sphere.material.diffuseColor = BABYLON.Color3.Black();
            spatialAudio.onLoadingStateChangedObservable.add((percentage) => {
                console.log("Loading state changed, updating sphere material!");
                data.sphere.material.diffuseColor = new BABYLON.Color3(percentage, percentage, percentage);
             });

            spatialAudio.onLoadingCompletedObservable.addOnce(() => {
                console.log("Loading completed, playing audio!");
                spatialAudio.play();
            });

            initialized = true;
        }

        const data = await createSceneData();

        const button = document.getElementsByClassName("babylonVRicon")[0];
        const oldOnClick = button.onclick;
        button.onclick = () => {
            oldOnClick();
            console.log("Audio unlocked!");
            setupAudio(data);
        };

        engine.runRenderLoop(function () {
            data.scene.render();
        });
        window.addEventListener("resize", function () {
            engine.resize();
        });        

    } catch (error) {
        alert(error.stack);
    }
}

run();
