// ======================================
// PinWheel Photobox - UI Controller
// ======================================

class UIController {
    constructor() {
        this.cameraManager = null;

        // State
        this.selectedFrame = PHOTOBOX_CONFIG.frames[0].file;
        this.selectedFilter = PHOTOBOX_CONFIG.activeFilter || "normal";
        this.selectedTimer = PHOTOBOX_CONFIG.defaultTimer || 3;
        this.photos = [];
        this.stickers = [];
        this.isMuted = false;
        this.isShooting = false;
        this.customTitle = PHOTOBOX_CONFIG.brandName;
        this._renderPending = false;
        this._renderPromise = null;
        this.isCameraReady = false;
        this._renderErrorShown = false;

        // DOM Elements
        this.dom = {
            video: document.getElementById("video"),
            cameraPreview: document.getElementById("cameraPreview"),
            slots: [
                document.getElementById("slot1"),
                document.getElementById("slot2"),
                document.getElementById("slot3"),
                document.getElementById("slot4")
            ],
            slotImgs: [
                document.getElementById("slotImg1"),
                document.getElementById("slotImg2"),
                document.getElementById("slotImg3"),
                document.getElementById("slotImg4")
            ],
            focusBadge: document.querySelector(".focus-badge"),
            frameOverlay: document.getElementById("frameOverlay"),
            countdown: document.getElementById("countdown"),
            flash: document.getElementById("flash"),
            startBtn: document.getElementById("startBtn"),
            retakeBtn: document.getElementById("retakeBtn"),
            downloadBtn: document.getElementById("downloadBtn"),
            printBtn: document.getElementById("printBtn"),
            copyBtn: document.getElementById("copyBtn"),
            mirrorBtn: document.getElementById("mirrorBtn"),
            muteBtn: document.getElementById("muteBtn"),
            cameraSelect: document.getElementById("cameraSelect"),
            timerSelect: document.getElementById("timerSelect"),
            frameList: document.getElementById("frameList"),
            filterList: document.getElementById("filterList"),
            resultCanvas: document.getElementById("resultCanvas"),
            liveResultCanvas: document.getElementById("liveResultCanvas"),
            liveResultEmpty: document.getElementById("liveResultEmpty"),
            liveResultHint: document.getElementById("liveResultHint"),
            liveDownloadBtn: document.getElementById("liveDownloadBtn"),
            resultSection: document.querySelector(".result"),
            canvas: document.getElementById("canvas"),
            shotsProgress: document.getElementById("shotsProgress"),
            photoThumbnails: document.getElementById("photoThumbnails"),
            customTitleInput: document.getElementById("customTitleInput"),
            titleGroup: document.querySelector(".studio-group.title-group"),
            stickerList: document.getElementById("stickerList"),
            clearStickersBtn: document.getElementById("clearStickersBtn"),
            toastContainer: document.getElementById("toastContainer"),
            // Sounds
            shutterSound: document.getElementById("shutterSound"),
            countSound: document.getElementById("countSound"),
            flashSound: document.getElementById("flashSound")
        };
    }

