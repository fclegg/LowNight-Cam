"use strict";

/* =========================================================
   NIGHTflux v1
   Astral Apparatus Program

   Camera / Low-Light Processing Engine
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const cameraView = document.getElementById("cameraView");
const processingCanvas = document.getElementById("processingCanvas");
const captureCanvas = document.getElementById("captureCanvas");

const processingContext = processingCanvas.getContext("2d", {
    willReadFrequently: true
});

const captureContext = captureCanvas.getContext("2d", {
    willReadFrequently: true
});


/* Camera */

const startCameraButton =
    document.getElementById("startCameraButton");

const cameraMessage =
    document.getElementById("cameraMessage");

const cameraStatusDot =
    document.getElementById("cameraStatusDot");

const cameraStatusText =
    document.getElementById("cameraStatusText");


/* Controls */

const photoButton =
    document.getElementById("photoButton");

const videoButton =
    document.getElementById("videoButton");

const videoButtonText =
    document.getElementById("videoButtonText");

const fullscreenButton =
    document.getElementById("fullscreenButton");


/* Vision */

const modeButtons =
    document.querySelectorAll(".mode-button");

const currentMode =
    document.getElementById("currentMode");

const overlayMode =
    document.getElementById("overlayMode");


/* Image controls */

const brightnessSlider =
    document.getElementById("brightnessSlider");

const contrastSlider =
    document.getElementById("contrastSlider");

const gammaSlider =
    document.getElementById("gammaSlider");

const sharpnessSlider =
    document.getElementById("sharpnessSlider");

const zoomSlider =
    document.getElementById("zoomSlider");

const brightnessValue =
    document.getElementById("brightnessValue");

const contrastValue =
    document.getElementById("contrastValue");

const gammaValue =
    document.getElementById("gammaValue");

const sharpnessValue =
    document.getElementById("sharpnessValue");

const zoomValue =
    document.getElementById("zoomValue");

const resetControlsButton =
    document.getElementById("resetControlsButton");


/* Investigation */

const sessionTimer =
    document.getElementById("sessionTimer");

const sessionStatus =
    document.getElementById("sessionStatus");

const startSessionButton =
    document.getElementById("startSessionButton");

const stopSessionButton =
    document.getElementById("stopSessionButton");


/* Events */

const markEventButton =
    document.getElementById("markEventButton");

const eventModal =
    document.getElementById("eventModal");

const eventDescription =
    document.getElementById("eventDescription");

const saveEventButton =
    document.getElementById("saveEventButton");

const cancelEventButton =
    document.getElementById("cancelEventButton");

const lastEvent =
    document.getElementById("lastEvent");

const lastEventTime =
    document.getElementById("lastEventTime");

const lastEventDescription =
    document.getElementById("lastEventDescription");


/* Recording */

const timestampToggle =
    document.getElementById("timestampToggle");

const modeToggle =
    document.getElementById("modeToggle");

const reticleToggle =
    document.getElementById("reticleToggle");

const recordingIndicator =
    document.getElementById("recordingIndicator");


/* Diagnostics */

const diagnosticCamera =
    document.getElementById("diagnosticCamera");

const diagnosticResolution =
    document.getElementById("diagnosticResolution");

const diagnosticFPS =
    document.getElementById("diagnosticFPS");

const diagnosticProcessing =
    document.getElementById("diagnosticProcessing");

const diagnosticDevice =
    document.getElementById("diagnosticDevice");


/* Gallery */

const captureGallery =
    document.getElementById("captureGallery");

const emptyGallery =
    document.getElementById("emptyGallery");

const captureCount =
    document.getElementById("captureCount");


/* Data */

const exportEventsButton =
    document.getElementById("exportEventsButton");

const exportReportButton =
    document.getElementById("exportReportButton");

const clearSessionButton =
    document.getElementById("clearSessionButton");


/* Toast */

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* Permission modal */

const permissionModal =
    document.getElementById("permissionModal");

const permissionButton =
    document.getElementById("permissionButton");

const closePermissionButton =
    document.getElementById("closePermissionButton");


/* Photo modal */

const photoModal =
    document.getElementById("photoModal");

const photoPreview =
    document.getElementById("photoPreview");

const closePhotoButton =
    document.getElementById("closePhotoButton");

const downloadPhotoButton =
    document.getElementById("downloadPhotoButton");

const discardPhotoButton =
    document.getElementById("discardPhotoButton");


/* =========================================================
   STATE
   ========================================================= */

const state = {

    stream: null,

    cameraReady: false,

    processing: false,

    animationFrame: null,

    currentMode: "normal",

    brightness: 0,

    contrast: 100,

    gamma: 1,

    sharpness: 0,

    zoom: 1,

    sessionActive: false,

    sessionStart: null,

    sessionElapsed: 0,

    sessionTimerInterval: null,

    events: [],

    captures: [],

    mediaRecorder: null,

    recordedChunks: [],

    recording: false,

    recordingMimeType: "",

    recordingStart: null,

    pendingPhotoData: null,

    fps: 0,

    frameCounter: 0,

    fpsStart: performance.now(),

    facingMode: "environment",

    trackCapabilities: null,

    startingCamera: false

};


/* =========================================================
   DEFAULTS
   ========================================================= */

