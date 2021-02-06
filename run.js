
// BABYLON library populated through html (studio.js)
// STUDIO library populated through html (studio.js)

async function run() {
    try {
        var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);

        var numTracks = 4;
        var trackName = "resources/cc1/20210130.cmbarth/quad."

        var trackExt = ".mp3";
        var tracks = new Array(numTracks);
        for (let i = 0; i < numTracks; i++)
        {
            tracks[i] = trackName + i + trackExt;
        }

        async function createSceneData() {
            function customLoadingScreen() {
            }
            customLoadingScreen.prototype.displayLoadingUI = function () {
            };
            customLoadingScreen.prototype.hideLoadingUI = function () {
                document.getElementById("loadingScreen").style.display = "none";
            };
            var loadingScreen = new customLoadingScreen();
            engine.loadingScreen = loadingScreen;

            engine.displayLoadingUI();
            const scene = new BABYLON.Scene(engine);
            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
            const rangePos = new BABYLON.Vector2(-3.5, 0);
            const rangeSize = new BABYLON.Vector2(6.0, 7.0);
            const walker = new STUDIO.CameraWalker(camera, rangePos, rangeSize, 0.05);
            BABYLON.SceneLoader.Append("resources/copyrighted/20210126.cmbarth/", "gallery.glb", scene, function (newMeshes) {
                engine.hideLoadingUI();
                walker.walking = true;
            });

            camera.setTarget(new BABYLON.Vector3(0, 0, 1));
            camera.attachControl(canvas, true);
            camera.fov = 1.1;
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;

            scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
            const data = new Object();
            data.scene = scene;
            data.rangePos = rangePos;
            data.rangeSize = rangeSize;
            return data;
        };

        var initialized = false;
        function setupAudio(data) {
            if (initialized) {
                return;
            }

            const quadAudio = new STUDIO.QuadAudio(tracks, data.scene, data.rangePos, data.rangeSize);
            initialized = true;
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
