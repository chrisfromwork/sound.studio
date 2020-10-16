
// STUDIO library populated through html

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

        function setupAudio(data) {
            const spatialAudio = new STUDIO.SpatialAudio(tracks, data.scene);
            spatialAudio.loaded.addOnce(() => { spatialAudio.play(); });
            data.sphere.material = spatialAudio.loadingMaterial;
        }

        const data = await createSceneData();
        setupAudio(data);

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