const DEFAULTS = {

    brightness: 0,

    contrast: 100,

    gamma: 1,

    sharpness: 0,

    zoom: 1,

    mode: "normal"

};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function initializeApplication() {

    setupEventListeners();

    updateControlDisplays();

    updateDiagnostics();

    detectDevice();

    checkCameraSupport();

    setVisionMode("normal");

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    if (startCameraButton) {

        startCameraButton.addEventListener(
            "click",
            requestCameraAccess
        );

    }


    if (permissionButton) {

        permissionButton.addEventListener(
            "click",
            requestCameraAccess
        );

    }


    if (closePermissionButton) {

        closePermissionButton.addEventListener(
            "click",
            closePermissionModal
        );

    }


    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setVisionMode(
                    button.dataset.mode
                );

            }
        );

    });


    brightnessSlider.addEventListener(
        "input",
        updateImageControls
    );

    contrastSlider.addEventListener(
        "input",
        updateImageControls
    );

    gammaSlider.addEventListener(
        "input",
        updateImageControls
    );

    sharpnessSlider.addEventListener(
        "input",
        updateImageControls
    );

    zoomSlider.addEventListener(
        "input",
        updateZoom
    );


    resetControlsButton.addEventListener(
        "click",
        resetImageControls
    );


    photoButton.addEventListener(
        "click",
        capturePhoto
    );

    videoButton.addEventListener(
        "click",
        toggleVideoRecording
    );

    fullscreenButton.addEventListener(
        "click",
        toggleFullscreen
    );


    startSessionButton.addEventListener(
        "click",
        startInvestigationSession
    );

    stopSessionButton.addEventListener(
        "click",
        stopInvestigationSession
    );


    markEventButton.addEventListener(
        "click",
        openEventModal
    );

    saveEventButton.addEventListener(
        "click",
        saveEvent
    );

    cancelEventButton.addEventListener(
        "click",
        closeEventModal
    );


    closePhotoButton.addEventListener(
        "click",
        closePhotoModal
    );

    downloadPhotoButton.addEventListener(
        "click",
        downloadCurrentPhoto
    );

    discardPhotoButton.addEventListener(
        "click",
        discardCurrentPhoto
    );


    exportEventsButton.addEventListener(
        "click",
        exportEvents
    );

    exportReportButton.addEventListener(
        "click",
        exportReport
    );

    clearSessionButton.addEventListener(
        "click",
        clearSession
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closePermissionModal();

                closeEventModal();

                closePhotoModal();

            }

        }
    );


    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );


    window.addEventListener(
        "beforeunload",
        stopCamera
    );

}


/* =========================================================
   CAMERA SUPPORT
   ========================================================= */

function checkCameraSupport() {

    if (
        !window.isSecureContext
    ) {

        showCameraError(
            "NIGHTflux requires HTTPS. Open this through GitHub Pages."
        );

        return false;

    }


    if (
        !navigator.mediaDevices
    ) {

        showCameraError(
            "Camera API is unavailable in this browser."
        );

        return false;

    }


    if (
        !navigator.mediaDevices.getUserMedia
    ) {

        showCameraError(
            "This browser does not support camera access."
        );

        return false;

    }


    return true;

}


/* =========================================================
   REQUEST CAMERA
   ========================================================= */

async function requestCameraAccess() {

    if (state.startingCamera) {
        return;
    }


    state.startingCamera = true;


    /*
       Give immediate visual feedback.
    */

    startCameraButton.disabled = true;

    startCameraButton.textContent =
        "STARTING CAMERA…";


    cameraStatusText.textContent =
        "REQUESTING CAMERA";


    cameraStatusDot.classList.remove(
        "offline",
        "online"
    );


    diagnosticCamera.textContent =
        "REQUESTING";


    diagnosticProcessing.textContent =
        "WAITING";


    showToast(
        "Requesting camera permission…"
    );


    /*
       Check browser requirements.
    */

    if (!checkCameraSupport()) {

        resetCameraStartButton();

        return;

    }


    try {

        /*
           IMPORTANT:

           We request VIDEO ONLY here.

           Audio/microphone will be added later when
           NIGHTflux's audio system is implemented.

           Keeping camera permission separate makes the
           initial iPhone setup much more reliable.
        */

        let stream;


        try {

            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {

                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 1920
                        },

                        height: {
                            ideal: 1080
                        },

                        frameRate: {
                            ideal: 30
                        }

                    },

                    audio: false

                });

        } catch (firstError) {

            console.warn(
                "Preferred camera request failed:",
                firstError
            );


            /*
               Second attempt:

               Extremely simple camera request.

               This helps with browsers that reject
               detailed constraints.
            */

            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: true,

                    audio: false

                });

        }


        if (!stream) {

            throw new Error(
                "Camera returned no stream."
            );

        }


        state.stream =
            stream;


        state.cameraReady =
            true;


        /*
           Connect stream to video element.
        */

        cameraView.srcObject =
            stream;


        /*
           Safari/iOS sometimes benefits from explicitly
           calling load before play.
        */

        cameraView.load();


        try {

            await cameraView.play();

        } catch (playError) {

            console.warn(
                "Video play warning:",
                playError
            );

        }


        /*
           Verify that video dimensions actually exist.
        */

        await waitForVideoReady();


        configureCameraTrack();


        showCameraUI();


        startProcessing();


        updateDiagnostics();


        showToast(
            "NIGHTflux camera online"
        );


    } catch (error) {

        console.error(
            "NIGHTflux camera error:",
            error
        );


        state.cameraReady =
            false;


        handleCameraError(
            error
        );

    } finally {

        state.startingCamera =
            false;


        resetCameraStartButton();

    }

}


/* =========================================================
   WAIT FOR VIDEO
   ========================================================= */

function waitForVideoReady() {

    return new Promise(
        resolve => {

            if (
                cameraView.videoWidth > 0 &&
                cameraView.videoHeight > 0
            ) {

                resolve();

                return;

            }


            let finished =
                false;


            const finish = () => {

                if (finished) {
                    return;
                }


                finished = true;


                cameraView.removeEventListener(
                    "loadedmetadata",
                    finish
                );


                cameraView.removeEventListener(
                    "canplay",
                    finish
                );


                resolve();

            };


            cameraView.addEventListener(
                "loadedmetadata",
                finish
            );


            cameraView.addEventListener(
                "canplay",
                finish
            );


            /*
               Safety timeout.

               Don't let NIGHTflux hang forever if Safari
               doesn't fire the expected event.
            */

            setTimeout(
                finish,
                3000
            );

        }
    );

}


