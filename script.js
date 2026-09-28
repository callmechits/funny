const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

const glyphs =
    "01アイウエオカキクケコサシスセソタチツテト&%^')@" +
    "0123456789ABCDEF!@#$%^&*"; //Change your characters here

let width;
let height;
let columns;
let drops;
let lengths;
let speeds;
let chars;

function randomGlyph() {
    return glyphs[Math.floor(Math.random() * glyphs.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const fontSize = Math.max(14, Math.min(22, width / 75));
    columns = Math.ceil(width / fontSize);

    drops = [];
    lengths = [];
    speeds = [];
    chars = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -height / fontSize;
        lengths[i] = randomInt(6, Math.min(25, Math.max(6, Math.floor(height / fontSize))));
        speeds[i] = 0.4 + Math.random() * 0.8;
        chars[i] = Array.from({ length: lengths[i] }, randomGlyph);
    }
}

let lastTime = 0;

function draw(time) {
    const delta = Math.min((time - lastTime) / 16.67, 2);
    lastTime = time;

    // Black translucent layer creates the fading trail.
    ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
    ctx.fillRect(0, 0, width, height);

    const fontSize = Math.max(14, Math.min(22, width / 75));
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let col = 0; col < columns; col++) {
        const x = col * fontSize + fontSize / 2;
        const head = Math.floor(drops[col]);

        for (let i = 0; i < lengths[col]; i++) {
            const row = head - i;
            if (row < 0) continue;

            const y = row * fontSize;

            if (y > height) continue;

            const fade = Math.max(0, 1 - i / lengths[col]);

            if (i === 0) {
                ctx.fillStyle = "rgb(200, 255, 200)";
                ctx.shadowColor = "#ffffff";
                ctx.shadowBlur = 8;
            } else {
                const green = Math.floor(60 + fade * 195);
                ctx.fillStyle = `rgb(0, ${green}, 0)`;
                ctx.shadowBlur = 0;
            }

            ctx.fillText(chars[col][i], x, y);
        }

        // Occasional glyph mutation for the flicker effect.
        if (Math.random() < 0.15 * delta) {
            const index = randomInt(0, lengths[col] - 1);
            chars[col][index] = randomGlyph();
        }

        drops[col] += speeds[col] * delta;

        if ((drops[col] - lengths[col]) * fontSize > height) {
            drops[col] = Math.random() * -20;
            lengths[col] = randomInt(
                5,
                Math.min(25, Math.max(6, Math.floor(height / fontSize)))
            );
            speeds[col] = 0.4 + Math.random() * 0.8;
            chars[col] = Array.from({ length: lengths[col] }, randomGlyph);
        }
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);

resize();
requestAnimationFrame(draw);
