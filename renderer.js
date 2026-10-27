// ======================================
// PinWheel Photobox Renderer
// ======================================

async function renderPhotobox(canvas, photos, options = {}) {
    const ctx = canvas.getContext("2d");

    // Standard high-resolution canvas size (900 x 2700 photostrip)
    canvas.width = PHOTOBOX_CONFIG.canvas.width;
    canvas.height = PHOTOBOX_CONFIG.canvas.height;

    // Resolve options
    const layoutKey = options.layout || PHOTOBOX_CONFIG.activeLayout || "photostrip4";
    const layoutConfig = PHOTOBOX_CONFIG.layouts[layoutKey] || PHOTOBOX_CONFIG.layouts.photostrip4;
    const selectedFramePath = options.frameFile || "frames/frame1.svg";
    const frameObj = PHOTOBOX_CONFIG.frames.find(f => f.file === selectedFramePath) || PHOTOBOX_CONFIG.frames[0];
    const filterKey = options.filter || PHOTOBOX_CONFIG.activeFilter || "normal";
    const filterObj = PHOTOBOX_CONFIG.filters.find(f => f.id === filterKey) || PHOTOBOX_CONFIG.filters[0];
    const brandTitle = (options.customTitle || PHOTOBOX_CONFIG.brandName).toUpperCase();
    const subTitle = options.subTitle || PHOTOBOX_CONFIG.subBrand;
    const stickers = options.stickers || [];
    const dateText = options.dateText || getFormattedDate();

    // 1. CLEAR & BACKGROUND
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = frameObj.bgColor || "#121216";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. DRAW PHOTOS WITH COVER-CROP & ASPECT RATIO INTEGRITY
    const slots = layoutConfig.slots;

    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const cornerRadius = layoutConfig.cornerRadius || 16;
        // In dual strip, slots map to photoIndex (0..3 duplicated)
        const photoIndex = slot.photoIndex !== undefined ? slot.photoIndex : i;
        const photoSrc = photos[photoIndex];

        if (!photoSrc) {
            // Unpopulated slots filled with pure white
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") {
                ctx.roundRect(slot.x, slot.y, slot.width, slot.height, cornerRadius);
            } else {
                ctx.rect(slot.x, slot.y, slot.width, slot.height);
            }
            ctx.fill();
            ctx.restore();
            continue;
        }

        const img = new Image();
        img.src = photoSrc;

        const loaded = await new Promise(resolve => {
            if (img.complete && img.naturalWidth) return resolve(true);
            const timeout = setTimeout(() => resolve(false), 2500);
            img.onload = () => { clearTimeout(timeout); resolve(true); };
            img.onerror = () => { clearTimeout(timeout); resolve(false); };
        });

        if (!loaded) continue;

        // Calculate center cover-crop coordinates
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const slotRatio = slot.width / slot.height;
        let sx, sy, sw, sh;

        if (imgRatio > slotRatio) {
            // Image is wider than slot: crop sides
            sh = img.naturalHeight;
            sw = sh * slotRatio;
            sx = (img.naturalWidth - sw) / 2;
            sy = 0;
        } else {
            // Image is taller than slot: crop top/bottom
            sw = img.naturalWidth;
            sh = sw / slotRatio;
            sx = 0;
            sy = (img.naturalHeight - sh) / 2;
        }

        // Draw photo with rounded corners and filter
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
            ctx.roundRect(slot.x, slot.y, slot.width, slot.height, cornerRadius);
        } else {
            ctx.rect(slot.x, slot.y, slot.width, slot.height);
        }
        ctx.clip();

        // Apply visual filter
        if (filterObj && filterObj.canvas && filterObj.canvas !== "none") {
            ctx.filter = filterObj.canvas;
        }

        ctx.drawImage(img, sx, sy, sw, sh, slot.x, slot.y, slot.width, slot.height);
        ctx.restore();

        // Subtle inner shadow border around each photo
        ctx.save();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 2;
        if (typeof ctx.roundRect === "function") {
            ctx.beginPath();
            ctx.roundRect(slot.x, slot.y, slot.width, slot.height, cornerRadius);
            ctx.stroke();
        }
        ctx.restore();
    }

    // 3. DRAW FRAME OVERLAY (PNG/SVG)
    if (selectedFramePath) {
        const embedded = window.PHOTOBOX_FRAME_DATA && window.PHOTOBOX_FRAME_DATA[selectedFramePath];
        const frameImg = new Image();
        frameImg.src = embedded || selectedFramePath;

        const frameLoaded = await new Promise(resolve => {
            if (frameImg.complete && frameImg.naturalWidth) return resolve(true);
            const timeout = setTimeout(() => resolve(false), 2000);
            frameImg.onload = () => { clearTimeout(timeout); resolve(true); };
            frameImg.onerror = () => { clearTimeout(timeout); resolve(false); };
        });

        if (frameLoaded) {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
        }
    }

    // 4. DRAW FOOTER & BRANDING TYPOGRAPHY
    drawBrandFooter(ctx, canvas, frameObj, brandTitle, subTitle, dateText);

    // 5. DRAW STICKERS (IF ANY)
    for (const stk of stickers) {
        ctx.save();
        ctx.font = `${stk.size || 60}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
        ctx.fillText(stk.emoji, stk.x, stk.y);
        ctx.restore();
    }

    // Preview canvases copy this canvas directly; export happens on demand.
    return true;
}

function drawBrandFooter(ctx, canvas, frameObj, brandTitle, subTitle, dateText) {
    ctx.save();
    const cx = canvas.width / 2;
    const primaryColor = frameObj.textColor || "#ffffff";
    const accentColor = frameObj.accentColor || "#d4af37";

    // Footer sits below the portrait photo window
    const dividerY = canvas.height - 260;
    const titleY = canvas.height - 175;
    const subY = canvas.height - 125;

    // Decorative divider with center diamond
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 180, dividerY);
    ctx.lineTo(cx - 26, dividerY);
    ctx.moveTo(cx + 26, dividerY);
    ctx.lineTo(cx + 180, dividerY);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(cx, dividerY - 7);
    ctx.lineTo(cx + 7, dividerY);
    ctx.lineTo(cx, dividerY + 7);
    ctx.lineTo(cx - 7, dividerY);
    ctx.closePath();
    ctx.fill();

    // Brand title, auto-shrink to fit the frame width
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    let titleSize = 46;
    do {
        ctx.font = `bold ${titleSize}px Poppins, sans-serif`;
        if (ctx.measureText(brandTitle).width <= canvas.width - 180) break;
        titleSize -= 2;
    } while (titleSize > 24);

    ctx.fillStyle = primaryColor;
    ctx.fillText(brandTitle, cx, titleY);

    // Date stamp & sub brand
    ctx.font = "600 20px Poppins, sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(`${dateText}  •  ${subTitle}`, cx, subY);

    ctx.restore();
}

function getFormattedDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} [${hh}:${min}]`;
}