/* =========================================================
   CAMERA TRACK
   ========================================================= */

function configureCameraTrack() {

    if (!state.stream) {
        return;
    }


    const tracks =
        state.stream.getVideoTracks();


    if (!tracks.length) {
        return;
    }


    const track =
        tracks[0];


    try {

        state.trackCapabilities =
            track.getCapabilities();

    } catch {

        state.trackCapabilities =
            null;

    }


    /*
       Hardware zoom.
    */

    if (
        state.trackCapabilities &&
        state.trackCapabilities.zoom
    ) {

        const zoom =
            state.trackCapabilities.zoom;


        if (
            Number.isFinite(zoom.min) &&
            Number.isFinite(zoom.max)
        ) {

            zoomSlider.min =
                String(
                    Math.max(
                        1,
                        zoom.min
                    )
                );


            zoomSlider.max =
                String(
                    Math.min(
                        4,
                        zoom.max
                    )
                );

        }

    }


    /*
       Autofocus.
    */

    try {

        if (
            state.trackCapabilities &&
            Array.isArray(
                state.trackCapabilities.focusMode
            )
        ) {

            if (
                state.trackCapabilities.focusMode.includes(
                    "continuous"
                )
            ) {

                track.applyConstraints({

                    advanced: [
                        {
                            focusMode:
                                "continuous"
                        }
                    ]

                }).catch(
                    () => {}
                );

            }

        }

    } catch {

        /* Unsupported camera feature */

    }

}


/* =========================================================
   CAMERA UI
   ========================================================= */

function showCameraUI() {

    cameraMessage.classList.add(
        "hidden"
    );


    cameraStatusDot.classList.remove(
        "offline"
    );

    cameraStatusDot.classList.add(
        "online"
    );


    cameraStatusText.textContent =
        "CAMERA ONLINE";


    diagnosticCamera.textContent =
        "ONLINE";


    photoButton.disabled =
        false;

    videoButton.disabled =
        false;

    markEventButton.disabled =
        false;

}


function resetCameraStartButton() {

    startCameraButton.disabled =
        false;

    startCameraButton.textContent =
        "START CAMERA";

}


/* =========================================================
   CAMERA ERRORS
   ========================================================= */

function handleCameraError(error) {

    state.cameraReady =
        false;


    let message =
        "Unable to access the camera.";


    switch (error.name) {

        case "NotAllowedError":

            message =
                "Camera permission was denied. On iPhone, check Settings → Safari → Camera.";

            break;


        case "PermissionDeniedError":

            message =
                "Camera permission was denied.";

            break;


        case "NotFoundError":

            message =
                "No camera was found.";

            break;


        case "DevicesNotFoundError":

            message =
                "No camera device was found.";

            break;


        case "NotReadableError":

            message =
                "The camera is being used by another application.";

            break;


        case "TrackStartError":

            message =
                "The camera could not be started.";

            break;


        case "OverconstrainedError":

            message =
                "The requested camera settings were unavailable.";

            break;


        case "SecurityError":

            message =
                "Camera access was blocked by browser security.";

            break;


        case "AbortError":

            message =
                "Camera startup was interrupted.";

            break;


        default:

            if (
                error &&
                error.message
            ) {

                message =
                    `Camera error: ${error.message}`;

            }

            break;

    }


    showCameraError(
        message
    );

}


function showCameraError(message) {

    cameraStatusDot.classList.remove(
        "online",
        "recording"
    );


    cameraStatusDot.classList.add(
        "offline"
    );


    cameraStatusText.textContent =
        "CAMERA OFFLINE";


    diagnosticCamera.textContent =
        "ERROR";


    diagnosticProcessing.textContent =
        "OFFLINE";


    /*
       Put the error directly into the camera area
       so the user can actually see what happened.
    */

    cameraMessage.classList.remove(
        "hidden"
    );


    const paragraph =
        cameraMessage.querySelector("p");


    if (paragraph) {

        paragraph.textContent =
            message;

    }


    showToast(
        message
    );

}


/* =========================================================
   PROCESSING
   ========================================================= */

function startProcessing() {

    if (state.processing) {
        return;
    }


    state.processing =
        true;


    processingCanvas.style.display =
        "block";


    diagnosticProcessing.textContent =
        "ACTIVE";


    state.frameCounter =
        0;


    state.fpsStart =
        performance.now();


    processFrame();

}


function stopProcessing() {

    state.processing =
        false;


    if (state.animationFrame) {

        cancelAnimationFrame(
            state.animationFrame
        );

        state.animationFrame =
            null;

    }


    processingCanvas.style.display =
        "none";


    diagnosticProcessing.textContent =
        "READY";

}


/* =========================================================
   FRAME PROCESSING
   ========================================================= */

function processFrame() {

    if (!state.processing) {
        return;
    }


    if (
        cameraView.readyState >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        const width =
            cameraView.videoWidth;

        const height =
            cameraView.videoHeight;


        if (
            width > 0 &&
            height > 0
        ) {

            prepareCanvas(
                width,
                height
            );


            drawVideoFrame();

            applyImageProcessing();

            if (
                state.sharpness > 0
            ) {

                applySharpness(
                    state.sharpness
                );

            }


            updateFPS();

        }

    }


    state.animationFrame =
        requestAnimationFrame(
            processFrame
        );

}


/* =========================================================
   CANVAS
   ========================================================= */

function prepareCanvas(
    width,
    height
) {

    if (
        processingCanvas.width !== width ||
        processingCanvas.height !== height
    ) {

        processingCanvas.width =
            width;

        processingCanvas.height =
            height;


        captureCanvas.width =
            width;

        captureCanvas.height =
            height;

    }

}


