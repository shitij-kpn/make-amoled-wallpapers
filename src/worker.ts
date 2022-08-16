onmessage = function (this: Window, e: MessageEvent) {
  console.log("worker message received");
  const sliderIntensity = e.data[0];
  const pixels = e.data[1];
  for (let i = 0; i < pixels.data.length; i += 4) {
    const red = pixels.data[i];
    const green = pixels.data[i + 1];
    const blue = pixels.data[i + 2];
    if (
      red <= sliderIntensity &&
      green <= sliderIntensity &&
      blue <= sliderIntensity
    ) {
      pixels.data[i] = 0;
      pixels.data[i + 1] = 0;
      pixels.data[i + 2] = 0;
    }
  }
  postMessage(pixels);
};
