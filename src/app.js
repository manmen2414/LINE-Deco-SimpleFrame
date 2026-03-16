import CropperCanvas from "@cropper/element-canvas";
import CropperImage from "@cropper/element-image";
import CropperHandle from "@cropper/element-handle";
import CropperSelection from "@cropper/element-selection";

import {
  calcMagnificationRate,
  downloadUrl,
  getImageWidthHeight,
  onFileSelected,
} from "./util";

/**
 * @param {boolean} isRotated
 */
function getConstRatio(isRotated) {
  return isRotated ? [2, 5] : [5, 2];
}

function initUploader() {
  /**@type {HTMLButtonElement?} */
  const btn = document.querySelector("button#upload-image");
  if (!btn) throw new Error("Upload btn not loaded");
  /**@type {HTMLInputElement?} */
  const input = document.querySelector("input#uploader");
  if (!input) throw new Error("Upload btn not loaded");
  btn.onclick = () => input.click();
  return input;
}

/**
 * @param {[number,number]} imageWidthHeight
 * @param {[number,number]} ratio
 */
function calcCanvasWidthHeight([imgWidth, imgHeight], ratio) {
  const baseWidthRatio = imgWidth / ratio[0];
  const baseHeightRatio = imgHeight / ratio[1];
  // どちらか比率が想定より大きい方にそろえながら比を一定にする
  const isWidthBigger = baseWidthRatio > baseHeightRatio;
  const width = isWidthBigger ? imgWidth : baseHeightRatio * ratio[0];
  const height = isWidthBigger ? baseWidthRatio * ratio[1] : imgHeight;
  return [width, height];
}

/**
 * @param {[number,number]} imageSize
 * @param {boolean} isRotated
 */
function getCanvasSize(imageSize, isRotated) {
  const editorWrapper = document.querySelector("#canvas-wrapper");
  if (!editorWrapper) throw new Error("canvas wrapper element not found");
  const imgElemWidth = editorWrapper.clientWidth;
  const canvasIdealSize = calcCanvasWidthHeight(
    imageSize,
    getConstRatio(isRotated),
  );
  const magnificationRate = calcMagnificationRate(
    isRotated ? [500, imgElemWidth] : [imgElemWidth, 500],
    canvasIdealSize,
  );
  const canvasWidth = canvasIdealSize[0] * magnificationRate;
  const canvasHeight = canvasIdealSize[1] * magnificationRate;
  return [canvasWidth, canvasHeight];
}

let defined = false;
function initDefines() {
  CropperCanvas.$define();
  CropperImage.$define();
  CropperHandle.$define();
  CropperSelection.$define();
  defined = true;
}

/**
 * @param {string} url
 * @param {boolean} isRotated
 */
async function editor(url, isRotated) {
  const ratio = getConstRatio(isRotated);
  const imageSize = await getImageWidthHeight(url);
  const [canvasWidth, canvasHeight] = getCanvasSize(imageSize, isRotated);
  /**@type {HTMLImageElement?} */
  const editorImage = document.querySelector("#editor-image");
  if (!editorImage) throw new Error("editor image element not found");
  editorImage.setAttribute("src", url);

  /**@type {CropperCanvas?} */
  const cropperCanvas = document.querySelector("cropper-canvas");
  if (!editorImage) throw new Error("<cropper-canvas> not found");
  cropperCanvas.style.width = `${canvasWidth}px`;
  cropperCanvas.style.height = `${canvasHeight}px`;

  /**@type {CropperSelection?} */
  const cropperSelection = document.querySelector("cropper-selection");
  if (!cropperSelection) throw new Error("<cropper-selection> not found");
  if (!!cropperSelection.$reset) {
    cropperSelection.$reset();
  }
  cropperSelection.setAttribute("aspect-ratio", `${ratio[0] / ratio[1]}`);
  cropperSelection.setAttribute("width", `${canvasWidth}`);
  if (!!cropperSelection.$moveTo) {
    cropperSelection.$moveTo(0, 0);
  }

  /**@type {CropperImage?} */
  const cropperImage = document.querySelector("cropper-selection");
  if (!cropperImage) throw new Error("<cropper-selection> not found");
  if (!!cropperImage.$center) {
    cropperImage.$center();
  }

  if (!defined) initDefines();
}

/**
 * @param {string} baseName
 */
async function save(baseName = null) {
  /**@type {CropperSelection?} */
  const cropperSelection = document.querySelector("cropper-selection");
  if (!cropperSelection) throw new Error("<cropper-selection> not found");
  if (!cropperSelection.$toCanvas)
    throw new Error("cropper-selection cannot convert to normal canvas");
  const canvas = await cropperSelection.$toCanvas();
  canvas.toBlob((blob) => {
    if (!blob) throw new Error("Cannot save from canvas");
    const objUrl = URL.createObjectURL(blob);
    downloadUrl(
      objUrl,
      !baseName
        ? "deco.png"
        : `deco-${baseName.split(".").slice(0, -1).join(".")}.png`,
    );
  }, "image/png");
}

export default function app() {
  const input = initUploader();
  onFileSelected(input, (url, name) => {
    let isRotated = false;
    editor(url, isRotated);
    /**@type {HTMLButtonElement?} */
    const rotateBtn = document.querySelector("#rotate-btn");
    if (!rotateBtn) throw new Error("Rotate btn not found");
    rotateBtn.onclick = () => {
      isRotated = !isRotated;
      editor(url, isRotated);
    };
    /**@type {HTMLButtonElement?} */
    const saveBtn = document.querySelector("#save-btn");
    if (!saveBtn) throw new Error("Save btn not found");
    saveBtn.className = "";
    saveBtn.onclick = () => {
      save(name);
    };
  });
}
