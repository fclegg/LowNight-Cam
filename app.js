"use strict";

/* =========================================================
   NIGHTflux v1
   Astral Apparatus Program

   Digital low-light investigation camera
   ========================================================= */


/* =========================================================
   DOM REFERENCES
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
   APPLICATION STATE
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

    lastFrameTime: performance.now(),

    facingMode: "environment",

    trackCapabilities: null

};


/* =========================================================
   CONSTANTS
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

document.addEventListener("DOMContentLoaded", () => {

    initializeApplication();

});


function initializeApplication() {

    updateControlDisplays();

    updateDiagnostics();

    detectDevice();

    setupEventListeners();

    checkCameraSupport();

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    /* Camera */

    startCameraButton.addEventListener(
        "click",
        requestCameraAccess
    );

    permissionButton.addEventListener(
        "click",
        requestCameraAccess
    );

    closePermissionButton.addEventListener(
        "click",
        closePermissionModal
    );


    /* Vision modes */

    modeButtons.forEach(button => {

        button.addEventListener("click", () => {

            const mode =
                button.dataset.mode;

            setVisionMode(mode);

        });

    });


    /* Image controls */

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


    /* Camera actions */

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


    /* Session */

    startSessionButton.addEventListener(
        "click",
        startInvestigationSession
    );

    stopSessionButton.addEventListener(
        "click",
        stopInvestigationSession
    );


    /* Events */

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


    /* Photo */

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


    /* Data */

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


    /* Escape key */

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


    /* Page lifecycle */

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

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        showCameraError(
            "Camera access is not supported by this browser."
        );

        return false;
    }

    return true;
}


/* =========================================================
   CAMERA PERMISSION
   ========================================================= */

async function requestCameraAccess() {

    if (!checkCameraSupport()) {
        return;
    }


    try {

        closePermissionModal();

        showToast("Requesting camera access…");


        const constraints = {

            audio: true,

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
                    ideal: 30,
                    max: 60
                }

            }

        };


        const stream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );


        state.stream = stream;

        state.cameraReady = true;


        cameraView.srcObject = stream;


        await cameraView.play();


        configureCameraTrack();

        showCameraUI();

        startProcessing();

        updateDiagnostics();

        showToast("Camera online");


    } catch (error) {

        console.error(
            "Camera initialization error:",
            error
        );

        state.cameraReady = false;

        handleCameraError(error);

    }

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


    const track = tracks[0];


    try {

        state.trackCapabilities =
            track.getCapabilities();

    } catch {

        state.trackCapabilities = null;

    }


    /*
       If the physical camera supports optical/digital
       zoom through MediaTrackCapabilities, use it.
    */

    if (
        state.trackCapabilities &&
        typeof state.trackCapabilities.zoom === "object"
    ) {

        const zoomCapabilities =
            state.trackCapabilities.zoom;


        if (
            Number.isFinite(zoomCapabilities.min) &&
            Number.isFinite(zoomCapabilities.max)
        ) {

            /*
               Keep the UI at a maximum of 4x even if
               the hardware advertises a larger range.
            */

            const maxZoom =
                Math.min(
                    4,
                    zoomCapabilities.max
                );


            zoomSlider.min =
                String(
                    Math.max(
                        1,
                        zoomCapabilities.min
                    )
                );


            zoomSlider.max =
                String(maxZoom);


            zoomSlider.step = "0.1";

        }

    }


    /*
       Try to enable continuous autofocus if supported.
    */

    try {

        if (
            state.trackCapabilities &&
            Array.isArray(
                state.trackCapabilities.focusMode
            )
        ) {

            if (
                state.trackCapabilities.focusMode
                    .includes("continuous")
            ) {

                track.applyConstraints({

                    advanced: [
                        {
                            focusMode: "continuous"
                        }
                    ]

                }).catch(() => {});

            }

        }

    } catch {
        /* Ignore unsupported focus controls */
    }

}


/* =========================================================
   CAMERA UI
   ========================================================= */

function showCameraUI() {

    cameraMessage.classList.add("hidden");

    cameraStatusDot.classList.remove("offline");

    cameraStatusDot.classList.add("online");

    cameraStatusText.textContent =
        "CAMERA ONLINE";


    photoButton.disabled = false;

    videoButton.disabled = false;

    markEventButton.disabled = false;

}


