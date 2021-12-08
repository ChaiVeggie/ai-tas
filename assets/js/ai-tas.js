const speakers = new Map([
    ['Grace', undefined],
    //['Alien', undefined],
]);

const name = 'Grace';

main();

async function main() {
    // Initialize AWS and create Polly service objects
    window.AWS.config.region = 'us-east-1';
    window.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:f1363b23-f7bc-4eb6-a055-8193d205c9e7',
    });

    const polly = new AWS.Polly();
    const presigner = new AWS.Polly.Presigner();
    const speechInit = HOST.aws.TextToSpeechFeature.initializeService(
        polly,
        presigner,
        window.AWS.VERSION
    );

    //Environment file
    const environmentFile = './assets/glTF/characters/adult_female/grace/grace.gltf';

    // Define the glTF assets that will represent the hosts
    const characterFile1 =
        './assets/glTF/characters/adult_female/grace/grace.gltf';
    const animationPath1 = './assets/glTF/animations/adult_female';
    const animationFiles = [
        'stand_idle.glb',
        'lipsync.glb',
        'gesture.glb',
        'emote.glb',
        'face_idle.glb',
        'blink.glb',
        'poi.glb',
    ];
    const gestureConfigFile = 'gesture.json';
    const poiConfigFile = 'poi.json';
    const audioAttachJoint1 = 'char:def_c_neckB'; // Name of the joint to attach audio to
    const audioAttachJoint2 = 'char:head';
    const lookJoint1 = 'char:jx_c_look'; // Name of the joint to use for point of interest target tracking
    const lookJoint2 = 'char:gaze';
    const voice1 = 'Joanna'; // Polly voice. Full list of available voices at: https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
    const voice2 = 'Ivy';
    const voiceEngine = 'neural'; // Neural engine is not available for all voices in all regions: https://docs.aws.amazon.com/polly/latest/dg/NTTS-main.html

    // Set up the scene and hosts
    const { scene, camera } = createScene();
    const {
        character: character1,
        clips: clips1,
        bindPoseOffset: bindPoseOffset1,
    } = await loadCharacter(
        scene,
        characterFile1,
        animationPath1,
        animationFiles,
        environmentFile
    );

    character1.position.x = 1.25;
    character1.rotation.y = -0.2;

    // Find the joints defined by name
    const children1 = character1.getDescendants(false);
    const audioAttach1 = children1.find(
        child => child.name === audioAttachJoint1
    );
    const lookTracker1 = children1.find(child => child.name === lookJoint1);

    // Read the gesture config file. This file contains options for splitting up
    // each animation in gestures.glb into 3 sub-animations and initializing them
    // as a QueueState animation.
    const gestureConfig1 = await fetch(
        `${animationPath1}/${gestureConfigFile}`
    ).then(response => response.json());

    // Read the point of interest config file. This file contains options for
    // creating Blend2dStates from look pose clips and initializing look layers
    // on the PointOfInterestFeature.
    const poiConfig1 = await fetch(
        `${animationPath1}/${poiConfigFile}`
    ).then(response => response.json());

    const [
        idleClips1,
        lipsyncClips1,
        gestureClips1,
        emoteClips1,
        faceClips1,
        blinkClips1,
        poiClips1,
    ] = clips1;
    const host1 = createHost(
        character1,
        audioAttach1,
        voice1,
        voiceEngine,
        idleClips1[0],
        faceClips1[0],
        lipsyncClips1,
        gestureClips1,
        gestureConfig1,
        emoteClips1,
        blinkClips1,
        poiClips1,
        poiConfig1,
        lookTracker1,
        bindPoseOffset1,
        scene,
        camera
    );

    // Turn down blink layer weight to account for the difference in eyelid height between Grace and Fiona
    host1.AnimationFeature.setLayerWeight('Blink', 0.5);

    // Set up each host to look at the other when the other speaks and at the
    // camera when speech ends
    const onHost1StartSpeech = () => {
        //host2.PointOfInterestFeature.setTarget(lookTracker1);
    };

    const onStopSpeech = () => {
        host1.PointOfInterestFeature.setTarget(camera);
    };

    host1.listenTo(
        host1.TextToSpeechFeature.EVENTS.play,
        onHost1StartSpeech
    );
    host1.listenTo(
        host1.TextToSpeechFeature.EVENTS.resume,
        onHost1StartSpeech
    );

    HOST.aws.TextToSpeechFeature.listenTo(
        HOST.aws.TextToSpeechFeature.EVENTS.pause,
        onStopSpeech
    );
    HOST.aws.TextToSpeechFeature.listenTo(
        HOST.aws.TextToSpeechFeature.EVENTS.stop,
        onStopSpeech
    );

    // Hide the load screen and show the text input
    document.getElementById('textToSpeech').style.display = 'inline-block';
    document.getElementById('loadScreen').style.display = 'none';

    // Wait for the TextToSpeechFeature to be ready
    await speechInit;

    speakers.set('Grace', host1);

    initializeUX();
}

