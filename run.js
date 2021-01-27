
// BABYLON library populated through html (studio.js)
// STUDIO library populated through html (studio.js)

async function run() {
    try {
        var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);

        var numTracks = 5;
        var trackName = "resources/cc1/20201013.cmbarth/track";
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
                console.log("hide loading ui");
            };
            customLoadingScreen.prototype.hideLoadingUI = function () {
                console.log("hide loading ui");
                var videoElement = document.getElementById('loadingScreen');
                videoElement.hidden = true;
                videoElement.pause();
                videoElement.src = ""; // empty source
                videoElement.load();
            };
            var loadingScreen = new customLoadingScreen();
            engine.loadingScreen = loadingScreen;

            engine.displayLoadingUI();
            const scene = new BABYLON.Scene(engine);
            BABYLON.SceneLoader.Append("resources/copyrighted/20210126.cmbarth/", "gallery.glb", scene, function (newMeshes) {
                console.log("loaded scene");
                engine.hideLoadingUI();
            });

            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0.7), scene);
            camera.setTarget(new BABYLON.Vector3(0, 0, 1));
            camera.attachControl(canvas, true);
            camera.fov = 1.1;
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;
            const sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
            sphere.position.y = 1;

            const env = scene.createDefaultEnvironment({skyboxSize: false});

            try {
                const xr = await scene.createDefaultXRExperienceAsync({
                    floorMeshes: [env.ground]
                });
            } catch (error) {
                alert(error.stack);
            }

            scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

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

        const buttonArray = document.getElementsByClassName("babylonVRicon");
        if (buttonArray.length > 0) {
            const button = buttonArray[0];
            if (!!button) {
                const oldOnClick = button.onclick;
                button.onclick = () => {
                    oldOnClick();
                    console.log("Audio unlocked!");
                    setupAudio(data);
                };
            } else {
                setupAudio(data);
            }
        } else {
            setupAudio(data);
        }

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