    init(cameraManager) {
        this.cameraManager = cameraManager;

        this.renderFrameList();
        this.renderFilterList();
        this.renderStickerList();
        this.populateCameraDevices();
        this.setupEventListeners();
        this.setFocusSlot(0);
        this.updateFrameOverlay();
        this.updatePreviewState();
        this.reRenderResult();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => this.reRenderResult());
        }
    }

    // ===================================
    // EVENT LISTENERS SETUP
    // ===================================
    setupEventListeners() {
        if (this.dom.startBtn) {
            this.dom.startBtn.addEventListener("click", () => this.startPhotoSession());
        }

        if (this.dom.retakeBtn) {
            this.dom.retakeBtn.addEventListener("click", () => this.resetToBooth());
        }

        if (this.dom.downloadBtn) {
            this.dom.downloadBtn.addEventListener("click", () => this.downloadResult());
        }

        if (this.dom.liveDownloadBtn) {
            this.dom.liveDownloadBtn.addEventListener("click", () => this.downloadResult());
        }

        if (this.dom.printBtn) {
            this.dom.printBtn.addEventListener("click", () => this.printResult());
        }

        if (this.dom.copyBtn) {
            this.dom.copyBtn.addEventListener("click", () => this.copyToClipboard());
        }

        if (this.dom.mirrorBtn) {
            this.dom.mirrorBtn.addEventListener("click", () => {
                const isMirrored = this.cameraManager.toggleMirror();
                this.dom.mirrorBtn.classList.toggle("active", isMirrored);
                this.showToast(isMirrored ? "Kamera di-mirror (Cermin)" : "Kamera normal (Tanpa mirror)");
            });
        }

        if (this.dom.muteBtn) {
            this.dom.muteBtn.addEventListener("click", () => {
                this.isMuted = !this.isMuted;
                this.dom.muteBtn.classList.toggle("muted", this.isMuted);
                this.dom.muteBtn.innerHTML = this.isMuted ? "🔇 Suara Mati" : "🔊 Suara Aktif";
                this.showToast(this.isMuted ? "Suara dinonaktifkan" : "Suara diaktifkan");
            });
        }

        if (this.dom.cameraSelect) {
            this.dom.cameraSelect.addEventListener("change", async (e) => {
                const deviceId = e.target.value;
                if (deviceId && this.cameraManager) {
                    const ok = await this.cameraManager.switchDevice(deviceId);
                    if (ok) this.showToast("Kamera berhasil diganti!");
                }
            });
        }

        if (this.dom.timerSelect) {
            this.dom.timerSelect.addEventListener("change", (e) => {
                this.selectedTimer = parseInt(e.target.value, 10) || 3;
                this.showToast(`Timer diatur ke ${this.selectedTimer} detik`);
            });
        }

        if (this.dom.customTitleInput) {
            this.dom.customTitleInput.addEventListener("input", (e) => {
                this.customTitle = e.target.value || PHOTOBOX_CONFIG.brandName;
                this.debounceReRender();
            });
        }

        if (this.dom.clearStickersBtn) {
            this.dom.clearStickersBtn.addEventListener("click", () => {
                this.stickers = [];
                this.reRenderResult();
                this.showToast("Semua stiker dihapus");
            });
        }

        // Keyboard shortcuts
        window.addEventListener("keydown", (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

            if (e.code === "Space" && !this.isShooting && this.photos.length === 0) {
                e.preventDefault();
                this.startPhotoSession();
            } else if (e.key === "r" || e.key === "R") {
                this.resetToBooth();
            } else if (e.key === "d" || e.key === "D") {
                if (this.photos.length > 0) this.downloadResult();
            } else if (e.key === "m" || e.key === "M") {
                if (this.dom.mirrorBtn) this.dom.mirrorBtn.click();
            }
        });
    }

    // ===================================
    // RENDER FRAME LIST
    // ===================================
    renderFrameList() {
        if (!this.dom.frameList) return;
        this.dom.frameList.innerHTML = "";

        PHOTOBOX_CONFIG.frames.forEach((frame) => {
            const card = document.createElement("div");
            card.className = "frame-card" + (frame.file === this.selectedFrame ? " active" : "");
            card.dataset.frame = frame.file;

            card.innerHTML = `
                <div class="frame-thumb" style="background-color: ${frame.bgColor}">
                    <img src="${frame.thumb || frame.file}" alt="${frame.name}" onerror="this.style.display='none'">
                    <div class="frame-tag" style="color: ${frame.accentColor}">${frame.tag || "Frame"}</div>
                </div>
                <span class="frame-name">${frame.name}</span>
            `;

            card.addEventListener("click", () => {
                this.selectedFrame = frame.file;
                document.querySelectorAll(".frame-card").forEach(c => c.classList.remove("active"));
                card.classList.add("active");
                this.updateFrameOverlay();
                this.reRenderResult();
            });

            this.dom.frameList.appendChild(card);
        });
    }

    // ===================================
    // RENDER FILTER LIST
    // ===================================
    renderFilterList() {
        if (!this.dom.filterList) return;
        this.dom.filterList.innerHTML = "";

        PHOTOBOX_CONFIG.filters.forEach(flt => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "filter-chip" + (flt.id === this.selectedFilter ? " active" : "");
            chip.dataset.filter = flt.id;
            chip.textContent = flt.name;

            chip.addEventListener("click", () => {
                this.selectedFilter = flt.id;
                document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                if (this.cameraManager) {
                    this.cameraManager.setFilter(flt.id);
                }
                this.applyFilterToSlotImages();
                this.reRenderResult();
            });

            this.dom.filterList.appendChild(chip);
        });
    }

    // ===================================
    // RENDER STICKER LIST
    // ===================================
    renderStickerList() {
        if (!this.dom.stickerList) return;
        this.dom.stickerList.innerHTML = "";

        PHOTOBOX_CONFIG.stickers.forEach(emoji => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "sticker-btn";
            btn.textContent = emoji;

            btn.addEventListener("click", () => {
                this.addRandomSticker(emoji);
            });

            this.dom.stickerList.appendChild(btn);
        });
    }

    addRandomSticker(emoji) {
        const canvasW = PHOTOBOX_CONFIG.canvas.width;
        const canvasH = PHOTOBOX_CONFIG.canvas.height;

        const x = Math.floor(100 + Math.random() * (canvasW - 200));
        // Keep stickers above the footer typography
        const y = Math.floor(120 + Math.random() * (canvasH - 520));

        this.stickers.push({
            emoji: emoji,
            x: x,
            y: y,
            size: 65
        });

        this.reRenderResult();
        this.showToast(`Stiker ${emoji} ditambahkan!`);
    }

    // ===================================
    // CAMERA DEVICES POPULATION
    // ===================================
    async populateCameraDevices() {
        if (!this.dom.cameraSelect || !this.cameraManager) return;
        const devices = await this.cameraManager.getAvailableDevices();

        this.dom.cameraSelect.innerHTML = "";
        if (devices.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.textContent = "Kamera Default / Web";
            this.dom.cameraSelect.appendChild(opt);
            return;
        }

        devices.forEach((dev, idx) => {
            const opt = document.createElement("option");
            opt.value = dev.deviceId;
            opt.textContent = dev.label || `Kamera ${idx + 1}`;
            this.dom.cameraSelect.appendChild(opt);
        });
    }

    // ===================================
    // PREVIEW & CAMERA STATE
    // ===================================
    setCameraReady(ready) {
        this.isCameraReady = ready;
        if (!this.dom.startBtn || this.isShooting) return;

        this.dom.startBtn.disabled = !ready;
        this.dom.startBtn.innerHTML = ready ? "📷 Mulai Foto (4x)" : "⏳ Menyiapkan kamera...";
    }

    updatePreviewState() {
        const count = this.photos.length;
        const total = PHOTOBOX_CONFIG.photoCount;

        if (this.dom.liveResultEmpty) {
            this.dom.liveResultEmpty.hidden = count > 0;
        }

        if (this.dom.liveDownloadBtn) {
            this.dom.liveDownloadBtn.disabled = count === 0;
        }

        if (this.dom.liveResultHint) {
            if (count === 0) {
                this.dom.liveResultHint.textContent = "Preview photostrip 4 foto — hasil muncul otomatis di sini";
            } else if (count < total) {
                this.dom.liveResultHint.textContent = `Foto ${count} dari ${total} masuk — preview diperbarui otomatis`;
            } else {
                this.dom.liveResultHint.textContent = "Photostrip siap diunduh 🎉";
            }
        }
    }

    syncPreviewCanvases() {
        const source = this.dom.canvas;
        if (!source) return;

        const copy = (canvas) => {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        };

        copy(this.dom.liveResultCanvas);
        if (this.photos.length > 0) {
            copy(this.dom.resultCanvas);
        }
    }

    clearPreviewCanvases() {
        [this.dom.liveResultCanvas, this.dom.resultCanvas].forEach((canvas) => {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    // ===================================
    // FRAME OVERLAY & FILTER HELPERS
    // ===================================
    updateFrameOverlay() {
        const frameObj = PHOTOBOX_CONFIG.frames.find(f => f.file === this.selectedFrame) || PHOTOBOX_CONFIG.frames[0];

        if (this.dom.frameOverlay) {
            const embedded = window.PHOTOBOX_FRAME_DATA && window.PHOTOBOX_FRAME_DATA[frameObj.file];
            this.dom.frameOverlay.src = embedded || frameObj.file;
        }
        if (this.dom.cameraPreview) {
            this.dom.cameraPreview.style.background = frameObj.bgColor;
        }

        const canvasW = PHOTOBOX_CONFIG.canvas.width;
        const canvasH = PHOTOBOX_CONFIG.canvas.height;
        const layout = PHOTOBOX_CONFIG.layouts[PHOTOBOX_CONFIG.activeLayout] || {};
        const usesFrameSlots = !!(frameObj.slots && frameObj.slots.length);
        const slots = usesFrameSlots ? frameObj.slots : (layout.slots || []);
        const radius = frameObj.cornerRadius ?? layout.cornerRadius ?? 0;

        this.dom.slots.forEach((el, i) => {
            const slot = slots[i];
            if (!el || !slot) return;
            el.style.left = ((slot.x / canvasW) * 100).toFixed(3) + "%";
            el.style.top = ((slot.y / canvasH) * 100).toFixed(3) + "%";
            el.style.width = ((slot.width / canvasW) * 100).toFixed(3) + "%";
            el.style.height = ((slot.height / canvasH) * 100).toFixed(3) + "%";
            // Preview is rendered at a third of the export size.
            el.style.borderRadius = usesFrameSlots ? (radius / 3) + "px" : "";
        });

        if (this.dom.titleGroup) {
            this.dom.titleGroup.style.display = frameObj.hideFooter ? "none" : "";
        }
    }

    setFocusSlot(index) {
        const slot = this.dom.slots[index];
        if (!slot) return;

        this.dom.slots.forEach((s, i) => {
            if (s) s.classList.toggle("active-focus", i === index);
        });

        if (this.dom.video) {
            slot.appendChild(this.dom.video);
        }
        if (this.dom.focusBadge) {
            slot.appendChild(this.dom.focusBadge);
        }
    }

    applyFilterToSlotImages() {
        const filterObj = PHOTOBOX_CONFIG.filters.find(f => f.id === this.selectedFilter);
        const cssFilter = filterObj && filterObj.css !== "none" ? filterObj.css : "none";
        this.dom.slotImgs.forEach(img => {
            if (img) img.style.filter = cssFilter;
        });
    }

    // ===================================
    // SHOOTING SESSION (4 FOTOS)
    // ===================================
    async startPhotoSession() {
        if (this.isShooting) return;
        if (!this.isCameraReady) {
            this.showToast("Kamera masih disiapkan, tunggu sebentar", "warn");
            return;
        }
        this.isShooting = true;
        this.photos = [];
        this.stickers = [];
        this.updatePreviewState();

        this.dom.slotImgs.forEach(img => {
            if (!img) return;
            img.src = "";
            img.style.display = "none";
        });
        if (this.dom.photoThumbnails) {
            this.dom.photoThumbnails.innerHTML = "";
        }
        if (this.dom.focusBadge) {
            this.dom.focusBadge.style.display = "";
        }

        this.dom.startBtn.disabled = true;
        this.dom.startBtn.innerHTML = "⏳ Mengambil Foto...";
        if (this.dom.retakeBtn) this.dom.retakeBtn.disabled = true;

        this.setFocusSlot(0);
        this.reRenderResult();

        try {
            for (let i = 0; i < PHOTOBOX_CONFIG.photoCount; i++) {
                this.setFocusSlot(i);
                if (this.dom.focusBadge) {
                    this.dom.focusBadge.style.display = "";
                }
                if (this.dom.shotsProgress) {
                    this.dom.shotsProgress.classList.add("active");
                    this.dom.shotsProgress.textContent = `Foto ${i + 1} dari ${PHOTOBOX_CONFIG.photoCount}`;
                }

                if (i > 0) {
                    await this.sleep(600);
                }

                await this.runCountdown(this.selectedTimer);
                await this.triggerFlash();

                const photoData = this.cameraManager.captureSnapshot();
                this.photos.push(photoData);

                const slotImg = this.dom.slotImgs[i];
                if (slotImg) {
                    slotImg.src = photoData;
                    slotImg.style.display = "block";
                    this.applyFilterToSlotImages();
                }
                if (this.dom.focusBadge) {
                    this.dom.focusBadge.style.display = "none";
                }

                this.addThumbnail(photoData, i + 1);
                this.reRenderResult();
                this.updatePreviewState();

                if (i < PHOTOBOX_CONFIG.photoCount - 1) {
                    await this.sleep(700);
                }
            }

            if (this.dom.shotsProgress) {
                this.dom.shotsProgress.textContent = "✨ Menyusun Photobox...";
            }
            await this.reRenderResult();
            this.showResultStudio();
            this.showToast("4 foto selesai! Photostrip siap ✨");
        } catch (err) {
            console.error("Error during shooting session:", err);
            this.showToast("Terjadi kendala saat mengambil foto", "error");
        } finally {
            this.isShooting = false;
            this.setCameraReady(this.isCameraReady);
            if (this.dom.retakeBtn) this.dom.retakeBtn.disabled = false;
            if (this.dom.shotsProgress) {
                this.dom.shotsProgress.classList.remove("active");
            }
            if (this.dom.focusBadge) {
                this.dom.focusBadge.style.display = "none";
            }
        }
    }

    async runCountdown(seconds) {
        return new Promise(async (resolve) => {
            for (let s = seconds; s >= 1; s--) {
                this.dom.countdown.textContent = s;
                this.dom.countdown.classList.add("show");
                this.playSound(this.dom.countSound);

                if (s === 1) {
                    // countdown.mp3 keeps beeping every second after the first
                    // tick; cut it once this tick's beep is done, otherwise a
                    // leftover beep lands on top of the flash.
                    await this.sleep(650);
                    this.stopSound(this.dom.countSound);
                    await this.sleep(250);
                } else {
                    await this.sleep(900);
                }
                this.dom.countdown.classList.remove("show");
                await this.sleep(100);
            }
            resolve();
        });
    }

    async triggerFlash() {
        return new Promise((resolve) => {
            this.playSound(this.dom.flashSound);
            this.playSound(this.dom.shutterSound);

            if (this.dom.flash) {
                this.dom.flash.classList.add("active");
                setTimeout(() => {
                    this.dom.flash.classList.remove("active");
                    resolve();
                }, 300);
            } else {
                resolve();
            }
        });
    }

    addThumbnail(dataUrl, index) {
        if (!this.dom.photoThumbnails) return;
        const thumb = document.createElement("div");
        thumb.className = "thumb-item";
        thumb.innerHTML = `
            <img src="${dataUrl}" alt="Shot ${index}">
            <span class="thumb-badge">${index}</span>
        `;
        this.dom.photoThumbnails.appendChild(thumb);
    }

    // ===================================
    // RESULT STUDIO & LIVE PREVIEW
    // ===================================
    reRenderResult() {
        if (!this.dom.canvas) return Promise.resolve();

        this._renderPending = true;
        if (!this._renderPromise) {
            this._renderPromise = this._renderLoop();
        }
        return this._renderPromise;
    }

    async _renderLoop() {
        try {
            do {
                this._renderPending = false;
                try {
                    await renderPhotobox(this.dom.canvas, this.photos, {
                        layout: PHOTOBOX_CONFIG.activeLayout,
                        frameFile: this.selectedFrame,
                        filter: this.selectedFilter,
                        customTitle: this.customTitle,
                        stickers: this.stickers
                    });

                    this.syncPreviewCanvases();
                    this._renderErrorShown = false;
                } catch (err) {
                    console.error("Gagal merender photostrip:", err);
                    if (!this._renderErrorShown) {
                        this._renderErrorShown = true;
                        this.showToast("Preview hasil gagal dirender. Coba refresh halaman.", "error");
                    }
                }
            } while (this._renderPending);
        } finally {
            this._renderPromise = null;
        }
    }

    debounceReRender() {
        clearTimeout(this._renderTimeout);
        this._renderTimeout = setTimeout(() => {
            this.reRenderResult();
        }, 300);
    }

    showResultStudio() {
        if (this.dom.resultSection) {
            this.dom.resultSection.classList.add("visible");
            this.dom.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    resetToBooth() {
        this.photos = [];
        this.stickers = [];
        this.clearPreviewCanvases();
        if (this.dom.resultSection) {
            this.dom.resultSection.classList.remove("visible");
        }
        this.dom.slotImgs.forEach(img => {
            if (!img) return;
            img.src = "";
            img.style.display = "none";
        });
        this.setFocusSlot(0);
        if (this.dom.focusBadge) {
            this.dom.focusBadge.style.display = "";
        }
        if (this.dom.photoThumbnails) {
            this.dom.photoThumbnails.innerHTML = "";
        }
        this.updatePreviewState();
        this.reRenderResult();
        window.scrollTo({ top: 0, behavior: "smooth" });
        this.showToast("Siap untuk sesi foto baru!");
    }

    // ===================================
    // EXPORT: DOWNLOAD, PRINT, COPY
    // ===================================
    async downloadResult() {
        if (!this.dom.canvas || this.photos.length === 0) {
            this.showToast("Belum ada foto untuk diunduh!", "warn");
            return;
        }
        if (this.isShooting) {
            this.showToast("Tunggu sampai sesi foto selesai ya", "warn");
            return;
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `${PHOTOBOX_CONFIG.downloadPrefix}-photostrip-${dateStr}.png`;

        try {
            // Make sure the canvas contains the latest frame, filter, and title.
            await this.reRenderResult();

            const blob = await new Promise((resolve) => {
                if (typeof this.dom.canvas.toBlob !== "function") {
                    resolve(null);
                    return;
                }
                this.dom.canvas.toBlob(resolve, "image/png");
            });

            const href = blob
                ? URL.createObjectURL(blob)
                : this.dom.canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.download = filename;
            link.href = href;
            document.body.appendChild(link);
            link.click();
            link.remove();

            if (blob) {
                setTimeout(() => URL.revokeObjectURL(href), 10000);
            }

            this.showToast("Photostrip berhasil di-download! 📸");
        } catch (err) {
            console.error("Gagal mengunduh photostrip:", err);
            this.showToast("Gagal mengunduh. Coba lagi ya.", "error");
        }
    }

    printResult() {
        if (this.photos.length === 0) {
            this.showToast("Belum ada foto untuk dicetak!", "warn");
            return;
        }
        window.print();
    }

    async copyToClipboard() {
        if (!this.dom.canvas || this.photos.length === 0) {
            this.showToast("Belum ada foto untuk disalin!", "warn");
            return;
        }

        try {
            this.dom.canvas.toBlob(async (blob) => {
                if (!blob) {
                    this.showToast("Gagal menyalin gambar", "error");
                    return;
                }
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob })
                ]);
                this.showToast("Foto berhasil disalin ke clipboard! 📋");
            }, "image/png");
        } catch (err) {
            console.error("Clipboard copy error:", err);
            this.showToast("Browser tidak mendukung salin langsung, gunakan Download", "warn");
        }
    }

    // ===================================
    // UTILITIES
    // ===================================
    playSound(audioElement) {
        if (this.isMuted || !audioElement) return;
        try {
            audioElement.currentTime = 0;
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Audio play prevented:", e));
            }
        } catch (e) {
            console.warn("Sound error:", e);
        }
    }

    stopSound(audioElement) {
        if (!audioElement) return;
        try {
            audioElement.pause();
            audioElement.currentTime = 0;
        } catch (e) {
            console.warn("Sound error:", e);
        }
    }

    showToast(message, type = "info") {
        if (!this.dom.toastContainer) return;

        const toast = document.createElement("div");
        toast.className = `toast-item toast-${type}`;
        toast.textContent = message;

        this.dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 400);
        }, 2800);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
