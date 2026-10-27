// ======================================
// PinWheel Photobox - Main Application
// ======================================

document.addEventListener("DOMContentLoaded", async () => {
    const videoEl = document.getElementById("video");

    // Initialize Camera Manager
    const cameraManager = new CameraManager(videoEl);

    // Initialize UI Controller
    const ui = new UIController();

    // Expose instances for developer inspection
    window.PinWheelPhotobox = {
        camera: cameraManager,
        ui: ui,
        config: PHOTOBOX_CONFIG
    };

    // Render the booth UI first so the frame and live preview always appear,
    // even while the browser is still waiting for camera permission/metadata.
    ui.init(cameraManager);
    ui.setCameraReady(false);

    try {
        const camStatus = await cameraManager.init();

        // Device labels are only available after permission is granted.
        ui.populateCameraDevices();
        ui.setCameraReady(true);

        if (camStatus.simulated) {
            ui.showToast("Menggunakan mode simulasi kamera", "info");
        } else {
            ui.showToast("Kamera siap! Silakan pilih frame & mulai foto", "info");
        }
    } catch (err) {
        console.error("Gagal menyiapkan kamera:", err);
        ui.setCameraReady(true);
        ui.showToast("Kamera bermasalah — coba refresh halaman", "error");
    }
});
