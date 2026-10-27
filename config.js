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
            file: "frames/frame1.svg",
            bgColor: "#b3c3d5",
            accentColor: "#b04a5f",
            textColor: "#24344d",
            tag: "Retro"
        },
        {
            id: "frame2",
            name: "Mint Daisy",
            file: "frames/frame2.svg",
            bgColor: "#d9efe2",
            accentColor: "#2f7d68",
            textColor: "#1e4d3f",
            tag: "Fresh"
        },
        {
            id: "frame3",
            name: "Butter Picnic",
            file: "frames/frame3.svg",
            bgColor: "#fff3c9",
            accentColor: "#c2410c",
            textColor: "#7c2d12",
            tag: "Cute"
        },
        {
            id: "frame4",
            name: "Lavender Cloud",
            file: "frames/frame4.svg",
            bgColor: "#efe6fb",
            accentColor: "#7c3aed",
            textColor: "#4c1d95",
            tag: "Dreamy"
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
