"use strict";
const main = document.getElementById("main");
const imageEl = document.getElementById("wallpaper");
const outputContainer = document.getElementById("io");
const slider = document.getElementById("slider");
const downloadButton = (document.getElementById("download-button"));
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
let sliderIntensity = parseInt(slider.value);
downloadButton.style.display = "none";
outputContainer.style.display = "none";
function download() {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "blacked.png";
    a.click();
}
function changeGrayToBlack(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        const red = pixels.data[i];
        const green = pixels.data[i + 1];
        const blue = pixels.data[i + 2];
        if (red < sliderIntensity &&
            green < sliderIntensity &&
            blue < sliderIntensity) {
            pixels.data[i] = 0;
            pixels.data[i + 1] = 0;
            pixels.data[i + 2] = 0;
        }
    }
    return pixels;
}
function showResults(img) {
    [img.width, img.height] = [400, 400];
    outputContainer.appendChild(img);
    downloadButton.style.display = "flex";
    outputContainer.style.display = "flex";
    const img2 = new Image();
    img2.src = canvas.toDataURL();
    [img2.width, img2.height] = [400, 400];
    outputContainer.appendChild(img2);
}
function handleImageLoad(e) {
    const img = e.target;
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
    const data = context.getImageData(0, 0, img.width, img.height);
    if (window.Worker) {
        const myWorker = new Worker("worker.js");
        myWorker.postMessage([sliderIntensity, data]);
        myWorker.onmessage = function (e) {
            const pixels = e.data;
            context.putImageData(pixels, 0, 0);
            showResults(img);
        };
    }
    else {
        const pixels = changeGrayToBlack(data);
        context.putImageData(pixels, 0, 0);
        showResults(img);
    }
}
function handleReaderLoad() {
    const img = new Image();
    img.src = this.result;
    img.onload = handleImageLoad;
}
function handleImageChange() {
    outputContainer.style.display = "none";
    downloadButton.style.display = "none";
    outputContainer.innerHTML = "";
    const files = imageEl.files;
    if (!files)
        return;
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = handleReaderLoad;
}
imageEl.addEventListener("change", handleImageChange);
slider.addEventListener("change", (e) => {
    sliderIntensity = parseInt(e.target.value);
    handleImageChange();
});
