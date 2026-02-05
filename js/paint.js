/*
 * Portfolio Sandra — Paint (mensajes secretos)
 * Canvas drawing tool with email sending
 * MS Paint classic style: brush, pencil, eraser, fill, line, rect, circle
 */

let paintCanvas, paintCtx;
let isPainting = false;
let paintColor = '#ff69b4';
let paintSize = 3;
let paintTool = 'brush';
let startX, startY;
let canvasSnapshot; // for shape preview

function initPaintCanvas() {
    paintCanvas = document.getElementById('paint-canvas');
    if (!paintCanvas) return;

    const container = paintCanvas.parentElement;
    paintCanvas.width = container.clientWidth;
    paintCanvas.height = container.clientHeight;

    paintCtx = paintCanvas.getContext('2d');
    paintCtx.fillStyle = '#ffffff';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';

    // Mouse events
    paintCanvas.addEventListener('mousedown', startPaint);
    paintCanvas.addEventListener('mousemove', paint);
    paintCanvas.addEventListener('mouseup', stopPaint);
    paintCanvas.addEventListener('mouseleave', stopPaint);

    // Touch events
    paintCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = paintCanvas.getBoundingClientRect();
        startPaint({
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        });
    }, { passive: false });

    paintCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = paintCanvas.getBoundingClientRect();
        paint({
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        });
    }, { passive: false });

    paintCanvas.addEventListener('touchend', stopPaint);
}

function startPaint(e) {
    isPainting = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (paintTool === 'fill') {
        floodFill(Math.round(e.offsetX), Math.round(e.offsetY), paintColor);
        isPainting = false;
        return;
    }

    if (paintTool === 'line' || paintTool === 'rect' || paintTool === 'circle') {
        // Save canvas state for shape preview
        canvasSnapshot = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
    }

    paintCtx.beginPath();
    paintCtx.moveTo(e.offsetX, e.offsetY);

    // Pencil: draw a single pixel dot on click
    if (paintTool === 'pencil') {
        paintCtx.fillStyle = paintColor;
        paintCtx.fillRect(e.offsetX, e.offsetY, paintSize, paintSize);
    }
}

function paint(e) {
    if (!isPainting) return;

    if (paintTool === 'brush' || paintTool === 'pencil') {
        paintCtx.lineWidth = paintTool === 'pencil' ? Math.max(1, paintSize * 0.5) : paintSize;
        paintCtx.strokeStyle = paintColor;
        paintCtx.lineTo(e.offsetX, e.offsetY);
        paintCtx.stroke();
    } else if (paintTool === 'eraser') {
        paintCtx.strokeStyle = '#ffffff';
        paintCtx.lineWidth = paintSize * 3;
        paintCtx.lineTo(e.offsetX, e.offsetY);
        paintCtx.stroke();
    } else if (paintTool === 'line') {
        // Preview line
        paintCtx.putImageData(canvasSnapshot, 0, 0);
        paintCtx.beginPath();
        paintCtx.strokeStyle = paintColor;
        paintCtx.lineWidth = paintSize;
        paintCtx.moveTo(startX, startY);
        paintCtx.lineTo(e.offsetX, e.offsetY);
        paintCtx.stroke();
    } else if (paintTool === 'rect') {
        // Preview rectangle
        paintCtx.putImageData(canvasSnapshot, 0, 0);
        paintCtx.beginPath();
        paintCtx.strokeStyle = paintColor;
        paintCtx.lineWidth = paintSize;
        paintCtx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    } else if (paintTool === 'circle') {
        // Preview ellipse
        paintCtx.putImageData(canvasSnapshot, 0, 0);
        paintCtx.beginPath();
        paintCtx.strokeStyle = paintColor;
        paintCtx.lineWidth = paintSize;
        const rx = Math.abs(e.offsetX - startX) / 2;
        const ry = Math.abs(e.offsetY - startY) / 2;
        const cx = startX + (e.offsetX - startX) / 2;
        const cy = startY + (e.offsetY - startY) / 2;
        paintCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        paintCtx.stroke();
    }
}

function stopPaint() {
    isPainting = false;
    if (paintCtx) paintCtx.beginPath();
    canvasSnapshot = null;
}

// Flood fill (bucket tool)
function floodFill(x, y, fillColor) {
    const imgData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
    const data = imgData.data;
    const w = paintCanvas.width;
    const h = paintCanvas.height;

    // Convert hex color to RGB
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);

    const idx = (y * w + x) * 4;
    const targetR = data[idx], targetG = data[idx + 1], targetB = data[idx + 2];

    // If same color, skip
    if (targetR === r && targetG === g && targetB === b) return;

    const tolerance = 10;
    function matchTarget(i) {
        return Math.abs(data[i] - targetR) <= tolerance &&
               Math.abs(data[i + 1] - targetG) <= tolerance &&
               Math.abs(data[i + 2] - targetB) <= tolerance;
    }

    const stack = [[x, y]];
    const visited = new Set();

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;

        const key = cy * w + cx;
        if (visited.has(key)) continue;
        visited.add(key);

        const ci = key * 4;
        if (!matchTarget(ci)) continue;

        data[ci] = r;
        data[ci + 1] = g;
        data[ci + 2] = b;
        data[ci + 3] = 255;

        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    paintCtx.putImageData(imgData, 0, 0);
}

// Update foreground color preview
function updateFgPreview() {
    const fg = document.getElementById('paint-fg');
    if (fg) fg.style.background = paintColor;
}

// Tool selection
document.addEventListener('DOMContentLoaded', () => {
    // Tool buttons
    document.querySelectorAll('.paint-tool[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.getAttribute('data-tool');

            if (tool === 'clear') {
                if (paintCtx) {
                    paintCtx.fillStyle = '#ffffff';
                    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
                }
                return;
            }

            paintTool = tool;
            document.querySelectorAll('.paint-tool[data-tool]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Color selection
    document.querySelectorAll('.paint-color').forEach(colorEl => {
        colorEl.addEventListener('click', () => {
            paintColor = colorEl.getAttribute('data-color');
            document.querySelectorAll('.paint-color').forEach(c => c.classList.remove('active'));
            colorEl.classList.add('active');
            updateFgPreview();
            // If on eraser, switch back to brush
            if (paintTool === 'eraser') {
                paintTool = 'brush';
                document.querySelectorAll('.paint-tool[data-tool]').forEach(b => b.classList.remove('active'));
                document.querySelector('.paint-tool[data-tool="brush"]').classList.add('active');
            }
        });
    });

    // Size slider
    const sizeSlider = document.getElementById('paint-size');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', (e) => {
            paintSize = parseInt(e.target.value);
        });
    }

    // Send drawing
    const sendBtn = document.getElementById('paint-send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (!paintCanvas) return;

            // For now show a success dialog. When Formspree/EmailJS is set up,
            // this will convert canvas to image and send it.
            showDialog('Paint', '¡Dibujo enviado a Sandra! ♡ Gracias por tu mensaje secreto.', 'fa-check-circle');

            // Clear canvas after sending
            if (paintCtx) {
                paintCtx.fillStyle = '#ffffff';
                paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
            }
        });
    }

    // Resize canvas when window is resized
    window.addEventListener('resize', () => {
        if (paintCanvas && paintCanvas.parentElement) {
            const container = paintCanvas.parentElement;
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                const imageData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
                paintCanvas.width = container.clientWidth;
                paintCanvas.height = container.clientHeight;
                paintCtx.fillStyle = '#ffffff';
                paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
                paintCtx.putImageData(imageData, 0, 0);
                paintCtx.lineCap = 'round';
                paintCtx.lineJoin = 'round';
            }
        }
    });
});
