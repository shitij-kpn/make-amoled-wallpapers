const main = <HTMLDivElement>document.getElementById("main");
const imageEl = <HTMLInputElement>document.getElementById("wallpaper");
const outputContainer = <HTMLDivElement>document.getElementById("io");
const slider = <HTMLInputElement>document.getElementById("slider");
const downloadButton = <HTMLButtonElement>(
  document.getElementById("download-button")
);

const canvas = document.createElement("canvas");
const context = <CanvasRenderingContext2D>canvas.getContext("2d");

let sliderIntensity = parseInt(slider.value);
downloadButton.style.display = "none";
outputContainer.style.display = "none";

function download() {
  const a = document.createElement("a");
  a.href = canvas.toDataURL();
  a.download = "blacked.png";
  a.click();
}

// changes rgb values from (..,..,..) to (0,0,0)
function changeGrayToBlack(pixels: ImageData) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    const red = pixels.data[i];
    const green = pixels.data[i + 1];
    const blue = pixels.data[i + 2];
    if (
      red < sliderIntensity &&
      green < sliderIntensity &&
      blue < sliderIntensity
    ) {
      pixels.data[i] = 0;
      pixels.data[i + 1] = 0;
      pixels.data[i + 2] = 0;
    }
  }
  return pixels;
}

function showResults(img: HTMLImageElement) {
  [img.width, img.height] = [400, 400]; // for display purposes, actual resolution remains same
  outputContainer.appendChild(img);

  downloadButton.style.display = "flex";
  outputContainer.style.display = "flex";

  const img2 = new Image();
  img2.src = canvas.toDataURL();
  [img2.width, img2.height] = [400, 400];
  outputContainer.appendChild(img2);
}

function handleImageLoad(e: Event) {
  const img = <HTMLImageElement>e.target;
  // resize canvas and draw image on it. NOT displayed on dom
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);

  // get image data and change pixel values
  const data = context.getImageData(0, 0, img.width, img.height);
  if (window.Worker) {
    const myWorker = new Worker("worker.js");
    myWorker.postMessage([sliderIntensity, data]);

    myWorker.onmessage = function (e) {
      const pixels = e.data;
      context.putImageData(pixels, 0, 0);

      //display before and after on DOM
      showResults(img);
    };
  } else {
    const pixels = changeGrayToBlack(data);
    context.putImageData(pixels, 0, 0);
    showResults(img);
  }
}

function handleReaderLoad(this: FileReader) {
  const img = new Image();
  img.src = <string>this.result;
  img.onload = handleImageLoad;
}

function handleImageChange() {
  outputContainer.style.display = "none";
  downloadButton.style.display = "none";
  outputContainer.innerHTML = "";
  const files = imageEl.files;
  if (!files) return; //files can be null
  const reader = new FileReader();
  reader.readAsDataURL(files[0]);
  reader.onload = handleReaderLoad;
}

imageEl.addEventListener("change", handleImageChange);
slider.addEventListener("change", (e) => {
  sliderIntensity = parseInt((e.target as HTMLInputElement).value);
  handleImageChange();
});