/* =========================================================
   DRAW CAMERA
   ========================================================= */

function drawVideoFrame() {

    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


    const zoom =
        Math.max(
            1,
            state.zoom
        );


    const sourceWidth =
        width / zoom;

    const sourceHeight =
        height / zoom;


    const sourceX =
        (width - sourceWidth) / 2;

    const sourceY =
        (height - sourceHeight) / 2;


    processingContext.drawImage(
        cameraView,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height
    );

}


/* =========================================================
   IMAGE PROCESSING
   ========================================================= */

function applyImageProcessing() {

    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


    const imageData =
        processingContext.getImageData(
            0,
            0,
            width,
            height
        );


    const pixels =
        imageData.data;


    const brightness =
        state.brightness;


    const contrast =
        state.contrast / 100;


    const gamma =
        state.gamma;


    const mode =
        state.currentMode;


    const gammaTable =
        createGammaTable(
            gamma
        );


    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        let r =
            pixels[i];

        let g =
            pixels[i + 1];

        let b =
            pixels[i + 2];


        /*
           Brightness.
        */

        r += brightness;
        g += brightness;
        b += brightness;


        /*
           Contrast.
        */

        r =
            ((r - 128) * contrast) +
            128;

        g =
            ((g - 128) * contrast) +
            128;

        b =
            ((b - 128) * contrast) +
            128;


        r =
            clampByte(r);

        g =
            clampByte(g);

        b =
            clampByte(b);


        /*
           Gamma.
        */

        r =
            gammaTable[r];

        g =
            gammaTable[g];

        b =
            gammaTable[b];


        /*
           Vision modes.
        */

        if (
            mode === "green"
        ) {

            const luminance =
                calculateLuminance(
                    r,
                    g,
                    b
                );


            r =
                luminance * 0.08;

            g =
                luminance * 1.15;

            b =
                luminance * 0.12;


        } else if (
            mode === "whitehot"
        ) {

            const luminance =
                calculateLuminance(
                    r,
                    g,
                    b
                );


            r =
                luminance;

            g =
                luminance;

            b =
                luminance;


        } else if (
            mode === "negative"
        ) {

            r =
                255 - r;

            g =
                255 - g;

            b =
                255 - b;


        } else if (
            mode === "lowlight"
        ) {

            const luminance =
                calculateLuminance(
                    r,
                    g,
                    b
                );


            const lifted =
                Math.sqrt(
                    luminance / 255
                ) * 255;


            r =
                lifted;

            g =
                lifted;

            b =
                lifted;

        }


        pixels[i] =
            clampByte(r);

        pixels[i + 1] =
            clampByte(g);

        pixels[i + 2] =
            clampByte(b);

    }


    processingContext.putImageData(
        imageData,
        0,
        0
    );


    if (
        mode === "edge"
    ) {

        applyEdgeDetection();

    }

}


/* =========================================================
   GAMMA
   ========================================================= */

function createGammaTable(
    gamma
) {

    const table =
        new Uint8ClampedArray(
            256
        );


    for (
        let i = 0;
        i < 256;
        i++
    ) {

        const normalized =
            i / 255;


        const corrected =
            Math.pow(
                normalized,
                1 / gamma
            );


        table[i] =
            clampByte(
                corrected * 255
            );

    }


    return table;

}


/* =========================================================
   EDGE DETECTION
   ========================================================= */

function applyEdgeDetection() {

    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


    const source =
        processingContext.getImageData(
            0,
            0,
            width,
            height
        );


    const output =
        processingContext.createImageData(
            width,
            height
        );


    const src =
        source.data;

    const dst =
        output.data;


    const getGray =
        (x, y) => {

            const index =
                ((y * width) + x) * 4;


            return (
                0.299 * src[index] +
                0.587 * src[index + 1] +
                0.114 * src[index + 2]
            );

        };


    for (
        let y = 1;
        y < height - 1;
        y++
    ) {

        for (
            let x = 1;
            x < width - 1;
            x++
        ) {

            const gx =
                -getGray(
                    x - 1,
                    y - 1
                ) +

                getGray(
                    x + 1,
                    y - 1
                ) +

                -2 * getGray(
                    x - 1,
                    y
                ) +

                2 * getGray(
                    x + 1,
                    y
                ) +

                -getGray(
                    x - 1,
                    y + 1
                ) +

                getGray(
                    x + 1,
                    y + 1
                );


            const gy =
                -getGray(
                    x - 1,
                    y - 1
                ) -

                2 * getGray(
                    x,
                    y - 1
                ) -

                getGray(
                    x + 1,
                    y - 1
                ) +

                getGray(
                    x - 1,
                    y + 1
                ) +

                2 * getGray(
                    x,
                    y + 1
                ) +

                getGray(
                    x + 1,
                    y + 1
                );


            const magnitude =
                Math.sqrt(
                    gx * gx +
                    gy * gy
                );


            const value =
                clampByte(
                    magnitude * 1.5
                );


            const index =
                ((y * width) + x) * 4;


            dst[index] =
                value;

            dst[index + 1] =
                value;

            dst[index + 2] =
                value;

            dst[index + 3] =
                255;

        }

    }


    processingContext.putImageData(
        output,
        0,
        0
    );

}


/* =========================================================
   SHARPNESS
   ========================================================= */

