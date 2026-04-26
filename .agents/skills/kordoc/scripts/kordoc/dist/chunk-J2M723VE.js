#!/usr/bin/env node

// src/detect.ts
import JSZip from "jszip";
function magicBytes(buffer) {
  return new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
}
function isZipFile(buffer) {
  const b = magicBytes(buffer);
  return b[0] === 80 && b[1] === 75 && b[2] === 3 && b[3] === 4;
}
function isHwpxFile(buffer) {
  return isZipFile(buffer);
}
function isOldHwpFile(buffer) {
  const b = magicBytes(buffer);
  return b[0] === 208 && b[1] === 207 && b[2] === 17 && b[3] === 224;
}
function isPdfFile(buffer) {
  const b = magicBytes(buffer);
  return b[0] === 37 && b[1] === 80 && b[2] === 68 && b[3] === 70;
}
function isHwpmlFile(buffer) {
  const bytes = new Uint8Array(buffer, 0, Math.min(512, buffer.byteLength));
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/^\uFEFF/, "");
  return head.trimStart().startsWith("<?xml") && head.includes("<HWPML");
}
function detectFormat(buffer) {
  if (buffer.byteLength < 4) return "unknown";
  if (isZipFile(buffer)) return "hwpx";
  if (isOldHwpFile(buffer)) return "hwp";
  if (isPdfFile(buffer)) return "pdf";
  if (isHwpmlFile(buffer)) return "hwpml";
  return "unknown";
}
async function detectZipFormat(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer);
    if (zip.file("xl/workbook.xml")) return "xlsx";
    if (zip.file("word/document.xml")) return "docx";
    if (zip.file("Contents/content.hpf") || zip.file("mimetype")) return "hwpx";
    const hasSection = Object.keys(zip.files).some((f) => f.startsWith("Contents/"));
    if (hasSection) return "hwpx";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export {
  isZipFile,
  isHwpxFile,
  isOldHwpFile,
  isPdfFile,
  isHwpmlFile,
  detectFormat,
  detectZipFormat
};
//# sourceMappingURL=chunk-J2M723VE.js.map