function showCameraError(message) {

    cameraStatusDot.classList.remove("online");

    cameraStatusDot.classList.add("offline");

    cameraStatusText.textContent =
        "CAMERA ERROR";


    diagnosticCamera.textContent =
        "ERROR";


    diagnosticProcessing.textContent =
        "OFFLINE";


    showToast(message);

}


/* =========================================================
   CAMERA ERROR HANDLING
   ========================================================= */

function handleCameraError(error) {

    let message =
        "Unable to access camera.";


    if (error.name === "NotAllowedError") {

        message =
            "Camera permission was denied. Check your browser settings.";

    } else if (error.name === "NotFoundError") {

        message =
            "No camera was found on this device.";

    } else if (error.name === "NotReadableError") {

        message =
            "The camera is currently being used by another application.";

    } else if (error.name === "SecurityError") {

        message =
            "Camera access requires a secure HTTPS connection.";

    }


    showCameraError(message);

}


/* =========================================================
   PROCESSING ENGINE
   ========================================================= */

function startProcessing() {

    if (state.processing) {
        return;
    }


    state.processing = true;

    diagnosticProcessing.textContent =
        "ACTIVE";


    processingCanvas.style.display =
        "block";


    state.lastFrameTime =
        performance.now();


    state.fpsStart =
        performance.now();


    state.frameCounter = 0;


    processFrame();

}


function stopProcessing() {

    state.processing = false;


    if (state.animationFrame) {

        cancelAnimationFrame(
            state.animationFrame
        );

        state.animationFrame = null;

    }


    processingCanvas.style.display =
        "none";


    diagnosticProcessing.textContent =
        "READY";

}


/* =========================================================
   MAIN FRAME PROCESSOR
   ========================================================= */

function processFrame() {

    if (!state.processing) {
        return;
    }


    if (
        cameraView.readyState >=
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        const videoWidth =
            cameraView.videoWidth;

        const videoHeight =
            cameraView.videoHeight;


        if (
            videoWidth > 0 &&
            videoHeight > 0
        ) {

            prepareCanvas(
                videoWidth,
                videoHeight
            );


            /*
               Draw the source frame.
            */

            drawVideoFrame();


            /*
               Apply the selected image processing.
            */

            applyImageProcessing();


            /*
               Apply optional sharpening.
            */

            if (state.sharpness > 0) {

                applySharpness(
                    state.sharpness
                );

            }


            /*
               Draw investigation overlay.
            */

            drawProcessingOverlay();


            /*
               Update FPS information.
            */

            updateFPS();

        }

    }


    state.animationFrame =
        requestAnimationFrame(
            processFrame
        );

}


/* =========================================================
   CANVAS PREPARATION
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
   DRAW VIDEO FRAME
   ========================================================= */