function applySharpness(
    amount
) {

    if (amount <= 0) {
        return;
    }


    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


    const imageData =
        processingContext.getImageData(
            0,
            0,
            width,
            height
        );


    const source =
        imageData.data;


    const copy =
        new Uint8ClampedArray(
            source
        );


    const strength =
        amount / 100;


    for (
        let y = 1;
        y < height - 1;
        y++
    ) {

        for (
            let x = 1;
            x < width - 1;
            x++
        ) {

            const index =
                ((y * width) + x) * 4;


            for (
                let channel = 0;
                channel < 3;
                channel++
            ) {

                const center =
                    copy[
                        index +
                        channel
                    ];


                const top =
                    copy[
                        index -
                        width * 4 +
                        channel
                    ];


                const bottom =
                    copy[
                        index +
                        width * 4 +
                        channel
                    ];


                const left =
                    copy[
                        index -
                        4 +
                        channel
                    ];


                const right =
                    copy[
                        index +
                        4 +
                        channel
                    ];


                const average =
                    (
                        top +
                        bottom +
                        left +
                        right
                    ) / 4;


                source[
                    index +
                    channel
                ] =
                    clampByte(
                        center +
                        (
                            center -
                            average
                        ) *
                        strength
                    );

            }

        }

    }


    processingContext.putImageData(
        imageData,
        0,
        0
    );

}


/* =========================================================
   FPS
   ========================================================= */

function updateFPS() {

    state.frameCounter++;


    const now =
        performance.now();


    const elapsed =
        now -
        state.fpsStart;


    if (
        elapsed >= 1000
    ) {

        state.fps =
            Math.round(
                (
                    state.frameCounter /
                    elapsed
                ) * 1000
            );


        state.frameCounter =
            0;


        state.fpsStart =
            now;


        diagnosticFPS.textContent =
            `${state.fps} FPS`;

    }

}


/* =========================================================
   VISION MODE
   ========================================================= */

function setVisionMode(
    mode
) {

    const validModes = [

        "normal",
        "green",
        "whitehot",
        "negative",
        "edge",
        "lowlight"

    ];


    if (
        !validModes.includes(mode)
    ) {

        mode =
            "normal";

    }


    state.currentMode =
        mode;


    modeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === mode
            );

        }
    );


    const displayName =
        getModeDisplayName(
            mode
        );


    currentMode.textContent =
        displayName;


    overlayMode.textContent =
        displayName;

}


/* =========================================================
   IMAGE CONTROLS
   ========================================================= */

function updateImageControls() {

    state.brightness =
        Number(
            brightnessSlider.value
        );


    state.contrast =
        Number(
            contrastSlider.value
        );


    state.gamma =
        Number(
            gammaSlider.value
        );


    state.sharpness =
        Number(
            sharpnessSlider.value
        );


    updateControlDisplays();

}


function updateControlDisplays() {

    brightnessValue.textContent =
        state.brightness;


    contrastValue.textContent =
        `${state.contrast}%`;


    gammaValue.textContent =
        Number(
            state.gamma
        ).toFixed(1);


    sharpnessValue.textContent =
        state.sharpness;


    zoomValue.textContent =
        `${Number(
            state.zoom
        ).toFixed(1)}×`;

}


function resetImageControls() {

    state.brightness =
        DEFAULTS.brightness;

    state.contrast =
        DEFAULTS.contrast;

    state.gamma =
        DEFAULTS.gamma;

    state.sharpness =
        DEFAULTS.sharpness;

    state.zoom =
        DEFAULTS.zoom;


    brightnessSlider.value =
        DEFAULTS.brightness;

    contrastSlider.value =
        DEFAULTS.contrast;

    gammaSlider.value =
        DEFAULTS.gamma;

    sharpnessSlider.value =
        DEFAULTS.sharpness;

    zoomSlider.value =
        DEFAULTS.zoom;


    setVisionMode(
        DEFAULTS.mode
    );


    updateControlDisplays();


    showToast(
        "Image controls reset"
    );

}


/* =========================================================
   ZOOM
   ========================================================= */

async function updateZoom() {

    state.zoom =
        Number(
            zoomSlider.value
        );


    updateControlDisplays();


    if (
        !state.stream ||
        !state.trackCapabilities ||
        !state.trackCapabilities.zoom
    ) {

        return;

    }


    const track =
        state.stream.getVideoTracks()[0];


    if (!track) {
        return;
    }


    const capability =
        state.trackCapabilities.zoom;


    const physicalZoom =
        clamp(
            state.zoom,
            capability.min,
            capability.max
        );


    try {

        await track.applyConstraints({

            advanced: [
                {
                    zoom:
                        physicalZoom
                }
            ]

        });

    } catch {

        /* Canvas zoom remains active */

    }

}


/* =========================================================
   PHOTO
   ========================================================= */

function capturePhoto() {

    if (!state.cameraReady) {

        showToast(
            "Camera is not active"
        );

        return;

    }


    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


    if (
        width <= 0 ||
        height <= 0
    ) {

        showToast(
            "Camera frame is not ready"
        );

        return;

    }


    captureCanvas.width =
        width;

    captureCanvas.height =
        height;


    captureContext.clearRect(
        0,
        0,
        width,
        height
    );


    captureContext.drawImage(
        processingCanvas,
        0,
        0,
        width,
        height
    );


    drawCaptureMetadata(
        captureContext,
        width,
        height
    );


    const dataURL =
        captureCanvas.toDataURL(
            "image/jpeg",
            0.92
        );


    const capture = {

        id:
            createID(),

        timestamp:
            new Date(),

        mode:
            state.currentMode,

        dataURL:
            dataURL

    };


    state.captures.push(
        capture
    );


    state.pendingPhotoData =
        capture;


    photoPreview.src =
        dataURL;


    updateGallery();

    updateCaptureCount();


    photoModal.classList.remove(
        "hidden"
    );


    showToast(
        "Photo captured"
    );

}


/* =========================================================
   PHOTO METADATA
   ========================================================= */

