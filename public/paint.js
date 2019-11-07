//// CANVAS ////
(function() {
    const paintCanvas = document.querySelector(".js-paint");
    const canvas = document.getElementById("canvas");
    const context = paintCanvas.getContext("2d");
    const sig = document.getElementById("sig");
    context.lineCap = "round";

    let x = 0,
        y = 0;
    let isMouseDown = false;

    const stopDrawing = () => {
        isMouseDown = false;
    };
    const startDrawing = event => {
        isMouseDown = true;
        [x, y] = [event.offsetX, event.offsetY];
    };
    const drawLine = event => {
        if (isMouseDown) {
            const newX = event.offsetX;
            const newY = event.offsetY;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(newX, newY);
            context.stroke();
            [x, y] = [newX, newY];
            var dataURL = canvas.toDataURL();
            sig.value = dataURL;
            console.log(sig.value);
        }
    };

    paintCanvas.addEventListener("mousedown", startDrawing);
    paintCanvas.addEventListener("mousemove", drawLine);
    paintCanvas.addEventListener("mouseup", () => {
        stopDrawing();
    });
    paintCanvas.addEventListener("mouseout", stopDrawing);
})();
