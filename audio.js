try {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    var numTracks = 5;
    var trackName = "cc1.resources/20201013.cmbarth/track";
    var trackExt = ".mp3";
    var soundName = "Track";
    var tracks = new Array(numTracks);

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 5), scene);

        camera.attachControl(canvas, true);

        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

        return scene;
    };

    var preparedTracks = 0;
    function soundReady() {
        alert("Track prepared");
        preparedTracks++;
        if (preparedTracks === numTracks) {
            for (let i = 0; i < numTracks; i++) {
                tracks[i].play();
            }
        }
    }

    var setupAudio = function (scene) {
        for (let i = 0; i < numTracks; i++) {
            let currTrackName = soundName + i;
            let currTrackFile = trackName + i + trackExt;
            tracks[i] = new BABYLON.Sound(currTrackName, currTrackFile, scene, soundReady, {
                loop: true,
                autoplay: false
            });
            console.log("Created:" + currTrackName + ", " + currTrackFile);
        }
    }

    var setupXR = function () {
        // TODO
    }

    var scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });
    window.addEventListener("resize", function () {
        engine.resize();
    });

    setupAudio(scene);
} catch (error) {
    alert(error.stack);
}