function drawCaptureMetadata(
    context,
    width,
    height
) {

    if (
        timestampToggle.checked
    ) {

        const timestamp =
            formatDateTime(
                new Date()
            );


        context.save();


        context.fillStyle =
            "rgba(0,0,0,0.65)";


        context.fillRect(
            10,
            height - 38,
            175,
            26
        );


        context.fillStyle =
            "#ffffff";


        context.font =
            "12px monospace";


        context.fillText(
            timestamp,
            18,
            height - 21
        );


        context.restore();

    }


    if (
        modeToggle.checked
    ) {

        context.save();


        context.fillStyle =
            "rgba(0,0,0,0.65)";


        context.fillRect(
            width - 130,
            10,
            120,
            26
        );


        context.fillStyle =
            "#ffffff";


        context.font =
            "11px monospace";


        context.textAlign =
            "right";


        context.fillText(
            getModeDisplayName(
                state.currentMode
            ),
            width - 18,
            27
        );


        context.restore();

    }

}


/* =========================================================
   GALLERY
   ========================================================= */

function updateGallery() {

    const existing =
        captureGallery.querySelectorAll(
            ".gallery-item"
        );


    existing.forEach(
        item => item.remove()
    );


    if (
        state.captures.length === 0
    ) {

        emptyGallery.classList.remove(
            "hidden"
        );

        return;

    }


    emptyGallery.classList.add(
        "hidden"
    );


    state.captures.forEach(
        capture => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "gallery-item";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                capture.dataURL;


            image.alt =
                "NIGHTflux capture";


            const time =
                document.createElement(
                    "div"
                );


            time.className =
                "gallery-item-time";


            time.textContent =
                formatTime(
                    capture.timestamp
                );


            item.appendChild(
                image
            );


            item.appendChild(
                time
            );


            item.addEventListener(
                "click",
                () => {

                    state.pendingPhotoData =
                        capture;


                    photoPreview.src =
                        capture.dataURL;


                    photoModal.classList.remove(
                        "hidden"
                    );

                }
            );


            captureGallery.appendChild(
                item
            );

        }
    );

}


function updateCaptureCount() {

    captureCount.textContent =
        String(
            state.captures.length
        );

}


/* =========================================================
   PHOTO DOWNLOAD
   ========================================================= */

function downloadCurrentPhoto() {

    if (
        !state.pendingPhotoData
    ) {

        return;

    }


    const capture =
        state.pendingPhotoData;


    const link =
        document.createElement(
            "a"
        );


    link.href =
        capture.dataURL;


    link.download =
        `NIGHTflux_${formatFileTimestamp(
            capture.timestamp
        )}.jpg`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    showToast(
        "Image saved"
    );

}


function discardCurrentPhoto() {

    if (
        state.pendingPhotoData
    ) {

        const index =
            state.captures.indexOf(
                state.pendingPhotoData
            );


        if (index !== -1) {

            state.captures.splice(
                index,
                1
            );

        }

    }


    state.pendingPhotoData =
        null;


    updateGallery();

    updateCaptureCount();

    closePhotoModal();


    showToast(
        "Capture discarded"
    );

}


function closePhotoModal() {

    photoModal.classList.add(
        "hidden"
    );

}


/* =========================================================
   VIDEO
   ========================================================= */

function toggleVideoRecording() {

    if (state.recording) {

        stopVideoRecording();

    } else {

        startVideoRecording();

    }

}


function startVideoRecording() {

    if (!state.stream) {

        showToast(
            "Camera is not active"
        );

        return;

    }


    if (
        typeof MediaRecorder ===
        "undefined"
    ) {

        showToast(
            "Video recording is not supported."
        );

        return;

    }


    const mimeTypes = [

        "video/mp4",

        "video/webm;codecs=vp9,opus",

        "video/webm;codecs=vp8,opus",

        "video/webm"

    ];


    let selectedMime =
        "";


    for (
        const mimeType of mimeTypes
    ) {

        if (
            MediaRecorder.isTypeSupported(
                mimeType
            )
        ) {

            selectedMime =
                mimeType;

            break;

        }

    }


    try {

        state.mediaRecorder =
            new MediaRecorder(
                state.stream,
                selectedMime
                    ? {
                        mimeType:
                            selectedMime
                    }
                    : undefined
            );


        state.recordedChunks =
            [];


        state.recordingMimeType =
            selectedMime ||
            "video/webm";


        state.mediaRecorder.ondataavailable =
            event => {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    state.recordedChunks.push(
                        event.data
                    );

                }

            };


        state.mediaRecorder.onstop =
            finishVideoRecording;


        state.mediaRecorder.onerror =
            event => {

                console.error(
                    event
                );

                showToast(
                    "Recording error"
                );

            };


        state.mediaRecorder.start(
            1000
        );


        state.recording =
            true;


        state.recordingStart =
            new Date();


        videoButton.classList.add(
            "recording"
        );


        videoButtonText.textContent =
            "STOP";


        recordingIndicator.classList.remove(
            "hidden"
        );


        cameraStatusDot.classList.remove(
            "online"
        );


        cameraStatusDot.classList.add(
            "recording"
        );


        cameraStatusText.textContent =
            "RECORDING";


        showToast(
            "Recording started"
        );

    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Unable to start recording"
        );

    }

}


function stopVideoRecording() {

    if (
        !state.mediaRecorder ||
        state.mediaRecorder.state ===
        "inactive"
    ) {

        return;

    }


    state.mediaRecorder.stop();


    state.recording =
        false;


    videoButton.classList.remove(
        "recording"
    );


    videoButtonText.textContent =
        "RECORD";


    recordingIndicator.classList.add(
        "hidden"
    );


    cameraStatusDot.classList.remove(
        "recording"
    );


    cameraStatusDot.classList.add(
        "online"
    );


    cameraStatusText.textContent =
        "CAMERA ONLINE";


    showToast(
        "Processing recording…"
    );

}


