
async function run() {
    try {
        var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);

        var numTracks = 5;
        var trackName = "cc1.resources/20201013.cmbarth/track";
        var trackExt = ".mp3";
        var soundName = "Track";
        var tracks = new Array(numTracks);

        async function createScene() {
            const scene = new BABYLON.Scene(engine);
            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;
            const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
            sphere.position.y = 1;

            const playbackMaterial = new BABYLON.StandardMaterial("PlaybackMat", scene);
            playbackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            sphere.material = playbackMaterial;

            const env = scene.createDefaultEnvironment();

            try {
                const xr = await scene.createDefaultXRExperienceAsync({
                    floorMeshes: [env.ground]
                });
            } catch (error) {
                console.log(error.stack);
            }

            return scene;
        };

        var preparedTracks = 0;
        function soundReady() {
            preparedTracks++;
            playbackMaterial.diffuseColor = new BABYLON.Color3(preparedTracks / numTracks, preparedTracks / numTracks, preparedTracks / numTracks);
            if (preparedTracks === numTracks) {
                for (let i = 0; i < numTracks; i++) {
                    console.log("playing track:" + i);
                    tracks[i].play();
                }
            }
        }

        function setupAudio(scene) {
            try {
                for (let i = 0; i < numTracks; i++) {
                    let currTrackName = soundName + i;
                    let currTrackFile = trackName + i + trackExt;
                    tracks[i] = new BABYLON.Sound(currTrackName, currTrackFile, scene, soundReady, { loop: true });
                    console.log("Created:" + currTrackName + ", " + currTrackFile);
                }
            } catch (error) {
                console.log(error.stack);
            }
        }

        const scene = await createScene();
        setupAudio(scene);

        engine.runRenderLoop(function () {
            scene.render();
        });
        window.addEventListener("resize", function () {
            engine.resize();
        });

    } catch (error) {
        alert(error.stack);
    }
}

run();