function drawVideoFrame() {

    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


    /*
       Apply digital zoom by cropping the center of
       the camera image.
    */

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


    /*
       Precalculate gamma table.

       This is considerably faster than calling Math.pow()
       for every RGB channel on every frame.
    */

    const gammaTable =
        createGammaTable(gamma);


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


        /* -----------------------------------------------
           BRIGHTNESS
        ------------------------------------------------ */

        r += brightness;
        g += brightness;
        b += brightness;


        /* -----------------------------------------------
           CONTRAST
        ------------------------------------------------ */

        r =
            ((r - 128) * contrast) + 128;

        g =
            ((g - 128) * contrast) + 128;

        b =
            ((b - 128) * contrast) + 128;


        /* -----------------------------------------------
           CLAMP
        ------------------------------------------------ */

        r =
            clampByte(r);

        g =
            clampByte(g);

        b =
            clampByte(b);


        /* -----------------------------------------------
           GAMMA
        ------------------------------------------------ */

        r =
            gammaTable[r];

        g =
            gammaTable[g];

        b =
            gammaTable[b];


        /* -----------------------------------------------
           VISION MODE
        ------------------------------------------------ */

        if (mode === "green") {

            const luminance =
                calculateLuminance(
                    r,
                    g,
                    b
                );


            /*
               Green phosphor style.

               Dark pixels remain nearly black while
               brighter pixels become progressively brighter.
            */

            r =
                luminance * 0.08;

            g =
                luminance * 1.15;

            b =
                luminance * 0.12;


        } else if (mode === "whitehot") {

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


        } else if (mode === "negative") {

            r =
                255 - r;

            g =
                255 - g;

            b =
                255 - b;


        } else if (mode === "edge") {

            /*
               Edge detection is handled in a second pass.
               We leave the source pixels here.
            */


        } else if (mode === "lowlight") {

            /*
               Stronger shadow lift for very dark scenes.
            */

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


    /*
       Edge mode gets a dedicated processing pass.
    */

    if (mode === "edge") {

        applyEdgeDetection();

    }

}


/* =========================================================
   GAMMA TABLE
   ========================================================= */

function createGammaTable(gamma) {

    const table =
        new Uint8ClampedArray(256);


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


    /*
       Simple Sobel edge detector.

       This is intentionally lightweight so it can run
       on mobile hardware without becoming unusably slow.
    */

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
                -getGray(x - 1, y - 1) +
                getGray(x + 1, y - 1) +

                -2 * getGray(x - 1, y) +
                2 * getGray(x + 1, y) +

                -getGray(x - 1, y + 1) +
                getGray(x + 1, y + 1);


            const gy =
                -getGray(x - 1, y - 1) -
                2 * getGray(x, y - 1) -
                getGray(x + 1, y - 1) +

                getGray(x - 1, y + 1) +
                2 * getGray(x, y + 1) +
                getGray(x + 1, y + 1);


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

function applySharpness(amount) {

    if (amount <= 0) {
        return;
    }


    /*
       Keep sharpening lightweight.

       The effect uses the canvas filter where available.
       Because the live feed is already being processed,
       aggressive convolution would be expensive on an iPhone.
    */

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
        new Uint8ClampedArray(source);


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
                    copy[index + channel];


                const top =
                    copy[
                        index -
                        (width * 4) +
                        channel
                    ];


                const bottom =
                    copy[
                        index +
                        (width * 4) +
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


                const blur =
                    (
                        top +
                        bottom +
                        left +
                        right
                    ) / 4;


                const sharpened =
                    center +
                    (
                        (center - blur) *
                        strength
                    );


                source[index + channel] =
                    clampByte(
                        sharpened
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
   OVERLAY
   ========================================================= */

function drawProcessingOverlay() {

    /*
       The HTML overlay sits over the camera canvas,
       so there is nothing to draw here for the normal
       interface.

       This function is intentionally retained because
       future capture rendering will use the same overlay
       state.
    */

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


    if (elapsed >= 1000) {

        state.fps =
            Math.round(
                (
                    state.frameCounter /
                    elapsed
                ) * 1000
            );


        state.frameCounter = 0;

        state.fpsStart =
            now;


        diagnosticFPS.textContent =
            `${state.fps} FPS`;

    }

}


/* =========================================================
   VISION MODE
   ========================================================= */

function setVisionMode(mode) {

    const validModes = [
        "normal",
        "green",
        "whitehot",
        "negative",
        "edge",
        "lowlight"
    ];


    if (!validModes.includes(mode)) {
        return;
    }


    state.currentMode =
        mode;


    modeButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );

    });


    const displayName =
        getModeDisplayName(mode);


    currentMode.textContent =
        displayName;

    overlayMode.textContent =
        displayName;


    showToast(
        `Vision mode: ${displayName}`
    );

}


function getModeDisplayName(mode) {

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
        Number(state.gamma).toFixed(1);


    sharpnessValue.textContent =
        state.sharpness;


    zoomValue.textContent =
        `${Number(state.zoom).toFixed(1)}×`;

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


    /*
       If the physical camera provides hardware zoom,
       use it in addition to the canvas zoom when possible.

       Canvas zoom remains the fallback.
    */

    if (
        state.stream &&
        state.trackCapabilities &&
        state.trackCapabilities.zoom
    ) {

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
                        zoom: physicalZoom
                    }
                ]

            });

        } catch {

            /*
               Ignore hardware zoom failures.

               Canvas zoom will continue to work.
            */

        }

    }

}


/* =========================================================
   PHOTO CAPTURE
   ========================================================= */