function finishVideoRecording() {

    if (
        state.recordedChunks.length === 0
    ) {

        showToast(
            "No video data was recorded"
        );

        return;

    }


    const blob =
        new Blob(
            state.recordedChunks,
            {
                type:
                    state.recordingMimeType
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const extension =
        state.recordingMimeType.includes(
            "mp4"
        )
            ? "mp4"
            : "webm";


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `NIGHTflux_${formatFileTimestamp(
            new Date()
        )}.${extension}`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        2000
    );


    state.recordedChunks =
        [];


    state.mediaRecorder =
        null;


    showToast(
        "Video saved"
    );

}


/* =========================================================
   SESSION
   ========================================================= */

function startInvestigationSession() {

    if (state.sessionActive) {
        return;
    }


    state.sessionActive =
        true;


    state.sessionStart =
        new Date();


    state.sessionElapsed =
        0;


    sessionStatus.textContent =
        "ACTIVE";


    sessionStatus.classList.add(
        "active"
    );


    startSessionButton.disabled =
        true;


    stopSessionButton.disabled =
        false;


    state.sessionTimerInterval =
        setInterval(
            updateSessionTimer,
            1000
        );


    updateSessionTimer();


    showToast(
        "Investigation session started"
    );

}


function stopInvestigationSession() {

    if (!state.sessionActive) {
        return;
    }


    state.sessionActive =
        false;


    if (
        state.sessionTimerInterval
    ) {

        clearInterval(
            state.sessionTimerInterval
        );

        state.sessionTimerInterval =
            null;

    }


    sessionStatus.textContent =
        "STANDBY";


    sessionStatus.classList.remove(
        "active"
    );


    startSessionButton.disabled =
        false;


    stopSessionButton.disabled =
        true;


    showToast(
        "Investigation session stopped"
    );

}


function updateSessionTimer() {

    if (
        !state.sessionActive ||
        !state.sessionStart
    ) {

        return;

    }


    state.sessionElapsed =
        Date.now() -
        state.sessionStart.getTime();


    sessionTimer.textContent =
        formatDuration(
            state.sessionElapsed
        );

}


/* =========================================================
   EVENTS
   ========================================================= */

function openEventModal() {

    if (!state.cameraReady) {

        showToast(
            "Start the camera first"
        );

        return;

    }


    eventDescription.value =
        "";


    eventModal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {
            eventDescription.focus();
        },
        100
    );

}


function closeEventModal() {

    eventModal.classList.add(
        "hidden"
    );

}


function saveEvent() {

    const now =
        new Date();


    const event = {

        id:
            createID(),

        timestamp:
            now,

        elapsed:
            state.sessionStart
                ? Date.now() -
                  state.sessionStart.getTime()
                : 0,

        mode:
            state.currentMode,

        description:
            eventDescription.value.trim() ||
            "Observation marked.",

        brightness:
            state.brightness,

        contrast:
            state.contrast,

        gamma:
            state.gamma,

        zoom:
            state.zoom

    };


    state.events.push(
        event
    );


    lastEventTime.textContent =
        formatDateTime(
            now
        );


    lastEventDescription.textContent =
        event.description;


    lastEvent.classList.remove(
        "hidden"
    );


    closeEventModal();


    showToast(
        "Event recorded"
    );

}


/* =========================================================
   EXPORT EVENTS
   ========================================================= */

function exportEvents() {

    if (
        state.events.length === 0
    ) {

        showToast(
            "No events to export"
        );

        return;

    }


    const rows = [

        [
            "Event ID",
            "Timestamp",
            "Session Time",
            "Vision Mode",
            "Description",
            "Brightness",
            "Contrast",
            "Gamma",
            "Zoom"
        ]

    ];


    state.events.forEach(
        event => {

            rows.push([

                event.id,

                formatDateTime(
                    event.timestamp
                ),

                formatDuration(
                    event.elapsed
                ),

                getModeDisplayName(
                    event.mode
                ),

                event.description,

                event.brightness,

                event.contrast,

                event.gamma,

                event.zoom

            ]);

        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            csvEscape
                        )
                        .join(",")
            )
            .join("\n");


    downloadTextFile(
        csv,
        `NIGHTflux_events_${formatFileTimestamp(
            new Date()
        )}.csv`,
        "text/csv"
    );


    showToast(
        "Events exported"
    );

}


/* =========================================================
   REPORT
   ========================================================= */

function exportReport() {

    const report = [];


    report.push(
        "NIGHTflux Investigation Report"
    );


    report.push(
        "Astral Apparatus Program"
    );


    report.push(
        "================================"
    );


    report.push("");


    report.push(
        `Generated: ${formatDateTime(
            new Date()
        )}`
    );


    report.push("");


    report.push(
        "SESSION"
    );


    report.push(
        `Status: ${
            state.sessionActive
                ? "Active"
                : "Stopped"
        }`
    );


    if (state.sessionStart) {

        report.push(
            `Started: ${formatDateTime(
                state.sessionStart
            )}`
        );

    }


    report.push(
        `Elapsed: ${formatDuration(
            state.sessionElapsed
        )}`
    );


    report.push("");


    report.push(
        "CAMERA SETTINGS"
    );


    report.push(
        `Vision Mode: ${
            getModeDisplayName(
                state.currentMode
            )
        }`
    );


    report.push(
        `Brightness: ${
            state.brightness
        }`
    );


    report.push(
        `Contrast: ${
            state.contrast
        }%`
    );


    report.push(
        `Gamma: ${
            state.gamma
        }`
    );


    report.push(
        `Sharpness: ${
            state.sharpness
        }`
    );


    report.push(
        `Digital Zoom: ${
            state.zoom
        }x`
    );


    report.push("");


    report.push(
        `Photos: ${
            state.captures.length
        }`
    );


    report.push(
        `Events: ${
            state.events.length
        }`
    );


    report.push("");


    state.events.forEach(
        (event, index) => {

            report.push(
                `EVENT ${index + 1}`
            );


            report.push(
                `Time: ${formatDateTime(
                    event.timestamp
                )}`
            );


            report.push(
                `Session Time: ${formatDuration(
                    event.elapsed
                )}`
            );


            report.push(
                `Mode: ${getModeDisplayName(
                    event.mode
                )}`
            );


            report.push(
                `Description: ${
                    event.description
                }`
            );


            report.push("");

        }
    );


    report.push(
        "================================"
    );


    report.push(
        "NIGHTflux v1.0"
    );


    report.push(
        "Astral Apparatus"
    );


    downloadTextFile(
        report.join("\n"),
        `NIGHTflux_report_${formatFileTimestamp(
            new Date()
        )}.txt`,
        "text/plain"
    );


    showToast(
        "Report exported"
    );

}


