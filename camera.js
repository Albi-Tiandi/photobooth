// ======================================
// PinWheel Photobox - Camera Module
// ======================================

class CameraManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.currentDeviceId = null;
        this.isMirrored = PHOTOBOX_CONFIG.camera.mirrored !== false;
        this.activeFilter = "normal";
        this.isSimulated = false;
        this.simulatedAnimId = null;

        this.applyMirrorStyle();
    }

    applyMirrorStyle() {
        if (!this.video) return;
        this.video.style.transform = this.isMirrored ? "scaleX(-1)" : "scaleX(1)";
    }

    toggleMirror(forceValue = null) {
        this.isMirrored = forceValue !== null ? forceValue : !this.isMirrored;
        this.applyMirrorStyle();
        return this.isMirrored;
    }

    setFilter(filterId) {
        this.activeFilter = filterId;
        const filterObj = PHOTOBOX_CONFIG.filters.find(f => f.id === filterId);
        if (this.video && filterObj) {
            this.video.style.filter = filterObj.css;
        }
    }

    async init() {
        try {
            await this.startStream();
            await this.getAvailableDevices();
            return { success: true, simulated: false };
        } catch (error) {
            console.warn("Kamera fisik tidak dapat diakses, beralih ke mode simulasi kamera:", error);
            this.startSimulatedCamera();
            return { success: false, simulated: true, error: error.message };
        }
    }

    async startStream(deviceId = null) {
        this.stopCurrentStream();

        const constraints = {
            audio: false,
            video: {
                width: { ideal: PHOTOBOX_CONFIG.camera.width },
                height: { ideal: PHOTOBOX_CONFIG.camera.height },
                facingMode: deviceId ? undefined : PHOTOBOX_CONFIG.camera.facingMode
            }
        };

        if (deviceId) {
            constraints.video.deviceId = { exact: deviceId };
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.currentDeviceId = deviceId;
            this.isSimulated = false;

            return this.waitForVideoReady();
        } catch (err) {
            throw err;
        }
    }

    // Never block the whole app on a metadata event that may have already fired.
    waitForVideoReady(timeoutMs = 5000) {
        const video = this.video;
        if (!video) return Promise.resolve(false);

        const play = () => video.play().catch(e => console.warn("Video play interrupted:", e));

        if (video.readyState >= 1) {
            play();
            return Promise.resolve(true);
        }

        return new Promise((resolve) => {
            let settled = false;

            const finish = (ready) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                video.removeEventListener("loadedmetadata", onReady);
                video.removeEventListener("loadeddata", onReady);
                if (ready) play();
                resolve(ready);
            };

            const onReady = () => finish(true);
            const timer = setTimeout(() => finish(false), timeoutMs);

            video.addEventListener("loadedmetadata", onReady);
            video.addEventListener("loadeddata", onReady);
        });
    }

    stopCurrentStream() {
        if (this.simulatedAnimId) {
            cancelAnimationFrame(this.simulatedAnimId);
            this.simulatedAnimId = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    async getAvailableDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return [];
        }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(d => d.kind === "videoinput");
        } catch (err) {
            console.warn("Gagal membaca daftar device kamera:", err);
            return [];
        }
    }

    async switchDevice(deviceId) {
        if (this.isSimulated) return false;
        try {
            await this.startStream(deviceId);
            return true;
        } catch (err) {
            console.error("Gagal mengganti kamera:", err);
            return false;
        }
    }

    // Mode simulasi jika user tidak memiliki webcam atau izin kamera ditolak
    startSimulatedCamera() {
        this.isSimulated = true;
        const simCanvas = document.createElement("canvas");
        simCanvas.width = 1280;
        simCanvas.height = 960;
        const ctx = simCanvas.getContext("2d");

        let angle = 0;
        const drawSimulation = () => {
            angle += 0.02;

            // Gradient background
            const grad = ctx.createLinearGradient(0, 0, simCanvas.width, simCanvas.height);
            grad.addColorStop(0, "#1e1b4b");
            grad.addColorStop(0.5, "#312e81");
            grad.addColorStop(1, "#0f172a");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, simCanvas.width, simCanvas.height);

            // Floating decorative circle
            ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
            ctx.beginPath();
            ctx.arc(640 + Math.sin(angle) * 110, 420 + Math.cos(angle * 1.5) * 45, 220, 0, Math.PI * 2);
            ctx.fill();

            // Twinkling studio lights
            ctx.fillStyle = "rgba(254, 243, 199, 0.85)";
            [[250, 180], [1050, 230], [340, 760], [980, 700]].forEach(([x, y], i) => {
                const twinkle = 3 + Math.sin(angle * 2 + i) * 2;
                ctx.beginPath();
                ctx.arc(x, y, twinkle, 0, Math.PI * 2);
                ctx.fill();
            });

            // Stylized photobooth avatar in landscape 4:3
            const headY = 420 + Math.sin(angle * 2) * 8;

            // Neck
            ctx.fillStyle = "#c7d2fe";
            ctx.beginPath();
            ctx.ellipse(640, 610, 45, 95, 0, 0, Math.PI * 2);
            ctx.fill();

            // Shoulders & Body
            ctx.fillStyle = "#818cf8";
            ctx.beginPath();
            ctx.ellipse(640, 880, 300, 200, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = "#e0e7ff";
            ctx.beginPath();
            ctx.arc(640, headY, 150, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            ctx.arc(590, headY - 18, 14, 0, Math.PI * 2);
            ctx.arc(690, headY - 18, 14, 0, Math.PI * 2);
            ctx.fill();

            // Cheerful Smile
            ctx.strokeStyle = "#1e1b4b";
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.arc(640, headY + 25, 66, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();

            // Blush on cheeks
            ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
            ctx.beginPath();
            ctx.arc(548, headY + 40, 24, 0, Math.PI * 2);
            ctx.arc(732, headY + 40, 24, 0, Math.PI * 2);
            ctx.fill();

            this.simulatedAnimId = requestAnimationFrame(drawSimulation);
        };

        drawSimulation();

        // Convert canvas stream to video
        try {
            this.stream = simCanvas.captureStream(30);
            this.video.srcObject = this.stream;
            this.video.play().catch(e => console.warn(e));
        } catch (e) {
            console.warn("Simulated captureStream unsupported:", e);
        }
    }

    // Ambil 1 foto snapshot dalam resolusi tinggi dengan center-crop & mirror handling
    captureSnapshot() {
        const v = this.video;
        const vw = v.videoWidth || 1280;
        const vh = v.videoHeight || 960;

        const snapCanvas = document.createElement("canvas");
        snapCanvas.width = vw;
        snapCanvas.height = vh;
        const snapCtx = snapCanvas.getContext("2d");

        // Apply mirror if enabled
        if (this.isMirrored) {
            snapCtx.translate(vw, 0);
            snapCtx.scale(-1, 1);
        }

        // Draw current video frame
        snapCtx.drawImage(v, 0, 0, vw, vh);

        return snapCanvas.toDataURL("image/png");
    }
}