function capturePhoto() {

    if (!state.cameraReady) {

        showToast(
            "Start the camera first"
        );

        return;

    }


    if (
        processingCanvas.width === 0 ||
        processingCanvas.height === 0
    ) {

        showToast(
            "Camera frame is not ready"
        );

        return;

    }


    const width =
        processingCanvas.width;

    const height =
        processingCanvas.height;


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


    /*
       Copy the already-processed live frame.
    */

    captureContext.drawImage(
        processingCanvas,
        0,
        0,
        width,
        height
    );


    /*
       Add optional investigation metadata.
    */

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
   CAPTURE METADATA
   ========================================================= */

function drawCaptureMetadata(
    context,
    width,
    height
) {

    /*
       Metadata is deliberately subtle so it doesn't
       obscure evidence.
    */

    if (
        timestampToggle.checked
    ) {

        const timestamp =
            formatDateTime(
                new Date()
            );


        context.save();


        context.fillStyle =
            "rgba(0, 0, 0, 0.65)";


        context.fillRect(
            10,
            height - 38,
            170,
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
            "rgba(0, 0, 0, 0.65)";


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


    if (
        !reticleToggle.checked
    ) {

        /*
           The reticle exists only in the HTML overlay,
           so there is nothing to remove from the canvas.
        */

    }

}


/* =========================================================
   GALLERY
   ========================================================= */

function updateGallery() {

    /*
       Remove old generated gallery items.
    */

    const existing =
        captureGallery.querySelectorAll(
            ".gallery-item"
        );


    existing.forEach(item => {
        item.remove();
    });


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


            item.appendChild(image);

            item.appendChild(time);


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
   VIDEO RECORDING
   ========================================================= */

function toggleVideoRecording() {

    if (state.recording) {

        stopVideoRecording();

    } else {

        startVideoRecording();

    }

}


/* =========================================================
   START RECORDING
   ========================================================= */

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
            "Video recording is not supported by this browser."
        );

        return;

    }


    /*
       Prefer formats commonly supported by Safari/iOS,
       then fall back through alternatives.
    */

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

        const options =
            selectedMime
                ? {
                    mimeType:
                        selectedMime
                }
                : undefined;


        state.mediaRecorder =
            new MediaRecorder(
                state.stream,
                options
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
                    "MediaRecorder error:",
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
            "Recording initialization error:",
            error
        );


        showToast(
            "Unable to start recording"
        );

    }

}


/* =========================================================
   STOP RECORDING
   ========================================================= */

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


/* =========================================================
   FINISH RECORDING
   ========================================================= */

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
        state.recordingMimeType
            .includes("mp4")
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
            URL.revokeObjectURL(url);
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
   INVESTIGATION SESSION
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
   EVENT MARKING
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
   DATA EXPORT
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
   REPORT EXPORT
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
        "CURRENT CAMERA SETTINGS"
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
        "CAPTURES"
    );

    report.push(
        `Photos: ${
            state.captures.length
        }`
    );


    report.push("");


    report.push(
        "EVENTS"
    );

    report.push(
        `Marked Events: ${
            state.events.length
        }`
    );


    report.push("");


    if (
        state.events.length > 0
    ) {

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

    } else {

        report.push(
            "No events recorded."
        );

    }


    report.push(
        "================================"
    );

    report.push(
        "NIGHTflux v1"
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
   CLEAR SESSION
   ========================================================= */

function clearSession() {

    const confirmed =
        window.confirm(
            "Clear all NIGHTflux session events and captures?"
        );


    if (!confirmed) {
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

            /*
               iOS Safari fallback.
            */

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
   PERMISSION MODAL
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

        /*
           Do not destroy the camera stream.

           iOS may temporarily suspend the camera while
           the page is backgrounded.
        */

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
   UTILITY FUNCTIONS
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


function clampByte(value) {

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
            (totalSeconds % 3600) /
            60
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
                    .padStart(2, "0")
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


function csvEscape(value) {

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


/* =========================================================
   INITIAL STATE
   ========================================================= */

setVisionMode("normal");

updateControlDisplays();

updateDiagnostics();


/* =========================================================
   END NIGHTflux v1
   ========================================================= */