// Set up base scene
function createScene() {
    // Canvas
    const canvas = document.getElementById('renderCanvas');
    canvas.style.width = `${window.innerWidth * 0.8}px`;
    canvas.style.height = `${window.innerHeight * 0.8}px`;

    // Scene
    const engine = new BABYLON.Engine(canvas, true, undefined, true);
    const scene = new BABYLON.Scene(engine);
    scene.useRightHandedSystem = true;
    scene.fogColor.set(0.5, 0.5, 0.5);
    const assetManager = new BABYLON.AssetsManager(scene);

    // Use our own button to enable audio
    BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;

    // Handle window resize
    window.addEventListener('resize', function () {
        canvas.style.width = `${window.innerWidth * 0.8}px`;
        canvas.style.height = `${window.innerHeight * 0.8}px`;
        engine.resize();
    });
    engine.runRenderLoop(scene.render.bind(scene));

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        'Camera',
        Math.PI / 2,
        Math.PI / 2,
        1.4,
        new BABYLON.Vector3(0, 1.4, 0),
        scene
    );
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.setPosition(new BABYLON.Vector3(1.4, 1.4, 2.5)); //0, 1.4, 3.1
    camera.setTarget(new BABYLON.Vector3(1.2, 1, 0)); //0, 0.8, 0
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(canvas, true);

    // Lights
    var hemiLight = new BABYLON.HemisphericLight(
        'light1',
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemiLight.intensity = 0.6;
    hemiLight.specular = BABYLON.Color3.Black();

    var dirLight = new BABYLON.DirectionalLight(
        'dir01',
        new BABYLON.Vector3(0, -0.5, -1.0),
        scene
    );
    dirLight.position = new BABYLON.Vector3(0, 5, 5);

    // Shadows
    shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Environment
    // var helper = scene.createDefaultEnvironment({
    //     enableGroundShadow: true,
    // });
    // helper.groundMaterial.primaryColor.set(0.5, 0.5, 0.5);
    // helper.ground.receiveShadows = true;

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("Assets/textures/skybox2", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    return { scene, camera };
}

// Load character model and animations
async function loadCharacter(
    scene,
    characterFile,
    animationPath,
    animationFiles
) {
    // Load character model
    const {
        character,
        bindPoseOffset,
    } = await BABYLON.SceneLoader.LoadAssetContainerAsync(
        characterFile
    ).then(container => {
        const [character] = container.meshes;
        const [bindPoseOffset] = container.animationGroups;

        // Make the offset pose additive
        if (bindPoseOffset) {
            BABYLON.AnimationGroup.MakeAnimationAdditive(bindPoseOffset);
        }

        // Add everything to the scene
        container.scene = scene;
        container.addAllToScene();

        // Cast shadows but don't receive
        shadowGenerator.addShadowCaster(character, true);
        for (var index = 0; index < container.meshes.length; index++) {
            container.meshes[index].receiveShadows = false;
        }

        return { character, bindPoseOffset };
    });

    const children = character.getDescendants(false);

    // Load animations
    const clips = await Promise.all(
        animationFiles.map((filename, index) => {
            const filePath = `${animationPath}/${filename}`;

            return BABYLON.SceneLoader.LoadAssetContainerAsync(filePath).then(
                container => {
                    const startingIndex = scene.animatables.length;
                    const firstIndex = scene.animationGroups.length;

                    // Apply animation to character
                    container.mergeAnimationsTo(
                        scene,
                        scene.animatables.slice(startingIndex),
                        target => children.find(c => c.name === target.name) || null
                    );

                    // Find the new animations and destroy the container
                    const animations = scene.animationGroups.slice(firstIndex);
                    container.dispose();
                    scene.onAnimationFileImportedObservable.notifyObservers(scene);

                    return animations;
                }
            );
        })
    );

    return { character, clips, bindPoseOffset };
}

// Initialize the host
function createHost(
    character,
    audioAttachJoint,
    voice,
    engine,
    idleClip,
    faceIdleClip,
    lipsyncClips,
    gestureClips,
    gestureConfig,
    emoteClips,
    blinkClips,
    poiClips,
    poiConfig,
    lookJoint,
    bindPoseOffset,
    scene,
    camera
) {
    // Add the host to the render loop
    const host = new HOST.HostObject({ owner: character });
    scene.onBeforeAnimationsObservable.add(() => {
        host.update();
    });

    // Set up text to speech
    host.addFeature(HOST.aws.TextToSpeechFeature, false, {
        scene,
        attachTo: audioAttachJoint,
        voice,
        engine,
    });

    // Set up animation
    host.addFeature(HOST.anim.AnimationFeature);

    // Base idle
    host.AnimationFeature.addLayer('Base');
    host.AnimationFeature.addAnimation(
        'Base',
        idleClip.name,
        HOST.anim.AnimationTypes.single,
        { clip: idleClip }
    );
    host.AnimationFeature.playAnimation('Base', idleClip.name);

    // Face idle
    host.AnimationFeature.addLayer('Face', {
        blendMode: HOST.anim.LayerBlendModes.Additive,
    });
    BABYLON.AnimationGroup.MakeAnimationAdditive(faceIdleClip);
    host.AnimationFeature.addAnimation(
        'Face',
        faceIdleClip.name,
        HOST.anim.AnimationTypes.single,
        { clip: faceIdleClip, from: 1 / 30, to: faceIdleClip.to }
    );
    host.AnimationFeature.playAnimation('Face', faceIdleClip.name);

    // Blink
    host.AnimationFeature.addLayer('Blink', {
        blendMode: HOST.anim.LayerBlendModes.Additive,
        transitionTime: 0.075,
    });
    blinkClips.forEach(clip => {
        BABYLON.AnimationGroup.MakeAnimationAdditive(clip);
    });
    host.AnimationFeature.addAnimation(
        'Blink',
        'blink',
        HOST.anim.AnimationTypes.randomAnimation,
        {
            playInterval: 3,
            subStateOptions: blinkClips.map(clip => {
                return {
                    name: clip.name,
                    loopCount: 1,
                    clip,
                };
            }),
        }
    );
    host.AnimationFeature.playAnimation('Blink', 'blink');

    // Talking idle
    host.AnimationFeature.addLayer('Talk', {
        transitionTime: 0.75,
        blendMode: HOST.anim.LayerBlendModes.Additive,
    });
    host.AnimationFeature.setLayerWeight('Talk', 0);
    const talkClip = lipsyncClips.find(c => c.name === 'stand_talk');
    BABYLON.AnimationGroup.MakeAnimationAdditive(talkClip);
    lipsyncClips.splice(lipsyncClips.indexOf(talkClip), 1);
    host.AnimationFeature.addAnimation(
        'Talk',
        talkClip.name,
        HOST.anim.AnimationTypes.single,
        { clip: talkClip }
    );
    host.AnimationFeature.playAnimation('Talk', talkClip.name);

    // Gesture animations
    host.AnimationFeature.addLayer('Gesture', {
        transitionTime: 0.5,
        blendMode: HOST.anim.LayerBlendModes.Additive,
    });

    gestureClips.forEach(clip => {
        const { name } = clip;
        const config = gestureConfig[name];
        BABYLON.AnimationGroup.MakeAnimationAdditive(clip);

        if (config !== undefined) {
            // Add the clip to each queueOption so it can be split up
            config.queueOptions.forEach((option, index) => {
                option.clip = clip;
                option.to /= 30.0;
                option.from /= 30.0;
            });
            host.AnimationFeature.addAnimation(
                'Gesture',
                name,
                HOST.anim.AnimationTypes.queue,
                config
            );
        } else {
            host.AnimationFeature.addAnimation(
                'Gesture',
                name,
                HOST.anim.AnimationTypes.single,
                { clip }
            );
        }
    });

    // Emote animations
    host.AnimationFeature.addLayer('Emote', {
        transitionTime: 0.5,
    });

    emoteClips.forEach(clip => {
        const { name } = clip;
        host.AnimationFeature.addAnimation(
            'Emote',
            name,
            HOST.anim.AnimationTypes.single,
            { clip, loopCount: 1 }
        );
    });

    // Viseme poses
    host.AnimationFeature.addLayer('Viseme', {
        transitionTime: 0.12,
        blendMode: HOST.anim.LayerBlendModes.Additive,
    });
    host.AnimationFeature.setLayerWeight('Viseme', 0);
    const blendStateOptions = lipsyncClips.map(clip => {
        BABYLON.AnimationGroup.MakeAnimationAdditive(clip);
        return {
            name: clip.name,
            clip,
            weight: 0,
            from: 1 / 30,
            to: 2 / 30,
        };
    });
    host.AnimationFeature.addAnimation(
        'Viseme',
        'visemes',
        HOST.anim.AnimationTypes.freeBlend,
        { blendStateOptions }
    );
    host.AnimationFeature.playAnimation('Viseme', 'visemes');

    // POI poses
    const children = character.getDescendants(false);
    poiConfig.forEach(config => {
        host.AnimationFeature.addLayer(config.name, {
            blendMode: HOST.anim.LayerBlendModes.Additive,
        });

        // Find each pose clip and make it additive
        config.blendStateOptions.forEach(clipConfig => {
            clip = poiClips.find(clip => clip.name === clipConfig.clip);
            BABYLON.AnimationGroup.MakeAnimationAdditive(clip);
            clipConfig.clip = clip;
            clipConfig.from = 1 / 30;
            clipConfig.to = 2 / 30;
        });

        host.AnimationFeature.addAnimation(
            config.name,
            config.animation,
            HOST.anim.AnimationTypes.blend2d,
            { ...config }
        );

        host.AnimationFeature.playAnimation(config.name, config.animation);

        // Find and store the reference object
        config.reference = children.find(
            child => child.name === config.reference
        );
    });

    // Apply bindPoseOffset clip if it exists
    if (bindPoseOffset !== undefined) {
        host.AnimationFeature.addLayer('BindPoseOffset', {
            blendMode: HOST.anim.LayerBlendModes.Additive,
        });
        host.AnimationFeature.addAnimation(
            'BindPoseOffset',
            bindPoseOffset.name,
            HOST.anim.AnimationTypes.single,
            { clip: bindPoseOffset, from: 1 / 30, to: 2 / 30 }
        );
        host.AnimationFeature.playAnimation(
            'BindPoseOffset',
            bindPoseOffset.name
        );
    }

    // Set up Lipsync
    const visemeOptions = {
        layers: [
            {
                name: 'Viseme',
                animation: 'visemes',
            },
        ],
    };
    const talkingOptions = {
        layers: [
            {
                name: 'Talk',
                animation: 'stand_talk',
                blendTime: 0.75,
                easingFn: HOST.anim.Easing.Quadratic.InOut,
            },
        ],
    };
    host.addFeature(
        HOST.LipsyncFeature,
        false,
        visemeOptions,
        talkingOptions
    );

    // Set up Gestures
    host.addFeature(HOST.GestureFeature, false, {
        layers: {
            Gesture: { minimumInterval: 3 },
            Emote: {
                blendTime: 0.5,
                easingFn: HOST.anim.Easing.Quadratic.InOut,
            },
        },
    });

    // Set up Point of Interest
    host.addFeature(
        HOST.PointOfInterestFeature,
        false,
        {
            target: camera,
            lookTracker: lookJoint,
            scene,
        },
        {
            layers: poiConfig,
        },
        {
            layers: [{ name: 'Blink' }],
        }
    );

    return host;
}

// Return the host whose name matches the text of the current tab
function getCurrentHost() {
    const tab = document.getElementsByClassName('tab current')[0];
    const name = tab.textContent;

    return { name, host: speakers.get(name) };
}

function initializeUX() {

    // Initialise Emote Dropdown
    const { host } = getCurrentHost(speakers);
    const emoteSelect = document.getElementById('emotes');
    emoteSelect.length = 0;
    const emotes = host.AnimationFeature.getAnimations('Emote');
    emotes.forEach((emote, i) => {
        const emoteOption = document.createElement('option');
        emoteOption.text = emote;
        emoteOption.value = emote;
        emoteSelect.add(emoteOption, 0);

        // Set the current item to the first emote
        if (!i) {
            emoteSelect.value = emote;
        }
    });

    // Play, pause, resume and stop the contents of the text input as speech
    // when buttons are clicked
    ['play', 'pause', 'resume', 'stop', 'rasa'].forEach(id => {
        const button = document.getElementById(id);
        button.onclick = () => {
            const { host } = getCurrentHost(speakers);
            const speechInput = document.getElementsByClassName(
                `textEntry ${name}`
            )[0];

            //console.log("SpeechInput.value: " + speechInput.value);
            //console.log("ID: " + id); //play, pause, etc

            if (id == 'rasa') {
                playRasaResponse();
            }
            else {
                host.TextToSpeechFeature[id](speechInput.value);
            }
        };
    });

    //Save to Frappe server instance, ensure token is generated for users to be authorized
    function saveToServer(msg, bot) {
        //const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        var inputObjectData = { //for Frappe server
            "user": user,
            "message": msg,
            "bot": bot //Checks if the msg is from the bot, value 1 or 0
        };
        console.log("inputObjectData: " + inputObjectData.user, inputObjectData.message);
        (async () => {
            const response = await fetch('http://localhost:8000/api/resource/ChatMessages', {
                method: 'POST',
                body: JSON.stringify(inputObjectData)
            }).then((response) => {
                //Bad response returned
                if (response.status >= 400 && response.status < 600) {
                    //console.log(JSON.stringify(req.headers));
                    throw new Error("Bad response from server");
                }
                return response;
            }).then(response => response.json())
                .then((data) => {
                    //successful response
                    console.log('data saved');
                    console.log('data: ' + JSON.stringify(data));
                }).catch((error) => {
                    console.log(error);
                });
        })();
    }

    function playRasaResponse() {
        const rasaChatInput = document.getElementsByClassName(`textEntryRASA`)[0].value;
        document.getElementsByClassName(`textEntryRASA`)[0].value = ""; //Reset textfield

        //check if input field is empty
        if (rasaChatInput === "") {
            host.TextToSpeechFeature['play']("I can't read your mind, please enter something!");
            return;
        }
        if (rasaChatInput === "something") {
            host.TextToSpeechFeature['play']("ha ha, very funny");
            return;
        }

        var inputObjectData = { //for rasa server
            "sender": "test_user",
            "message": rasaChatInput
        };

        saveToServer(rasaChatInput, 0);

        //console.log('inputObjectData: ' + inputObjectData);
        //console.log('rasaChatInput: ' + rasaChatInput);

        (async () => {
            const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
                method: 'POST',
                body: JSON.stringify(inputObjectData),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                //Bad response returned
                if (response.status >= 400 && response.status < 600) {
                    throw new Error("Bad response from server");
                }
                return response;
            }).then(response => response.json())
                .then((data) => {
                    //successful response
                    // console.log('data: ' + JSON.stringify(data));
                    // console.log('data[0].text: ' + data[0].text);

                    //Save the AI response to database, bot value set to 1 to show it is an AI
                    saveToServer(data[0].text, 1);

                    //Set the text field to the AI's response
                    document.getElementById("rasaResponse").value = data[0].text;

                    //Set gestures before playing.
                    const gestureMap = host.GestureFeature.createGestureMap();
                    const gestureArray = host.GestureFeature.createGenericGestureArray([
                        'Gesture',
                    ]);
                    var outputWithSSML = HOST.aws.TextToSpeechUtils.autoGenerateSSMLMarks(
                        data[0].text,
                        gestureMap,
                        gestureArray
                    );
                    //console.log(outputWithSSML);

                    //Play final output
                    host.TextToSpeechFeature['play'](outputWithSSML);
                }).catch((error) => {
                    //network error
                    console.log(error);
                    host.TextToSpeechFeature['play']("Sorry, there seems to be some technical issues at the moment");
                });

            //const rasaResponseJson = await response.json(); //extract JSON from the http response
            //console.log('rasaResponse: ' + rasaResponseJson[0].text);
            //document.getElementById("rasaResponse").value = rasaResponseJson[0].text;
            //host.TextToSpeechFeature['play'](rasaResponseJson[0].text);

            // <speak>
            //   <amazon:domain name="conversational">
            //     Hello, my name is Grace. I used to only be a host inside Amazon Sumerian, but
            //     now you can use me in other Javascript runtime environments like three js
            //     and Babylon js. Right now,
            //     <mark name='{"feature":"PointOfInterestFeature","method":"setTargetByName","args":["char:gaze"]}' />
            //     my friend and I here are in Babylon js.
            //   </amazon:domain>
            // </speak>

            // <speak><amazon:domain name="conversational">
            //     <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","wave",{}]}' />Hello, <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","self",{}]}' />my name is Grace. <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","self",{}]}' />I used to <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","one",{}]}' />only be a host <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","in",{}]}' />inside Amazon Sumerian, but
            //     <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","in",{}]}' />now <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","you",{}]}' />you can use <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","self",{}]}' />me in other Javascript runtime <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","many",{}]}' />environments like three js
            //     and Babylon js. Right <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","in",{}]}' />now,
            //     <mark name='{"feature":"PointOfInterestFeature","method":"setTargetByName","args":["char:gaze"]}' />
            //     <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","self",{}]}' />my <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","heart",{}]}' />friend and <mark name='{"feature":"GestureFeature","method":"playGesture","args":["Gesture","self",{}]}' />I here are in Babylon js.
            // </amazon:domain></speak>

        })();
    }

    // Update the text area text with gesture SSML markup when clicked
    const gestureButton = document.getElementById('gestures');
    gestureButton.onclick = () => {
        // const { name, host } = getCurrentHost(speakers);
        const speechInput = document.getElementsByClassName(
            `textEntry ${name}`
        )[0];
        const gestureMap = host.GestureFeature.createGestureMap();
        const gestureArray = host.GestureFeature.createGenericGestureArray([
            'Gesture',
        ]);
        speechInput.value = HOST.aws.TextToSpeechUtils.autoGenerateSSMLMarks(
            speechInput.value,
            gestureMap,
            gestureArray
        );
    };

    // Play emote on demand with emote button
    const emoteButton = document.getElementById('playEmote');
    emoteButton.onclick = () => {
        host.GestureFeature.playGesture('Emote', emoteSelect.value);
    };

    // Initialize tab
    const tab = document.getElementsByClassName('tab current')[0];

    //Pressing enter while on the focus on the input field sends the message.
    document.getElementsByClassName("textEntryRASA")[0].addEventListener('keydown', (event) => {
        if (event.which === 13 && event.shiftKey == false) { //13 refers to the enter key
            playRasaResponse();
        }
    });
}