/* =========================================================
   CLEAR
   ========================================================= */

function clearSession() {

    if (
        !window.confirm(
            "Clear all NIGHTflux session events and captures?"
        )
    ) {

        return;

    }


    state.events =
        [];

    state.captures =
        [];

    state.pendingPhotoData =
        null;


    lastEvent.classList.add(
        "hidden"
    );


    updateGallery();

    updateCaptureCount();


    showToast(
        "Session data cleared"
    );

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleFullscreen() {

    const cameraFrame =
        document.querySelector(
            ".camera-frame"
        );


    try {

        if (
            document.fullscreenElement
        ) {

            await document.exitFullscreen();

            document.body.classList.remove(
                "fullscreen-camera"
            );

            return;

        }


        if (
            cameraFrame.requestFullscreen
        ) {

            await cameraFrame.requestFullscreen();

        } else {

            document.body.classList.add(
                "fullscreen-camera"
            );

        }

    } catch {

        document.body.classList.toggle(
            "fullscreen-camera"
        );

    }

}


/* =========================================================
   MODALS
   ========================================================= */

function closePermissionModal() {

    permissionModal.classList.add(
        "hidden"
    );

}


/* =========================================================
   VISIBILITY
   ========================================================= */

function handleVisibilityChange() {

    if (
        document.hidden
    ) {

        return;

    }


    if (
        state.cameraReady &&
        !state.processing
    ) {

        startProcessing();

    }

}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera() {

    if (!state.stream) {
        return;
    }


    state.stream
        .getTracks()
        .forEach(
            track => track.stop()
        );


    state.stream =
        null;


    state.cameraReady =
        false;


    stopProcessing();

}


/* =========================================================
   DIAGNOSTICS
   ========================================================= */

function updateDiagnostics() {

    diagnosticCamera.textContent =
        state.cameraReady
            ? "ONLINE"
            : "OFFLINE";


    if (
        cameraView.videoWidth &&
        cameraView.videoHeight
    ) {

        diagnosticResolution.textContent =
            `${cameraView.videoWidth} × ${cameraView.videoHeight}`;

    } else {

        diagnosticResolution.textContent =
            "--";

    }


    diagnosticFPS.textContent =
        state.fps
            ? `${state.fps} FPS`
            : "--";


    diagnosticProcessing.textContent =
        state.processing
            ? "ACTIVE"
            : "READY";

}


function detectDevice() {

    const userAgent =
        navigator.userAgent;


    let device =
        "Unknown";


    if (
        /iPhone/i.test(
            userAgent
        )
    ) {

        device =
            "iPhone";

    } else if (
        /iPad/i.test(
            userAgent
        )
    ) {

        device =
            "iPad";

    } else if (
        /Android/i.test(
            userAgent
        )
    ) {

        device =
            "Android";

    } else if (
        /Macintosh/i.test(
            userAgent
        )
    ) {

        device =
            "Mac";

    } else if (
        /Windows/i.test(
            userAgent
        )
    ) {

        device =
            "Windows";

    }


    diagnosticDevice.textContent =
        device;

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout =
    null;


function showToast(message) {

    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   UTILITY
   ========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );

}


function clampByte(
    value
) {

    return clamp(
        Math.round(value),
        0,
        255
    );

}


function calculateLuminance(
    r,
    g,
    b
) {

    return (
        0.299 * r +
        0.587 * g +
        0.114 * b
    );

}


function formatDuration(
    milliseconds
) {

    const totalSeconds =
        Math.floor(
            milliseconds / 1000
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    return [

        hours,
        minutes,
        seconds

    ]
        .map(
            value =>
                String(value)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join(":");

}


function formatTime(
    date
) {

    return new Date(
        date
    ).toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


function formatDateTime(
    date
) {

    return new Date(
        date
    ).toLocaleString(
        [],
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


function formatFileTimestamp(
    date
) {

    const d =
        new Date(date);


    const year =
        d.getFullYear();


    const month =
        String(
            d.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        );


    const hours =
        String(
            d.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            d.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const seconds =
        String(
            d.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}_` +
        `${hours}-${minutes}-${seconds}`
    );

}


function createID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function csvEscape(
    value
) {

    const string =
        String(
            value ?? ""
        );


    if (
        string.includes(",") ||
        string.includes('"') ||
        string.includes("\n")
    ) {

        return `"${string.replace(
            /"/g,
            '""'
        )}"`;

    }


    return string;

}


function downloadTextFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );

}


function getModeDisplayName(
    mode
) {

    const names = {

        normal: "NORMAL",

        green: "GREEN",

        whitehot: "WHITE HOT",

        negative: "NEGATIVE",

        edge: "EDGE",

        lowlight: "LOW LIGHT"

    };


    return (
        names[mode] ||
        "NORMAL"
    );

}


/* =========================================================
   INITIAL STATE
   ========================================================= */

updateControlDisplays();

updateDiagnostics();