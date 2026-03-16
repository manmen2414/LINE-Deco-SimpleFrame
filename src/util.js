/**
 * @param {HTMLInputElement} input
 * @param {(dataUrl:string,name:string)=>void} func
 */
function onFileSelected(input, func) {
  input.onchange = function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      func(reader.result, file.name);
      input.value = "";
    };
    reader.readAsDataURL(file);
  };
}

/**
 * @param {string} sourceURL
 * @returns {Promise<number>}
 */
function getImageWidthHeight(sourceURL) {
  return new Promise((s) => {
    const img = new Image();
    img.src = sourceURL;
    img.onload = () => {
      s([img.naturalWidth, img.naturalHeight]);
    };
  });
}

/**
 * targetSizeにfromSizeが収まる最大の拡大率を計算する。
 * @param {[number,number]} targetSize
 * @param {[number,number]} fromSize
 */
function calcMagnificationRate(targetSize, fromSize) {
  const widthRate = targetSize[0] / fromSize[0];
  const heightRage = targetSize[1] / fromSize[1];
  return widthRate < heightRage ? widthRate : heightRage;
}

/**
 * blob or data URLをダウンロードする
 * @param {string} url
 * @param {string} filename
 */
function downloadUrl(url, filename) {
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = url;
  anchor.click();
}

export {
  onFileSelected,
  getImageWidthHeight,
  calcMagnificationRate,
  downloadUrl,
};
