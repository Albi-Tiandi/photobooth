// ======================================
// PinWheel Photobox Configuration
// ======================================

const PHOTOBOX_CONFIG = {
    // Brand & Studio identity
    brandName: "PINWHEEL PHOTOBOX",
    subBrand: "STUDIO MEMORIES • LIFE PHOTO",

    // Jumlah foto per sesi (photostrip 4 foto)
    photoCount: 4,

    // Resolusi canvas photostrip 1:3 (cetak 2x6" 300DPI)
    canvas: {
        width: 900,
        height: 2700
    },

    // Camera settings (4:3 landscape, cocok untuk jendela foto strip)
    camera: {
        width: 1280,
        height: 960,
        facingMode: "user",
        mirrored: true
    },

    // Timer options in seconds
    timerOptions: [
        { label: "3 Detik", value: 3 },
        { label: "5 Detik", value: 5 },
        { label: "10 Detik", value: 10 }
    ],
    defaultTimer: 3,

    // Frames directory & presets (photostrip 900x2700)
    frameFolder: "frames/",
    frames: [
        {
            id: "frame1",
            name: "Denim Pink",
            file: "frames/frame1.webp",
            thumb: "frames/frame1-thumb.webp",
            bgColor: "#b7d9eb",
            accentColor: "#b04a5f",
            textColor: "#24344d",
            tag: "Retro",
            cornerRadius: 0,
            hideFooter: true,
            slots: [
                { x: 108.86, y: 168.86, width: 682.29, height: 488.57 },
                { x: 108.86, y: 738.86, width: 682.29, height: 488.57 },
                { x: 108.86, y: 1308.86, width: 682.29, height: 488.57 },
                { x: 108.86, y: 1878.86, width: 682.29, height: 488.57 }
            ]
        },
        {
            id: "frame2",
            name: "Seal & Glitter",
            file: "frames/frame2.webp",
            thumb: "frames/frame2-thumb.webp",
            bgColor: "#e2e2d8",
            accentColor: "#8c2f24",
            textColor: "#3b2a1e",
            tag: "Vintage",
            cornerRadius: 0,
            hideFooter: true,
            slots: [
                { x: 84, y: 99, width: 732, height: 526.5 },
                { x: 84, y: 679.5, width: 732, height: 526.5 },
                { x: 84, y: 1263, width: 732, height: 526.5 },
                { x: 84, y: 1845, width: 732, height: 526.5 }
            ]
        },
        {
            id: "frame3",
            name: "Blue Lace",
            file: "frames/frame3.webp",
            thumb: "frames/frame3-thumb.webp",
            bgColor: "#4d6cad",
            accentColor: "#2d4f8f",
            textColor: "#1e3a6b",
            tag: "Lace",
            cornerRadius: 0,
            hideFooter: true,
            slots: [
                { x: 144.8, y: 311.2, width: 610.4, height: 372.8 },
                { x: 144.8, y: 879.2, width: 610.4, height: 372.8 },
                { x: 144.8, y: 1446.4, width: 610.4, height: 372.8 },
                { x: 144.8, y: 2016, width: 610.4, height: 372.8 }
            ]
        },
        {
            id: "frame4",
            name: "Maroon Film",
            file: "frames/frame4.webp",
            thumb: "frames/frame4-thumb.webp",
            bgColor: "#fff9f1",
            accentColor: "#7a2b2b",
            textColor: "#4a1f1f",
            tag: "Classic",
            cornerRadius: 0,
            hideFooter: true,
            slots: [
                { x: 189, y: 201, width: 522, height: 541.5 },
                { x: 189, y: 768, width: 522, height: 541.5 },
                { x: 189, y: 1335, width: 522, height: 541.5 },
                { x: 189, y: 1900.5, width: 522, height: 541.5 }
            ]
        },
        {
            id: "frame5",
            name: "Cherry Pop",
            file: "frames/frame5.svg",
            bgColor: "#fde8ea",
            accentColor: "#be123c",
            textColor: "#881337",
            tag: "Sweet"
        },
        {
            id: "frame6",
            name: "Midnight Star",
            file: "frames/frame6.svg",
            bgColor: "#1e2a47",
            accentColor: "#fbbf24",
            textColor: "#fef3c7",
            tag: "Night"
        }
    ],

    // Layout photostrip: 4 jendela landscape bertumpuk
    layouts: {
        photostrip4: {
            id: "photostrip4",
            name: "Photostrip 4 Foto",
            photoCount: 4,
            cornerRadius: 14,
            slots: [
                { x: 60, y: 80, width: 780, height: 540 },
                { x: 60, y: 660, width: 780, height: 540 },
                { x: 60, y: 1240, width: 780, height: 540 },
                { x: 60, y: 1820, width: 780, height: 540 }
            ]
        }
    },

    activeLayout: "photostrip4",

    // Visual Filters
    filters: [
        { id: "normal", name: "Normal", css: "none", canvas: "none" },
        { id: "bw", name: "B&W Film", css: "grayscale(100%) contrast(120%)", canvas: "grayscale(100%) contrast(120%)" },
        { id: "peach", name: "K-Peach", css: "brightness(108%) contrast(105%) saturate(115%)", canvas: "brightness(108%) contrast(105%) saturate(115%)" },
        { id: "vintage", name: "Vintage", css: "sepia(40%) contrast(110%) brightness(95%)", canvas: "sepia(40%) contrast(110%) brightness(95%)" },
        { id: "cyber", name: "Cyberpunk", css: "contrast(125%) hue-rotate(190deg) saturate(140%)", canvas: "contrast(125%) hue-rotate(190deg) saturate(140%)" },
        { id: "cold", name: "Cool Film", css: "brightness(104%) contrast(108%) hue-rotate(20deg)", canvas: "brightness(104%) contrast(108%) hue-rotate(20deg)" }
    ],
    activeFilter: "normal",

    // Sticker presets for decorating final photo
    stickers: [
        "💖", "✨", "⭐", "🎀", "🌸", "👑", "🕶️", "📸", "🎂", "🥂", "🕊️", "🍀", "🔥", "✌️"
    ],

    // Sound paths
    sounds: {
        shutter: "assets/shutter.mp3",
        countdown: "assets/countdown.mp3",
        flash: "assets/flash.mp3"
    },

    // Download default filename
    downloadPrefix: "PinWheel-Photobox"
};
