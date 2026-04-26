"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

















var _chunkJ3FHRU5Tcjs = require('./chunk-J3FHRU5T.cjs');


var _chunkMUOQXDZ4cjs = require('./chunk-MUOQXDZ4.cjs');

// src/index.ts
var _promises = require('fs/promises');

// src/detect.ts
var _jszip = require('jszip'); var _jszip2 = _interopRequireDefault(_jszip);
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
    const zip = await _jszip2.default.loadAsync(buffer);
    if (zip.file("xl/workbook.xml")) return "xlsx";
    if (zip.file("word/document.xml")) return "docx";
    if (zip.file("Contents/content.hpf") || zip.file("mimetype")) return "hwpx";
    const hasSection = Object.keys(zip.files).some((f) => f.startsWith("Contents/"));
    if (hasSection) return "hwpx";
    return "unknown";
  } catch (e3) {
    return "unknown";
  }
}

// src/hwpx/parser.ts

var _zlib = require('zlib');
var _xmldom = require('@xmldom/xmldom');

// src/hwpx/com-fallback.ts
var _child_process = require('child_process');
var _os = require('os');
function isComFallbackAvailable() {
  return _os.platform.call(void 0, ) === "win32";
}
function isEncryptedHwpx(manifestXml) {
  return manifestXml.includes("encryption-data");
}
function extractTextViaCom(filePath) {
  if (!isComFallbackAvailable()) {
    throw new Error("COM fallback\uC740 Windows\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4");
  }
  const escaped = filePath.replace(/'/g, "''");
  const ps1 = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

$src = '${escaped}'
$tmpDir = Join-Path $env:TEMP ('hwp-com-' + [guid]::NewGuid().ToString('N'))
[void](New-Item -ItemType Directory -Path $tmpDir -Force)
$tmpFile = Join-Path $tmpDir (Split-Path $src -Leaf)
Copy-Item -LiteralPath $src -Destination $tmpFile -Force

try {
  $hwp = New-Object -ComObject HWPFrame.HwpObject
  $hwp.RegisterModule('FilePathCheckerModule', 'FilePathCheckerModuleExample') | Out-Null
  $hwp.Open($tmpFile, '', '') | Out-Null
  $pc = $hwp.PageCount
  $result = @{ pageCount = $pc; pages = @() }
  for ($p = 1; $p -le $pc; $p++) {
    $t = $hwp.GetPageText($p, 0)
    $result.pages += @($t)
  }
  $hwp.Clear(1) | Out-Null
  try { $hwp.Quit() | Out-Null } catch { }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($hwp) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
  $result | ConvertTo-Json -Depth 3 -Compress
} catch {
  @{ error = $_.Exception.Message } | ConvertTo-Json -Compress
} finally {
  # \uC784\uC2DC \uD30C\uC77C \uC815\uB9AC + \uC880\uBE44 Hwp.exe \uBC29\uC9C0\uC6A9 garbage collect
  try { Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue } catch { }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
`;
  const stdout = _child_process.execFileSync.call(void 0, "powershell", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    ps1
  ], {
    encoding: "utf-8",
    timeout: 12e4,
    // 2분 타임아웃
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024
    // 50MB
  });
  const trimmed = stdout.trim();
  const jsonStart = trimmed.indexOf("{");
  if (jsonStart < 0) throw new Error(`COM \uCD9C\uB825\uC5D0 JSON\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: ${trimmed.slice(0, 200)}`);
  const json = JSON.parse(trimmed.slice(jsonStart));
  if (json.error) {
    throw new Error(`COM \uD14D\uC2A4\uD2B8 \uCD94\uCD9C \uC2E4\uD328: ${json.error}`);
  }
  const warnings = [];
  const pages = Array.isArray(json.pages) ? json.pages : [];
  const pageCount = _nullishCoalesce(json.pageCount, () => ( pages.length));
  if (pages.length === 0) {
    warnings.push({ message: "COM\uC73C\uB85C \uD14D\uC2A4\uD2B8\uB97C \uCD94\uCD9C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4", code: "COM_EMPTY" });
  }
  return { pages, pageCount, warnings };
}
function comResultToParseResult(pages, pageCount, warnings) {
  const blocks = [];
  const lines = [];
  for (let i = 0; i < pages.length; i++) {
    const text = (_nullishCoalesce(pages[i], () => ( ""))).trim();
    if (!text) continue;
    const paragraphs = text.split(/\n/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      blocks.push({ type: "paragraph", text: trimmed, pageNumber: i + 1 });
      lines.push(trimmed);
    }
  }
  const markdown = lines.join("\n\n");
  const metadata = { pageCount };
  warnings.push({
    message: "DRM \uBB38\uC11C: \uD55C\uCEF4 COM API\uB85C \uD14D\uC2A4\uD2B8 \uCD94\uCD9C (\uC11C\uC2DD/\uD45C \uC815\uBCF4 \uC81C\uD55C\uC801)",
    code: "DRM_COM_FALLBACK"
  });
  return {
    markdown,
    blocks,
    metadata,
    warnings: warnings.length > 0 ? warnings : void 0
  };
}

// src/hwpx/equation.ts
var CONVERT_MAP = {
  TIMES: "\\times",
  times: "\\times",
  LEFT: "\\left",
  RIGHT: "\\right",
  under: "\\underline",
  SMALLSUM: "\\sum",
  sum: "\\sum",
  SMALLPROD: "\\prod",
  prod: "\\prod",
  SMALLINTER: "\\cap",
  CUP: "\\cup",
  OPLUS: "\\oplus",
  OMINUS: "\\ominus",
  OTIMES: "\\otimes",
  ODIV: "\\oslash",
  ODOT: "\\odot",
  LOR: "\\lor",
  LAND: "\\land",
  SUBSET: "\\subset",
  SUPERSET: "\\supset",
  SUBSETEQ: "\\subseteq",
  SUPSETEQ: "\\supseteq",
  IN: "\\in",
  OWNS: "\\owns",
  NOTIN: "\\notin",
  LEQ: "\\leq",
  GEQ: "\\geq",
  "<<": "\\ll",
  ">>": "\\gg",
  "<<<": "\\lll",
  ">>>": "\\ggg",
  PREC: "\\prec",
  SUCC: "\\succ",
  UPLUS: "\\uplus",
  "\xB1": "\\pm",
  "-+": "\\mp",
  "\xF7": "\\div",
  CIRC: "\\circ",
  BULLET: "\\bullet",
  DEG: " ^\\circ",
  AST: "\\ast",
  STAR: "\\bigstar",
  BIGCIRC: "\\bigcirc",
  EMPTYSET: "\\emptyset",
  THEREFORE: "\\therefore",
  BECAUSE: "\\because",
  EXIST: "\\exists",
  "!=": "\\neq",
  SMCOPROD: "\\coprod",
  coprod: "\\coprod",
  SQCAP: "\\sqcap",
  SQCUP: "\\sqcup",
  SQSUBSET: "\\sqsubset",
  SQSUBSETEQ: "\\sqsubseteq",
  BIGSQCUP: "\\bigsqcup",
  BIGOPLUS: "\\bigoplus",
  BIGOTIMES: "\\bigotimes",
  BIGODOT: "\\bigodot",
  BIGUPLUS: "\\biguplus",
  inter: "\\bigcap",
  union: "\\bigcup",
  BIGOMINUS: "{\\Large\\ominus}",
  BIGODIV: "{\\Large\\oslash}",
  UNDEROVER: "",
  SIM: "\\sim",
  APPROX: "\\approx",
  SIMEQ: "\\simeq",
  CONG: "\\cong",
  "==": "\\equiv",
  DIAMOND: "\\diamond",
  FORALL: "\\forall",
  prime: "'",
  Partial: "\\partial",
  INF: "\\infty",
  PROPTO: "\\propto",
  lim: "\\lim",
  Lim: "\\lim",
  larrow: "\\leftarrow",
  "->": "\\rightarrow",
  uparrow: "\\uparrow",
  downarrow: "\\downarrow",
  LARROW: "\\Leftarrow",
  RARROW: "\\Rightarrow",
  UPARROW: "\\Uparrow",
  DOWNARROW: "\\Downarrow",
  udarrow: "\\updownarrow",
  "<->": "\\leftrightarrow",
  UDARROW: "\\Updownarrow",
  LRARROW: "\\Leftrightarrow",
  NWARROW: "\\nwarrow",
  SEARROW: "\\searrow",
  NEARROW: "\\nearrow",
  SWARROW: "\\swarrow",
  HOOKLEFT: "\\hookleftarrow",
  HOOKRIGHT: "\\hookrightarrow",
  PVER: "\\|",
  MAPSTO: "\\mapsto",
  CDOTS: "\\cdots",
  LDOTS: "\\ldots",
  VDOTS: "\\vdots",
  DDOTS: "\\ddots",
  DAGGER: "\\dagger",
  DDAGGER: "\\ddagger",
  DOTEQ: "\\doteq",
  image: "\\fallingdotseq",
  REIMAGE: "\\risingdotseq",
  ASYMP: "\\asymp",
  ISO: "\\Bumpeq",
  DSUM: "\\dotplus",
  XOR: "\\veebar",
  TRIANGLE: "\\triangle",
  NABLA: "\\nabla",
  ANGLE: "\\angle",
  MSANGLE: "\\measuredangle",
  SANGLE: "\\sphericalangle",
  VDASH: "\\vdash",
  DASHV: "\\dashv",
  BOT: "\\bot",
  TOP: "\\top",
  MODELS: "\\models",
  LAPLACE: "\\mathcal{L}",
  CENTIGRADE: "^{\\circ}C",
  FAHRENHEIT: "^{\\circ}F",
  LSLANT: "\\diagup",
  RSLANT: "\\diagdown",
  sqrt: "\\sqrt",
  int: "\\int",
  dint: "\\iint",
  tint: "\\iiint",
  oint: "\\oint",
  alpha: "\\alpha",
  beta: "\\beta",
  gamma: "\\gamma",
  delta: "\\delta",
  epsilon: "\\epsilon",
  zeta: "\\zeta",
  eta: "\\eta",
  theta: "\\theta",
  iota: "\\iota",
  kappa: "\\kappa",
  lambda: "\\lambda",
  mu: "\\mu",
  nu: "\\nu",
  xi: "\\xi",
  omicron: "\\omicron",
  pi: "\\pi",
  rho: "\\rho",
  sigma: "\\sigma",
  tau: "\\tau",
  upsilon: "\\upsilon",
  phi: "\\phi",
  chi: "\\chi",
  psi: "\\psi",
  omega: "\\omega",
  ALPHA: "A",
  BETA: "B",
  GAMMA: "\\Gamma",
  DELTA: "\\Delta",
  EPSILON: "E",
  ZETA: "Z",
  ETA: "H",
  THETA: "\\Theta",
  IOTA: "I",
  KAPPA: "K",
  LAMBDA: "\\Lambda",
  MU: "M",
  NU: "N",
  XI: "\\Xi",
  OMICRON: "O",
  PI: "\\Pi",
  RHO: "P",
  SIGMA: "\\Sigma",
  TAU: "T",
  UPSILON: "\\Upsilon",
  PHI: "\\Phi",
  CHI: "X",
  PSI: "\\Psi",
  OMEGA: "\\Omega",
  "\u2308": "\\lceil",
  "\u2309": "\\rceil",
  "\u230A": "\\lfloor",
  "\u230B": "\\rfloor",
  "\u2225": "\\|",
  "\u2290": "\\sqsupset",
  "\u2292": "\\sqsupseteq",
  odint: "\\mathop \u222F",
  otint: "\\mathop \u2230",
  BIGSQCAP: "\\mathop \u2A05",
  ATT: "\\mathop \u203B",
  HUND: "\\mathop \u2030",
  THOU: "\\mathop \u2031",
  IDENTICAL: "\\mathop \u2237",
  RTANGLE: "\\mathop \u22BE",
  BASE: "\\mathop \u2302",
  BENZENE: "\\mathop \u232C"
};
var MIDDLE_CONVERT_MAP = {
  matrix: "HULKMATRIX",
  pmatrix: "HULKPMATRIX",
  bmatrix: "HULKBMATRIX",
  dmatrix: "HULKDMATRIX",
  eqalign: "HULKEQALIGN",
  cases: "HULKCASE",
  vec: "HULKVEC",
  dyad: "HULKDYAD",
  acute: "HULKACUTE",
  grave: "HULKGRAVE",
  dot: "HULKDOT",
  ddot: "HULKDDOT",
  bar: "HULKBAR",
  hat: "HULKHAT",
  check: "HULKCHECK",
  arch: "HULKARCH",
  tilde: "HULKTILDE",
  BOX: "HULKBOX",
  OVERBRACE: "HULKOVERBRACE",
  UNDERBRACE: "HULKUNDERBRACE"
};
var BAR_CONVERT_MAP = {
  HULKVEC: "\\overrightarrow",
  HULKDYAD: "\\overleftrightarrow",
  HULKACUTE: "\\acute",
  HULKGRAVE: "\\grave",
  HULKDOT: "\\dot",
  HULKDDOT: "\\ddot",
  HULKBAR: "\\overline",
  HULKHAT: "\\widehat",
  HULKCHECK: "\\check",
  HULKARCH: "\\overset{\\frown}",
  HULKTILDE: "\\widetilde",
  HULKBOX: "\\boxed"
};
var MATRIX_CONVERT_MAP = {
  HULKMATRIX: { begin: "\\begin{matrix}", end: "\\end{matrix}", removeOutterBrackets: true },
  HULKPMATRIX: { begin: "\\begin{pmatrix}", end: "\\end{pmatrix}", removeOutterBrackets: true },
  HULKBMATRIX: { begin: "\\begin{bmatrix}", end: "\\end{bmatrix}", removeOutterBrackets: true },
  HULKDMATRIX: { begin: "\\begin{vmatrix}", end: "\\end{vmatrix}", removeOutterBrackets: true },
  HULKCASE: { begin: "\\begin{cases}", end: "\\end{cases}", removeOutterBrackets: true },
  HULKEQALIGN: { begin: "\\eqalign{", end: "}", removeOutterBrackets: false }
};
var BRACE_CONVERT_MAP = {
  HULKOVERBRACE: "\\overbrace",
  HULKUNDERBRACE: "\\underbrace"
};
function findBrackets(eqString, startIdx, direction) {
  if (direction === 1) {
    const startCur = eqString.indexOf("{", startIdx);
    if (startCur === -1) throw new Error("cannot find bracket");
    let bracketCount = 1;
    for (let i = startCur + 1; i < eqString.length; i++) {
      const ch = eqString[i];
      if (ch === "{") bracketCount += 1;
      else if (ch === "}") bracketCount -= 1;
      if (bracketCount === 0) return [startCur, i + 1];
    }
    throw new Error("cannot find bracket");
  }
  const reversed = Array.from(eqString).reverse();
  for (let i = 0; i < reversed.length; i++) {
    if (reversed[i] === "{") reversed[i] = "}";
    else if (reversed[i] === "}") reversed[i] = "{";
  }
  const flipped = reversed.join("");
  const newStartIdx = flipped.length - (startIdx + 1);
  const [s, e] = findBrackets(flipped, newStartIdx, 1);
  return [flipped.length - e, flipped.length - s];
}
function findOutterBrackets(eqString, startIdx) {
  let idx = startIdx;
  while (true) {
    idx -= 1;
    if (idx < 0) throw new Error("cannot find bracket");
    if (eqString[idx] === "{") break;
  }
  return findBrackets(eqString, idx, 1);
}
function replaceFrac(eqString) {
  const hmlFrac = "over";
  while (true) {
    const cursor = eqString.indexOf(hmlFrac);
    if (cursor === -1) break;
    try {
      const [numStart, numEnd] = findBrackets(eqString, cursor, 0);
      const numerator = eqString.slice(numStart, numEnd);
      const beforeFrac = eqString.slice(0, numStart);
      const afterFrac = eqString.slice(cursor + hmlFrac.length);
      eqString = beforeFrac + "\\frac" + numerator + afterFrac;
    } catch (e4) {
      return eqString;
    }
  }
  return eqString;
}
function replaceRootOf(eqString) {
  while (true) {
    const rootCursor = eqString.indexOf("root");
    if (rootCursor === -1) break;
    try {
      const ofCursor = eqString.indexOf("of");
      if (ofCursor === -1) return eqString;
      const elem1 = findBrackets(eqString, rootCursor, 1);
      const elem2 = findBrackets(eqString, ofCursor, 1);
      const e1 = eqString.slice(elem1[0] + 1, elem1[1] - 1);
      const e2 = eqString.slice(elem2[0] + 1, elem2[1] - 1);
      eqString = eqString.slice(0, rootCursor) + "\\sqrt[" + e1 + "]{" + e2 + "}" + eqString.slice(elem2[1] + 1);
    } catch (e5) {
      return eqString;
    }
  }
  return eqString;
}
function replaceAllMatrix(eqString) {
  const replaceElements = (bracketStr) => {
    let inner = bracketStr.slice(1, -1);
    inner = inner.replace(/#/g, " \\\\ ");
    inner = inner.replace(/&amp;/g, "&");
    return inner;
  };
  const replaceMatrix = (input, matStr, matElem) => {
    while (true) {
      const cursor = input.indexOf(matStr);
      if (cursor === -1) break;
      try {
        const [eStart, eEnd] = findBrackets(input, cursor, 1);
        const elem = replaceElements(input.slice(eStart, eEnd));
        let beforeMat;
        let afterMat;
        if (matElem.removeOutterBrackets) {
          const [bStart, bEnd] = findOutterBrackets(input, cursor);
          beforeMat = input.slice(0, bStart);
          afterMat = input.slice(bEnd);
        } else {
          beforeMat = input.slice(0, cursor);
          afterMat = input.slice(eEnd);
        }
        input = beforeMat + matElem.begin + elem + matElem.end + afterMat;
      } catch (e6) {
        return input;
      }
    }
    return input;
  };
  for (const [matKey, matElem] of Object.entries(MATRIX_CONVERT_MAP)) {
    eqString = replaceMatrix(eqString, matKey, matElem);
  }
  return eqString;
}
function replaceAllBar(eqString) {
  const replaceBar = (input, barStr, barElem) => {
    while (true) {
      const cursor = input.indexOf(barStr);
      if (cursor === -1) break;
      try {
        const [eStart, eEnd] = findBrackets(input, cursor, 1);
        const [bStart, bEnd] = findOutterBrackets(input, cursor);
        const elem = input.slice(eStart, eEnd);
        const beforeBar = input.slice(0, bStart);
        const afterBar = input.slice(bEnd);
        input = beforeBar + barElem + elem + afterBar;
      } catch (e7) {
        return input;
      }
    }
    return input;
  };
  for (const [barKey, barElem] of Object.entries(BAR_CONVERT_MAP)) {
    eqString = replaceBar(eqString, barKey, barElem);
  }
  return eqString;
}
function replaceAllBrace(eqString) {
  const replaceBrace = (input, braceStr, braceElem) => {
    while (true) {
      const cursor = input.indexOf(braceStr);
      if (cursor === -1) break;
      try {
        const [eStart1, eEnd1] = findBrackets(input, cursor, 1);
        const [eStart2, eEnd2] = findBrackets(input, eEnd1, 1);
        const elem1 = input.slice(eStart1, eEnd1);
        const elem2 = input.slice(eStart2, eEnd2);
        const beforeBrace = input.slice(0, cursor);
        const afterBrace = input.slice(eEnd2);
        input = beforeBrace + braceElem + elem1 + "^" + elem2 + afterBrace;
      } catch (e8) {
        return input;
      }
    }
    return input;
  };
  for (const [braceKey, braceElem] of Object.entries(BRACE_CONVERT_MAP)) {
    eqString = replaceBrace(eqString, braceKey, braceElem);
  }
  return eqString;
}
function replaceBracket(strList) {
  for (let i = 0; i < strList.length; i++) {
    if (strList[i] === "{" && i > 0 && strList[i - 1] === "\\left") strList[i] = "\\{";
    if (strList[i] === "}" && i > 0 && strList[i - 1] === "\\right") strList[i] = "\\}";
  }
  return strList;
}
function hmlToLatex(hmlEqStr) {
  if (!hmlEqStr) return "";
  let s = hmlEqStr.replace(/`/g, " ");
  s = s.replace(/\{/g, " { ").replace(/\}/g, " } ").replace(/&/g, " & ");
  let tokens = s.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t in CONVERT_MAP) tokens[i] = CONVERT_MAP[t];
    else if (t in MIDDLE_CONVERT_MAP) tokens[i] = MIDDLE_CONVERT_MAP[t];
  }
  tokens = tokens.filter((tok) => tok.length !== 0);
  tokens = replaceBracket(tokens);
  let out = tokens.join(" ");
  out = replaceFrac(out);
  out = replaceRootOf(out);
  out = replaceAllMatrix(out);
  out = replaceAllBar(out);
  out = replaceAllBrace(out);
  return out;
}

// src/hwpx/parser.ts
var MAX_DECOMPRESS_SIZE = 100 * 1024 * 1024;
var MAX_ZIP_ENTRIES = 500;
function clampSpan(val, max) {
  return Math.max(1, Math.min(val, max));
}
var MAX_XML_DEPTH = 200;
function createXmlParser(warnings) {
  return new (0, _xmldom.DOMParser)({
    onError(level, msg) {
      if (level === "fatalError") throw new (0, _chunkJ3FHRU5Tcjs.KordocError)(`XML \uD30C\uC2F1 \uC2E4\uD328: ${msg}`);
      _optionalChain([warnings, 'optionalAccess', _2 => _2.push, 'call', _3 => _3({ code: "MALFORMED_XML", message: `XML ${level === "warn" ? "\uACBD\uACE0" : "\uC624\uB958"}: ${msg}` })]);
    }
  });
}
async function extractHwpxStyles(zip, decompressed) {
  const result = {
    charProperties: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map()
  };
  const headerPaths = ["Contents/header.xml", "header.xml", "Contents/head.xml", "head.xml"];
  for (const hp of headerPaths) {
    const hpLower = hp.toLowerCase();
    const file = zip.file(hp) || Object.values(zip.files).find((f) => f.name.toLowerCase() === hpLower) || null;
    if (!file) continue;
    try {
      const xml = await file.async("text");
      if (decompressed) {
        decompressed.total += xml.length * 2;
        if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
      }
      const parser = createXmlParser();
      const doc = parser.parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, xml), "text/xml");
      if (!doc.documentElement) continue;
      parseCharProperties(doc, result.charProperties);
      parseStyleElements(doc, result.styles);
      break;
    } catch (e9) {
      continue;
    }
  }
  return result;
}
function parseCharProperties(doc, map) {
  const tagNames = ["hh:charPr", "charPr", "hp:charPr"];
  for (const tagName of tagNames) {
    const elements = doc.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const id = el.getAttribute("id") || el.getAttribute("IDRef") || "";
      if (!id) continue;
      const prop = {};
      const height = el.getAttribute("height");
      if (height) {
        const parsedHeight = parseInt(height, 10);
        if (!isNaN(parsedHeight) && parsedHeight > 0) {
          prop.fontSize = parsedHeight / 100;
        }
      }
      const bold = el.getAttribute("bold");
      if (bold === "true" || bold === "1") prop.bold = true;
      const italic = el.getAttribute("italic");
      if (italic === "true" || italic === "1") prop.italic = true;
      const fontFaces = el.getElementsByTagName("*");
      for (let j = 0; j < fontFaces.length; j++) {
        const ff = fontFaces[j];
        const localTag = (ff.tagName || "").replace(/^[^:]+:/, "");
        if (localTag === "fontface" || localTag === "fontRef") {
          const face = ff.getAttribute("face") || ff.getAttribute("FontFace");
          if (face) {
            prop.fontName = face;
            break;
          }
        }
      }
      map.set(id, prop);
    }
  }
}
function parseStyleElements(doc, map) {
  const tagNames = ["hh:style", "style", "hp:style"];
  for (const tagName of tagNames) {
    const elements = doc.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const id = el.getAttribute("id") || el.getAttribute("IDRef") || String(i);
      const name = el.getAttribute("name") || el.getAttribute("engName") || "";
      const charPrId = el.getAttribute("charPrIDRef") || void 0;
      const paraPrId = el.getAttribute("paraPrIDRef") || void 0;
      map.set(id, { name, charPrId, paraPrId });
    }
  }
}
async function parseHwpxDocument(buffer, options) {
  _chunkJ3FHRU5Tcjs.precheckZipSize.call(void 0, buffer, MAX_DECOMPRESS_SIZE, MAX_ZIP_ENTRIES);
  let zip;
  try {
    zip = await _jszip2.default.loadAsync(buffer);
  } catch (e10) {
    return extractFromBrokenZip(buffer);
  }
  const actualEntryCount = Object.keys(zip.files).length;
  if (actualEntryCount > MAX_ZIP_ENTRIES) {
    throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("ZIP \uC5D4\uD2B8\uB9AC \uC218 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
  }
  const manifestFile = zip.file("META-INF/manifest.xml");
  if (manifestFile) {
    const manifestXml = await manifestFile.async("text");
    if (isEncryptedHwpx(manifestXml)) {
      if (isComFallbackAvailable() && _optionalChain([options, 'optionalAccess', _4 => _4.filePath])) {
        const { pages, pageCount, warnings: warnings2 } = extractTextViaCom(options.filePath);
        if (pages.some((p) => p && p.trim().length > 0)) {
          return comResultToParseResult(pages, pageCount, warnings2);
        }
      }
      throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("DRM \uC554\uD638\uD654\uB41C HWPX \uD30C\uC77C\uC785\uB2C8\uB2E4. Windows + \uD55C\uCEF4 \uC624\uD53C\uC2A4 \uC124\uCE58 \uC2DC \uC790\uB3D9 \uCD94\uCD9C\uB429\uB2C8\uB2E4.");
    }
  }
  const decompressed = { total: 0 };
  const metadata = {};
  await extractHwpxMetadata(zip, metadata, decompressed);
  const styleMap = await extractHwpxStyles(zip, decompressed);
  const warnings = [];
  const sectionPaths = await resolveSectionPaths(zip);
  if (sectionPaths.length === 0) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("HWPX\uC5D0\uC11C \uC139\uC158 \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  metadata.pageCount = sectionPaths.length;
  const pageFilter = _optionalChain([options, 'optionalAccess', _5 => _5.pages]) ? _chunkMUOQXDZ4cjs.parsePageRange.call(void 0, options.pages, sectionPaths.length) : null;
  const totalTarget = pageFilter ? pageFilter.size : sectionPaths.length;
  const blocks = [];
  const nestedTableCounter = { count: 0 };
  let parsedSections = 0;
  for (let si = 0; si < sectionPaths.length; si++) {
    if (pageFilter && !pageFilter.has(si + 1)) continue;
    const file = zip.file(sectionPaths[si]);
    if (!file) continue;
    try {
      const xml = await file.async("text");
      decompressed.total += xml.length * 2;
      if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
      blocks.push(...parseSectionXml(xml, styleMap, warnings, si + 1, nestedTableCounter));
      parsedSections++;
      _optionalChain([options, 'optionalAccess', _6 => _6.onProgress, 'optionalCall', _7 => _7(parsedSections, totalTarget)]);
    } catch (secErr) {
      if (secErr instanceof _chunkJ3FHRU5Tcjs.KordocError) throw secErr;
      warnings.push({ page: si + 1, message: `\uC139\uC158 ${si + 1} \uD30C\uC2F1 \uC2E4\uD328: ${secErr instanceof Error ? secErr.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}`, code: "PARTIAL_PARSE" });
    }
  }
  const images = await extractImagesFromZip(zip, blocks, decompressed, warnings);
  detectHwpxHeadings(blocks, styleMap);
  const outline = blocks.filter((b) => b.type === "heading" && b.level && b.text).map((b) => ({ level: b.level, text: b.text, pageNumber: b.pageNumber }));
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, blocks);
  return { markdown, blocks, metadata, outline: outline.length > 0 ? outline : void 0, warnings: warnings.length > 0 ? warnings : void 0, images: images.length > 0 ? images : void 0 };
}
function imageExtToMime(ext) {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "tif":
    case "tiff":
      return "image/tiff";
    case "wmf":
      return "image/wmf";
    case "emf":
      return "image/emf";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
function mimeToExt(mime) {
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("bmp")) return "bmp";
  if (mime.includes("tiff")) return "tif";
  if (mime.includes("wmf")) return "wmf";
  if (mime.includes("emf")) return "emf";
  if (mime.includes("svg")) return "svg";
  return "bin";
}
async function extractImagesFromZip(zip, blocks, decompressed, warnings) {
  const images = [];
  let imageIndex = 0;
  for (const block of blocks) {
    if (block.type !== "image" || !block.text) continue;
    const ref = block.text;
    const candidates = [
      `BinData/${ref}`,
      `Contents/BinData/${ref}`,
      ref
      // 절대 경로일 수도 있음
    ];
    let resolvedPath = null;
    if (!ref.includes(".")) {
      const prefixes = [`BinData/${ref}`, `Contents/BinData/${ref}`];
      for (const prefix of prefixes) {
        const match = zip.file(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.[a-zA-Z0-9]+$`));
        if (match.length > 0) {
          resolvedPath = match[0].name;
          break;
        }
      }
    }
    let found = false;
    const allCandidates = resolvedPath ? [resolvedPath, ...candidates] : candidates;
    for (const path of allCandidates) {
      if (_chunkJ3FHRU5Tcjs.isPathTraversal.call(void 0, path)) continue;
      const file = zip.file(path);
      if (!file) continue;
      try {
        const data = await file.async("uint8array");
        decompressed.total += data.length;
        if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
        const actualPath = path;
        const ext = actualPath.includes(".") ? actualPath.split(".").pop() || "png" : "png";
        const mimeType = imageExtToMime(ext);
        imageIndex++;
        const filename = `image_${String(imageIndex).padStart(3, "0")}.${mimeToExt(mimeType)}`;
        images.push({ filename, data, mimeType });
        block.text = filename;
        block.imageData = { data, mimeType, filename: ref };
        found = true;
        break;
      } catch (err) {
        if (err instanceof _chunkJ3FHRU5Tcjs.KordocError) throw err;
      }
    }
    if (!found) {
      _optionalChain([warnings, 'optionalAccess', _8 => _8.push, 'call', _9 => _9({ page: block.pageNumber, message: `\uC774\uBBF8\uC9C0 \uD30C\uC77C \uC5C6\uC74C: ${ref}`, code: "SKIPPED_IMAGE" })]);
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: ${ref}]`;
    }
  }
  return images;
}
async function extractHwpxMetadata(zip, metadata, decompressed) {
  try {
    const metaPaths = ["meta.xml", "META-INF/meta.xml", "docProps/core.xml"];
    for (const mp of metaPaths) {
      const file = zip.file(mp) || Object.values(zip.files).find((f) => f.name.toLowerCase() === mp.toLowerCase()) || null;
      if (!file) continue;
      const xml = await file.async("text");
      if (decompressed) {
        decompressed.total += xml.length * 2;
        if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
      }
      parseDublinCoreMetadata(xml, metadata);
      if (metadata.title || metadata.author) return;
    }
  } catch (e11) {
  }
}
function parseDublinCoreMetadata(xml, metadata) {
  const parser = createXmlParser();
  const doc = parser.parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, xml), "text/xml");
  if (!doc.documentElement) return;
  const getText = (tagNames) => {
    for (const tag of tagNames) {
      const els = doc.getElementsByTagName(tag);
      if (els.length > 0) {
        const text = _optionalChain([els, 'access', _10 => _10[0], 'access', _11 => _11.textContent, 'optionalAccess', _12 => _12.trim, 'call', _13 => _13()]);
        if (text) return text;
      }
    }
    return void 0;
  };
  metadata.title = metadata.title || getText(["dc:title", "title"]);
  metadata.author = metadata.author || getText(["dc:creator", "creator", "cp:lastModifiedBy"]);
  metadata.description = metadata.description || getText(["dc:description", "description", "dc:subject", "subject"]);
  metadata.createdAt = metadata.createdAt || getText(["dcterms:created", "meta:creation-date"]);
  metadata.modifiedAt = metadata.modifiedAt || getText(["dcterms:modified", "meta:date"]);
  const keywords = getText(["dc:keyword", "cp:keywords", "meta:keyword"]);
  if (keywords && !metadata.keywords) {
    metadata.keywords = keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean);
  }
}
function extractFromBrokenZip(buffer) {
  const data = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let pos = 0;
  const blocks = [];
  const warnings = [
    { code: "BROKEN_ZIP_RECOVERY", message: "\uC190\uC0C1\uB41C ZIP \uAD6C\uC870 \u2014 Local File Header \uAE30\uBC18 \uBCF5\uAD6C \uBAA8\uB4DC" }
  ];
  let totalDecompressed = 0;
  let entryCount = 0;
  let sectionNum = 0;
  const nestedTableCounter = { count: 0 };
  while (pos < data.length - 30) {
    if (data[pos] !== 80 || data[pos + 1] !== 75 || data[pos + 2] !== 3 || data[pos + 3] !== 4) {
      pos++;
      while (pos < data.length - 30) {
        if (data[pos] === 80 && data[pos + 1] === 75 && data[pos + 2] === 3 && data[pos + 3] === 4) break;
        pos++;
      }
      continue;
    }
    if (++entryCount > MAX_ZIP_ENTRIES) break;
    const method = view.getUint16(pos + 8, true);
    const compSize = view.getUint32(pos + 18, true);
    const nameLen = view.getUint16(pos + 26, true);
    const extraLen = view.getUint16(pos + 28, true);
    if (nameLen > 1024 || extraLen > 65535) {
      pos += 30 + nameLen + extraLen;
      continue;
    }
    const fileStart = pos + 30 + nameLen + extraLen;
    if (fileStart + compSize > data.length) break;
    if (compSize === 0 && method !== 0) {
      pos = fileStart;
      continue;
    }
    const nameBytes = data.slice(pos + 30, pos + 30 + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    if (_chunkJ3FHRU5Tcjs.isPathTraversal.call(void 0, name)) {
      pos = fileStart + compSize;
      continue;
    }
    const fileData = data.slice(fileStart, fileStart + compSize);
    pos = fileStart + compSize;
    if (!name.toLowerCase().includes("section") || !name.endsWith(".xml")) continue;
    try {
      let content;
      if (method === 0) {
        content = new TextDecoder().decode(fileData);
      } else if (method === 8) {
        const decompressed = _zlib.inflateRawSync.call(void 0, Buffer.from(fileData), { maxOutputLength: MAX_DECOMPRESS_SIZE });
        content = new TextDecoder().decode(decompressed);
      } else {
        continue;
      }
      totalDecompressed += content.length * 2;
      if (totalDecompressed > MAX_DECOMPRESS_SIZE) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC");
      sectionNum++;
      blocks.push(...parseSectionXml(content, void 0, warnings, sectionNum, nestedTableCounter));
    } catch (e12) {
      continue;
    }
  }
  if (blocks.length === 0) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uC190\uC0C1\uB41C HWPX\uC5D0\uC11C \uC139\uC158 \uB370\uC774\uD130\uB97C \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, blocks);
  return { markdown, blocks, warnings: warnings.length > 0 ? warnings : void 0 };
}
async function resolveSectionPaths(zip) {
  const manifestPaths = ["Contents/content.hpf", "content.hpf"];
  for (const mp of manifestPaths) {
    const mpLower = mp.toLowerCase();
    const file = zip.file(mp) || Object.values(zip.files).find((f) => f.name.toLowerCase() === mpLower) || null;
    if (!file) continue;
    const xml = await file.async("text");
    const paths = parseSectionPathsFromManifest(xml);
    if (paths.length > 0) return paths;
  }
  const sectionFiles = zip.file(/[Ss]ection\d+\.xml$/);
  return sectionFiles.map((f) => f.name).sort();
}
function parseSectionPathsFromManifest(xml) {
  const parser = createXmlParser();
  const doc = parser.parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, xml), "text/xml");
  const items = doc.getElementsByTagName("opf:item");
  const spine = doc.getElementsByTagName("opf:itemref");
  const isSectionId = (id) => /^s/i.test(id) || id.toLowerCase().includes("section");
  const idToHref = /* @__PURE__ */ new Map();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = item.getAttribute("id") || "";
    let href = item.getAttribute("href") || "";
    const mediaType = item.getAttribute("media-type") || "";
    if (!isSectionId(id) && !mediaType.includes("xml")) continue;
    if (!href.startsWith("/") && !href.startsWith("Contents/") && isSectionId(id))
      href = "Contents/" + href;
    idToHref.set(id, href);
  }
  if (spine.length > 0) {
    const ordered = [];
    for (let i = 0; i < spine.length; i++) {
      const href = idToHref.get(spine[i].getAttribute("idref") || "");
      if (href) ordered.push(href);
    }
    if (ordered.length > 0) return ordered;
  }
  return Array.from(idToHref.entries()).filter(([id]) => isSectionId(id)).sort((a, b) => a[0].localeCompare(b[0])).map(([, href]) => href);
}
function detectHwpxHeadings(blocks, styleMap) {
  let baseFontSize = 0;
  const sizeFreq = /* @__PURE__ */ new Map();
  for (const b of blocks) {
    if (_optionalChain([b, 'access', _14 => _14.style, 'optionalAccess', _15 => _15.fontSize])) {
      sizeFreq.set(b.style.fontSize, (sizeFreq.get(b.style.fontSize) || 0) + 1);
    }
  }
  let maxCount = 0;
  for (const [size, count] of sizeFreq) {
    if (count > maxCount) {
      maxCount = count;
      baseFontSize = size;
    }
  }
  for (const block of blocks) {
    if (block.type !== "paragraph" || !block.text) continue;
    const text = block.text.trim();
    if (text.length === 0 || text.length > 200 || /^\d+$/.test(text)) continue;
    let level = 0;
    if (baseFontSize > 0 && _optionalChain([block, 'access', _16 => _16.style, 'optionalAccess', _17 => _17.fontSize])) {
      const ratio = block.style.fontSize / baseFontSize;
      if (ratio >= _chunkJ3FHRU5Tcjs.HEADING_RATIO_H1) level = 1;
      else if (ratio >= _chunkJ3FHRU5Tcjs.HEADING_RATIO_H2) level = 2;
      else if (ratio >= _chunkJ3FHRU5Tcjs.HEADING_RATIO_H3) level = 3;
    }
    const compactText = text.replace(/\s+/g, "");
    if (/^제\d+[조장절편]/.test(compactText) && text.length <= 50) {
      if (level === 0) level = 3;
    }
    if (level > 0) {
      block.type = "heading";
      block.level = level;
    }
  }
}
function makeNestedTableMarker(counter, rows) {
  counter.count++;
  const firstRow = _nullishCoalesce(rows[0], () => ( []));
  const hint = firstRow.map((c) => c.text.trim().replace(/\n/g, " ")).filter(Boolean).join(" | ");
  const hintChars = [...hint];
  const truncated = hintChars.length > 60 ? hintChars.slice(0, 60).join("") + "\u2026" : hint;
  return truncated ? `[\uC911\uCCA9 \uD14C\uC774\uBE14 #${counter.count}: ${truncated}]` : `[\uC911\uCCA9 \uD14C\uC774\uBE14 #${counter.count}]`;
}
function handleNestedTable(newTable, tableStack, blocks, ctx) {
  const parentTable = tableStack.pop();
  let nestedCols = 0;
  for (const r of newTable.rows) if (r.length > nestedCols) nestedCols = r.length;
  if (newTable.rows.length >= 3 && nestedCols >= 2) {
    blocks.push({ type: "table", table: _chunkJ3FHRU5Tcjs.buildTable.call(void 0, newTable.rows), pageNumber: ctx.sectionNum });
    if (parentTable.cell) {
      const marker = ctx.counter ? makeNestedTableMarker(ctx.counter, newTable.rows) : "[\uC911\uCCA9 \uD14C\uC774\uBE14]";
      parentTable.cell.text += (parentTable.cell.text ? "\n" : "") + marker;
    }
  } else {
    const nestedText = _chunkJ3FHRU5Tcjs.convertTableToText.call(void 0, newTable.rows);
    if (parentTable.cell) {
      const marker = ctx.counter ? makeNestedTableMarker(ctx.counter, newTable.rows) : "[\uC911\uCCA9 \uD14C\uC774\uBE14]";
      parentTable.cell.text += (parentTable.cell.text ? "\n" : "") + marker + "\n" + nestedText;
    }
  }
  return parentTable;
}
function parseSectionXml(xml, styleMap, warnings, sectionNum, counter) {
  const parser = createXmlParser(warnings);
  const doc = parser.parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, xml), "text/xml");
  if (!doc.documentElement) return [];
  const blocks = [];
  const ctx = { styleMap, warnings, sectionNum, counter };
  walkSection(doc.documentElement, blocks, null, [], ctx);
  return blocks;
}
function extractImageRef(el) {
  const children = el.childNodes;
  if (!children) return null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;
    const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
    if (tag === "imgRect" || tag === "img" || tag === "imgClip") {
      const ref = child.getAttribute("binaryItemIDRef") || child.getAttribute("href") || "";
      if (ref) return ref;
    }
    const nested = extractImageRef(child);
    if (nested) return nested;
  }
  const directRef = el.getAttribute("binaryItemIDRef") || "";
  if (directRef) return directRef;
  return null;
}
function walkSection(node, blocks, tableCtx, tableStack, ctx, depth = 0) {
  if (depth > MAX_XML_DEPTH) return;
  const children = node.childNodes;
  if (!children) return;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = el.tagName || el.localName || "";
    const localTag = tag.replace(/^[^:]+:/, "");
    switch (localTag) {
      case "tbl": {
        if (tableCtx) tableStack.push(tableCtx);
        const newTable = { rows: [], currentRow: [], cell: null };
        walkSection(el, blocks, newTable, tableStack, ctx, depth + 1);
        if (newTable.rows.length > 0) {
          if (tableStack.length > 0) {
            tableCtx = handleNestedTable(newTable, tableStack, blocks, ctx);
          } else {
            blocks.push({ type: "table", table: _chunkJ3FHRU5Tcjs.buildTable.call(void 0, newTable.rows), pageNumber: ctx.sectionNum });
            tableCtx = null;
          }
        } else {
          tableCtx = tableStack.length > 0 ? tableStack.pop() : null;
        }
        break;
      }
      case "tr":
        if (tableCtx) {
          tableCtx.currentRow = [];
          walkSection(el, blocks, tableCtx, tableStack, ctx, depth + 1);
          if (tableCtx.currentRow.length > 0) tableCtx.rows.push(tableCtx.currentRow);
          tableCtx.currentRow = [];
        }
        break;
      case "tc":
        if (tableCtx) {
          tableCtx.cell = { text: "", colSpan: 1, rowSpan: 1 };
          walkSection(el, blocks, tableCtx, tableStack, ctx, depth + 1);
          if (tableCtx.cell) {
            tableCtx.currentRow.push(tableCtx.cell);
            tableCtx.cell = null;
          }
        }
        break;
      case "cellAddr":
        if (_optionalChain([tableCtx, 'optionalAccess', _18 => _18.cell])) {
          const ca = parseInt(el.getAttribute("colAddr") || "", 10);
          const ra = parseInt(el.getAttribute("rowAddr") || "", 10);
          if (!isNaN(ca)) tableCtx.cell.colAddr = ca;
          if (!isNaN(ra)) tableCtx.cell.rowAddr = ra;
        }
        break;
      case "cellSpan":
        if (_optionalChain([tableCtx, 'optionalAccess', _19 => _19.cell])) {
          const rawCs = parseInt(el.getAttribute("colSpan") || "1", 10);
          const cs = isNaN(rawCs) ? 1 : rawCs;
          const rawRs = parseInt(el.getAttribute("rowSpan") || "1", 10);
          const rs = isNaN(rawRs) ? 1 : rawRs;
          tableCtx.cell.colSpan = clampSpan(cs, _chunkJ3FHRU5Tcjs.MAX_COLS);
          tableCtx.cell.rowSpan = clampSpan(rs, _chunkJ3FHRU5Tcjs.MAX_ROWS);
        }
        break;
      case "p": {
        const { text, href, footnote, style } = extractParagraphInfo(el, ctx.styleMap);
        if (text) {
          if (_optionalChain([tableCtx, 'optionalAccess', _20 => _20.cell])) {
            tableCtx.cell.text += (tableCtx.cell.text ? "\n" : "") + text;
          } else if (!tableCtx) {
            const block = { type: "paragraph", text, pageNumber: ctx.sectionNum };
            if (style) block.style = style;
            if (href) block.href = href;
            if (footnote) block.footnoteText = footnote;
            blocks.push(block);
          }
        }
        tableCtx = walkParagraphChildren(el, blocks, tableCtx, tableStack, ctx, depth + 1);
        break;
      }
      // 이미지/그림 — 경로 추출 또는 경고
      case "pic":
      case "shape":
      case "drawingObject": {
        const imgRef = extractImageRef(el);
        if (imgRef) {
          blocks.push({ type: "image", text: imgRef, pageNumber: ctx.sectionNum });
        } else if (ctx.warnings && ctx.sectionNum) {
          ctx.warnings.push({ page: ctx.sectionNum, message: `\uC2A4\uD0B5\uB41C \uC694\uC18C: ${localTag}`, code: "SKIPPED_IMAGE" });
        }
        break;
      }
      default:
        walkSection(el, blocks, tableCtx, tableStack, ctx, depth + 1);
        break;
    }
  }
}
function walkParagraphChildren(node, blocks, tableCtx, tableStack, ctx, depth = 0) {
  if (depth > MAX_XML_DEPTH) return tableCtx;
  const children = node.childNodes;
  if (!children) return tableCtx;
  const walkChildren = (parent, d) => {
    if (d > MAX_XML_DEPTH) return;
    const kids2 = parent.childNodes;
    if (!kids2) return;
    for (let i = 0; i < kids2.length; i++) {
      const el = kids2[i];
      if (el.nodeType !== 1) continue;
      const tag = el.tagName || el.localName || "";
      const localTag = tag.replace(/^[^:]+:/, "");
      if (localTag === "tbl") {
        if (tableCtx) tableStack.push(tableCtx);
        const newTable = { rows: [], currentRow: [], cell: null };
        walkSection(el, blocks, newTable, tableStack, ctx, d + 1);
        if (newTable.rows.length > 0) {
          if (tableStack.length > 0) {
            tableCtx = handleNestedTable(newTable, tableStack, blocks, ctx);
          } else {
            blocks.push({ type: "table", table: _chunkJ3FHRU5Tcjs.buildTable.call(void 0, newTable.rows), pageNumber: ctx.sectionNum });
            tableCtx = null;
          }
        } else {
          tableCtx = tableStack.length > 0 ? tableStack.pop() : null;
        }
      } else if (localTag === "pic" || localTag === "shape" || localTag === "drawingObject") {
        const drawTextChild = findDescendant(el, "drawText");
        if (drawTextChild) {
          extractDrawTextBlocks(drawTextChild, blocks, ctx.styleMap, ctx.sectionNum);
        } else {
          const imgRef = extractImageRef(el);
          if (imgRef) {
            blocks.push({ type: "image", text: imgRef, pageNumber: ctx.sectionNum });
          } else if (ctx.warnings && ctx.sectionNum) {
            ctx.warnings.push({ page: ctx.sectionNum, message: `\uC2A4\uD0B5\uB41C \uC694\uC18C: ${localTag}`, code: "SKIPPED_IMAGE" });
          }
        }
      } else if (localTag === "drawText") {
        extractDrawTextBlocks(el, blocks, ctx.styleMap, ctx.sectionNum);
      } else if (localTag === "r" || localTag === "run" || localTag === "ctrl" || localTag === "rect" || localTag === "ellipse" || localTag === "polygon" || localTag === "line" || localTag === "arc" || localTag === "curve" || localTag === "connectLine" || localTag === "container") {
        walkChildren(el, d + 1);
      } else if (localTag === "run") {
        tableCtx = walkParagraphChildren(el, blocks, tableCtx, tableStack, ctx, depth + 1);
      }
    }
  };
  walkChildren(node, depth);
  return tableCtx;
}
function findDescendant(node, targetTag, depth = 0) {
  if (depth > 5) return null;
  const children = node.childNodes;
  if (!children) return null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;
    const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
    if (tag === targetTag) return child;
    const found = findDescendant(child, targetTag, depth + 1);
    if (found) return found;
  }
  return null;
}
function extractDrawTextBlocks(drawTextNode, blocks, styleMap, sectionNum) {
  const children = drawTextNode.childNodes;
  if (!children) return;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;
    const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
    if (tag === "subList" || tag === "p" || tag === "para") {
      if (tag === "subList") {
        extractDrawTextBlocks(child, blocks, styleMap, sectionNum);
      } else {
        const info = extractParagraphInfo(child, styleMap);
        const text = info.text.trim();
        if (text) {
          blocks.push({ type: "paragraph", text, style: _nullishCoalesce(info.style, () => ( void 0)), pageNumber: sectionNum });
        }
      }
    }
  }
}
function extractParagraphInfo(para, styleMap) {
  let text = "";
  let href;
  let footnote;
  let charPrId;
  const walk = (node) => {
    const children = node.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 3) {
        text += child.textContent || "";
        continue;
      }
      if (child.nodeType !== 1) continue;
      const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
      switch (tag) {
        case "t":
          walk(child);
          break;
        // 자식 순회 (tab 등 하위 요소 처리)
        case "tab": {
          const leader = child.getAttribute("leader");
          if (leader && leader !== "0") {
            text += "";
          } else {
            text += "	";
          }
          break;
        }
        case "br":
          if ((child.getAttribute("type") || "line") === "line") text += "\n";
          break;
        case "fwSpace":
        case "hwSpace":
          text += " ";
          break;
        case "tbl":
          break;
        // 테이블은 walkSection에서 처리
        // 하이퍼링크
        case "hyperlink": {
          const url = child.getAttribute("url") || child.getAttribute("href") || "";
          if (url) {
            const safe = _chunkJ3FHRU5Tcjs.sanitizeHref.call(void 0, url);
            if (safe) href = safe;
          }
          walk(child);
          break;
        }
        // 각주/미주
        case "footNote":
        case "endNote":
        case "fn":
        case "en": {
          const noteText = extractTextFromNode(child);
          if (noteText) footnote = (footnote ? footnote + "; " : "") + noteText;
          break;
        }
        // 제어 요소 — 필드, 컨트롤, 매개변수 등 스킵
        case "ctrl":
        case "fieldBegin":
        case "fieldEnd":
        case "parameters":
        case "stringParam":
        case "integerParam":
        case "boolParam":
        case "floatParam":
        case "secPr":
        // 섹션 속성 (페이지 설정 등)
        case "colPr":
        // 다단 속성
        case "linesegarray":
        case "lineseg":
        // 레이아웃 정보
        // 도형/이미지 요소 — 대체텍스트("사각형입니다." 등) 누출 방지
        case "pic":
        case "shape":
        case "drawingObject":
        case "shapeComment":
        case "drawText":
          break;
        // 수식: <hp:equation> 내부의 <hp:script> 에 HULK-style equation
        // 스크립트가 담겨 있음. hml-equation-parser 로 LaTeX 변환 후 `$...$`
        // 로 래핑. 실패/빈 스크립트면 무시 (대체 텍스트 누출 방지).
        case "equation": {
          const script = findChildByLocalName(child, "script");
          const raw = script ? extractTextFromNode(script) : "";
          if (raw.trim()) {
            try {
              const latex = hmlToLatex(raw).trim();
              if (latex) text += " $" + latex + "$ ";
            } catch (e13) {
            }
          }
          break;
        }
        // run 요소에서 charPrIDRef 추출
        case "r": {
          const runCharPr = child.getAttribute("charPrIDRef");
          if (runCharPr && !charPrId) charPrId = runCharPr;
          walk(child);
          break;
        }
        default:
          walk(child);
          break;
      }
    }
  };
  walk(para);
  const leaderIdx = text.indexOf("");
  if (leaderIdx >= 0) text = text.substring(0, leaderIdx);
  let cleanText = text.replace(/[ \t]+/g, " ").trim();
  if (/^그림입니다\.?\s*원본\s*그림의\s*(이름|크기)/.test(cleanText)) cleanText = "";
  cleanText = cleanText.replace(/그림입니다\.?\s*원본\s*그림의\s*(이름|크기)[^\n]*(\n[^\n]*원본\s*그림의\s*(이름|크기)[^\n]*)*/g, "").trim();
  cleanText = cleanText.replace(/(?:모서리가 둥근 |둥근 )?(?:사각형|직사각형|정사각형|원|타원|삼각형|선|직선|곡선|화살표|오각형|육각형|팔각형|별|십자|구름|마름모|도넛|평행사변형|사다리꼴|개체|그리기\s?개체|묶음\s?개체|글상자|표|그림|OLE\s?개체)\s?입니다\.?/g, "").trim();
  let style;
  if (styleMap && charPrId) {
    const charProp = styleMap.charProperties.get(charPrId);
    if (charProp) {
      style = {};
      if (charProp.fontSize) style.fontSize = charProp.fontSize;
      if (charProp.bold) style.bold = true;
      if (charProp.italic) style.italic = true;
      if (charProp.fontName) style.fontName = charProp.fontName;
      if (!style.fontSize && !style.bold && !style.italic) style = void 0;
    }
  }
  return { text: cleanText, href, footnote, style };
}
function findChildByLocalName(parent, name) {
  const children = parent.childNodes;
  if (!children) return null;
  for (let i = 0; i < children.length; i++) {
    const ch = children[i];
    if (ch.nodeType !== 1) continue;
    const tag = (ch.tagName || ch.localName || "").replace(/^[^:]+:/, "");
    if (tag === name) return ch;
  }
  return null;
}
function extractTextFromNode(node) {
  let result = "";
  const children = node.childNodes;
  if (!children) return result;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 3) result += child.textContent || "";
    else if (child.nodeType === 1) result += extractTextFromNode(child);
  }
  return result.trim();
}

// src/hwp5/record.ts

var TAG_PARA_HEADER = 66;
var TAG_PARA_TEXT = 67;
var TAG_CHAR_SHAPE = 68;
var TAG_CTRL_HEADER = 71;
var TAG_LIST_HEADER = 72;
var TAG_TABLE = 77;
var TAG_EQEDIT = 88;
var TAG_DOC_CHAR_SHAPE = 21;
var TAG_DOC_PARA_SHAPE = 25;
var TAG_DOC_STYLE = 26;
var CHAR_LINE = 0;
var CHAR_SECTION_BREAK = 10;
var CHAR_PARA = 13;
var CHAR_TAB = 9;
var CHAR_HYPHEN = 30;
var CHAR_NBSP = 31;
var CHAR_FIXED_NBSP = 24;
var CHAR_FIXED_WIDTH = 25;
var FLAG_COMPRESSED = 1 << 0;
var FLAG_ENCRYPTED = 1 << 1;
var FLAG_DISTRIBUTION = 1 << 2;
var FLAG_DRM = 1 << 4;
var MAX_RECORDS = 5e5;
function readRecords(data) {
  const records = [];
  let offset = 0;
  while (offset + 4 <= data.length && records.length < MAX_RECORDS) {
    const header = data.readUInt32LE(offset);
    offset += 4;
    const tagId = header & 1023;
    const level = header >> 10 & 1023;
    let size = header >> 20 & 4095;
    if (size === 4095) {
      if (offset + 4 > data.length) break;
      size = data.readUInt32LE(offset);
      offset += 4;
    }
    if (offset + size > data.length) break;
    records.push({ tagId, level, size, data: data.subarray(offset, offset + size) });
    offset += size;
  }
  return records;
}
var MAX_DECOMPRESS_SIZE2 = 100 * 1024 * 1024;
function decompressStream(data) {
  const opts = { maxOutputLength: MAX_DECOMPRESS_SIZE2 };
  if (data.length >= 2 && data[0] === 120) {
    try {
      return _zlib.inflateSync.call(void 0, data, opts);
    } catch (e14) {
    }
  }
  return _zlib.inflateRawSync.call(void 0, data, opts);
}
function parseFileHeader(data) {
  if (data.length < 40) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("FileHeader\uAC00 \uB108\uBB34 \uC9E7\uC2B5\uB2C8\uB2E4 (\uCD5C\uC18C 40\uBC14\uC774\uD2B8)");
  const sig = data.subarray(0, 32).toString("utf8").replace(/\0+$/, "");
  return {
    signature: sig,
    versionMajor: data[35],
    flags: data.readUInt32LE(36)
  };
}
function parseDocInfo(records) {
  const charShapes = [];
  const paraShapes = [];
  const styles = [];
  for (const rec of records) {
    if (rec.tagId === TAG_DOC_PARA_SHAPE && rec.data.length >= 4) {
      const flags = rec.data.readUInt32LE(0);
      const outlineLevel = flags >> 25 & 7;
      paraShapes.push({ outlineLevel });
    }
    if (rec.tagId === TAG_DOC_CHAR_SHAPE && rec.data.length >= 18) {
      if (rec.data.length >= 50) {
        const fontSize = rec.data.readUInt32LE(42);
        const attrFlags = rec.data.readUInt32LE(46);
        charShapes.push({ fontSize, attrFlags });
      } else {
        charShapes.push({ fontSize: 0, attrFlags: 0 });
      }
    }
    if (rec.tagId === TAG_DOC_STYLE && rec.data.length >= 8) {
      try {
        let offset = 0;
        const nameLen = rec.data.readUInt16LE(offset);
        offset += 2;
        const nameBytes = nameLen * 2;
        const name = nameBytes > 0 && offset + nameBytes <= rec.data.length ? rec.data.subarray(offset, offset + nameBytes).toString("utf16le") : "";
        offset += nameBytes;
        let nameKo = "";
        if (offset + 2 <= rec.data.length) {
          const nameKoLen = rec.data.readUInt16LE(offset);
          offset += 2;
          const nameKoBytes = nameKoLen * 2;
          if (nameKoBytes > 0 && offset + nameKoBytes <= rec.data.length) {
            nameKo = rec.data.subarray(offset, offset + nameKoBytes).toString("utf16le");
          }
          offset += nameKoBytes;
        }
        const type = offset < rec.data.length ? rec.data.readUInt8(offset) : 0;
        offset += 1;
        offset += 2;
        offset += 2;
        const paraShapeId = offset + 2 <= rec.data.length ? rec.data.readUInt16LE(offset) : 0;
        offset += 2;
        const charShapeId = offset + 2 <= rec.data.length ? rec.data.readUInt16LE(offset) : 0;
        styles.push({ name, nameKo, charShapeId, paraShapeId, type });
      } catch (e15) {
      }
    }
  }
  return { charShapes, paraShapes, styles };
}
function extractTextWithControls(data, resolveControl) {
  let result = "";
  let i = 0;
  while (i + 1 < data.length) {
    const ch = data.readUInt16LE(i);
    i += 2;
    switch (ch) {
      // ── char 타입 (2바이트만, 확장 데이터 없음) ──
      case CHAR_LINE:
        result += "\n";
        break;
      case CHAR_SECTION_BREAK: {
        if (i + 16 <= data.length && data.readUInt16LE(i) === 11) {
          const ctrlId = data.subarray(i + 2, i + 6).toString("ascii");
          const replacement = _optionalChain([resolveControl, 'optionalCall', _21 => _21(ctrlId)]);
          if (replacement) result += replacement;
          i += 16;
          break;
        }
        result += "\n";
        if (i + 14 <= data.length) i += 14;
        break;
      }
      case CHAR_PARA:
        break;
      // 문단 끝
      case CHAR_HYPHEN:
        result += "-";
        break;
      case CHAR_NBSP:
        result += " ";
        break;
      case CHAR_FIXED_NBSP:
        result += "\xA0";
        break;
      // 진짜 NBSP
      case CHAR_FIXED_WIDTH:
        result += " ";
        break;
      // 고정폭 공백
      // ── inline 타입 (2바이트 + 14바이트 확장) ──
      case CHAR_TAB:
        result += "	";
        if (i + 14 <= data.length) i += 14;
        break;
      default:
        if (ch >= 1 && ch <= 31) {
          const isExtended = ch >= 1 && ch <= 3 || ch >= 11 && ch <= 12 || ch >= 14 && ch <= 18 || ch >= 21 && ch <= 23;
          const isInline = ch >= 4 && ch <= 9 || ch >= 19 && ch <= 20;
          if ((isExtended || isInline) && i + 14 <= data.length) {
            const ctrlId = data.subarray(i, i + 4).toString("ascii");
            const replacement = _optionalChain([resolveControl, 'optionalCall', _22 => _22(ctrlId)]);
            if (replacement) result += replacement;
            i += 14;
          }
        } else if (ch >= 32) {
          if (ch >= 55296 && ch <= 56319 && i + 1 < data.length) {
            const lo = data.readUInt16LE(i);
            if (lo >= 56320 && lo <= 57343) {
              i += 2;
              const codePoint = (ch - 55296 << 10) + (lo - 56320) + 65536;
              result += String.fromCodePoint(codePoint);
              break;
            }
          }
          result += String.fromCharCode(ch);
        }
        break;
    }
  }
  return result;
}
function extractEquationText(data) {
  if (data.length < 6) return null;
  const scriptLength = data.readUInt16LE(4);
  const scriptStart = 6;
  const scriptEnd = scriptStart + scriptLength * 2;
  if (scriptLength <= 0 || scriptEnd > data.length) return null;
  const equation = data.subarray(scriptStart, scriptEnd).toString("utf16le").replace(/\0+/g, "").trim();
  return equation || null;
}

// src/hwp5/aes.ts
var S_BOX = new Uint8Array([
  99,
  124,
  119,
  123,
  242,
  107,
  111,
  197,
  48,
  1,
  103,
  43,
  254,
  215,
  171,
  118,
  202,
  130,
  201,
  125,
  250,
  89,
  71,
  240,
  173,
  212,
  162,
  175,
  156,
  164,
  114,
  192,
  183,
  253,
  147,
  38,
  54,
  63,
  247,
  204,
  52,
  165,
  229,
  241,
  113,
  216,
  49,
  21,
  4,
  199,
  35,
  195,
  24,
  150,
  5,
  154,
  7,
  18,
  128,
  226,
  235,
  39,
  178,
  117,
  9,
  131,
  44,
  26,
  27,
  110,
  90,
  160,
  82,
  59,
  214,
  179,
  41,
  227,
  47,
  132,
  83,
  209,
  0,
  237,
  32,
  252,
  177,
  91,
  106,
  203,
  190,
  57,
  74,
  76,
  88,
  207,
  208,
  239,
  170,
  251,
  67,
  77,
  51,
  133,
  69,
  249,
  2,
  127,
  80,
  60,
  159,
  168,
  81,
  163,
  64,
  143,
  146,
  157,
  56,
  245,
  188,
  182,
  218,
  33,
  16,
  255,
  243,
  210,
  205,
  12,
  19,
  236,
  95,
  151,
  68,
  23,
  196,
  167,
  126,
  61,
  100,
  93,
  25,
  115,
  96,
  129,
  79,
  220,
  34,
  42,
  144,
  136,
  70,
  238,
  184,
  20,
  222,
  94,
  11,
  219,
  224,
  50,
  58,
  10,
  73,
  6,
  36,
  92,
  194,
  211,
  172,
  98,
  145,
  149,
  228,
  121,
  231,
  200,
  55,
  109,
  141,
  213,
  78,
  169,
  108,
  86,
  244,
  234,
  101,
  122,
  174,
  8,
  186,
  120,
  37,
  46,
  28,
  166,
  180,
  198,
  232,
  221,
  116,
  31,
  75,
  189,
  139,
  138,
  112,
  62,
  181,
  102,
  72,
  3,
  246,
  14,
  97,
  53,
  87,
  185,
  134,
  193,
  29,
  158,
  225,
  248,
  152,
  17,
  105,
  217,
  142,
  148,
  155,
  30,
  135,
  233,
  206,
  85,
  40,
  223,
  140,
  161,
  137,
  13,
  191,
  230,
  66,
  104,
  65,
  153,
  45,
  15,
  176,
  84,
  187,
  22
]);
var INV_S_BOX = new Uint8Array([
  82,
  9,
  106,
  213,
  48,
  54,
  165,
  56,
  191,
  64,
  163,
  158,
  129,
  243,
  215,
  251,
  124,
  227,
  57,
  130,
  155,
  47,
  255,
  135,
  52,
  142,
  67,
  68,
  196,
  222,
  233,
  203,
  84,
  123,
  148,
  50,
  166,
  194,
  35,
  61,
  238,
  76,
  149,
  11,
  66,
  250,
  195,
  78,
  8,
  46,
  161,
  102,
  40,
  217,
  36,
  178,
  118,
  91,
  162,
  73,
  109,
  139,
  209,
  37,
  114,
  248,
  246,
  100,
  134,
  104,
  152,
  22,
  212,
  164,
  92,
  204,
  93,
  101,
  182,
  146,
  108,
  112,
  72,
  80,
  253,
  237,
  185,
  218,
  94,
  21,
  70,
  87,
  167,
  141,
  157,
  132,
  144,
  216,
  171,
  0,
  140,
  188,
  211,
  10,
  247,
  228,
  88,
  5,
  184,
  179,
  69,
  6,
  208,
  44,
  30,
  143,
  202,
  63,
  15,
  2,
  193,
  175,
  189,
  3,
  1,
  19,
  138,
  107,
  58,
  145,
  17,
  65,
  79,
  103,
  220,
  234,
  151,
  242,
  207,
  206,
  240,
  180,
  230,
  115,
  150,
  172,
  116,
  34,
  231,
  173,
  53,
  133,
  226,
  249,
  55,
  232,
  28,
  117,
  223,
  110,
  71,
  241,
  26,
  113,
  29,
  41,
  197,
  137,
  111,
  183,
  98,
  14,
  170,
  24,
  190,
  27,
  252,
  86,
  62,
  75,
  198,
  210,
  121,
  32,
  154,
  219,
  192,
  254,
  120,
  205,
  90,
  244,
  31,
  221,
  168,
  51,
  136,
  7,
  199,
  49,
  177,
  18,
  16,
  89,
  39,
  128,
  236,
  95,
  96,
  81,
  127,
  169,
  25,
  181,
  74,
  13,
  45,
  229,
  122,
  159,
  147,
  201,
  156,
  239,
  160,
  224,
  59,
  77,
  174,
  42,
  245,
  176,
  200,
  235,
  187,
  60,
  131,
  83,
  153,
  97,
  23,
  43,
  4,
  126,
  186,
  119,
  214,
  38,
  225,
  105,
  20,
  99,
  85,
  33,
  12,
  125
]);
var RCON = new Uint8Array([1, 2, 4, 8, 16, 32, 64, 128, 27, 54]);
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 128;
    a = a << 1 & 255;
    if (hi) a ^= 27;
    b >>= 1;
  }
  return p;
}
function expandKey(key) {
  const w = new Uint32Array(44);
  for (let i = 0; i < 4; i++) {
    w[i] = key[4 * i] << 24 | key[4 * i + 1] << 16 | key[4 * i + 2] << 8 | key[4 * i + 3];
  }
  for (let i = 4; i < 44; i++) {
    let temp = w[i - 1];
    if (i % 4 === 0) {
      temp = (temp << 8 | temp >>> 24) >>> 0;
      temp = S_BOX[temp >>> 24 & 255] << 24 | S_BOX[temp >>> 16 & 255] << 16 | S_BOX[temp >>> 8 & 255] << 8 | S_BOX[temp & 255];
      temp = (temp ^ RCON[i / 4 - 1] << 24) >>> 0;
    }
    w[i] = (w[i - 4] ^ temp) >>> 0;
  }
  return w;
}
function decryptBlock(block, roundKeys) {
  const s = new Uint8Array(16);
  for (let i = 0; i < 16; i++) s[i] = block[i];
  addRoundKey(s, roundKeys, 10);
  for (let round = 9; round >= 1; round--) {
    invShiftRows(s);
    invSubBytes(s);
    addRoundKey(s, roundKeys, round);
    invMixColumns(s);
  }
  invShiftRows(s);
  invSubBytes(s);
  addRoundKey(s, roundKeys, 0);
  return s;
}
function addRoundKey(s, w, round) {
  const base = round * 4;
  for (let c = 0; c < 4; c++) {
    const k = w[base + c];
    s[c * 4] ^= k >>> 24 & 255;
    s[c * 4 + 1] ^= k >>> 16 & 255;
    s[c * 4 + 2] ^= k >>> 8 & 255;
    s[c * 4 + 3] ^= k & 255;
  }
}
function invSubBytes(s) {
  for (let i = 0; i < 16; i++) s[i] = INV_S_BOX[s[i]];
}
function invShiftRows(s) {
  let t = s[13];
  s[13] = s[9];
  s[9] = s[5];
  s[5] = s[1];
  s[1] = t;
  t = s[2];
  s[2] = s[10];
  s[10] = t;
  t = s[6];
  s[6] = s[14];
  s[14] = t;
  t = s[3];
  s[3] = s[7];
  s[7] = s[11];
  s[11] = s[15];
  s[15] = t;
}
function invMixColumns(s) {
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
    s[i] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
    s[i + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
    s[i + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
    s[i + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
  }
}
function aes128EcbDecrypt(data, key) {
  if (key.length !== 16) throw new Error("AES-128 \uD0A4\uB294 16\uBC14\uC774\uD2B8\uC5EC\uC57C \uD569\uB2C8\uB2E4");
  if (data.length % 16 !== 0) throw new Error("AES ECB \uC785\uB825\uC740 16\uBC14\uC774\uD2B8\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4");
  const roundKeys = expandKey(key);
  const out = new Uint8Array(data.length);
  for (let offset = 0; offset < data.length; offset += 16) {
    const block = data.subarray(offset, offset + 16);
    const decrypted = decryptBlock(block, roundKeys);
    out.set(decrypted, offset);
  }
  return out;
}

// src/hwp5/crypto.ts
var MsvcLcg = class {
  
  constructor(seed) {
    this.seed = seed >>> 0;
  }
  /** 0 ~ 0x7FFF 범위 난수 반환 (MSVC rand() 호환) */
  rand() {
    this.seed = Math.imul(this.seed, 214013) + 2531011 >>> 0;
    return this.seed >>> 16 & 32767;
  }
};
function decryptDistributePayload(payload) {
  if (payload.length < 256) throw new Error("\uBC30\uD3EC\uC6A9 payload\uAC00 256\uBC14\uC774\uD2B8 \uBBF8\uB9CC\uC785\uB2C8\uB2E4");
  const seed = (payload[0] | payload[1] << 8 | payload[2] << 16 | payload[3] << 24) >>> 0;
  const lcg = new MsvcLcg(seed);
  const result = new Uint8Array(payload.subarray(0, 256));
  let i = 0;
  let n = 0;
  let key = 0;
  while (i < 256) {
    if (n === 0) {
      key = lcg.rand() & 255;
      n = (lcg.rand() & 15) + 1;
    }
    if (i >= 4) {
      result[i] ^= key;
    }
    i++;
    n--;
  }
  return result;
}
function extractAesKey(decryptedPayload) {
  const offset = 4 + (decryptedPayload[0] & 15);
  if (offset + 16 > decryptedPayload.length) {
    throw new Error("AES \uD0A4 \uCD94\uCD9C \uC2E4\uD328: \uC624\uD504\uC14B\uC774 payload \uBC94\uC704\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4");
  }
  return decryptedPayload.slice(offset, offset + 16);
}
function parseRecordHeader(data, offset) {
  if (offset + 4 > data.length) throw new Error("\uB808\uCF54\uB4DC \uD5E4\uB354 \uD30C\uC2F1 \uC2E4\uD328: \uB370\uC774\uD130 \uBD80\uC871");
  const header = (data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24) >>> 0;
  const tagId = header & 1023;
  let size = header >>> 20 & 4095;
  let headerSize = 4;
  if (size === 4095) {
    if (offset + 8 > data.length) throw new Error("\uD655\uC7A5 \uB808\uCF54\uB4DC \uD06C\uAE30 \uD30C\uC2F1 \uC2E4\uD328: \uB370\uC774\uD130 \uBD80\uC871");
    size = (data[offset + 4] | data[offset + 5] << 8 | data[offset + 6] << 16 | data[offset + 7] << 24) >>> 0;
    headerSize = 8;
  }
  return { tagId, size, headerSize };
}
var TAG_DISTRIBUTE_DOC_DATA = 16 + 12;
function decryptViewText(viewTextRaw, compressed) {
  const data = new Uint8Array(viewTextRaw);
  const rec = parseRecordHeader(data, 0);
  if (rec.tagId !== TAG_DISTRIBUTE_DOC_DATA) {
    throw new Error(`\uBC30\uD3EC\uC6A9 \uBB38\uC11C\uC758 \uCCAB \uB808\uCF54\uB4DC\uAC00 DISTRIBUTE_DOC_DATA(${TAG_DISTRIBUTE_DOC_DATA})\uAC00 \uC544\uB2D9\uB2C8\uB2E4 (\uC2E4\uC81C: ${rec.tagId})`);
  }
  const payloadStart = rec.headerSize;
  const payloadEnd = payloadStart + rec.size;
  if (payloadEnd > data.length || rec.size < 256) {
    throw new Error("\uBC30\uD3EC\uC6A9 payload\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
  }
  const payload = data.subarray(payloadStart, payloadStart + 256);
  const decryptedPayload = decryptDistributePayload(payload);
  const aesKey = extractAesKey(decryptedPayload);
  const encryptedStart = payloadEnd;
  const encryptedData = data.subarray(encryptedStart);
  if (encryptedData.length === 0) {
    throw new Error("\uBC30\uD3EC\uC6A9 \uBB38\uC11C\uC5D0 \uC554\uD638\uD654\uB41C \uBCF8\uBB38 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const alignedLen = encryptedData.length - encryptedData.length % 16;
  if (alignedLen === 0) {
    throw new Error("\uC554\uD638\uD654\uB41C \uB370\uC774\uD130\uAC00 \uB108\uBB34 \uC9E7\uC2B5\uB2C8\uB2E4 (16\uBC14\uC774\uD2B8 \uBBF8\uB9CC)");
  }
  const alignedData = encryptedData.subarray(0, alignedLen);
  const decrypted = aes128EcbDecrypt(alignedData, aesKey);
  if (compressed) {
    try {
      return decompressStream(Buffer.from(decrypted));
    } catch (e16) {
      return Buffer.from(decrypted);
    }
  }
  return Buffer.from(decrypted);
}

// src/hwp5/equation.ts
var WORD_COMMANDS = /* @__PURE__ */ new Map([
  ["alpha", "\\alpha"],
  ["beta", "\\beta"],
  ["gamma", "\\gamma"],
  ["delta", "\\delta"],
  ["epsilon", "\\epsilon"],
  ["theta", "\\theta"],
  ["lambda", "\\lambda"],
  ["mu", "\\mu"],
  ["pi", "\\pi"],
  ["sigma", "\\sigma"],
  ["tau", "\\tau"],
  ["phi", "\\phi"],
  ["omega", "\\omega"],
  ["sin", "\\sin"],
  ["cos", "\\cos"],
  ["tan", "\\tan"],
  ["sec", "\\sec"],
  ["csc", "\\csc"],
  ["cot", "\\cot"],
  ["log", "\\log"],
  ["ln", "\\ln"],
  ["lim", "\\lim"],
  ["inf", "\\infty"],
  ["sum", "\\sum"],
  ["smallsum", "\\sum"],
  ["prod", "\\prod"],
  ["int", "\\int"],
  ["oint", "\\oint"],
  ["rightarrow", "\\rightarrow"],
  ["leftarrow", "\\leftarrow"],
  ["partial", "\\partial"],
  ["nabla", "\\nabla"],
  ["angle", "\\angle"],
  ["triangle", "\\triangle"],
  ["vec", "\\vec"],
  ["bar", "\\overline"],
  ["dot", "\\dot"],
  ["hat", "\\hat"],
  ["left", "\\left"],
  ["right", "\\right"]
]);
var SYMBOL_WORDS = /* @__PURE__ */ new Map([
  ["times", "\\times"],
  ["divide", "\\div"],
  ["div", "\\div"],
  ["le", "\\leq"],
  ["ge", "\\geq"],
  ["geq", "\\geq"],
  ["deg", "^\\circ"],
  ["rarrow", "\\rightarrow"],
  ["larrow", "\\leftarrow"],
  ["lrarrow", "\\leftrightarrow"],
  ["in", "\\in"],
  ["notin", "\\notin"],
  ["emptyset", "\\emptyset"],
  ["subset", "\\subset"],
  ["nsubset", "\\nsubseteq"],
  ["cup", "\\cup"],
  ["cap", "\\cap"],
  ["smallinter", "\\cap"],
  ["sim", "\\sim"],
  ["circ", "\\circ"],
  ["bot", "\\perp"],
  ["dyad", "\\overleftrightarrow"],
  ["arch", "\\overset{\\frown}"]
]);
function hwpEquationToLatex(equation) {
  return convertEquation(equation.replace(/\0/g, "").trim(), 0);
}
function convertEquation(equation, depth) {
  if (!equation || depth > 12) return equation;
  let result = equation.replace(/\s+/g, " ").replace(/`+/g, "\\,").replace(/~+/g, "\\,").trim();
  result = convertMatrixLike(result);
  result = convertRoots(result, depth);
  result = convertOver(result, depth);
  result = convertSqrt(result, depth);
  result = convertScripts(result);
  result = convertOperators(result);
  result = removeFontDirectives(result);
  result = convertWords(result);
  result = cleanupLatexSpacing(result);
  return result;
}
function convertMatrixLike(input) {
  return input.replace(
    /\bmatrix\s*\{([^{}]*)\}/gi,
    (_match, body) => `\\begin{matrix} ${body.split("#").map((part) => part.trim()).join(" & ")} \\end{matrix}`
  ).replace(
    /\bcases\s*\{([^{}]*)\}/gi,
    (_match, body) => `\\begin{cases} ${body.split("#").map((part) => part.trim()).join(" \\\\ ")} \\end{cases}`
  );
}
function convertRoots(input, depth) {
  return input.replace(/(?<!\\)\broot\s+({[^{}]*}|\S+)\s+of\s+({[^{}]*}|\S+)/gi, (_match, degree, radicand) => {
    return `\\sqrt[${convertEquation(unwrapGroup(degree), depth + 1)}]{${convertEquation(unwrapGroup(radicand), depth + 1)}}`;
  });
}
function convertSqrt(input, depth) {
  return input.replace(/(?<!\\)\bsqrt\s*({[^{}]*}|\S+)/gi, (_match, radicand) => {
    return `\\sqrt{${convertEquation(unwrapGroup(radicand), depth + 1)}}`;
  });
}
function convertOver(input, depth) {
  let result = input;
  for (let guard = 0; guard < 50; guard++) {
    const over = findTopLevelWord(result, "over");
    if (over < 0) break;
    const left = readLeftAtom(result, over);
    const right = readRightAtom(result, over + "over".length);
    if (!left || !right) break;
    const numerator = convertEquation(unwrapGroup(left.atom), depth + 1);
    const denominator = convertEquation(unwrapGroup(right.atom), depth + 1);
    result = result.slice(0, left.start) + `\\frac{${numerator}}{${denominator}}` + result.slice(right.end);
  }
  return result;
}
function convertScripts(input) {
  return input.replace(/\s*\^\s*/g, "^").replace(/\s*_\s*/g, "_").replace(/\^(?!\{)([^\s{}_^]+)/g, "^{$1}").replace(/_(?!\{)([^\s{}_^]+)/g, "_{$1}");
}
function convertOperators(input) {
  return input.replace(/\+-/g, "\\pm").replace(/-\+/g, "\\mp").replace(/\/\//g, "\\parallel").replace(/△/g, "\\triangle ").replace(/□/g, "\\square ").replace(/‧/g, "\\cdot ").replace(/!=/g, "\\neq").replace(/<=/g, "\\leq").replace(/>=/g, "\\geq").replace(/==/g, "\\equiv");
}
function removeFontDirectives(input) {
  return input.replace(/(?<!\\)\b(?:rm|it)\b\s*/gi, "");
}
function convertWords(input) {
  return input.replace(/(?<![\\A-Za-z0-9])([A-Za-z][A-Za-z0-9]*)(?![A-Za-z0-9])/g, (word) => {
    const exact = SYMBOL_WORDS.get(word);
    if (exact) return exact;
    const lower = word.toLowerCase();
    return _nullishCoalesce(_nullishCoalesce(SYMBOL_WORDS.get(lower), () => ( WORD_COMMANDS.get(lower))), () => ( word));
  });
}
function cleanupLatexSpacing(input) {
  return input.replace(/\\left\s*\{/g, "\\left\\{").replace(/\\right\s*\}/g, "\\right\\}").replace(/\\left\s*([\[\]\(\)\|])/g, "\\left$1").replace(/\\right\s*([\[\]\(\)\|])/g, "\\right$1").replace(/\s*\\,\s*/g, "\\,").replace(/\s+/g, " ").replace(/\{\s+/g, "{").replace(/\s+\}/g, "}").trim();
}
function findTopLevelWord(input, word) {
  let curly = 0;
  let paren = 0;
  for (let i = 0; i <= input.length - word.length; i++) {
    const ch = input[i];
    if (ch === "{") curly++;
    else if (ch === "}") curly = Math.max(0, curly - 1);
    else if (ch === "(") paren++;
    else if (ch === ")") paren = Math.max(0, paren - 1);
    if (curly !== 0 || paren !== 0) continue;
    if (input.slice(i, i + word.length).toLowerCase() !== word) continue;
    if (isWordChar(input[i - 1]) || isWordChar(input[i + word.length])) continue;
    return i;
  }
  return -1;
}
function readLeftAtom(input, end) {
  let pos = end - 1;
  while (pos >= 0 && /\s/.test(input[pos])) pos--;
  if (pos < 0) return null;
  if (input[pos] === "}") {
    const start2 = findMatchingLeft(input, pos, "{", "}");
    if (start2 >= 0) return { start: start2, atom: input.slice(start2, pos + 1) };
  }
  if (input[pos] === ")") {
    const start2 = findMatchingLeft(input, pos, "(", ")");
    if (start2 >= 0) return { start: start2, atom: input.slice(start2, pos + 1) };
  }
  let start = pos;
  while (start >= 0 && !/\s/.test(input[start]) && !/[+\-=<>]/.test(input[start])) start--;
  return { start: start + 1, atom: input.slice(start + 1, pos + 1) };
}
function readRightAtom(input, start) {
  let pos = start;
  while (pos < input.length && /\s/.test(input[pos])) pos++;
  if (pos >= input.length) return null;
  if (input[pos] === "{") {
    const end2 = findMatchingRight(input, pos, "{", "}");
    if (end2 >= 0) return { end: end2 + 1, atom: input.slice(pos, end2 + 1) };
  }
  if (input[pos] === "(") {
    const end2 = findMatchingRight(input, pos, "(", ")");
    if (end2 >= 0) return { end: end2 + 1, atom: input.slice(pos, end2 + 1) };
  }
  let end = pos;
  while (end < input.length && !/\s/.test(input[end]) && !/[+\-=<>]/.test(input[end])) end++;
  return { end, atom: input.slice(pos, end) };
}
function findMatchingLeft(input, closeIndex, open, close) {
  let depth = 0;
  for (let i = closeIndex; i >= 0; i--) {
    if (input[i] === close) depth++;
    else if (input[i] === open) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function findMatchingRight(input, openIndex, open, close) {
  let depth = 0;
  for (let i = openIndex; i < input.length; i++) {
    if (input[i] === open) depth++;
    else if (input[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function unwrapGroup(input) {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed.slice(1, -1);
  return trimmed;
}
function isWordChar(ch) {
  return !!ch && /[A-Za-z0-9_]/.test(ch);
}

// src/hwp5/cfb-lenient.ts
var CFB_MAGIC = Buffer.from([208, 207, 17, 224, 161, 177, 26, 225]);
var END_OF_CHAIN = 4294967294;
var FREE_SECT = 4294967295;
var MAX_CHAIN_LENGTH = 1e6;
var MAX_DIR_ENTRIES = 1e5;
var MAX_STREAM_SIZE = 100 * 1024 * 1024;
function parseLenientCfb(data) {
  if (data.length < 512) throw new Error("CFB \uD30C\uC77C\uC774 \uB108\uBB34 \uC9E7\uC2B5\uB2C8\uB2E4 (\uCD5C\uC18C 512\uBC14\uC774\uD2B8)");
  if (!data.subarray(0, 8).equals(CFB_MAGIC)) throw new Error("CFB \uB9E4\uC9C1 \uBC14\uC774\uD2B8 \uBD88\uC77C\uCE58");
  const sectorSizeShift = data.readUInt16LE(30);
  if (sectorSizeShift < 7 || sectorSizeShift > 16) throw new Error("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC139\uD130 \uD06C\uAE30 \uC2DC\uD504\uD2B8: " + sectorSizeShift);
  const sectorSize = 1 << sectorSizeShift;
  const miniSectorSizeShift = data.readUInt16LE(32);
  if (miniSectorSizeShift > 16) throw new Error("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uBBF8\uB2C8 \uC139\uD130 \uD06C\uAE30 \uC2DC\uD504\uD2B8: " + miniSectorSizeShift);
  const miniSectorSize = 1 << miniSectorSizeShift;
  const fatSectorCount = data.readUInt32LE(44);
  if (fatSectorCount > 1e4) throw new Error("FAT \uC139\uD130 \uC218\uAC00 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4: " + fatSectorCount);
  const firstDirSector = data.readUInt32LE(48);
  const miniStreamCutoff = data.readUInt32LE(56);
  const firstMiniFatSector = data.readUInt32LE(60);
  const miniFatSectorCount = data.readUInt32LE(64);
  const firstDifatSector = data.readUInt32LE(68);
  const difatSectorCount = data.readUInt32LE(72);
  function sectorOffset(id) {
    return 512 + id * sectorSize;
  }
  function readSectorData(id) {
    const off = sectorOffset(id);
    if (off + sectorSize > data.length) return Buffer.alloc(0);
    return data.subarray(off, off + sectorSize);
  }
  const fatSectors = [];
  for (let i = 0; i < 109 && fatSectors.length < fatSectorCount; i++) {
    const sid = data.readUInt32LE(76 + i * 4);
    if (sid === FREE_SECT || sid === END_OF_CHAIN) break;
    fatSectors.push(sid);
  }
  let difatSector = firstDifatSector;
  const visitedDifat = /* @__PURE__ */ new Set();
  for (let d = 0; d < difatSectorCount && difatSector !== END_OF_CHAIN && difatSector !== FREE_SECT; d++) {
    if (visitedDifat.has(difatSector)) break;
    visitedDifat.add(difatSector);
    const buf = readSectorData(difatSector);
    const entriesPerSector = sectorSize / 4 - 1;
    for (let i = 0; i < entriesPerSector && fatSectors.length < fatSectorCount; i++) {
      const sid = buf.readUInt32LE(i * 4);
      if (sid === FREE_SECT || sid === END_OF_CHAIN) continue;
      fatSectors.push(sid);
    }
    difatSector = buf.readUInt32LE(entriesPerSector * 4);
  }
  const entriesPerFatSector = sectorSize / 4;
  const fatTable = new Uint32Array(fatSectors.length * entriesPerFatSector);
  for (let fi = 0; fi < fatSectors.length; fi++) {
    const buf = readSectorData(fatSectors[fi]);
    for (let i = 0; i < entriesPerFatSector; i++) {
      fatTable[fi * entriesPerFatSector + i] = i * 4 + 3 < buf.length ? buf.readUInt32LE(i * 4) : FREE_SECT;
    }
  }
  function readChain(startSector, maxBytes) {
    if (startSector === END_OF_CHAIN || startSector === FREE_SECT) return Buffer.alloc(0);
    if (maxBytes > MAX_STREAM_SIZE) throw new Error("\uC2A4\uD2B8\uB9BC\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4");
    const chunks = [];
    let current = startSector;
    let totalRead = 0;
    const visited = /* @__PURE__ */ new Set();
    while (current !== END_OF_CHAIN && current !== FREE_SECT && totalRead < maxBytes) {
      if (visited.has(current)) break;
      if (visited.size > MAX_CHAIN_LENGTH) break;
      visited.add(current);
      const buf = readSectorData(current);
      const remaining = maxBytes - totalRead;
      chunks.push(remaining < sectorSize ? buf.subarray(0, remaining) : buf);
      totalRead += Math.min(buf.length, remaining);
      current = current < fatTable.length ? fatTable[current] : END_OF_CHAIN;
    }
    return Buffer.concat(chunks);
  }
  let miniFatTable = null;
  function getMiniFatTable() {
    if (miniFatTable) return miniFatTable;
    if (miniFatSectorCount === 0 || firstMiniFatSector === END_OF_CHAIN) {
      miniFatTable = new Uint32Array(0);
      return miniFatTable;
    }
    const miniFatData = readChain(firstMiniFatSector, miniFatSectorCount * sectorSize);
    const entries = miniFatData.length / 4;
    miniFatTable = new Uint32Array(entries);
    for (let i = 0; i < entries; i++) {
      miniFatTable[i] = miniFatData.readUInt32LE(i * 4);
    }
    return miniFatTable;
  }
  const dirData = readChain(firstDirSector, MAX_DIR_ENTRIES * 128);
  const dirEntries = [];
  for (let offset = 0; offset + 128 <= dirData.length && dirEntries.length < MAX_DIR_ENTRIES; offset += 128) {
    const nameLen = dirData.readUInt16LE(offset + 64);
    if (nameLen <= 0 || nameLen > 64) {
      dirEntries.push({ name: "", type: 0, startSector: 0, size: 0 });
      continue;
    }
    const nameBytes = nameLen - 2;
    const name = nameBytes > 0 ? dirData.subarray(offset, offset + nameBytes).toString("utf16le") : "";
    const type = dirData[offset + 66];
    const startSector = dirData.readUInt32LE(offset + 116);
    const size = dirData.readUInt32LE(offset + 120);
    dirEntries.push({ name, type, startSector, size });
  }
  let miniStreamData = null;
  function getMiniStream() {
    if (miniStreamData) return miniStreamData;
    const root = dirEntries[0];
    if (!root || root.type !== 5) {
      miniStreamData = Buffer.alloc(0);
      return miniStreamData;
    }
    miniStreamData = readChain(root.startSector, root.size || MAX_STREAM_SIZE);
    return miniStreamData;
  }
  function readMiniStream(startSector, size) {
    const mft = getMiniFatTable();
    const ms = getMiniStream();
    if (mft.length === 0 || ms.length === 0) return Buffer.alloc(0);
    const chunks = [];
    let current = startSector;
    let totalRead = 0;
    const visited = /* @__PURE__ */ new Set();
    while (current !== END_OF_CHAIN && current !== FREE_SECT && totalRead < size) {
      if (visited.has(current)) break;
      if (visited.size > MAX_CHAIN_LENGTH) break;
      visited.add(current);
      const off = current * miniSectorSize;
      const remaining = size - totalRead;
      const chunkSize = Math.min(miniSectorSize, remaining);
      if (off + chunkSize <= ms.length) {
        chunks.push(ms.subarray(off, off + chunkSize));
      }
      totalRead += chunkSize;
      current = current < mft.length ? mft[current] : END_OF_CHAIN;
    }
    return Buffer.concat(chunks);
  }
  function readStreamData(entry) {
    if (entry.size === 0) return Buffer.alloc(0);
    if (entry.size < miniStreamCutoff) {
      const miniResult = readMiniStream(entry.startSector, entry.size);
      if (miniResult.length > 0) return miniResult;
    }
    return readChain(entry.startSector, entry.size);
  }
  function findEntryByPath(path) {
    const parts = path.replace(/^\//, "").split("/");
    if (parts.length === 1) {
      return _nullishCoalesce(dirEntries.find((e) => e.name === parts[0] && e.type === 2), () => ( null));
    }
    const storageName = parts[0];
    const streamName = parts.slice(1).join("/");
    for (const e of dirEntries) {
      if (e.type === 2 && e.name === streamName) {
        return e;
      }
    }
    const lastPart = parts[parts.length - 1];
    return _nullishCoalesce(dirEntries.find((e) => e.type === 2 && e.name === lastPart), () => ( null));
  }
  return {
    findStream(path) {
      const normalized = path.replace(/^\//, "");
      const entry = findEntryByPath(normalized);
      if (!entry || entry.type !== 2) return null;
      const stream = readStreamData(entry);
      return stream.length > 0 ? stream : null;
    },
    entries() {
      return dirEntries.filter((e) => e.type === 2);
    }
  };
}

// src/hwp5/parser.ts
var _module = require('module');
var require2 = _module.createRequire.call(void 0, import.meta.url);
var CFB = require2("cfb");
var MAX_SECTIONS = 100;
var MAX_TOTAL_DECOMPRESS = 100 * 1024 * 1024;
function parseHwp5Document(buffer, options) {
  let cfb = null;
  let lenientCfb = null;
  const warnings = [];
  try {
    cfb = CFB.parse(buffer);
  } catch (e17) {
    try {
      lenientCfb = parseLenientCfb(buffer);
      warnings.push({ message: "\uC190\uC0C1\uB41C CFB \uCEE8\uD14C\uC774\uB108 \u2014 lenient \uBAA8\uB4DC\uB85C \uBCF5\uAD6C", code: "LENIENT_CFB_RECOVERY" });
    } catch (e18) {
      throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("CFB \uCEE8\uD14C\uC774\uB108 \uD30C\uC2F1 \uC2E4\uD328 (strict \uBC0F lenient \uBAA8\uB450)");
    }
  }
  const findStream = (path) => {
    if (cfb) {
      const entry = CFB.find(cfb, path);
      return _optionalChain([entry, 'optionalAccess', _23 => _23.content]) ? Buffer.from(entry.content) : null;
    }
    return lenientCfb.findStream(path);
  };
  const headerData = findStream("/FileHeader");
  if (!headerData) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("FileHeader \uC2A4\uD2B8\uB9BC \uC5C6\uC74C");
  const header = parseFileHeader(headerData);
  if (header.signature !== "HWP Document File") throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("HWP \uC2DC\uADF8\uB2C8\uCC98 \uBD88\uC77C\uCE58");
  if (header.flags & FLAG_ENCRYPTED) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uC554\uD638\uD654\uB41C HWP\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
  if (header.flags & FLAG_DRM) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("DRM \uBCF4\uD638\uB41C HWP\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
  const compressed = (header.flags & FLAG_COMPRESSED) !== 0;
  const distribution = (header.flags & FLAG_DISTRIBUTION) !== 0;
  const metadata = {
    version: `${header.versionMajor}.x`
  };
  if (cfb) extractHwp5Metadata(cfb, metadata);
  const docInfo = cfb ? parseDocInfoStream(cfb, compressed) : parseDocInfoFromStream(findStream("/DocInfo"), compressed);
  const sections = distribution ? cfb ? findViewTextSections(cfb, compressed) : findViewTextSectionsLenient(lenientCfb, compressed) : cfb ? findSections(cfb) : findSectionsLenient(lenientCfb, compressed);
  if (sections.length === 0) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uC139\uC158 \uC2A4\uD2B8\uB9BC\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  metadata.pageCount = sections.length;
  const pageFilter = _optionalChain([options, 'optionalAccess', _24 => _24.pages]) ? _chunkMUOQXDZ4cjs.parsePageRange.call(void 0, options.pages, sections.length) : null;
  const totalTarget = pageFilter ? pageFilter.size : sections.length;
  const blocks = [];
  const nestedTableCounter = { count: 0 };
  let totalDecompressed = 0;
  let parsedSections = 0;
  for (let si = 0; si < sections.length; si++) {
    if (pageFilter && !pageFilter.has(si + 1)) continue;
    try {
      const sectionData = sections[si];
      const data = !distribution && compressed ? decompressStream(Buffer.from(sectionData)) : Buffer.from(sectionData);
      totalDecompressed += data.length;
      if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
      const records = readRecords(data);
      const sectionBlocks = parseSection(records, docInfo, warnings, si + 1, nestedTableCounter);
      blocks.push(...sectionBlocks);
      parsedSections++;
      _optionalChain([options, 'optionalAccess', _25 => _25.onProgress, 'optionalCall', _26 => _26(parsedSections, totalTarget)]);
    } catch (secErr) {
      if (secErr instanceof _chunkJ3FHRU5Tcjs.KordocError) throw secErr;
      warnings.push({ page: si + 1, message: `\uC139\uC158 ${si + 1} \uD30C\uC2F1 \uC2E4\uD328: ${secErr instanceof Error ? secErr.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}`, code: "PARTIAL_PARSE" });
    }
  }
  const images = cfb ? extractHwp5Images(cfb, blocks, compressed, warnings) : extractHwp5ImagesLenient(lenientCfb, blocks, compressed, warnings);
  const flatBlocks = _chunkJ3FHRU5Tcjs.flattenLayoutTables.call(void 0, blocks);
  if (docInfo) {
    detectHwp5Headings(flatBlocks, docInfo);
  }
  const outline = flatBlocks.filter((b) => b.type === "heading" && b.level && b.text).map((b) => ({ level: b.level, text: b.text, pageNumber: b.pageNumber }));
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, flatBlocks);
  return { markdown, blocks: flatBlocks, metadata, outline: outline.length > 0 ? outline : void 0, warnings: warnings.length > 0 ? warnings : void 0, images: images.length > 0 ? images : void 0 };
}
function parseDocInfoStream(cfb, compressed) {
  try {
    const entry = CFB.find(cfb, "/DocInfo");
    if (!_optionalChain([entry, 'optionalAccess', _27 => _27.content])) return null;
    const data = compressed ? decompressStream(Buffer.from(entry.content)) : Buffer.from(entry.content);
    const records = readRecords(data);
    return parseDocInfo(records);
  } catch (e19) {
    return null;
  }
}
function parseDocInfoFromStream(raw, compressed) {
  if (!raw) return null;
  try {
    const data = compressed ? decompressStream(raw) : raw;
    return parseDocInfo(readRecords(data));
  } catch (e20) {
    return null;
  }
}
function detectHwp5Headings(blocks, docInfo) {
  let baseFontSize = 0;
  for (const style of docInfo.styles) {
    const name = (style.nameKo || style.name).toLowerCase();
    if (name.includes("\uBC14\uD0D5") || name.includes("\uBCF8\uBB38") || name === "normal" || name === "body") {
      const cs = docInfo.charShapes[style.charShapeId];
      if (_optionalChain([cs, 'optionalAccess', _28 => _28.fontSize]) > 0) {
        baseFontSize = cs.fontSize / 10;
        break;
      }
    }
  }
  if (baseFontSize === 0) {
    const sizeFreq = /* @__PURE__ */ new Map();
    for (const b of blocks) {
      if (_optionalChain([b, 'access', _29 => _29.style, 'optionalAccess', _30 => _30.fontSize])) {
        sizeFreq.set(b.style.fontSize, (sizeFreq.get(b.style.fontSize) || 0) + 1);
      }
    }
    let maxCount = 0;
    for (const [size, count] of sizeFreq) {
      if (count > maxCount) {
        maxCount = count;
        baseFontSize = size;
      }
    }
  }
  if (baseFontSize <= 0) return;
  for (const block of blocks) {
    if (block.type === "heading") continue;
    if (block.type !== "paragraph" || !block.text) continue;
    const text = block.text.trim();
    if (text.length === 0 || text.length > 200) continue;
    if (/^\d+$/.test(text)) continue;
    let level = 0;
    if (_optionalChain([block, 'access', _31 => _31.style, 'optionalAccess', _32 => _32.fontSize]) && baseFontSize > 0) {
      const ratio = block.style.fontSize / baseFontSize;
      if (ratio >= _chunkJ3FHRU5Tcjs.HEADING_RATIO_H1) level = 1;
      else if (ratio >= _chunkJ3FHRU5Tcjs.HEADING_RATIO_H2) level = 2;
      else if (ratio >= _chunkJ3FHRU5Tcjs.HEADING_RATIO_H3) level = 3;
    }
    if (/^제\d+[장절편]\s/.test(text) && text.length <= 50) {
      if (level === 0) level = 2;
    } else if (/^제\d+(조의?\d*)\s*[\(（]/.test(text) && text.length <= 80) {
      if (level === 0) level = 3;
    }
    if (level > 0) {
      block.type = "heading";
      block.level = level;
    }
  }
}
function extractHwp5Metadata(cfb, metadata) {
  try {
    const summaryEntry = CFB.find(cfb, "/HwpSummaryInformation") || CFB.find(cfb, "/SummaryInformation");
    if (!_optionalChain([summaryEntry, 'optionalAccess', _33 => _33.content])) return;
    const data = Buffer.from(summaryEntry.content);
    if (data.length < 48) return;
    const numSets = data.readUInt32LE(24);
    if (numSets === 0) return;
    const setOffset = data.readUInt32LE(44);
    if (setOffset >= data.length - 8) return;
    const numProps = data.readUInt32LE(setOffset + 4);
    if (numProps === 0 || numProps > 100) return;
    for (let i = 0; i < numProps; i++) {
      const entryOffset = setOffset + 8 + i * 8;
      if (entryOffset + 8 > data.length) break;
      const propId = data.readUInt32LE(entryOffset);
      const propOffset = setOffset + data.readUInt32LE(entryOffset + 4);
      if (propOffset + 8 > data.length) continue;
      if (propId !== 2 && propId !== 4 && propId !== 6) continue;
      const propType = data.readUInt32LE(propOffset);
      if (propType !== 30) continue;
      const strLen = data.readUInt32LE(propOffset + 4);
      if (strLen === 0 || strLen > 1e4 || propOffset + 8 + strLen > data.length) continue;
      const str = data.subarray(propOffset + 8, propOffset + 8 + strLen).toString("utf8").replace(/\0+$/, "").trim();
      if (!str) continue;
      if (propId === 2) metadata.title = str;
      else if (propId === 4) metadata.author = str;
      else if (propId === 6) metadata.description = str;
    }
  } catch (e21) {
  }
}
function findViewTextSections(cfb, compressed) {
  const sections = [];
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const entry = CFB.find(cfb, `/ViewText/Section${i}`);
    if (!_optionalChain([entry, 'optionalAccess', _34 => _34.content])) break;
    try {
      const decrypted = decryptViewText(Buffer.from(entry.content), compressed);
      sections.push({ idx: i, content: decrypted });
    } catch (e22) {
      break;
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
function findSections(cfb) {
  const sections = [];
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const entry = CFB.find(cfb, `/BodyText/Section${i}`);
    if (!_optionalChain([entry, 'optionalAccess', _35 => _35.content])) break;
    sections.push({ idx: i, content: Buffer.from(entry.content) });
  }
  if (sections.length === 0 && cfb.FileIndex) {
    for (const entry of cfb.FileIndex) {
      if (sections.length >= MAX_SECTIONS) break;
      if (_optionalChain([entry, 'access', _36 => _36.name, 'optionalAccess', _37 => _37.startsWith, 'call', _38 => _38("Section")]) && entry.content) {
        const idx = parseInt(entry.name.replace("Section", ""), 10) || 0;
        sections.push({ idx, content: Buffer.from(entry.content) });
      }
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
function findSectionsLenient(lcfb, compressed) {
  const sections = [];
  let totalDecompressed = 0;
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const raw = _nullishCoalesce(lcfb.findStream(`/BodyText/Section${i}`), () => ( lcfb.findStream(`Section${i}`)));
    if (!raw) break;
    const content = compressed ? decompressStream(raw) : raw;
    totalDecompressed += content.length;
    if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
    sections.push({ idx: i, content });
  }
  if (sections.length === 0) {
    for (const e of lcfb.entries()) {
      if (sections.length >= MAX_SECTIONS) break;
      if (e.name.startsWith("Section")) {
        const idx = parseInt(e.name.replace("Section", ""), 10) || 0;
        const raw = lcfb.findStream(e.name);
        if (raw) {
          const content = compressed ? decompressStream(raw) : raw;
          totalDecompressed += content.length;
          if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
          sections.push({ idx, content });
        }
      }
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
function findViewTextSectionsLenient(lcfb, compressed) {
  const sections = [];
  let totalDecompressed = 0;
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const raw = _nullishCoalesce(lcfb.findStream(`/ViewText/Section${i}`), () => ( lcfb.findStream(`Section${i}`)));
    if (!raw) break;
    try {
      const content = decryptViewText(raw, compressed);
      totalDecompressed += content.length;
      if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
      sections.push({ idx: i, content });
    } catch (e23) {
      break;
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
var TAG_SHAPE_COMPONENT = 74;
var CTRL_ID_EQEDIT = "deqe";
function extractBinDataId(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 50; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.data.length >= 2) {
      if (r.tagId > TAG_SHAPE_COMPONENT && r.level > ctrlLevel + 1 && r.data.length >= 4) {
        const possibleId = r.data.readUInt16LE(0);
        if (possibleId < 1e4) return possibleId;
      }
    }
  }
  return -1;
}
function isEquationControlId(ctrlId) {
  return ctrlId === CTRL_ID_EQEDIT || ctrlId === "eqed";
}
function formatEquationForMarkdown(equation) {
  const normalized = hwpEquationToLatex(equation);
  if (!normalized) return "";
  return `$${normalized.replace(/\$/g, "\\$")}$`;
}
function extractEquationFromControl(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 10; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.tagId !== TAG_EQEDIT) continue;
    const equation = extractEquationText(r.data);
    return equation ? formatEquationForMarkdown(equation) : null;
  }
  return null;
}
function renderTextWithEquations(textRecords, equations) {
  const queue = [...equations];
  return textRecords.map((data) => extractTextWithControls(data, (ctrlId) => {
    if (!isEquationControlId(ctrlId) || queue.length === 0) return null;
    return queue.shift();
  })).join("").replace(/\$\$/g, "$ $");
}
function detectImageMime(data) {
  if (data.length < 4) return null;
  if (data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71) return "image/png";
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) return "image/jpeg";
  if (data[0] === 71 && data[1] === 73 && data[2] === 70) return "image/gif";
  if (data[0] === 66 && data[1] === 77) return "image/bmp";
  if (data[0] === 215 && data[1] === 205 && data[2] === 198 && data[3] === 154) return "image/wmf";
  if (data[0] === 1 && data[1] === 0 && data[2] === 0 && data[3] === 0) return "image/emf";
  return null;
}
function extractHwp5Images(cfb, blocks, compressed, warnings) {
  const binDataMap = /* @__PURE__ */ new Map();
  const binDataRe = /\/BinData\/[Bb][Ii][Nn](\d{4})$/;
  if (cfb.FileIndex) {
    for (const entry of cfb.FileIndex) {
      if (!_optionalChain([entry, 'optionalAccess', _39 => _39.name]) || !entry.content) continue;
      const match = entry.name.match(binDataRe);
      if (!match) continue;
      const idx = parseInt(match[1], 10);
      let data = Buffer.from(entry.content);
      if (compressed) {
        try {
          data = decompressStream(data);
        } catch (e24) {
        }
      }
      binDataMap.set(idx, { data, name: entry.name });
    }
  }
  if (binDataMap.size === 0) return [];
  const images = [];
  let imageIndex = 0;
  for (const block of blocks) {
    if (block.type !== "image" || !block.text) continue;
    const binId = parseInt(block.text, 10);
    if (isNaN(binId)) continue;
    const bin = binDataMap.get(binId);
    if (!bin) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId} \uC5C6\uC74C`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: BinData ${binId}]`;
      continue;
    }
    const mime = detectImageMime(bin.data);
    if (!mime) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId}: \uC54C \uC218 \uC5C6\uB294 \uC774\uBBF8\uC9C0 \uD615\uC2DD`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: ${bin.name}]`;
      continue;
    }
    imageIndex++;
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("png") ? "png" : mime.includes("gif") ? "gif" : mime.includes("bmp") ? "bmp" : "bin";
    const filename = `image_${String(imageIndex).padStart(3, "0")}.${ext}`;
    images.push({ filename, data: new Uint8Array(bin.data), mimeType: mime });
    block.text = filename;
    block.imageData = { data: new Uint8Array(bin.data), mimeType: mime, filename: bin.name };
  }
  return images;
}
function extractHwp5ImagesLenient(lcfb, blocks, compressed, warnings) {
  const binDataMap = /* @__PURE__ */ new Map();
  const binRe = /^BIN(\d{4})/i;
  for (const e of lcfb.entries()) {
    const match = e.name.match(binRe);
    if (!match) continue;
    const idx = parseInt(match[1], 10);
    let raw = lcfb.findStream(e.name);
    if (!raw) continue;
    if (compressed) {
      try {
        raw = decompressStream(raw);
      } catch (e25) {
      }
    }
    binDataMap.set(idx, { data: raw, name: e.name });
  }
  if (binDataMap.size === 0) return [];
  const images = [];
  let imageIndex = 0;
  for (const block of blocks) {
    if (block.type !== "image" || !block.text) continue;
    const binId = parseInt(block.text, 10);
    if (isNaN(binId)) continue;
    const bin = binDataMap.get(binId);
    if (!bin) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId} \uFFFD\uFFFD\uFFFD\uC74C`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: BinData ${binId}]`;
      continue;
    }
    const mime = detectImageMime(bin.data);
    if (!mime) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId}: \uC54C \uC218 \uC5C6\uB294 \uC774\uBBF8\uC9C0 \uD615\uC2DD`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: ${bin.name}]`;
      continue;
    }
    imageIndex++;
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("png") ? "png" : mime.includes("gif") ? "gif" : mime.includes("bmp") ? "bmp" : "bin";
    const filename = `image_${String(imageIndex).padStart(3, "0")}.${ext}`;
    images.push({ filename, data: new Uint8Array(bin.data), mimeType: mime });
    block.text = filename;
    block.imageData = { data: new Uint8Array(bin.data), mimeType: mime, filename: bin.name };
  }
  return images;
}
function parseSection(records, docInfo, warnings, sectionNum, counter) {
  const blocks = [];
  let i = 0;
  while (i < records.length) {
    const rec = records[i];
    if (rec.tagId === TAG_PARA_HEADER && rec.level === 0) {
      const { paragraph, tables, nextIdx, charShapeIds, paraShapeId } = parseParagraphWithTables(records, i, counter);
      if (paragraph) {
        const block = { type: "paragraph", text: paragraph, pageNumber: sectionNum };
        if (docInfo && charShapeIds.length > 0) {
          const style = resolveCharStyle(charShapeIds, docInfo);
          if (style) block.style = style;
        }
        if (docInfo && paraShapeId >= 0 && paraShapeId < docInfo.paraShapes.length) {
          const ol = docInfo.paraShapes[paraShapeId].outlineLevel;
          if (ol >= 1 && ol <= 6) {
            block.type = "heading";
            block.level = ol;
          }
        }
        blocks.push(block);
      }
      for (const t of tables) blocks.push({ type: "table", table: t, pageNumber: sectionNum });
      i = nextIdx;
      continue;
    }
    if (rec.tagId === TAG_CTRL_HEADER && rec.level <= 1 && rec.data.length >= 4) {
      const ctrlId = rec.data.subarray(0, 4).toString("ascii");
      if (ctrlId === " lbt" || ctrlId === "tbl ") {
        const { table, nextIdx } = parseTableBlock(records, i, counter);
        if (table) blocks.push({ type: "table", table, pageNumber: sectionNum });
        i = nextIdx;
        continue;
      }
      if (ctrlId === "gso " || ctrlId === " osg") {
        const binId = extractBinDataId(records, i);
        if (binId >= 0) {
          blocks.push({ type: "image", text: String(binId), pageNumber: sectionNum });
        } else {
          const boxText = extractTextBoxText(records, i);
          if (boxText) {
            blocks.push({ type: "paragraph", text: boxText, pageNumber: sectionNum });
          }
        }
      } else if (ctrlId === " elo" || ctrlId === "ole ") {
        warnings.push({ page: sectionNum, message: `\uC2A4\uD0B5\uB41C \uC81C\uC5B4 \uC694\uC18C: ${ctrlId.trim()}`, code: "SKIPPED_IMAGE" });
      } else if (ctrlId === "fn  " || ctrlId === " nf " || ctrlId === "en  " || ctrlId === " ne ") {
        const noteText = extractNoteText(records, i);
        if (noteText && blocks.length > 0) {
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock.type === "paragraph") {
            lastBlock.footnoteText = lastBlock.footnoteText ? lastBlock.footnoteText + "; " + noteText : noteText;
          }
        }
      } else if (ctrlId === "%tok" || ctrlId === "klnk") {
        const url = extractHyperlinkUrl(rec.data);
        if (url && blocks.length > 0) {
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock.type === "paragraph" && !lastBlock.href) {
            lastBlock.href = _nullishCoalesce(_chunkJ3FHRU5Tcjs.sanitizeHref.call(void 0, url), () => ( void 0));
          }
        }
      }
    }
    i++;
  }
  return blocks;
}
function extractNoteText(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  const texts = [];
  let textRecords = [];
  let equations = [];
  const flushText = () => {
    const text = renderTextWithEquations(textRecords, equations).trim();
    if (text) texts.push(text);
    textRecords = [];
    equations = [];
  };
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 100; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.tagId === TAG_PARA_HEADER) {
      flushText();
    }
    if (r.tagId === TAG_PARA_TEXT) {
      textRecords.push(r.data);
    }
    if (r.tagId === TAG_CTRL_HEADER && r.data.length >= 4) {
      const ctrlId = r.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, j);
        if (equation) equations.push(equation);
      }
    }
  }
  flushText();
  return texts.length > 0 ? texts.join(" ") : null;
}
function extractTextBoxText(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  const texts = [];
  let textRecords = [];
  let equations = [];
  const flushText = () => {
    const text = renderTextWithEquations(textRecords, equations).trim();
    if (text) texts.push(text);
    textRecords = [];
    equations = [];
  };
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 200; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.tagId === TAG_PARA_HEADER) {
      flushText();
    }
    if (r.tagId === TAG_PARA_TEXT) {
      textRecords.push(r.data);
    }
    if (r.tagId === TAG_CTRL_HEADER && r.data.length >= 4) {
      const ctrlId = r.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, j);
        if (equation) equations.push(equation);
      }
    }
  }
  flushText();
  return texts.length > 0 ? texts.join("\n") : null;
}
function extractHyperlinkUrl(data) {
  try {
    const httpSig = Buffer.from("http", "utf16le");
    const idx = data.indexOf(httpSig);
    if (idx >= 0) {
      let end = idx;
      while (end + 1 < data.length) {
        const ch = data.readUInt16LE(end);
        if (ch === 0) break;
        end += 2;
      }
      const url = data.subarray(idx, end).toString("utf16le");
      if (/^https?:\/\/.+/.test(url) && url.length < 2e3) {
        return url;
      }
    }
  } catch (e26) {
  }
  return null;
}
function resolveCharStyle(charShapeIds, docInfo) {
  if (charShapeIds.length === 0 || docInfo.charShapes.length === 0) return void 0;
  const freq = /* @__PURE__ */ new Map();
  let maxCount = 0, dominantId = charShapeIds[0];
  for (const id of charShapeIds) {
    const count = (freq.get(id) || 0) + 1;
    freq.set(id, count);
    if (count > maxCount) {
      maxCount = count;
      dominantId = id;
    }
  }
  const cs = docInfo.charShapes[dominantId];
  if (!cs) return void 0;
  const style = {};
  if (cs.fontSize > 0) style.fontSize = cs.fontSize / 10;
  if (cs.attrFlags & 1) style.italic = true;
  if (cs.attrFlags & 2) style.bold = true;
  return style.fontSize || style.bold || style.italic ? style : void 0;
}
function parseParagraphWithTables(records, startIdx, counter) {
  const startLevel = records[startIdx].level;
  const textRecords = [];
  const equations = [];
  const tables = [];
  const charShapeIds = [];
  const paraHeaderData = records[startIdx].data;
  const paraShapeId = paraHeaderData.length >= 10 ? paraHeaderData.readUInt16LE(8) : -1;
  let i = startIdx + 1;
  while (i < records.length) {
    const rec = records[i];
    if (rec.tagId === TAG_PARA_HEADER && rec.level <= startLevel) break;
    if (rec.tagId === TAG_PARA_TEXT) {
      textRecords.push(rec.data);
    }
    if (rec.tagId === TAG_CHAR_SHAPE && rec.data.length >= 8) {
      for (let offset = 0; offset + 7 < rec.data.length; offset += 8) {
        charShapeIds.push(rec.data.readUInt32LE(offset + 4));
      }
    }
    if (rec.tagId === TAG_CTRL_HEADER && rec.data.length >= 4) {
      const ctrlId = rec.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, i);
        if (equation) equations.push(equation);
      } else if (ctrlId === " lbt" || ctrlId === "tbl ") {
        const { table, nextIdx } = parseTableBlock(records, i, counter);
        if (table) tables.push(table);
        i = nextIdx;
        continue;
      }
    }
    i++;
  }
  const text = renderTextWithEquations(textRecords, equations);
  const trimmed = text.trim();
  return { paragraph: trimmed || null, tables, nextIdx: i, charShapeIds, paraShapeId };
}
function parseTableBlock(records, startIdx, counter) {
  const tableLevel = records[startIdx].level;
  let i = startIdx + 1;
  let rows = 0, cols = 0;
  const cells = [];
  while (i < records.length) {
    const rec = records[i];
    if (rec.tagId === TAG_PARA_HEADER && rec.level <= tableLevel) break;
    if (rec.tagId === TAG_CTRL_HEADER && rec.level <= tableLevel) break;
    if (rec.tagId === TAG_TABLE && rec.data.length >= 8) {
      rows = Math.min(rec.data.readUInt16LE(4), _chunkJ3FHRU5Tcjs.MAX_ROWS);
      cols = Math.min(rec.data.readUInt16LE(6), _chunkJ3FHRU5Tcjs.MAX_COLS);
    }
    if (rec.tagId === TAG_LIST_HEADER) {
      const { cell, nextIdx } = parseCellBlock(records, i, tableLevel, counter);
      if (cell) cells.push(cell);
      i = nextIdx;
      continue;
    }
    i++;
  }
  if (rows === 0 || cols === 0 || cells.length === 0) return { table: null, nextIdx: i };
  const hasAddr = cells.some((c) => c.colAddr !== void 0 && c.rowAddr !== void 0);
  if (hasAddr) {
    const cellRows2 = arrangeCells(rows, cols, cells);
    const irCells = cellRows2.map((row) => row.map((c) => ({
      text: c.text.trim(),
      colSpan: c.colSpan,
      rowSpan: c.rowSpan
    })));
    return { table: { rows, cols, cells: irCells, hasHeader: rows > 1 }, nextIdx: i };
  }
  const cellRows = arrangeCells(rows, cols, cells);
  return { table: _chunkJ3FHRU5Tcjs.buildTable.call(void 0, cellRows), nextIdx: i };
}
function parseCellBlock(records, startIdx, tableLevel, counter) {
  const rec = records[startIdx];
  const cellLevel = rec.level;
  const texts = [];
  let textRecords = [];
  let equations = [];
  const flushText = () => {
    const text = renderTextWithEquations(textRecords, equations).trim();
    if (text) texts.push(text);
    textRecords = [];
    equations = [];
  };
  let colSpan = 1;
  let rowSpan = 1;
  let colAddr;
  let rowAddr;
  if (rec.data.length >= 16) {
    colAddr = rec.data.readUInt16LE(8);
    rowAddr = rec.data.readUInt16LE(10);
    const cs = rec.data.readUInt16LE(12);
    const rs = rec.data.readUInt16LE(14);
    if (cs > 0) colSpan = Math.min(cs, _chunkJ3FHRU5Tcjs.MAX_COLS);
    if (rs > 0) rowSpan = Math.min(rs, _chunkJ3FHRU5Tcjs.MAX_ROWS);
  }
  let i = startIdx + 1;
  while (i < records.length) {
    const r = records[i];
    if (r.tagId === TAG_LIST_HEADER && r.level <= cellLevel) break;
    if (r.level <= tableLevel && (r.tagId === TAG_PARA_HEADER || r.tagId === TAG_CTRL_HEADER)) break;
    if (r.tagId === TAG_PARA_HEADER) {
      flushText();
    }
    if (r.tagId === TAG_PARA_TEXT) {
      textRecords.push(r.data);
    }
    if (r.tagId === TAG_CTRL_HEADER && r.data.length >= 4) {
      const ctrlId = r.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, i);
        if (equation) equations.push(equation);
      } else if (ctrlId === " lbt" || ctrlId === "tbl ") {
        flushText();
        if (counter) {
          counter.count++;
          texts.push(`[\uC911\uCCA9 \uD14C\uC774\uBE14 #${counter.count}]`);
        } else {
          texts.push("[\uC911\uCCA9 \uD14C\uC774\uBE14]");
        }
      }
    }
    i++;
  }
  flushText();
  return { cell: { text: texts.join("\n"), colSpan, rowSpan, colAddr, rowAddr }, nextIdx: i };
}
function arrangeCells(rows, cols, cells) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const hasAddr = cells.some((c) => c.colAddr !== void 0 && c.rowAddr !== void 0);
  if (hasAddr) {
    for (const cell of cells) {
      const r = _nullishCoalesce(cell.rowAddr, () => ( 0));
      const c = _nullishCoalesce(cell.colAddr, () => ( 0));
      if (r >= rows || c >= cols) continue;
      grid[r][c] = cell;
      for (let dr = 0; dr < cell.rowSpan; dr++) {
        for (let dc = 0; dc < cell.colSpan; dc++) {
          if (dr === 0 && dc === 0) continue;
          if (r + dr < rows && c + dc < cols)
            grid[r + dr][c + dc] = { text: "", colSpan: 1, rowSpan: 1 };
        }
      }
    }
  } else {
    let cellIdx = 0;
    for (let r = 0; r < rows && cellIdx < cells.length; r++) {
      for (let c = 0; c < cols && cellIdx < cells.length; c++) {
        if (grid[r][c] !== null) continue;
        const cell = cells[cellIdx++];
        grid[r][c] = cell;
        for (let dr = 0; dr < cell.rowSpan; dr++) {
          for (let dc = 0; dc < cell.colSpan; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (r + dr < rows && c + dc < cols)
              grid[r + dr][c + dc] = { text: "", colSpan: 1, rowSpan: 1 };
          }
        }
      }
    }
  }
  return grid.map((row) => row.map((c) => c || { text: "", colSpan: 1, rowSpan: 1 }));
}

// src/hwp5/sentinel.ts
var SENTINEL_PATTERNS = [
  /상위\s*버전의\s*배포용\s*문서/,
  /최신\s*버전의\s*한글.*뷰어/,
  /문서를\s*읽으려면/
];
function isDistributionSentinel(markdown) {
  if (!markdown) return false;
  const hit = SENTINEL_PATTERNS.some((p) => p.test(markdown));
  if (!hit) return false;
  const stripped = markdown.split(/\r?\n/).filter((line) => !SENTINEL_PATTERNS.some((p) => p.test(line))).join("").replace(/\s+/g, "");
  return stripped.length < 120;
}

// src/xlsx/parser.ts


var MAX_SHEETS = 100;
var MAX_DECOMPRESS_SIZE3 = 100 * 1024 * 1024;
var MAX_ROWS2 = 1e4;
var MAX_COLS2 = 200;
function cleanNumericValue(raw) {
  if (!/^-?\d+\.\d+$/.test(raw)) return raw;
  const num = parseFloat(raw);
  if (!isFinite(num)) return raw;
  const cleaned = parseFloat(num.toPrecision(15)).toString();
  return cleaned;
}
function parseCellRef(ref) {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col: col - 1, row: parseInt(m[2], 10) - 1 };
}
function parseMergeRef(ref) {
  const parts = ref.split(":");
  if (parts.length !== 2) return null;
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return null;
  return { startCol: start.col, startRow: start.row, endCol: end.col, endRow: end.row };
}
function getElements(parent, tagName) {
  const nodes = parent.getElementsByTagName(tagName);
  const result = [];
  for (let i = 0; i < nodes.length; i++) result.push(nodes[i]);
  return result;
}
function getTextContent(el) {
  return _nullishCoalesce(_optionalChain([el, 'access', _40 => _40.textContent, 'optionalAccess', _41 => _41.trim, 'call', _42 => _42()]), () => ( ""));
}
function parseXml(text) {
  return new (0, _xmldom.DOMParser)().parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, text), "text/xml");
}
function parseSharedStrings(xml) {
  const doc = parseXml(xml);
  const strings = [];
  const siList = getElements(doc.documentElement, "si");
  for (const si of siList) {
    const tElements = getElements(si, "t");
    strings.push(tElements.map((t) => _nullishCoalesce(t.textContent, () => ( ""))).join(""));
  }
  return strings;
}
function parseWorkbook(xml) {
  const doc = parseXml(xml);
  const sheets = [];
  const sheetElements = getElements(doc.documentElement, "sheet");
  for (const el of sheetElements) {
    sheets.push({
      name: _nullishCoalesce(el.getAttribute("name"), () => ( `Sheet${sheets.length + 1}`)),
      sheetId: _nullishCoalesce(el.getAttribute("sheetId"), () => ( "")),
      rId: _nullishCoalesce(el.getAttribute("r:id"), () => ( ""))
    });
  }
  return sheets;
}
function parseRels(xml) {
  const doc = parseXml(xml);
  const map = /* @__PURE__ */ new Map();
  const rels = getElements(doc.documentElement, "Relationship");
  for (const rel of rels) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target) map.set(id, target);
  }
  return map;
}
function parseWorksheet(xml, sharedStrings) {
  const doc = parseXml(xml);
  const grid = [];
  let maxRow = 0;
  let maxCol = 0;
  const rows = getElements(doc.documentElement, "row");
  for (const rowEl of rows) {
    const rowNum = parseInt(_nullishCoalesce(rowEl.getAttribute("r"), () => ( "0")), 10) - 1;
    if (rowNum < 0 || rowNum >= MAX_ROWS2) continue;
    const cells = getElements(rowEl, "c");
    for (const cellEl of cells) {
      const ref = cellEl.getAttribute("r");
      if (!ref) continue;
      const pos = parseCellRef(ref);
      if (!pos || pos.col >= MAX_COLS2) continue;
      const type = cellEl.getAttribute("t");
      const vElements = getElements(cellEl, "v");
      const fElements = getElements(cellEl, "f");
      let value = "";
      if (vElements.length > 0) {
        const raw = getTextContent(vElements[0]);
        if (type === "s") {
          const idx = parseInt(raw, 10);
          value = _nullishCoalesce(sharedStrings[idx], () => ( ""));
        } else if (type === "b") {
          value = raw === "1" ? "TRUE" : "FALSE";
        } else {
          value = cleanNumericValue(raw);
        }
      } else if (type === "inlineStr") {
        const isEl = getElements(cellEl, "is");
        if (isEl.length > 0) {
          const tElements = getElements(isEl[0], "t");
          value = tElements.map((t) => _nullishCoalesce(t.textContent, () => ( ""))).join("");
        }
      }
      if (!value && fElements.length > 0) {
        value = `=${getTextContent(fElements[0])}`;
      }
      while (grid.length <= pos.row) grid.push([]);
      while (grid[pos.row].length <= pos.col) grid[pos.row].push("");
      grid[pos.row][pos.col] = value;
      if (pos.row > maxRow) maxRow = pos.row;
      if (pos.col > maxCol) maxCol = pos.col;
    }
  }
  const merges = [];
  const mergeCellElements = getElements(doc.documentElement, "mergeCell");
  for (const el of mergeCellElements) {
    const ref = el.getAttribute("ref");
    if (!ref) continue;
    const m = parseMergeRef(ref);
    if (m) merges.push(m);
  }
  return { grid, merges, maxRow, maxCol };
}
function sheetToBlocks(sheetName, grid, merges, maxRow, maxCol, sheetIndex) {
  const blocks = [];
  if (sheetName) {
    blocks.push({
      type: "heading",
      text: sheetName,
      level: 2,
      pageNumber: sheetIndex + 1
    });
  }
  if (maxRow < 0 || maxCol < 0 || grid.length === 0) return blocks;
  const mergeMap = /* @__PURE__ */ new Map();
  const mergeSkip = /* @__PURE__ */ new Set();
  for (const m of merges) {
    const colSpan = m.endCol - m.startCol + 1;
    const rowSpan = m.endRow - m.startRow + 1;
    mergeMap.set(`${m.startRow},${m.startCol}`, { colSpan, rowSpan });
    for (let r = m.startRow; r <= m.endRow; r++) {
      for (let c = m.startCol; c <= m.endCol; c++) {
        if (r !== m.startRow || c !== m.startCol) {
          mergeSkip.add(`${r},${c}`);
        }
      }
    }
  }
  let firstRow = -1;
  let lastRow = -1;
  for (let r = 0; r <= maxRow; r++) {
    const row = grid[r];
    if (row && row.some((cell) => cell !== "")) {
      if (firstRow === -1) firstRow = r;
      lastRow = r;
    }
  }
  if (firstRow === -1) return blocks;
  const cellRows = [];
  for (let r = firstRow; r <= lastRow; r++) {
    const row = [];
    for (let c = 0; c <= maxCol; c++) {
      const key = `${r},${c}`;
      if (mergeSkip.has(key)) continue;
      const text = _nullishCoalesce((grid[r] && grid[r][c]), () => ( ""));
      const merge = mergeMap.get(key);
      row.push({
        text,
        colSpan: _nullishCoalesce(_optionalChain([merge, 'optionalAccess', _43 => _43.colSpan]), () => ( 1)),
        rowSpan: _nullishCoalesce(_optionalChain([merge, 'optionalAccess', _44 => _44.rowSpan]), () => ( 1))
      });
    }
    cellRows.push(row);
  }
  if (cellRows.length > 0) {
    const table = _chunkJ3FHRU5Tcjs.buildTable.call(void 0, cellRows);
    if (table.rows > 0) {
      blocks.push({ type: "table", table, pageNumber: sheetIndex + 1 });
    }
  }
  return blocks;
}
async function parseXlsxDocument(buffer, options) {
  _chunkJ3FHRU5Tcjs.precheckZipSize.call(void 0, buffer, MAX_DECOMPRESS_SIZE3);
  const zip = await _jszip2.default.loadAsync(buffer);
  const warnings = [];
  const workbookFile = zip.file("xl/workbook.xml");
  if (!workbookFile) {
    throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 XLSX \uD30C\uC77C: xl/workbook.xml\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  let sharedStrings = [];
  const ssFile = zip.file("xl/sharedStrings.xml");
  if (ssFile) {
    sharedStrings = parseSharedStrings(await ssFile.async("text"));
  }
  const sheets = parseWorkbook(await workbookFile.async("text"));
  if (sheets.length === 0) {
    throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("XLSX \uD30C\uC77C\uC5D0 \uC2DC\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  let relsMap = /* @__PURE__ */ new Map();
  const relsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (relsFile) {
    relsMap = parseRels(await relsFile.async("text"));
  }
  let pageFilter = null;
  if (_optionalChain([options, 'optionalAccess', _45 => _45.pages])) {
    const { parsePageRange: parsePageRange2 } = await Promise.resolve().then(() => _interopRequireWildcard(require("./page-range-3C7UGGEK.cjs")));
    pageFilter = parsePageRange2(options.pages, sheets.length);
  }
  const blocks = [];
  const processedSheets = Math.min(sheets.length, MAX_SHEETS);
  for (let i = 0; i < processedSheets; i++) {
    if (pageFilter && !pageFilter.has(i + 1)) continue;
    const sheet = sheets[i];
    _optionalChain([options, 'optionalAccess', _46 => _46.onProgress, 'optionalCall', _47 => _47(i + 1, processedSheets)]);
    let sheetPath = relsMap.get(sheet.rId);
    if (sheetPath) {
      if (!sheetPath.startsWith("xl/") && !sheetPath.startsWith("/")) {
        sheetPath = `xl/${sheetPath}`;
      } else if (sheetPath.startsWith("/")) {
        sheetPath = sheetPath.slice(1);
      }
    } else {
      sheetPath = `xl/worksheets/sheet${i + 1}.xml`;
    }
    const sheetFile = zip.file(sheetPath);
    if (!sheetFile) {
      warnings.push({
        page: i + 1,
        message: `\uC2DC\uD2B8 "${sheet.name}" \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ${sheetPath}`,
        code: "PARTIAL_PARSE"
      });
      continue;
    }
    try {
      const sheetXml = await sheetFile.async("text");
      const { grid, merges, maxRow, maxCol } = parseWorksheet(sheetXml, sharedStrings);
      const sheetBlocks = sheetToBlocks(sheet.name, grid, merges, maxRow, maxCol, i);
      blocks.push(...sheetBlocks);
    } catch (err) {
      warnings.push({
        page: i + 1,
        message: `\uC2DC\uD2B8 "${sheet.name}" \uD30C\uC2F1 \uC2E4\uD328: ${err instanceof Error ? err.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}`,
        code: "PARTIAL_PARSE"
      });
    }
  }
  const metadata = {
    pageCount: processedSheets
  };
  const coreFile = zip.file("docProps/core.xml");
  if (coreFile) {
    try {
      const coreXml = await coreFile.async("text");
      const doc = parseXml(coreXml);
      const getFirst = (tag) => {
        const els = doc.getElementsByTagName(tag);
        return els.length > 0 ? (_nullishCoalesce(els[0].textContent, () => ( ""))).trim() : void 0;
      };
      metadata.title = getFirst("dc:title") || getFirst("dcterms:title");
      metadata.author = getFirst("dc:creator");
      metadata.description = getFirst("dc:description");
      const created = getFirst("dcterms:created");
      if (created) metadata.createdAt = created;
      const modified = getFirst("dcterms:modified");
      if (modified) metadata.modifiedAt = modified;
    } catch (e27) {
    }
  }
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, blocks);
  return { markdown, blocks, metadata, warnings: warnings.length > 0 ? warnings : void 0 };
}

// src/docx/parser.ts



// src/docx/equation.ts
function lname(el) {
  return el.localName || _optionalChain([el, 'access', _48 => _48.tagName, 'optionalAccess', _49 => _49.replace, 'call', _50 => _50(/^[^:]+:/, "")]) || "";
}
function kids(parent, name) {
  const out = [];
  const nodes = parent.childNodes;
  if (!nodes) return out;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.nodeType !== 1) continue;
    const el = n;
    if (lname(el) === name) out.push(el);
  }
  return out;
}
function firstKid(parent, name) {
  const list = kids(parent, name);
  return _nullishCoalesce(list[0], () => ( null));
}
function eachChild(parent) {
  const out = [];
  const nodes = parent.childNodes;
  if (!nodes) return out;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeType === 1) out.push(nodes[i]);
  }
  return out;
}
function runToLatex(r) {
  let out = "";
  for (const t of kids(r, "t")) out += _nullishCoalesce(t.textContent, () => ( ""));
  return out;
}
var FUNC_NAMES = /* @__PURE__ */ new Set([
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "arcsin",
  "arccos",
  "arctan",
  "log",
  "ln",
  "lg",
  "exp",
  "det",
  "dim",
  "gcd",
  "inf",
  "sup",
  "lim",
  "max",
  "min",
  "Pr",
  "arg"
]);
var ACCENT_MAP = {
  "\u0302": "\\hat",
  // U+0302 COMBINING CIRCUMFLEX
  "\u0303": "\\tilde",
  // U+0303
  "\u0304": "\\bar",
  // U+0304
  "\u0307": "\\dot",
  // U+0307
  "\u0308": "\\ddot",
  // U+0308
  "\u0301": "\\acute",
  // U+0301
  "\u0300": "\\grave",
  // U+0300
  "\u0306": "\\breve",
  // U+0306
  "\u030C": "\\check",
  // U+030C
  "\u20D7": "\\vec",
  // U+20D7 COMBINING RIGHT ARROW ABOVE
  "\u2192": "\\vec"
};
var NARY_MAP = {
  "\u2211": "\\sum",
  "\u220F": "\\prod",
  "\u2210": "\\coprod",
  "\u222B": "\\int",
  "\u222C": "\\iint",
  "\u222D": "\\iiint",
  "\u222E": "\\oint",
  "\u222F": "\\oiint",
  "\u2230": "\\oiiint",
  "\u22C3": "\\bigcup",
  "\u22C2": "\\bigcap",
  "\u2A01": "\\bigoplus",
  "\u2A02": "\\bigotimes",
  "\u2A00": "\\bigodot"
};
function mapDelim(ch, isLeft) {
  const l = {
    "(": "(",
    "[": "[",
    "{": "\\{",
    "\u27E8": "\\langle",
    "|": "|",
    "\u2016": "\\|",
    "\u230A": "\\lfloor",
    "\u2308": "\\lceil",
    "": "."
  };
  const r = {
    ")": ")",
    "]": "]",
    "}": "\\}",
    "\u27E9": "\\rangle",
    "|": "|",
    "\u2016": "\\|",
    "\u230B": "\\rfloor",
    "\u2309": "\\rceil",
    "": "."
  };
  const map = isLeft ? l : r;
  return _nullishCoalesce(map[ch], () => ( ch));
}
function grp(body) {
  const s = body.trim();
  if (s.length === 0) return "{}";
  if (s.startsWith("{") && s.endsWith("}")) return s;
  return "{" + s + "}";
}
function childrenToLatex(parent) {
  let out = "";
  for (const ch of eachChild(parent)) {
    out += nodeToLatex(ch);
  }
  return out;
}
function nodeToLatex(el) {
  const tag = lname(el);
  switch (tag) {
    case "r":
      return runToLatex(el);
    case "e":
    // generic container (인자로 쓰임) — 자식 연결
    case "num":
    case "den":
    case "sub":
    case "sup":
    case "deg":
    case "lim":
    case "fName":
      return childrenToLatex(el);
    // 분수
    case "f": {
      const n = firstKid(el, "num");
      const d = firstKid(el, "den");
      const num = n ? childrenToLatex(n) : "";
      const den = d ? childrenToLatex(d) : "";
      return "\\frac" + grp(num) + grp(den);
    }
    // 첨자
    case "sSup": {
      const e = firstKid(el, "e");
      const sup = firstKid(el, "sup");
      return grp(e ? childrenToLatex(e) : "") + "^" + grp(sup ? childrenToLatex(sup) : "");
    }
    case "sSub": {
      const e = firstKid(el, "e");
      const sub = firstKid(el, "sub");
      return grp(e ? childrenToLatex(e) : "") + "_" + grp(sub ? childrenToLatex(sub) : "");
    }
    case "sSubSup": {
      const e = firstKid(el, "e");
      const sub = firstKid(el, "sub");
      const sup = firstKid(el, "sup");
      return grp(e ? childrenToLatex(e) : "") + "_" + grp(sub ? childrenToLatex(sub) : "") + "^" + grp(sup ? childrenToLatex(sup) : "");
    }
    case "sPre": {
      const sub = firstKid(el, "sub");
      const sup = firstKid(el, "sup");
      const e = firstKid(el, "e");
      const preSub = sub ? grp(childrenToLatex(sub)) : "{}";
      const preSup = sup ? grp(childrenToLatex(sup)) : "{}";
      const body = e ? childrenToLatex(e) : "";
      return "{}_" + preSub + "^" + preSup + grp(body);
    }
    // 근호
    case "rad": {
      const deg = firstKid(el, "deg");
      const e = firstKid(el, "e");
      const body = e ? childrenToLatex(e) : "";
      const radPr = firstKid(el, "radPr");
      let hide = false;
      if (radPr) {
        const degHide = firstKid(radPr, "degHide");
        if (degHide) {
          const val = _nullishCoalesce(degHide.getAttribute("m:val"), () => ( degHide.getAttribute("val")));
          hide = val === "1" || val === "on" || val === "true";
        }
      }
      const degStr = !hide && deg ? childrenToLatex(deg).trim() : "";
      return degStr ? "\\sqrt[" + degStr + "]" + grp(body) : "\\sqrt" + grp(body);
    }
    // n-ary 연산자 (sum, prod, int, …)
    case "nary": {
      const naryPr = firstKid(el, "naryPr");
      let op = "\\int";
      let subHide = false;
      let supHide = false;
      let limLoc = "";
      if (naryPr) {
        const chr = firstKid(naryPr, "chr");
        if (chr) {
          const v = _nullishCoalesce(_nullishCoalesce(chr.getAttribute("m:val"), () => ( chr.getAttribute("val"))), () => ( ""));
          if (v && NARY_MAP[v]) op = NARY_MAP[v];
          else if (v) op = v;
        } else {
          op = "\\int";
        }
        const sh = firstKid(naryPr, "subHide");
        const ph = firstKid(naryPr, "supHide");
        if (sh) subHide = (_nullishCoalesce(sh.getAttribute("m:val"), () => ( sh.getAttribute("val")))) !== "0";
        if (ph) supHide = (_nullishCoalesce(ph.getAttribute("m:val"), () => ( ph.getAttribute("val")))) !== "0";
        const ll = firstKid(naryPr, "limLoc");
        if (ll) limLoc = _nullishCoalesce(_nullishCoalesce(ll.getAttribute("m:val"), () => ( ll.getAttribute("val"))), () => ( ""));
      }
      const sub = firstKid(el, "sub");
      const sup = firstKid(el, "sup");
      const e = firstKid(el, "e");
      const subStr = !subHide && sub ? childrenToLatex(sub) : "";
      const supStr = !supHide && sup ? childrenToLatex(sup) : "";
      const body = e ? childrenToLatex(e) : "";
      let head = op;
      if (limLoc === "undOvr") {
        if (subStr) head += "_" + grp(subStr);
        if (supStr) head += "^" + grp(supStr);
      } else {
        if (subStr) head += "_" + grp(subStr);
        if (supStr) head += "^" + grp(supStr);
      }
      return head + " " + body;
    }
    // 괄호 (delimiter)
    case "d": {
      const dPr = firstKid(el, "dPr");
      let beg = "(";
      let end = ")";
      let sep = ",";
      if (dPr) {
        const begChr = firstKid(dPr, "begChr");
        const endChr = firstKid(dPr, "endChr");
        const sepChr = firstKid(dPr, "sepChr");
        if (begChr) beg = _nullishCoalesce(_nullishCoalesce(begChr.getAttribute("m:val"), () => ( begChr.getAttribute("val"))), () => ( beg));
        if (endChr) end = _nullishCoalesce(_nullishCoalesce(endChr.getAttribute("m:val"), () => ( endChr.getAttribute("val"))), () => ( end));
        if (sepChr) sep = _nullishCoalesce(_nullishCoalesce(sepChr.getAttribute("m:val"), () => ( sepChr.getAttribute("val"))), () => ( sep));
      }
      const items = kids(el, "e").map(childrenToLatex);
      const body = items.join(sep);
      return "\\left" + mapDelim(beg, true) + body + "\\right" + mapDelim(end, false);
    }
    // 행렬
    case "m": {
      const rows = [];
      for (const mr of kids(el, "mr")) {
        const cells = kids(mr, "e").map(childrenToLatex);
        rows.push(cells.join(" & "));
      }
      return "\\begin{matrix}" + rows.join(" \\\\ ") + "\\end{matrix}";
    }
    // 상자/박스 (acc 와 유사하지만 bar 가 아닌 box)
    case "box":
      return childrenToLatex(el);
    // 함수 적용 (sin, cos, log …)
    case "func": {
      const fn = firstKid(el, "fName");
      const e = firstKid(el, "e");
      const fnStr = fn ? childrenToLatex(fn).trim() : "";
      const body = e ? childrenToLatex(e) : "";
      const fnLatex = FUNC_NAMES.has(fnStr) ? "\\" + fnStr : fnStr;
      return fnLatex + grp(body);
    }
    // 악센트 (hat/bar/vec/…)
    case "acc": {
      const accPr = firstKid(el, "accPr");
      let chr = "";
      if (accPr) {
        const chrEl = firstKid(accPr, "chr");
        if (chrEl) chr = _nullishCoalesce(_nullishCoalesce(chrEl.getAttribute("m:val"), () => ( chrEl.getAttribute("val"))), () => ( ""));
      }
      if (!chr) chr = "\u0302";
      const e = firstKid(el, "e");
      const body = e ? childrenToLatex(e) : "";
      const cmd = _nullishCoalesce(ACCENT_MAP[chr], () => ( "\\hat"));
      return cmd + grp(body);
    }
    // bar (위/아래 줄)
    case "bar": {
      const barPr = firstKid(el, "barPr");
      let pos = "top";
      if (barPr) {
        const posEl = firstKid(barPr, "pos");
        if (posEl) pos = _nullishCoalesce(_nullishCoalesce(posEl.getAttribute("m:val"), () => ( posEl.getAttribute("val"))), () => ( pos));
      }
      const e = firstKid(el, "e");
      const body = e ? childrenToLatex(e) : "";
      return (pos === "bot" ? "\\underline" : "\\overline") + grp(body);
    }
    // lim 위/아래
    case "limLow": {
      const e = firstKid(el, "e");
      const lim = firstKid(el, "lim");
      const base = e ? childrenToLatex(e).trim() : "";
      const below = lim ? childrenToLatex(lim) : "";
      if (FUNC_NAMES.has(base)) return "\\" + base + "_" + grp(below);
      return base + "_" + grp(below);
    }
    case "limUpp": {
      const e = firstKid(el, "e");
      const lim = firstKid(el, "lim");
      const base = e ? childrenToLatex(e).trim() : "";
      const above = lim ? childrenToLatex(lim) : "";
      if (FUNC_NAMES.has(base)) return "\\" + base + "^" + grp(above);
      return base + "^" + grp(above);
    }
    // group character (over/underset 비슷)
    case "groupChr":
      return childrenToLatex(_nullishCoalesce(firstKid(el, "e"), () => ( el)));
    // box/borderBox/phantom/eqArr/… 는 자식 본문만 유지
    case "borderBox":
    case "phant":
    case "eqArr":
      return childrenToLatex(el);
    // 최상위 컨테이너
    case "oMath":
    case "oMathPara":
      return childrenToLatex(el);
    // 메타 — 속성만 들어있으므로 출력 제외
    case "rPr":
    case "fPr":
    case "sSubPr":
    case "sSupPr":
    case "sSubSupPr":
    case "radPr":
    case "naryPr":
    case "dPr":
    case "accPr":
    case "barPr":
    case "funcPr":
    case "mPr":
    case "ctrlPr":
      return "";
    default:
      return childrenToLatex(el);
  }
}
function isOmmlRoot(el) {
  const t = lname(el);
  return t === "oMath" || t === "oMathPara";
}
function ommlElementToLatex(el) {
  if (!isOmmlRoot(el)) return "";
  const raw = childrenToLatex(el);
  return raw.replace(/\s+/g, " ").trim();
}
function isDisplayMath(el) {
  return lname(el) === "oMathPara";
}

// src/docx/parser.ts
var MAX_DECOMPRESS_SIZE4 = 100 * 1024 * 1024;
function getChildElements(parent, localName3) {
  const result = [];
  const children = parent.childNodes;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === 1) {
      const el = node;
      if (el.localName === localName3 || _optionalChain([el, 'access', _51 => _51.tagName, 'optionalAccess', _52 => _52.endsWith, 'call', _53 => _53(`:${localName3}`)])) {
        result.push(el);
      }
    }
  }
  return result;
}
function findElements(parent, localName3) {
  const result = [];
  const walk = (node) => {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 1) {
        const el = child;
        if (el.localName === localName3 || _optionalChain([el, 'access', _54 => _54.tagName, 'optionalAccess', _55 => _55.endsWith, 'call', _56 => _56(`:${localName3}`)])) {
          result.push(el);
        }
        walk(el);
      }
    }
  };
  walk(parent);
  return result;
}
function getAttr(el, localName3) {
  const attrs = el.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.localName === localName3 || attr.name === localName3) return attr.value;
  }
  return null;
}
function parseXml2(text) {
  return new (0, _xmldom.DOMParser)().parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, text), "text/xml");
}
function parseStyles(xml) {
  const doc = parseXml2(xml);
  const styles = /* @__PURE__ */ new Map();
  const styleElements = findElements(doc, "style");
  for (const el of styleElements) {
    const styleId = getAttr(el, "styleId");
    if (!styleId) continue;
    const nameEls = getChildElements(el, "name");
    const name = nameEls.length > 0 ? _nullishCoalesce(getAttr(nameEls[0], "val"), () => ( "")) : "";
    const basedOnEls = getChildElements(el, "basedOn");
    const basedOn = basedOnEls.length > 0 ? _nullishCoalesce(getAttr(basedOnEls[0], "val"), () => ( void 0)) : void 0;
    const pPrEls = getChildElements(el, "pPr");
    let outlineLevel;
    if (pPrEls.length > 0) {
      const outlineEls = getChildElements(pPrEls[0], "outlineLvl");
      if (outlineEls.length > 0) {
        const val = getAttr(outlineEls[0], "val");
        if (val !== null) outlineLevel = parseInt(val, 10);
      }
    }
    if (outlineLevel === void 0) {
      const headingMatch = name.match(/^(?:heading|Heading)\s*(\d+)$/i);
      if (headingMatch) outlineLevel = parseInt(headingMatch[1], 10) - 1;
    }
    styles.set(styleId, { name, basedOn, outlineLevel });
  }
  return styles;
}
function parseNumbering(xml) {
  const doc = parseXml2(xml);
  const abstractNums = /* @__PURE__ */ new Map();
  const abstractElements = findElements(doc, "abstractNum");
  for (const el of abstractElements) {
    const abstractNumId = getAttr(el, "abstractNumId");
    if (!abstractNumId) continue;
    const levels = /* @__PURE__ */ new Map();
    const lvlElements = getChildElements(el, "lvl");
    for (const lvl of lvlElements) {
      const ilvl = parseInt(_nullishCoalesce(getAttr(lvl, "ilvl"), () => ( "0")), 10);
      const numFmtEls = getChildElements(lvl, "numFmt");
      const numFmt = numFmtEls.length > 0 ? _nullishCoalesce(getAttr(numFmtEls[0], "val"), () => ( "bullet")) : "bullet";
      levels.set(ilvl, { numFmt, level: ilvl });
    }
    abstractNums.set(abstractNumId, levels);
  }
  const nums = /* @__PURE__ */ new Map();
  const numElements = findElements(doc, "num");
  for (const el of numElements) {
    const numId = getAttr(el, "numId");
    if (!numId) continue;
    const abstractRefs = getChildElements(el, "abstractNumId");
    if (abstractRefs.length > 0) {
      const ref = getAttr(abstractRefs[0], "val");
      if (ref && abstractNums.has(ref)) {
        nums.set(numId, abstractNums.get(ref));
      }
    }
  }
  return nums;
}
function parseRels2(xml) {
  const doc = parseXml2(xml);
  const map = /* @__PURE__ */ new Map();
  const rels = findElements(doc, "Relationship");
  for (const rel of rels) {
    const id = getAttr(rel, "Id");
    const target = getAttr(rel, "Target");
    if (id && target) map.set(id, target);
  }
  return map;
}
function parseFootnotes(xml) {
  const doc = parseXml2(xml);
  const notes = /* @__PURE__ */ new Map();
  const fnElements = findElements(doc, "footnote");
  for (const fn of fnElements) {
    const id = getAttr(fn, "id");
    if (!id || id === "0" || id === "-1") continue;
    const texts = [];
    const pElements = findElements(fn, "p");
    for (const p of pElements) {
      const runs = findElements(p, "r");
      for (const r of runs) {
        const tElements = getChildElements(r, "t");
        for (const t of tElements) texts.push(_nullishCoalesce(t.textContent, () => ( "")));
      }
    }
    notes.set(id, texts.join("").trim());
  }
  return notes;
}
function collectOmmlRoots(p) {
  const out = [];
  const walk = (node) => {
    const children = node.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType !== 1) continue;
      const el = child;
      const tag = el.localName || _optionalChain([el, 'access', _57 => _57.tagName, 'optionalAccess', _58 => _58.replace, 'call', _59 => _59(/^[^:]+:/, "")]) || "";
      if (tag === "oMath" || tag === "oMathPara") {
        out.push(el);
      } else {
        walk(el);
      }
    }
  };
  walk(p);
  return out;
}
function extractRun(r) {
  const tElements = getChildElements(r, "t");
  const text = tElements.map((t) => _nullishCoalesce(t.textContent, () => ( ""))).join("");
  let bold = false;
  let italic = false;
  const rPrEls = getChildElements(r, "rPr");
  if (rPrEls.length > 0) {
    bold = getChildElements(rPrEls[0], "b").length > 0;
    italic = getChildElements(rPrEls[0], "i").length > 0;
  }
  return { text, bold, italic };
}
function parseParagraph(p, styles, numbering, footnotes, rels) {
  const pPrEls = getChildElements(p, "pPr");
  let styleId = "";
  let numId = "";
  let ilvl = 0;
  if (pPrEls.length > 0) {
    const pStyleEls = getChildElements(pPrEls[0], "pStyle");
    if (pStyleEls.length > 0) styleId = _nullishCoalesce(getAttr(pStyleEls[0], "val"), () => ( ""));
    const numPrEls = getChildElements(pPrEls[0], "numPr");
    if (numPrEls.length > 0) {
      const numIdEls = getChildElements(numPrEls[0], "numId");
      const ilvlEls = getChildElements(numPrEls[0], "ilvl");
      numId = numIdEls.length > 0 ? _nullishCoalesce(getAttr(numIdEls[0], "val"), () => ( "")) : "";
      ilvl = ilvlEls.length > 0 ? parseInt(_nullishCoalesce(getAttr(ilvlEls[0], "val"), () => ( "0")), 10) : 0;
    }
  }
  const parts = [];
  let hasBold = false;
  let hasItalic = false;
  let href;
  let footnoteText;
  const hyperlinks = getChildElements(p, "hyperlink");
  const hyperlinkTexts = /* @__PURE__ */ new Set();
  for (const hl of hyperlinks) {
    const rId = getAttr(hl, "id");
    const hlText = [];
    const runs2 = findElements(hl, "r");
    for (const r of runs2) {
      const result = extractRun(r);
      hlText.push(result.text);
    }
    const text2 = hlText.join("");
    if (text2) {
      hyperlinkTexts.add(text2);
      if (rId && rels.has(rId)) {
        href = rels.get(rId);
        parts.push(text2);
      } else {
        parts.push(text2);
      }
    }
  }
  const runs = getChildElements(p, "r");
  for (const r of runs) {
    if (r.parentNode && r.parentNode.localName === "hyperlink") continue;
    const result = extractRun(r);
    if (result.bold) hasBold = true;
    if (result.italic) hasItalic = true;
    const fnRefEls = getChildElements(r, "footnoteReference");
    if (fnRefEls.length > 0) {
      const fnId = getAttr(fnRefEls[0], "id");
      if (fnId && footnotes.has(fnId)) {
        footnoteText = footnotes.get(fnId);
      }
    }
    if (result.text) parts.push(result.text);
  }
  for (const om of collectOmmlRoots(p)) {
    const latex = ommlElementToLatex(om);
    if (!latex) continue;
    if (isDisplayMath(om)) parts.push(" $$" + latex + "$$ ");
    else parts.push(" $" + latex + "$ ");
  }
  const text = parts.join("").replace(/[ \t]{2,}/g, " ").trim();
  if (!text) return null;
  const style = styles.get(styleId);
  if (_optionalChain([style, 'optionalAccess', _60 => _60.outlineLevel]) !== void 0 && style.outlineLevel >= 0 && style.outlineLevel <= 5) {
    return {
      type: "heading",
      text,
      level: style.outlineLevel + 1
    };
  }
  if (numId && numId !== "0") {
    const numDef = numbering.get(numId);
    const levelInfo = _optionalChain([numDef, 'optionalAccess', _61 => _61.get, 'call', _62 => _62(ilvl)]);
    const listType = _optionalChain([levelInfo, 'optionalAccess', _63 => _63.numFmt]) === "bullet" ? "unordered" : "ordered";
    return { type: "list", text, listType };
  }
  const block = { type: "paragraph", text };
  if (hasBold || hasItalic) {
    block.style = { bold: hasBold || void 0, italic: hasItalic || void 0 };
  }
  if (href) block.href = href;
  if (footnoteText) block.footnoteText = footnoteText;
  return block;
}
function parseTable(tbl, styles, numbering, footnotes, rels) {
  const trElements = getChildElements(tbl, "tr");
  if (trElements.length === 0) return null;
  const rows = [];
  let maxCols = 0;
  for (const tr of trElements) {
    const tcElements = getChildElements(tr, "tc");
    const row = [];
    for (const tc of tcElements) {
      let colSpan = 1;
      let rowSpan = 1;
      const tcPrEls = getChildElements(tc, "tcPr");
      if (tcPrEls.length > 0) {
        const gridSpanEls = getChildElements(tcPrEls[0], "gridSpan");
        if (gridSpanEls.length > 0) {
          colSpan = parseInt(_nullishCoalesce(getAttr(gridSpanEls[0], "val"), () => ( "1")), 10);
        }
        const vMergeEls = getChildElements(tcPrEls[0], "vMerge");
        if (vMergeEls.length > 0) {
          const val = getAttr(vMergeEls[0], "val");
          if (val !== "restart" && val !== null) {
            row.push({ text: "", colSpan, rowSpan: 0 });
            continue;
          }
        }
      }
      const cellTexts = [];
      const pElements = getChildElements(tc, "p");
      for (const p of pElements) {
        const block = parseParagraph(p, styles, numbering, footnotes, rels);
        if (_optionalChain([block, 'optionalAccess', _64 => _64.text])) cellTexts.push(block.text);
      }
      row.push({ text: cellTexts.join("\n"), colSpan, rowSpan });
    }
    rows.push(row);
    if (row.length > maxCols) maxCols = row.length;
  }
  for (let c = 0; c < maxCols; c++) {
    for (let r = 0; r < rows.length; r++) {
      const cell = rows[r][c];
      if (!cell || cell.rowSpan === 0) continue;
      let span = 1;
      for (let nr = r + 1; nr < rows.length; nr++) {
        if (_optionalChain([rows, 'access', _65 => _65[nr], 'access', _66 => _66[c], 'optionalAccess', _67 => _67.rowSpan]) === 0) span++;
        else break;
      }
      cell.rowSpan = span;
    }
  }
  const cleanRows = [];
  for (const row of rows) {
    const clean = row.filter((cell) => cell.rowSpan !== 0);
    cleanRows.push(clean);
  }
  if (cleanRows.length === 0) return null;
  let cols = 0;
  for (const row of cleanRows) {
    let c = 0;
    for (const cell of row) c += cell.colSpan;
    if (c > cols) cols = c;
  }
  const table = {
    rows: cleanRows.length,
    cols,
    cells: cleanRows,
    hasHeader: cleanRows.length > 1
  };
  return { type: "table", table };
}
async function extractImages(zip, rels, doc) {
  const blocks = [];
  const images = [];
  const drawingElements = findElements(doc.documentElement, "drawing");
  let imgIdx = 0;
  for (const drawing of drawingElements) {
    const blips = findElements(drawing, "blip");
    for (const blip of blips) {
      const embedId = getAttr(blip, "embed");
      if (!embedId) continue;
      const target = rels.get(embedId);
      if (!target) continue;
      const imgPath = target.startsWith("/") ? target.slice(1) : target.startsWith("word/") ? target : `word/${target}`;
      const imgFile = zip.file(imgPath);
      if (!imgFile) continue;
      try {
        const data = await imgFile.async("uint8array");
        imgIdx++;
        const ext = _nullishCoalesce(_optionalChain([imgPath, 'access', _68 => _68.split, 'call', _69 => _69("."), 'access', _70 => _70.pop, 'call', _71 => _71(), 'optionalAccess', _72 => _72.toLowerCase, 'call', _73 => _73()]), () => ( "png"));
        const mimeMap = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          bmp: "image/bmp",
          wmf: "image/wmf",
          emf: "image/emf"
        };
        const filename = `image_${String(imgIdx).padStart(3, "0")}.${ext}`;
        images.push({ filename, data, mimeType: _nullishCoalesce(mimeMap[ext], () => ( "image/png")) });
        blocks.push({ type: "image", text: filename });
      } catch (e28) {
      }
    }
  }
  return { blocks, images };
}
async function parseDocxDocument(buffer, options) {
  _chunkJ3FHRU5Tcjs.precheckZipSize.call(void 0, buffer, MAX_DECOMPRESS_SIZE4);
  const zip = await _jszip2.default.loadAsync(buffer);
  const warnings = [];
  const docFile = zip.file("word/document.xml");
  if (!docFile) {
    throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 DOCX \uD30C\uC77C: word/document.xml\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  let rels = /* @__PURE__ */ new Map();
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (relsFile) {
    rels = parseRels2(await relsFile.async("text"));
  }
  let styles = /* @__PURE__ */ new Map();
  const stylesFile = zip.file("word/styles.xml");
  if (stylesFile) {
    try {
      styles = parseStyles(await stylesFile.async("text"));
    } catch (e29) {
    }
  }
  let numbering = /* @__PURE__ */ new Map();
  const numFile = zip.file("word/numbering.xml");
  if (numFile) {
    try {
      numbering = parseNumbering(await numFile.async("text"));
    } catch (e30) {
    }
  }
  let footnotes = /* @__PURE__ */ new Map();
  const fnFile = zip.file("word/footnotes.xml");
  if (fnFile) {
    try {
      footnotes = parseFootnotes(await fnFile.async("text"));
    } catch (e31) {
    }
  }
  const docXml = await docFile.async("text");
  const doc = parseXml2(docXml);
  const body = findElements(doc, "body");
  if (body.length === 0) {
    throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("DOCX \uBCF8\uBB38(w:body)\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const blocks = [];
  const bodyEl = body[0];
  const children = bodyEl.childNodes;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType !== 1) continue;
    const el = node;
    const localName3 = _nullishCoalesce(el.localName, () => ( _optionalChain([el, 'access', _74 => _74.tagName, 'optionalAccess', _75 => _75.split, 'call', _76 => _76(":"), 'access', _77 => _77.pop, 'call', _78 => _78()])));
    if (localName3 === "p") {
      const block = parseParagraph(el, styles, numbering, footnotes, rels);
      if (block) blocks.push(block);
    } else if (localName3 === "tbl") {
      const block = parseTable(el, styles, numbering, footnotes, rels);
      if (block) blocks.push(block);
    }
  }
  const { blocks: imgBlocks, images } = await extractImages(zip, rels, doc);
  const metadata = {};
  const coreFile = zip.file("docProps/core.xml");
  if (coreFile) {
    try {
      const coreXml = await coreFile.async("text");
      const coreDoc = parseXml2(coreXml);
      const getFirst = (tag) => {
        const els = coreDoc.getElementsByTagName(tag);
        return els.length > 0 ? (_nullishCoalesce(els[0].textContent, () => ( ""))).trim() : void 0;
      };
      metadata.title = getFirst("dc:title") || getFirst("dcterms:title");
      metadata.author = getFirst("dc:creator");
      metadata.description = getFirst("dc:description");
      const created = getFirst("dcterms:created");
      if (created) metadata.createdAt = created;
      const modified = getFirst("dcterms:modified");
      if (modified) metadata.modifiedAt = modified;
    } catch (e32) {
    }
  }
  const outline = blocks.filter((b) => b.type === "heading").map((b) => ({ level: _nullishCoalesce(b.level, () => ( 2)), text: _nullishCoalesce(b.text, () => ( "")) }));
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, blocks);
  return {
    markdown,
    blocks,
    metadata,
    outline: outline.length > 0 ? outline : void 0,
    warnings: warnings.length > 0 ? warnings : void 0,
    images: images.length > 0 ? images : void 0
  };
}

// src/hwpml/parser.ts

var MAX_XML_DEPTH2 = 200;
var MAX_TABLE_ROWS = 5e3;
var MAX_TABLE_COLS = 500;
var MAX_HWPML_BYTES = 50 * 1024 * 1024;
function parseHwpmlDocument(buffer, options) {
  if (buffer.byteLength > MAX_HWPML_BYTES) {
    throw new Error(`HWPML \uD30C\uC77C \uD06C\uAE30 \uCD08\uACFC (${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB > 50MB)`);
  }
  const text = new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
  const normalized = text.replace(/&nbsp;/g, "&#160;");
  const xml = _chunkJ3FHRU5Tcjs.stripDtd.call(void 0, normalized);
  const warnings = [];
  const parser = new (0, _xmldom.DOMParser)({
    onError: (_level, msg) => {
      warnings.push({ message: `HWPML XML \uD30C\uC2F1 \uACBD\uACE0: ${msg}`, code: "MALFORMED_XML" });
    }
  });
  const doc = parser.parseFromString(xml, "text/xml");
  if (!doc.documentElement) {
    return { markdown: "", blocks: [], warnings };
  }
  const root = doc.documentElement;
  const metadata = {};
  const docSummary = findChild(root, "DOCSUMMARY");
  if (docSummary) {
    const title = findChild(docSummary, "TITLE");
    const author = findChild(docSummary, "AUTHOR");
    const date = findChild(docSummary, "DATE");
    if (title) metadata.title = textContent(title).trim();
    if (author) metadata.author = textContent(author).trim();
    if (date) metadata.createdAt = textContent(date).trim() || void 0;
  }
  const paraShapeMap = buildParaShapeMap(root);
  const body = findChild(root, "BODY");
  if (!body) {
    return { markdown: "", blocks: [], metadata, warnings };
  }
  const blocks = [];
  const pageFilter = _optionalChain([options, 'optionalAccess', _79 => _79.pages]) ? _chunkMUOQXDZ4cjs.parsePageRange.call(void 0, options.pages, countSections(body)) : null;
  let sectionIdx = 0;
  const children = body.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    if (localName(el) !== "SECTION") continue;
    sectionIdx++;
    if (pageFilter && !pageFilter.has(sectionIdx)) continue;
    parseSection2(el, blocks, paraShapeMap, sectionIdx, warnings);
  }
  const outline = blocks.filter((b) => b.type === "heading" && b.text).map((b) => ({ level: _nullishCoalesce(b.level, () => ( 1)), text: b.text, pageNumber: b.pageNumber }));
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, blocks);
  return {
    markdown,
    blocks,
    metadata: Object.keys(metadata).length > 0 ? metadata : void 0,
    outline: outline.length > 0 ? outline : void 0,
    warnings: warnings.length > 0 ? warnings : void 0
  };
}
function buildParaShapeMap(root) {
  const map = /* @__PURE__ */ new Map();
  const head = findChild(root, "HEAD");
  if (!head) return map;
  const mappingTable = findChild(head, "MAPPINGTABLE");
  if (!mappingTable) return map;
  const paraShapeList = findChild(mappingTable, "PARASHAPELIST");
  if (!paraShapeList) return map;
  const children = paraShapeList.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1 || localName(el) !== "PARASHAPE") continue;
    const id = _nullishCoalesce(el.getAttribute("Id"), () => ( ""));
    const headingType = _nullishCoalesce(el.getAttribute("HeadingType"), () => ( "None"));
    const level = parseInt(_nullishCoalesce(el.getAttribute("Level"), () => ( "0")), 10);
    let headingLevel = null;
    if (headingType === "Outline") {
      const safeLevel = isNaN(level) ? 0 : Math.max(0, level);
      headingLevel = Math.min(safeLevel + 1, 6);
    }
    map.set(id, { headingLevel });
  }
  return map;
}
function parseSection2(section, blocks, paraShapeMap, sectionNum, warnings) {
  walkContent(section, blocks, paraShapeMap, sectionNum, warnings, false);
}
function walkContent(node, blocks, paraShapeMap, sectionNum, warnings, inHeaderFooter, depth = 0) {
  if (depth > MAX_XML_DEPTH2) return;
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = localName(el);
    if (tag === "HEADER" || tag === "FOOTER") {
      continue;
    }
    if (tag === "P") {
      if (!inHeaderFooter) {
        parseParagraph2(el, blocks, paraShapeMap, sectionNum);
      }
      continue;
    }
    if (tag === "TABLE") {
      if (!inHeaderFooter) {
        parseTable2(el, blocks, paraShapeMap, sectionNum, warnings);
      }
      continue;
    }
    if (tag === "PARALIST" || tag === "SECTION" || tag === "COLDEF") {
      walkContent(el, blocks, paraShapeMap, sectionNum, warnings, inHeaderFooter, depth + 1);
      continue;
    }
    walkContent(el, blocks, paraShapeMap, sectionNum, warnings, inHeaderFooter, depth + 1);
  }
}
function parseParagraph2(el, blocks, paraShapeMap, sectionNum) {
  const paraShapeId = _nullishCoalesce(el.getAttribute("ParaShape"), () => ( ""));
  const shapeInfo = paraShapeMap.get(paraShapeId);
  const text = extractParagraphText(el);
  if (!text) return;
  if (_optionalChain([shapeInfo, 'optionalAccess', _80 => _80.headingLevel]) != null) {
    blocks.push({ type: "heading", text, level: shapeInfo.headingLevel, pageNumber: sectionNum });
  } else {
    blocks.push({ type: "paragraph", text, pageNumber: sectionNum });
  }
}
function extractParagraphText(p) {
  const parts = [];
  collectCharText(p, parts);
  return parts.join("").trim();
}
function collectCharText(node, parts, depth = 0) {
  if (depth > MAX_XML_DEPTH2) return;
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = localName(el);
    if (tag === "CHAR") {
      const t = textContent(el);
      if (t) parts.push(t);
    } else if (tag === "TABLE" || tag === "PICTURE" || tag === "SHAPEOBJECT") {
    } else if (tag === "AUTONUM") {
    } else {
      collectCharText(el, parts, depth + 1);
    }
  }
}
function parseTable2(el, blocks, paraShapeMap, sectionNum, warnings) {
  const cells = [];
  const rowCount = parseInt(_nullishCoalesce(el.getAttribute("RowCount"), () => ( "0")), 10);
  const colCount = parseInt(_nullishCoalesce(el.getAttribute("ColCount"), () => ( "0")), 10);
  if (isNaN(rowCount) || isNaN(colCount) || rowCount === 0 || colCount === 0) return;
  if (rowCount > MAX_TABLE_ROWS || colCount > MAX_TABLE_COLS) {
    warnings.push({ message: `\uD14C\uC774\uBE14 \uD06C\uAE30 \uCD08\uACFC (${rowCount}x${colCount}) \u2014 \uC2A4\uD0B5`, code: "TRUNCATED_TABLE" });
    return;
  }
  const children = el.childNodes;
  for (let i = 0; i < children.length; i++) {
    const rowEl = children[i];
    if (rowEl.nodeType !== 1 || localName(rowEl) !== "ROW") continue;
    const rowCells = rowEl.childNodes;
    for (let j = 0; j < rowCells.length; j++) {
      const cellEl = rowCells[j];
      if (cellEl.nodeType !== 1 || localName(cellEl) !== "CELL") continue;
      const colAddr = parseInt(_nullishCoalesce(cellEl.getAttribute("ColAddr"), () => ( "0")), 10);
      const rowAddr = parseInt(_nullishCoalesce(cellEl.getAttribute("RowAddr"), () => ( "0")), 10);
      const colSpan = Math.min(Math.max(1, parseInt(_nullishCoalesce(cellEl.getAttribute("ColSpan"), () => ( "1")), 10) || 1), MAX_TABLE_COLS);
      const rowSpan = Math.min(Math.max(1, parseInt(_nullishCoalesce(cellEl.getAttribute("RowSpan"), () => ( "1")), 10) || 1), MAX_TABLE_ROWS);
      const cellText = extractCellText(cellEl);
      cells.push({ text: cellText, colSpan, rowSpan, colAddr, rowAddr });
    }
  }
  if (cells.length === 0) return;
  const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(null));
  for (const cell of cells) {
    const r = _nullishCoalesce(cell.rowAddr, () => ( 0));
    const c = _nullishCoalesce(cell.colAddr, () => ( 0));
    if (isNaN(r) || isNaN(c) || r >= rowCount || c >= colCount) continue;
    grid[r][c] = cell;
    for (let dr = 0; dr < cell.rowSpan; dr++) {
      for (let dc = 0; dc < cell.colSpan; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (r + dr < rowCount && c + dc < colCount) {
          grid[r + dr][c + dc] = { text: "", colSpan: 1, rowSpan: 1 };
        }
      }
    }
  }
  const cellRows = grid.map(
    (row) => row.map((cell) => _nullishCoalesce(cell, () => ( { text: "", colSpan: 1, rowSpan: 1 })))
  );
  const table = _chunkJ3FHRU5Tcjs.buildTable.call(void 0, cellRows);
  blocks.push({ type: "table", table, pageNumber: sectionNum });
}
function extractCellText(cellEl) {
  const textParts = [];
  collectCellText(cellEl, textParts, 0);
  return textParts.filter(Boolean).join("\n").trim();
}
function collectCellText(node, parts, depth) {
  if (depth > 20) return;
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = localName(el);
    if (tag === "P") {
      const t = extractParagraphText(el);
      if (t) parts.push(t);
    } else if (tag === "TABLE") {
      parts.push("[\uC911\uCCA9 \uD14C\uC774\uBE14]");
    } else {
      collectCellText(el, parts, depth + 1);
    }
  }
}
function localName(el) {
  return (el.tagName || el.localName || "").replace(/^[^:]+:/, "");
}
function findChild(parent, tag) {
  const children = parent.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType === 1 && localName(el) === tag) return el;
  }
  return null;
}
function textContent(el) {
  const children = el.childNodes;
  const parts = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === 3) {
      parts.push(node.nodeValue || "");
    } else if (node.nodeType === 1) {
      parts.push(textContent(node));
    }
  }
  return parts.join("");
}
function countSections(body) {
  let count = 0;
  const children = body.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType === 1 && localName(el) === "SECTION") count++;
  }
  return count;
}

// src/form/recognize.ts
var LABEL_KEYWORDS = /* @__PURE__ */ new Set([
  "\uC131\uBA85",
  "\uC774\uB984",
  "\uC8FC\uC18C",
  "\uC804\uD654",
  "\uC804\uD654\uBC88\uD638",
  "\uD734\uB300\uD3F0",
  "\uD578\uB4DC\uD3F0",
  "\uC5F0\uB77D\uCC98",
  "\uC0DD\uB144\uC6D4\uC77C",
  "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638",
  "\uC18C\uC18D",
  "\uC9C1\uC704",
  "\uC9C1\uAE09",
  "\uBD80\uC11C",
  "\uC774\uBA54\uC77C",
  "\uD329\uC2A4",
  "\uD559\uAD50",
  "\uD559\uB144",
  "\uBC18",
  "\uBC88\uD638",
  "\uC2E0\uCCAD\uC778",
  "\uB300\uD45C\uC790",
  "\uB2F4\uB2F9\uC790",
  "\uC791\uC131\uC790",
  "\uD655\uC778\uC790",
  "\uC2B9\uC778\uC790",
  "\uC77C\uC2DC",
  "\uB0A0\uC9DC",
  "\uAE30\uAC04",
  "\uC7A5\uC18C",
  "\uBAA9\uC801",
  "\uC0AC\uC720",
  "\uBE44\uACE0",
  "\uAE08\uC561",
  "\uC218\uB7C9",
  "\uB2E8\uAC00",
  "\uD569\uACC4",
  "\uACC4",
  "\uC18C\uACC4",
  "\uB4F1\uB85D\uAE30\uC900\uC9C0",
  "\uBCF8\uC801",
  "\uC704\uC784\uC778",
  "\uCCAD\uAD6C\uC0AC\uC720",
  "\uC18C\uBA85\uC790\uB8CC"
]);
function isLabelCell(text) {
  const trimmed = text.trim().replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰*※]+$/g, "").trim();
  if (!trimmed || trimmed.length > 30) return false;
  for (const kw of LABEL_KEYWORDS) {
    if (trimmed.includes(kw)) return true;
  }
  if (/^[가-힣\s()（）·:：]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length >= 2 && trimmed.replace(/\s/g, "").length <= 8 && !/\d/.test(trimmed)) return true;
  if (/^[가-힣A-Za-z\s]+[:：]$/.test(trimmed)) return true;
  return false;
}
function extractFormFields(blocks) {
  const fields = [];
  let totalTables = 0;
  let formTables = 0;
  for (const block of blocks) {
    if (block.type !== "table" || !block.table) continue;
    totalTables++;
    const tableFields = extractFromTable(block.table);
    if (tableFields.length > 0) {
      formTables++;
      fields.push(...tableFields);
    }
  }
  for (const block of blocks) {
    if (block.type === "paragraph" && block.text) {
      const inlineFields = extractInlineFields(block.text);
      fields.push(...inlineFields);
    }
  }
  const confidence = totalTables > 0 ? formTables / totalTables : fields.length > 0 ? 0.3 : 0;
  return { fields, confidence: Math.min(confidence, 1) };
}
function extractFromTable(table) {
  const fields = [];
  if (table.cols >= 2) {
    for (let r = 0; r < table.rows; r++) {
      for (let c = 0; c < table.cols - 1; c++) {
        const labelCell = table.cells[r][c];
        const valueCell = table.cells[r][c + 1];
        if (isLabelCell(labelCell.text)) {
          fields.push({
            label: labelCell.text.trim().replace(/[:：]\s*$/, ""),
            value: valueCell.text.trim(),
            row: r,
            col: c
          });
        }
      }
    }
  }
  if (fields.length === 0 && table.rows >= 2 && table.cols >= 2) {
    const headerRow = table.cells[0];
    const allLabels = headerRow.every((cell) => {
      const t = cell.text.trim();
      return t.length > 0 && t.length <= 20;
    });
    if (allLabels) {
      for (let r = 1; r < table.rows; r++) {
        for (let c = 0; c < table.cols; c++) {
          const label = headerRow[c].text.trim();
          const value = table.cells[r][c].text.trim();
          if (label && value) {
            fields.push({ label, value, row: r, col: c });
          }
        }
      }
    }
  }
  return fields;
}
function extractInlineFields(text) {
  const fields = [];
  const pattern = /([가-힣A-Za-z]{2,10})\s*[:：]\s*([^\n,;]{1,100})/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const label = match[1].trim();
    const value = match[2].trim();
    if (value) {
      fields.push({ label, value, row: -1, col: -1 });
    }
  }
  return fields;
}

// src/form/match.ts
function normalizeLabel(label) {
  return label.trim().replace(/[:：\s()（）·]/g, "");
}
function findMatchingKey(cellLabel, values) {
  if (values.has(cellLabel)) return cellLabel;
  let bestKey;
  let bestLen = 0;
  for (const key of values.keys()) {
    if (cellLabel.startsWith(key)) {
      if (key.length >= cellLabel.length * 0.6 && key.length > bestLen) {
        bestLen = key.length;
        bestKey = key;
      }
    } else if (key.startsWith(cellLabel)) {
      if (cellLabel.length >= key.length * 0.6 && cellLabel.length > bestLen) {
        bestLen = cellLabel.length;
        bestKey = key;
      }
    }
  }
  return bestKey;
}
function isKeywordLabel(text) {
  const trimmed = text.trim().replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰*※]+$/g, "").trim();
  if (!trimmed || trimmed.length > 15) return false;
  for (const kw of LABEL_KEYWORDS) {
    if (trimmed.includes(kw)) return true;
  }
  return false;
}
function fillInCellPatterns(cellText, values, matchedLabels) {
  let text = cellText;
  const matches = [];
  text = text.replace(
    /([가-힣A-Za-z]+)\(\s{1,}\)([가-힣A-Za-z]*)/g,
    (match, prefix, suffix) => {
      const label = prefix + suffix;
      const normalizedLabel = normalizeLabel(label);
      const matchKey = values.has(normalizedLabel) ? normalizedLabel : values.has(normalizeLabel(prefix)) ? normalizeLabel(prefix) : void 0;
      if (matchKey === void 0) return match;
      const newValue = values.get(matchKey);
      matchedLabels.add(matchKey);
      matches.push({ key: matchKey, label, value: newValue });
      return `${prefix}(${newValue})${suffix}`;
    }
  );
  text = text.replace(
    /□([가-힣A-Za-z]+)/g,
    (match, keyword) => {
      const normalizedKw = normalizeLabel(keyword);
      const matchKey = values.has(normalizedKw) ? normalizedKw : void 0;
      if (matchKey === void 0) return match;
      const val = values.get(matchKey);
      const isTruthy = ["\u2611", "\u2713", "\u2714", "v", "V", "true", "1", "yes", "o", "O"].includes(val.trim()) || val.trim() === "";
      if (!isTruthy) return match;
      matchedLabels.add(matchKey);
      matches.push({ key: matchKey, label: `\u25A1${keyword}`, value: "\u2611" });
      return `\u2611${keyword}`;
    }
  );
  text = text.replace(
    /\(([가-힣A-Za-z]+)[:：]\s{1,}\)/g,
    (match, keyword) => {
      const normalizedKw = normalizeLabel(keyword);
      const matchKey = values.has(normalizedKw) ? normalizedKw : void 0;
      if (matchKey === void 0) return match;
      const newValue = values.get(matchKey);
      matchedLabels.add(matchKey);
      matches.push({ key: matchKey, label: keyword, value: newValue });
      return `(${keyword}\uFF1A${newValue})`;
    }
  );
  return matches.length > 0 ? { text, matches } : null;
}
function normalizeValues(values) {
  const map = /* @__PURE__ */ new Map();
  for (const [label, value] of Object.entries(values)) {
    map.set(normalizeLabel(label), value);
  }
  return map;
}
function resolveUnmatched(normalizedValues, matchedLabels, originalValues) {
  return [...normalizedValues.keys()].filter((k) => !matchedLabels.has(k)).map((k) => {
    for (const orig of Object.keys(originalValues)) {
      if (normalizeLabel(orig) === k) return orig;
    }
    return k;
  });
}

// src/form/filler.ts
function fillFormFields(blocks, values) {
  const cloned = structuredClone(blocks);
  const filled = [];
  const matchedLabels = /* @__PURE__ */ new Set();
  const normalizedValues = normalizeValues(values);
  const patternFilledCells = /* @__PURE__ */ new Set();
  for (const block of cloned) {
    if (block.type !== "table" || !block.table) continue;
    for (let r = 0; r < block.table.rows; r++) {
      for (let c = 0; c < block.table.cols; c++) {
        const cell = _optionalChain([block, 'access', _81 => _81.table, 'access', _82 => _82.cells, 'access', _83 => _83[r], 'optionalAccess', _84 => _84[c]]);
        if (!cell) continue;
        const result = fillInCellPatterns(cell.text, normalizedValues, matchedLabels);
        if (result) {
          cell.text = result.text;
          patternFilledCells.add(`${r},${c}`);
          for (const m of result.matches) {
            filled.push({ label: m.label, value: m.value, row: r, col: c });
          }
        }
      }
    }
  }
  for (const block of cloned) {
    if (block.type !== "table" || !block.table) continue;
    fillTable(block.table, normalizedValues, filled, matchedLabels, patternFilledCells);
  }
  for (const block of cloned) {
    if (block.type !== "paragraph" || !block.text) continue;
    const newText = fillInlineFields(block.text, normalizedValues, filled, matchedLabels);
    if (newText !== block.text) block.text = newText;
  }
  const unmatched = resolveUnmatched(normalizedValues, matchedLabels, values);
  return { blocks: cloned, filled, unmatched };
}
function fillTable(table, values, filled, matchedLabels, patternFilledCells) {
  if (table.cols < 2) return;
  for (let r = 0; r < table.rows; r++) {
    for (let c = 0; c < table.cols - 1; c++) {
      const labelCell = table.cells[r][c];
      const valueCell = table.cells[r][c + 1];
      if (!labelCell || !valueCell) continue;
      if (!isLabelCell(labelCell.text)) continue;
      if (isKeywordLabel(valueCell.text)) continue;
      const normalizedCellLabel = normalizeLabel(labelCell.text);
      if (!normalizedCellLabel) continue;
      const matchKey = findMatchingKey(normalizedCellLabel, values);
      if (matchKey === void 0) continue;
      const newValue = values.get(matchKey);
      if (_optionalChain([patternFilledCells, 'optionalAccess', _85 => _85.has, 'call', _86 => _86(`${r},${c + 1}`)])) {
        valueCell.text = newValue + " " + valueCell.text;
      } else {
        valueCell.text = newValue;
      }
      matchedLabels.add(matchKey);
      filled.push({
        label: labelCell.text.trim().replace(/[:：]\s*$/, ""),
        value: newValue,
        row: r,
        col: c
      });
    }
  }
  if (table.rows >= 2 && table.cols >= 2) {
    const headerRow = table.cells[0];
    const allLabels = headerRow.every((cell) => {
      const t = cell.text.trim();
      return t.length > 0 && t.length <= 20 && isLabelCell(t);
    });
    if (!allLabels) return;
    for (let r = 1; r < table.rows; r++) {
      for (let c = 0; c < table.cols; c++) {
        const headerLabel = normalizeLabel(headerRow[c].text);
        const matchKey = findMatchingKey(headerLabel, values);
        if (matchKey === void 0) continue;
        if (matchedLabels.has(matchKey)) continue;
        const newValue = values.get(matchKey);
        table.cells[r][c].text = newValue;
        matchedLabels.add(matchKey);
        filled.push({
          label: headerRow[c].text.trim(),
          value: newValue,
          row: r,
          col: c
        });
      }
    }
  }
}
function fillInlineFields(text, values, filled, matchedLabels) {
  return text.replace(
    /([가-힣A-Za-z]{2,10})\s*[:：]\s*([^\n,;]{0,100})/g,
    (match, rawLabel, _oldValue) => {
      const normalized = normalizeLabel(rawLabel);
      const matchKey = findMatchingKey(normalized, values);
      if (matchKey === void 0) return match;
      const newValue = values.get(matchKey);
      matchedLabels.add(matchKey);
      filled.push({
        label: rawLabel.trim(),
        value: newValue,
        row: -1,
        col: -1
      });
      return `${rawLabel}: ${newValue}`;
    }
  );
}

// src/form/filler-hwpx.ts


async function fillHwpx(hwpxBuffer, values) {
  const zip = await _jszip2.default.loadAsync(hwpxBuffer);
  const filled = [];
  const matchedLabels = /* @__PURE__ */ new Set();
  const normalizedValues = normalizeValues(values);
  const sectionFiles = Object.keys(zip.files).filter((name) => /[Ss]ection\d+\.xml$/i.test(name)).sort();
  if (sectionFiles.length === 0) {
    throw new (0, _chunkJ3FHRU5Tcjs.KordocError)("HWPX\uC5D0\uC11C \uC139\uC158 \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const xmlParser = new (0, _xmldom.DOMParser)();
  const xmlSerializer = new (0, _xmldom.XMLSerializer)();
  for (const sectionPath of sectionFiles) {
    const zipEntry = zip.file(sectionPath);
    if (!zipEntry) continue;
    const rawXml = await zipEntry.async("text");
    const doc = xmlParser.parseFromString(_chunkJ3FHRU5Tcjs.stripDtd.call(void 0, rawXml), "text/xml");
    if (!doc.documentElement) continue;
    let modified = false;
    const tables = findAllElements(doc.documentElement, "tbl");
    const cellPatternApplied = /* @__PURE__ */ new Set();
    for (const tblEl of tables) {
      const allCells = findAllElements(tblEl, "tc");
      for (const tcEl of allCells) {
        const tNodes = collectCellTextNodes(tcEl);
        const fullText = tNodes.map((n) => n.text).join("");
        const result = fillInCellPatterns(fullText, normalizedValues, matchedLabels);
        if (!result) continue;
        applyTextReplacements(tNodes, fullText, result.text);
        cellPatternApplied.add(tcEl);
        for (const m of result.matches) {
          filled.push({ label: m.label, value: m.value, row: -1, col: -1 });
        }
        modified = true;
      }
    }
    for (const tblEl of tables) {
      const rows = findDirectChildren(tblEl, "tr");
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const trEl = rows[rowIdx];
        const cells = findDirectChildren(trEl, "tc");
        for (let colIdx = 0; colIdx < cells.length - 1; colIdx++) {
          const labelText = extractCellText2(cells[colIdx]);
          if (!isLabelCell(labelText)) continue;
          const valueCell = cells[colIdx + 1];
          const valueText = extractCellText2(valueCell);
          if (isKeywordLabel(valueText)) continue;
          const normalizedCellLabel = normalizeLabel(labelText);
          if (!normalizedCellLabel) continue;
          const matchKey = findMatchingKey(normalizedCellLabel, normalizedValues);
          if (matchKey === void 0) continue;
          const newValue = normalizedValues.get(matchKey);
          if (cellPatternApplied.has(valueCell)) {
            prependCellText(valueCell, newValue);
          } else {
            replaceCellText(valueCell, newValue);
          }
          matchedLabels.add(matchKey);
          filled.push({
            label: labelText.trim().replace(/[:：]\s*$/, ""),
            value: newValue,
            row: rowIdx,
            col: colIdx
          });
          modified = true;
        }
      }
      if (rows.length >= 2) {
        const headerCells = findDirectChildren(rows[0], "tc");
        const allLabels = headerCells.every((cell) => {
          const t = extractCellText2(cell).trim();
          return t.length > 0 && t.length <= 20 && isLabelCell(t);
        });
        if (allLabels) {
          for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
            const dataCells = findDirectChildren(rows[rowIdx], "tc");
            for (let colIdx = 0; colIdx < Math.min(headerCells.length, dataCells.length); colIdx++) {
              const headerLabel = normalizeLabel(extractCellText2(headerCells[colIdx]));
              const matchKey = findMatchingKey(headerLabel, normalizedValues);
              if (matchKey === void 0) continue;
              if (matchedLabels.has(matchKey)) continue;
              const newValue = normalizedValues.get(matchKey);
              replaceCellText(dataCells[colIdx], newValue);
              matchedLabels.add(matchKey);
              filled.push({
                label: extractCellText2(headerCells[colIdx]).trim(),
                value: newValue,
                row: rowIdx,
                col: colIdx
              });
              modified = true;
            }
          }
        }
      }
    }
    const allParagraphs = findAllElements(doc.documentElement, "p");
    for (const pEl of allParagraphs) {
      if (isInsideTable(pEl)) continue;
      const tNodes = collectTextNodes(pEl);
      const fullText = tNodes.map((n) => n.text).join("");
      const pattern = /([가-힣A-Za-z]{2,10})\s*[:：]\s*([^\n,;]{0,100})/g;
      let match;
      while ((match = pattern.exec(fullText)) !== null) {
        const rawLabel = match[1];
        const normalized = normalizeLabel(rawLabel);
        const matchKey = findMatchingKey(normalized, normalizedValues);
        if (matchKey === void 0) continue;
        const newValue = normalizedValues.get(matchKey);
        const valueStart = match.index + match[0].length - match[2].length;
        const valueEnd = match.index + match[0].length;
        replaceTextRange(tNodes, valueStart, valueEnd, newValue);
        matchedLabels.add(matchKey);
        filled.push({ label: rawLabel.trim(), value: newValue, row: -1, col: -1 });
        modified = true;
        break;
      }
    }
    if (modified) {
      const newXml = xmlSerializer.serializeToString(doc);
      zip.file(sectionPath, newXml);
    }
  }
  const unmatched = resolveUnmatched(normalizedValues, matchedLabels, values);
  const buffer = await zip.generateAsync({ type: "arraybuffer" });
  return { buffer, filled, unmatched };
}
function localName2(el) {
  return (el.tagName || el.localName || "").replace(/^[^:]+:/, "");
}
function findAllElements(node, tagLocalName) {
  const result = [];
  const walk = (n) => {
    const children = n.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType !== 1) continue;
      if (localName2(child) === tagLocalName) result.push(child);
      walk(child);
    }
  };
  walk(node);
  return result;
}
function findDirectChildren(parent, tagLocalName) {
  const result = [];
  const children = parent.childNodes;
  if (!children) return result;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1 && localName2(child) === tagLocalName) {
      result.push(child);
    }
  }
  return result;
}
function isInsideTable(el) {
  let parent = el.parentNode;
  while (parent) {
    if (parent.nodeType === 1 && localName2(parent) === "tbl") return true;
    parent = parent.parentNode;
  }
  return false;
}
function extractCellText2(tcEl) {
  const parts = [];
  const walk = (node) => {
    const children = node.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 3) {
        parts.push(child.textContent || "");
      } else if (child.nodeType === 1) {
        const tag = localName2(child);
        if (tag === "t") walk(child);
        else if (tag === "run" || tag === "r" || tag === "p" || tag === "subList") walk(child);
        else if (tag === "tab") parts.push("	");
        else if (tag === "br") parts.push("\n");
      }
    }
  };
  walk(tcEl);
  return parts.join("");
}
function prependCellText(tcEl, text) {
  const tElements = findAllElements(tcEl, "t");
  if (tElements.length === 0) return;
  const firstT = tElements[0];
  const existing = firstT.textContent || "";
  clearChildren(firstT);
  firstT.appendChild(firstT.ownerDocument.createTextNode(text + " " + existing));
}
function replaceCellText(tcEl, newValue) {
  const paragraphs = findAllElements(tcEl, "p");
  if (paragraphs.length === 0) return;
  const firstP = paragraphs[0];
  const runs = findAllElements(firstP, "run").concat(findAllElements(firstP, "r"));
  if (runs.length > 0) {
    setRunText(runs[0], newValue);
    for (let i = 1; i < runs.length; i++) {
      setRunText(runs[i], "");
    }
  } else {
    const tElements = findAllElements(firstP, "t");
    if (tElements.length > 0) {
      clearChildren(tElements[0]);
      tElements[0].appendChild(tElements[0].ownerDocument.createTextNode(newValue));
      for (let i = 1; i < tElements.length; i++) {
        clearChildren(tElements[i]);
      }
    }
  }
  for (let i = 1; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (p.parentNode) {
      const pRuns = findAllElements(p, "run").concat(findAllElements(p, "r"));
      for (const run of pRuns) setRunText(run, "");
      const pTs = findAllElements(p, "t");
      for (const t of pTs) clearChildren(t);
    }
  }
}
function setRunText(runEl, text) {
  const tElements = findAllElements(runEl, "t");
  if (tElements.length > 0) {
    clearChildren(tElements[0]);
    tElements[0].appendChild(tElements[0].ownerDocument.createTextNode(text));
    for (let i = 1; i < tElements.length; i++) {
      clearChildren(tElements[i]);
    }
  }
}
function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
function collectTextNodes(pEl) {
  const tElements = findAllElements(pEl, "t");
  const result = [];
  let offset = 0;
  for (const t of tElements) {
    const text = t.textContent || "";
    result.push({ element: t, text, offset });
    offset += text.length;
  }
  return result;
}
function replaceTextRange(tNodes, globalStart, globalEnd, newValue) {
  let replaced = false;
  for (const node of tNodes) {
    const nodeStart = node.offset;
    const nodeEnd = node.offset + node.text.length;
    if (nodeEnd <= globalStart || nodeStart >= globalEnd) continue;
    const localStart = Math.max(0, globalStart - nodeStart);
    const localEnd = Math.min(node.text.length, globalEnd - nodeStart);
    if (!replaced) {
      const before = node.text.slice(0, localStart);
      const after = node.text.slice(localEnd);
      const newText = before + newValue + after;
      clearChildren(node.element);
      node.element.appendChild(node.element.ownerDocument.createTextNode(newText));
      replaced = true;
    } else {
      const before = node.text.slice(0, localStart);
      const after = node.text.slice(localEnd);
      const newText = before + after;
      clearChildren(node.element);
      node.element.appendChild(node.element.ownerDocument.createTextNode(newText));
    }
  }
}
function collectCellTextNodes(tcEl) {
  const tElements = findAllElements(tcEl, "t");
  const result = [];
  let offset = 0;
  for (const t of tElements) {
    const text = t.textContent || "";
    result.push({ element: t, text, offset });
    offset += text.length;
  }
  return result;
}
function applyTextReplacements(tNodes, originalFull, replacedFull) {
  if (originalFull === replacedFull) return;
  if (tNodes.length === 1) {
    clearChildren(tNodes[0].element);
    tNodes[0].element.appendChild(
      tNodes[0].element.ownerDocument.createTextNode(replacedFull)
    );
    return;
  }
  let diffStart = 0;
  while (diffStart < originalFull.length && diffStart < replacedFull.length && originalFull[diffStart] === replacedFull[diffStart]) {
    diffStart++;
  }
  let diffEndOrig = originalFull.length;
  let diffEndRepl = replacedFull.length;
  while (diffEndOrig > diffStart && diffEndRepl > diffStart && originalFull[diffEndOrig - 1] === replacedFull[diffEndRepl - 1]) {
    diffEndOrig--;
    diffEndRepl--;
  }
  const newPart = replacedFull.slice(diffStart, diffEndRepl);
  replaceTextRange(tNodes, diffStart, diffEndOrig, newPart);
}

// src/hwpx/generator.ts

var NS_SECTION = "http://www.hancom.co.kr/hwpml/2011/section";
var NS_PARA = "http://www.hancom.co.kr/hwpml/2011/paragraph";
var NS_HEAD = "http://www.hancom.co.kr/hwpml/2011/head";
var NS_OPF = "http://www.idpf.org/2007/opf/";
var NS_HPF = "http://www.hancom.co.kr/schema/2011/hpf";
var NS_OCF = "urn:oasis:names:tc:opendocument:xmlns:container";
var CHAR_NORMAL = 0;
var CHAR_BOLD = 1;
var CHAR_ITALIC = 2;
var CHAR_BOLD_ITALIC = 3;
var CHAR_CODE = 4;
var CHAR_H1 = 5;
var CHAR_H2 = 6;
var CHAR_H3 = 7;
var CHAR_H4 = 8;
var PARA_NORMAL = 0;
var PARA_H1 = 1;
var PARA_H2 = 2;
var PARA_H3 = 3;
var PARA_H4 = 4;
var PARA_CODE = 5;
var PARA_QUOTE = 6;
var PARA_LIST = 7;
async function markdownToHwpx(markdown) {
  const blocks = parseMarkdownToBlocks(markdown);
  const sectionXml = blocksToSectionXml(blocks);
  const zip = new (0, _jszip2.default)();
  zip.file("mimetype", "application/hwp+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", generateContainerXml());
  zip.file("Contents/content.hpf", generateManifest());
  zip.file("Contents/header.xml", generateHeaderXml());
  zip.file("Contents/section0.xml", sectionXml);
  zip.file("Preview/PrvText.txt", buildPrvText(blocks));
  return await zip.generateAsync({ type: "arraybuffer" });
}
function buildPrvText(blocks) {
  const lines = [];
  let bytes = 0;
  for (const b of blocks) {
    const text = b.text || (b.rows ? b.rows.map((r) => r.join(" ")).join("\n") : "");
    if (!text) continue;
    lines.push(text);
    bytes += text.length * 3;
    if (bytes > 1024) break;
  }
  return lines.join("\n").slice(0, 1024);
}
function parseMarkdownToBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const lang = fenceMatch[2].trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "code_block", text: codeLines.join("\n"), lang });
      continue;
    }
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", text: headingMatch[2].trim(), level: headingMatch[1].length });
      i++;
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      const tableRows = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        const row = lines[i];
        if (/^[\s|:\-]+$/.test(row)) {
          i++;
          continue;
        }
        const cells = row.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.length > 0) tableRows.push(cells);
        i++;
      }
      if (tableRows.length > 0) blocks.push({ type: "table", rows: tableRows });
      continue;
    }
    if (line.trimStart().startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && (lines[i].trimStart().startsWith("> ") || lines[i].trimStart().startsWith(">"))) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      for (const ql of quoteLines) {
        blocks.push({ type: "blockquote", text: ql.trim() || "" });
      }
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*+]|\d+[.)]) (.+)$/);
    if (listMatch) {
      const indent = Math.floor(listMatch[1].length / 2);
      const ordered = /\d/.test(listMatch[2]);
      blocks.push({ type: "list_item", text: listMatch[3].trim(), ordered, indent });
      i++;
      continue;
    }
    blocks.push({ type: "paragraph", text: line.trim() });
    i++;
  }
  return blocks;
}
function parseInlineMarkdown(text) {
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, t, u) => t || u);
  text = text.replace(/~~([^~]+)~~/g, "$1");
  const spans = [];
  const regex = /(`[^`]+`|\*{3}[^*]+\*{3}|\*{2}[^*]+\*{2}|\*[^*]+\*|_{2}[^_]+_{2}|_[^_]+_)/g;
  let lastIdx = 0;
  for (const match of text.matchAll(regex)) {
    const idx = match.index;
    if (idx > lastIdx) {
      spans.push({ text: text.slice(lastIdx, idx), bold: false, italic: false, code: false });
    }
    const raw = match[0];
    if (raw.startsWith("`")) {
      spans.push({ text: raw.slice(1, -1), bold: false, italic: false, code: true });
    } else if (raw.startsWith("***") || raw.startsWith("___")) {
      spans.push({ text: raw.slice(3, -3), bold: true, italic: true, code: false });
    } else if (raw.startsWith("**") || raw.startsWith("__")) {
      spans.push({ text: raw.slice(2, -2), bold: true, italic: false, code: false });
    } else {
      spans.push({ text: raw.slice(1, -1), bold: false, italic: true, code: false });
    }
    lastIdx = idx + raw.length;
  }
  if (lastIdx < text.length) {
    spans.push({ text: text.slice(lastIdx), bold: false, italic: false, code: false });
  }
  if (spans.length === 0) {
    spans.push({ text, bold: false, italic: false, code: false });
  }
  return spans;
}
function spanToCharPrId(span) {
  if (span.code) return CHAR_CODE;
  if (span.bold && span.italic) return CHAR_BOLD_ITALIC;
  if (span.bold) return CHAR_BOLD;
  if (span.italic) return CHAR_ITALIC;
  return CHAR_NORMAL;
}
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function generateRuns(text, defaultCharPr = CHAR_NORMAL) {
  const spans = parseInlineMarkdown(text);
  return spans.map((span) => {
    const charId = span.code || span.bold || span.italic ? spanToCharPrId(span) : defaultCharPr;
    return `<hp:run charPrIDRef="${charId}"><hp:t>${escapeXml(span.text)}</hp:t></hp:run>`;
  }).join("");
}
function generateParagraph(text, paraPrId = PARA_NORMAL, charPrId = CHAR_NORMAL) {
  if (paraPrId === PARA_CODE) {
    return `<hp:p paraPrIDRef="${paraPrId}" styleIDRef="0"><hp:run charPrIDRef="${CHAR_CODE}"><hp:t>${escapeXml(text)}</hp:t></hp:run></hp:p>`;
  }
  const runs = generateRuns(text, charPrId);
  return `<hp:p paraPrIDRef="${paraPrId}" styleIDRef="0">${runs}</hp:p>`;
}
function headingParaPrId(level) {
  if (level === 1) return PARA_H1;
  if (level === 2) return PARA_H2;
  if (level === 3) return PARA_H3;
  return PARA_H4;
}
function headingCharPrId(level) {
  if (level === 1) return CHAR_H1;
  if (level === 2) return CHAR_H2;
  if (level === 3) return CHAR_H3;
  return CHAR_H4;
}
function generateContainerXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ocf:container xmlns:ocf="${NS_OCF}" xmlns:hpf="${NS_HPF}">
  <ocf:rootfiles>
    <ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/>
  </ocf:rootfiles>
</ocf:container>`;
}
function generateManifest() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<opf:package xmlns:opf="${NS_OPF}" xmlns:hpf="${NS_HPF}" xmlns:hh="${NS_HEAD}">
  <opf:manifest>
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="no"/>
    <opf:itemref idref="section0" linear="yes"/>
  </opf:spine>
</opf:package>`;
}
function charPr(id, height, bold, italic, fontId = 0) {
  const boldAttr = bold ? ` bold="1"` : "";
  const italicAttr = italic ? ` italic="1"` : "";
  const effFont = bold ? 2 : fontId;
  return `      <hh:charPr id="${id}" height="${height}" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0"${boldAttr}${italicAttr}>
        <hh:fontRef hangul="${effFont}" latin="${effFont}" hanja="${effFont}" japanese="${effFont}" other="${effFont}" symbol="${effFont}" user="${effFont}"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
      </hh:charPr>`;
}
function paraPr(id, opts = {}) {
  const { align = "JUSTIFY", spaceBefore = 0, spaceAfter = 0, lineSpacing = 160, indent = 0 } = opts;
  return `      <hh:paraPr id="${id}" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0" textDir="AUTO">
        <hh:align horizontal="${align}" vertical="BASELINE"/>
        <hh:heading type="NONE" idRef="0" level="0"/>
        <hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="BREAK_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/>
        <hh:autoSpacing eAsianEng="0" eAsianNum="0"/>
        <hh:margin indent="${indent}" left="0" right="0" prev="${spaceBefore}" next="${spaceAfter}"/>
        <hh:lineSpacing type="PERCENT" value="${lineSpacing}"/>
        <hh:border borderFillIDRef="0" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/>
      </hh:paraPr>`;
}
function generateHeaderXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hh:head xmlns:hh="${NS_HEAD}" xmlns:hp="${NS_PARA}" version="1.4" secCnt="1">
  <hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>
  <hh:refList>
    <hh:fontfaces itemCnt="7">
      <hh:fontface lang="HANGUL" fontCnt="3">
        <hh:font id="0" face="\uD568\uCD08\uB86C\uBC14\uD0D5" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="\uD568\uCD08\uB86C\uB3CB\uC6C0" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="2" face="HY\uACAC\uACE0\uB515" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="9" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="LATIN" fontCnt="3">
        <hh:font id="0" face="Times New Roman" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_OLDSTYLE" weight="5" proportion="4" contrast="2" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="4"/>
        </hh:font>
        <hh:font id="1" face="Consolas" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_MODERN" weight="5" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/>
        </hh:font>
        <hh:font id="2" face="Arial Black" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="9" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="HANJA" fontCnt="1">
        <hh:font id="0" face="\uD568\uCD08\uB86C\uBC14\uD0D5" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="JAPANESE" fontCnt="1">
        <hh:font id="0" face="\uAD74\uB9BC" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="OTHER" fontCnt="1">
        <hh:font id="0" face="\uAD74\uB9BC" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="SYMBOL" fontCnt="1">
        <hh:font id="0" face="Symbol" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="USER" fontCnt="1">
        <hh:font id="0" face="\uAD74\uB9BC" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
    </hh:fontfaces>
    <hh:borderFills itemCnt="2">
      <hh:borderFill id="0" threeD="0" shadow="0" centerLine="0" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:rightBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:topBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:bottomBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:diagonal type="NONE" width="0.1 mm" color="#000000"/>
        <hh:fillInfo/>
      </hh:borderFill>
      <hh:borderFill id="1" threeD="0" shadow="0" centerLine="0" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:rightBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:topBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:bottomBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:diagonal type="NONE" width="0.1 mm" color="#000000"/>
        <hh:fillInfo/>
      </hh:borderFill>
    </hh:borderFills>
    <hh:charProperties itemCnt="9">
${charPr(0, 1e3, false, false)}
${charPr(1, 1e3, true, false)}
${charPr(2, 1e3, false, true)}
${charPr(3, 1e3, true, true)}
${charPr(4, 900, false, false, 1)}
${charPr(5, 1800, true, false, 1)}
${charPr(6, 1400, true, false, 1)}
${charPr(7, 1200, true, false, 1)}
${charPr(8, 1100, true, false, 1)}
    </hh:charProperties>
    <hh:tabProperties itemCnt="0"/>
    <hh:numberings itemCnt="0"/>
    <hh:bullets itemCnt="0"/>
    <hh:paraProperties itemCnt="8">
${paraPr(0)}
${paraPr(1, { align: "LEFT", spaceBefore: 800, spaceAfter: 200, lineSpacing: 180 })}
${paraPr(2, { align: "LEFT", spaceBefore: 600, spaceAfter: 150, lineSpacing: 170 })}
${paraPr(3, { align: "LEFT", spaceBefore: 400, spaceAfter: 100, lineSpacing: 160 })}
${paraPr(4, { align: "LEFT", spaceBefore: 300, spaceAfter: 100, lineSpacing: 160 })}
${paraPr(5, { align: "LEFT", lineSpacing: 130, indent: 400 })}
${paraPr(6, { align: "LEFT", lineSpacing: 150, indent: 600 })}
${paraPr(7, { align: "LEFT", lineSpacing: 160, indent: 600 })}
    </hh:paraProperties>
    <hh:styles itemCnt="1">
      <hh:style id="0" type="PARA" name="\uBC14\uD0D5\uAE00" engName="Normal" paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langIDRef="1042" lockForm="0"/>
    </hh:styles>
  </hh:refList>
  <hh:compatibleDocument targetProgram="HWP2018"/>
</hh:head>`;
}
function generateSecPr() {
  return `<hp:secPr textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" outlineShapeIDRef="0" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0"><hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/><hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/><hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/><hp:pagePr landscape="WIDELY" width="59528" height="84188" gutterType="LEFT_ONLY"><hp:margin header="2835" footer="2835" gutter="0" left="5670" right="4252" top="8504" bottom="4252"/></hp:pagePr><hp:footNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="EACH_COLUMN" beneathText="0"/></hp:footNotePr><hp:endNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="END_OF_DOCUMENT" beneathText="0"/></hp:endNotePr></hp:secPr>`;
}
var TABLE_ID_BASE = 1e3;
var tableIdCounter = TABLE_ID_BASE;
function nextTableId() {
  return ++tableIdCounter;
}
function generateTable(rows) {
  const rowCnt = rows.length;
  const colCnt = Math.max(...rows.map((r) => r.length), 1);
  const cellW = Math.floor(44e3 / colCnt);
  const cellH = 1500;
  const tblW = cellW * colCnt;
  const tblH = cellH * rowCnt;
  const tblId = nextTableId();
  const trElements = rows.map((row, rowIdx) => {
    const cells = row.length < colCnt ? [...row, ...Array(colCnt - row.length).fill("")] : row;
    const tdElements = cells.map((cell, colIdx) => {
      const runs = generateRuns(cell);
      const p = `<hp:p paraPrIDRef="0" styleIDRef="0">${runs}</hp:p>`;
      return `<hp:tc name="" header="${rowIdx === 0 ? 1 : 0}" hasMargin="0" protect="0" editable="1" dirty="0" borderFillIDRef="1"><hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="TOP" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">${p}</hp:subList><hp:cellAddr colAddr="${colIdx}" rowAddr="${rowIdx}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="${cellW}" height="${cellH}"/><hp:cellMargin left="141" right="141" top="141" bottom="141"/></hp:tc>`;
    }).join("");
    return `<hp:tr>${tdElements}</hp:tr>`;
  }).join("");
  const tblInner = `<hp:sz width="${tblW}" widthRelTo="ABSOLUTE" height="${tblH}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="0" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/><hp:outMargin left="0" right="0" top="0" bottom="0"/><hp:inMargin left="510" right="510" top="141" bottom="141"/>` + trElements;
  const tbl = `<hp:tbl id="${tblId}" zOrder="0" numberingType="TABLE" pageBreak="CELL" repeatHeader="0" rowCnt="${rowCnt}" colCnt="${colCnt}" cellSpacing="0" borderFillIDRef="1" noShading="0">${tblInner}</hp:tbl>`;
  return `<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0">${tbl}</hp:run></hp:p>`;
}
function blocksToSectionXml(blocks) {
  const paraXmls = [];
  let isFirst = true;
  const orderedCounters = {};
  let prevWasOrdered = false;
  for (const block of blocks) {
    let xml = "";
    if (block.type !== "list_item" || !block.ordered) {
      if (prevWasOrdered) {
        for (const k of Object.keys(orderedCounters)) delete orderedCounters[+k];
      }
      prevWasOrdered = false;
    }
    switch (block.type) {
      case "heading": {
        const pId = headingParaPrId(block.level || 1);
        const cId = headingCharPrId(block.level || 1);
        xml = generateParagraph(block.text || "", pId, cId);
        break;
      }
      case "paragraph":
        xml = generateParagraph(block.text || "");
        break;
      case "code_block": {
        const codeLines = (block.text || "").split("\n");
        xml = codeLines.map((line) => generateParagraph(line || " ", PARA_CODE)).join("\n  ");
        break;
      }
      case "blockquote":
        xml = generateParagraph(block.text || "", PARA_QUOTE);
        break;
      case "list_item": {
        const indent = block.indent || 0;
        let marker;
        if (block.ordered) {
          orderedCounters[indent] = (orderedCounters[indent] || 0) + 1;
          for (const k of Object.keys(orderedCounters)) {
            if (+k > indent) delete orderedCounters[+k];
          }
          marker = `${orderedCounters[indent]}. `;
          prevWasOrdered = true;
        } else {
          marker = "\xB7 ";
          if (prevWasOrdered) {
            for (const k of Object.keys(orderedCounters)) delete orderedCounters[+k];
          }
          prevWasOrdered = false;
        }
        const indentPrefix = "  ".repeat(indent);
        xml = generateParagraph(indentPrefix + marker + (block.text || ""), PARA_LIST);
        break;
      }
      case "hr":
        xml = `<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0"><hp:t>\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</hp:t></hp:run></hp:p>`;
        break;
      case "table":
        if (block.rows) {
          if (isFirst) {
            const secRun = `<hp:run charPrIDRef="0">${generateSecPr()}<hp:t></hp:t></hp:run>`;
            paraXmls.push(`<hp:p paraPrIDRef="0" styleIDRef="0">${secRun}</hp:p>`);
            isFirst = false;
          }
          xml = generateTable(block.rows);
        }
        break;
    }
    if (!xml) continue;
    if (isFirst && block.type !== "table") {
      xml = xml.replace(
        /<hp:run charPrIDRef="(\d+)">/,
        `<hp:run charPrIDRef="$1">${generateSecPr()}`
      );
      isFirst = false;
    }
    paraXmls.push(xml);
  }
  if (paraXmls.length === 0) {
    paraXmls.push(`<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0">${generateSecPr()}<hp:t></hp:t></hp:run></hp:p>`);
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hs:sec xmlns:hs="${NS_SECTION}" xmlns:hp="${NS_PARA}">
  ${paraXmls.join("\n  ")}
</hs:sec>`;
}

// src/diff/text-diff.ts
function similarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}
function normalizedSimilarity(a, b) {
  return similarity(normalize(a), normalize(b));
}
function normalize(s) {
  return s.replace(/\s+/g, " ").trim();
}
var MAX_LEVENSHTEIN_LEN = 1e4;
function levenshtein(a, b) {
  if (a.length + b.length > MAX_LEVENSHTEIN_LEN) {
    const sampleLen = Math.min(500, a.length, b.length);
    let diffs = 0;
    for (let i = 0; i < sampleLen; i++) if (a[i] !== b[i]) diffs++;
    const sampleRate = sampleLen > 0 ? diffs / sampleLen : 1;
    return Math.abs(a.length - b.length) + Math.round(Math.min(a.length, b.length) * sampleRate);
  }
  if (a.length > b.length) [a, b] = [b, a];
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  let curr = new Array(m + 1);
  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      if (a[i - 1] === b[j - 1]) {
        curr[i] = prev[i - 1];
      } else {
        curr[i] = 1 + Math.min(prev[i - 1], prev[i], curr[i - 1]);
      }
    }
    ;
    [prev, curr] = [curr, prev];
  }
  return prev[m];
}

// src/diff/compare.ts
var SIMILARITY_THRESHOLD = 0.4;
async function compare(bufferA, bufferB, options) {
  const [resultA, resultB] = await Promise.all([
    parse(bufferA, options),
    parse(bufferB, options)
  ]);
  if (!resultA.success) throw new Error(`\uBB38\uC11CA \uD30C\uC2F1 \uC2E4\uD328: ${resultA.error}`);
  if (!resultB.success) throw new Error(`\uBB38\uC11CB \uD30C\uC2F1 \uC2E4\uD328: ${resultB.error}`);
  return diffBlocks(resultA.blocks, resultB.blocks);
}
function diffBlocks(blocksA, blocksB) {
  const aligned = alignBlocks(blocksA, blocksB);
  const stats = { added: 0, removed: 0, modified: 0, unchanged: 0 };
  const diffs = [];
  for (const [a, b] of aligned) {
    if (a && b) {
      const sim = blockSimilarity(a, b);
      if (sim >= 0.99) {
        diffs.push({ type: "unchanged", before: a, after: b, similarity: 1 });
        stats.unchanged++;
      } else {
        const diff = { type: "modified", before: a, after: b, similarity: sim };
        if (a.type === "table" && b.type === "table" && a.table && b.table) {
          diff.cellDiffs = diffTableCells(a.table, b.table);
        }
        diffs.push(diff);
        stats.modified++;
      }
    } else if (a) {
      diffs.push({ type: "removed", before: a });
      stats.removed++;
    } else if (b) {
      diffs.push({ type: "added", after: b });
      stats.added++;
    }
  }
  return { stats, diffs };
}
function alignBlocks(a, b) {
  const m = a.length, n = b.length;
  if (m * n > 1e7) return fallbackAlign(a, b);
  const simCache = /* @__PURE__ */ new Map();
  const getSim = (i2, j2) => {
    const key = `${i2},${j2}`;
    let v = simCache.get(key);
    if (v === void 0) {
      v = blockSimilarity(a[i2], b[j2]);
      simCache.set(key, v);
    }
    return v;
  };
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i2 = 1; i2 <= m; i2++) {
    for (let j2 = 1; j2 <= n; j2++) {
      if (getSim(i2 - 1, j2 - 1) >= SIMILARITY_THRESHOLD) {
        dp[i2][j2] = dp[i2 - 1][j2 - 1] + 1;
      } else {
        dp[i2][j2] = Math.max(dp[i2 - 1][j2], dp[i2][j2 - 1]);
      }
    }
  }
  const pairs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (getSim(i - 1, j - 1) >= SIMILARITY_THRESHOLD && dp[i][j] === dp[i - 1][j - 1] + 1) {
      pairs.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  pairs.reverse();
  const result = [];
  let ai = 0, bi = 0;
  for (const [pi, pj] of pairs) {
    while (ai < pi) result.push([a[ai++], null]);
    while (bi < pj) result.push([null, b[bi++]]);
    result.push([a[ai++], b[bi++]]);
  }
  while (ai < m) result.push([a[ai++], null]);
  while (bi < n) result.push([null, b[bi++]]);
  return result;
}
function fallbackAlign(a, b) {
  const result = [];
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    result.push([a[i] || null, b[i] || null]);
  }
  return result;
}
function blockSimilarity(a, b) {
  if (a.type !== b.type) return 0;
  if (a.text !== void 0 && b.text !== void 0) {
    return normalizedSimilarity(a.text || "", b.text || "");
  }
  if (a.type === "table" && a.table && b.table) {
    return tableSimilarity(a.table, b.table);
  }
  if (a.type === b.type) return 1;
  return 0;
}
function tableSimilarity(a, b) {
  const dimSim = 1 - Math.abs(a.rows * a.cols - b.rows * b.cols) / Math.max(a.rows * a.cols, b.rows * b.cols, 1);
  const textsA = a.cells.flat().map((c) => c.text).join(" ");
  const textsB = b.cells.flat().map((c) => c.text).join(" ");
  const contentSim = normalizedSimilarity(textsA, textsB);
  return dimSim * 0.3 + contentSim * 0.7;
}
function diffTableCells(a, b) {
  const maxRows = Math.max(a.rows, b.rows);
  const maxCols = Math.max(a.cols, b.cols);
  const result = [];
  for (let r = 0; r < maxRows; r++) {
    const row = [];
    for (let c = 0; c < maxCols; c++) {
      const cellA = r < a.rows && c < a.cols ? a.cells[r][c].text : void 0;
      const cellB = r < b.rows && c < b.cols ? b.cells[r][c].text : void 0;
      let type;
      if (cellA === void 0) type = "added";
      else if (cellB === void 0) type = "removed";
      else if (cellA === cellB) type = "unchanged";
      else type = "modified";
      row.push({ type, before: cellA, after: cellB });
    }
    result.push(row);
  }
  return result;
}

// src/index.ts
async function parse(input, options) {
  let buffer;
  const opts = typeof input === "string" && !_optionalChain([options, 'optionalAccess', _87 => _87.filePath]) ? { ...options, filePath: input } : options;
  if (typeof input === "string") {
    try {
      const buf = await _promises.readFile.call(void 0, input);
      buffer = _chunkJ3FHRU5Tcjs.toArrayBuffer.call(void 0, buf);
    } catch (err) {
      const msg = err instanceof Error && "code" in err && err.code === "ENOENT" ? `\uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ${input}` : `\uD30C\uC77C \uC77D\uAE30 \uC2E4\uD328: ${input}`;
      return { success: false, fileType: "unknown", error: msg, code: "PARSE_ERROR" };
    }
  } else if (Buffer.isBuffer(input)) {
    buffer = _chunkJ3FHRU5Tcjs.toArrayBuffer.call(void 0, input);
  } else {
    buffer = input;
  }
  if (!buffer || buffer.byteLength === 0) {
    return { success: false, fileType: "unknown", error: "\uBE48 \uBC84\uD37C\uC774\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC785\uB825\uC785\uB2C8\uB2E4.", code: "EMPTY_INPUT" };
  }
  const format = detectFormat(buffer);
  switch (format) {
    case "hwpx": {
      const zipFormat = await detectZipFormat(buffer);
      if (zipFormat === "xlsx") return parseXlsx(buffer, opts);
      if (zipFormat === "docx") return parseDocx(buffer, opts);
      return parseHwpx(buffer, opts);
    }
    case "hwp":
      return parseHwp(buffer, opts);
    case "hwpml":
      return parseHwpml(buffer, opts);
    case "pdf":
      return parsePdf(buffer, opts);
    default:
      return { success: false, fileType: "unknown", error: "\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD30C\uC77C \uD615\uC2DD\uC785\uB2C8\uB2E4.", code: "UNSUPPORTED_FORMAT" };
  }
}
async function parseHwpx(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings, images } = await parseHwpxDocument(buffer, options);
    return { success: true, fileType: "hwpx", markdown, blocks, metadata, outline, warnings, images: _optionalChain([images, 'optionalAccess', _88 => _88.length]) ? images : void 0 };
  } catch (err) {
    return { success: false, fileType: "hwpx", error: err instanceof Error ? err.message : "HWPX \uD30C\uC2F1 \uC2E4\uD328", code: _chunkJ3FHRU5Tcjs.classifyError.call(void 0, err) };
  }
}
async function parseHwp(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings, images } = parseHwp5Document(Buffer.from(buffer), options);
    if (isDistributionSentinel(markdown) && isComFallbackAvailable() && _optionalChain([options, 'optionalAccess', _89 => _89.filePath])) {
      try {
        const { pages, pageCount, warnings: comWarns } = extractTextViaCom(options.filePath);
        if (pages.some((p) => p && p.trim().length > 0)) {
          const com = comResultToParseResult(pages, pageCount, comWarns);
          return {
            success: true,
            fileType: "hwp",
            markdown: com.markdown,
            blocks: com.blocks,
            metadata: com.metadata,
            warnings: com.warnings
          };
        }
      } catch (e33) {
      }
    }
    return { success: true, fileType: "hwp", markdown, blocks, metadata, outline, warnings, images: _optionalChain([images, 'optionalAccess', _90 => _90.length]) ? images : void 0 };
  } catch (err) {
    return { success: false, fileType: "hwp", error: err instanceof Error ? err.message : "HWP \uD30C\uC2F1 \uC2E4\uD328", code: _chunkJ3FHRU5Tcjs.classifyError.call(void 0, err) };
  }
}
async function parsePdf(buffer, options) {
  let parsePdfDocument;
  try {
    const mod = await Promise.resolve().then(() => _interopRequireWildcard(require("./parser-SWI3CIGV.cjs")));
    parsePdfDocument = mod.parsePdfDocument;
  } catch (e34) {
    return {
      success: false,
      fileType: "pdf",
      error: "PDF \uD30C\uC2F1\uC5D0 pdfjs-dist\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uC124\uCE58: npm install pdfjs-dist",
      code: "MISSING_DEPENDENCY"
    };
  }
  try {
    const { markdown, blocks, metadata, outline, warnings, isImageBased } = await parsePdfDocument(buffer, options);
    return { success: true, fileType: "pdf", markdown, blocks, metadata, outline, warnings, isImageBased };
  } catch (err) {
    const isImageBased = err instanceof Error && "isImageBased" in err ? true : void 0;
    return { success: false, fileType: "pdf", error: err instanceof Error ? err.message : "PDF \uD30C\uC2F1 \uC2E4\uD328", code: _chunkJ3FHRU5Tcjs.classifyError.call(void 0, err), isImageBased };
  }
}
async function parseXlsx(buffer, options) {
  try {
    const { markdown, blocks, metadata, warnings } = await parseXlsxDocument(buffer, options);
    return { success: true, fileType: "xlsx", markdown, blocks, metadata, warnings };
  } catch (err) {
    return { success: false, fileType: "xlsx", error: err instanceof Error ? err.message : "XLSX \uD30C\uC2F1 \uC2E4\uD328", code: _chunkJ3FHRU5Tcjs.classifyError.call(void 0, err) };
  }
}
async function parseDocx(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings, images } = await parseDocxDocument(buffer, options);
    return { success: true, fileType: "docx", markdown, blocks, metadata, outline, warnings, images: _optionalChain([images, 'optionalAccess', _91 => _91.length]) ? images : void 0 };
  } catch (err) {
    return { success: false, fileType: "docx", error: err instanceof Error ? err.message : "DOCX \uD30C\uC2F1 \uC2E4\uD328", code: _chunkJ3FHRU5Tcjs.classifyError.call(void 0, err) };
  }
}
async function parseHwpml(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings } = parseHwpmlDocument(buffer, options);
    return { success: true, fileType: "hwpml", markdown, blocks, metadata, outline, warnings };
  } catch (err) {
    return { success: false, fileType: "hwpml", error: err instanceof Error ? err.message : "HWPML \uD30C\uC2F1 \uC2E4\uD328", code: _chunkJ3FHRU5Tcjs.classifyError.call(void 0, err) };
  }
}
async function fillForm(input, values, outputFormat = "markdown") {
  let buffer;
  if (typeof input === "string") {
    const buf = await _promises.readFile.call(void 0, input);
    buffer = _chunkJ3FHRU5Tcjs.toArrayBuffer.call(void 0, buf);
  } else if (Buffer.isBuffer(input)) {
    buffer = _chunkJ3FHRU5Tcjs.toArrayBuffer.call(void 0, input);
  } else {
    buffer = input;
  }
  if (outputFormat === "hwpx-preserve") {
    const format = detectFormat(buffer);
    if (format === "hwpx") {
      const zipFormat = await detectZipFormat(buffer);
      if (zipFormat !== "hwpx") {
        throw new Error(`hwpx-preserve \uD3EC\uB9F7\uC740 HWPX \uC785\uB825\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4 (\uAC10\uC9C0\uB41C \uD3EC\uB9F7: ${zipFormat})`);
      }
    } else {
      throw new Error(`hwpx-preserve \uD3EC\uB9F7\uC740 HWPX \uC785\uB825\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4 (\uAC10\uC9C0\uB41C \uD3EC\uB9F7: ${format})`);
    }
    const hwpxResult = await fillHwpx(buffer, values);
    return {
      output: hwpxResult.buffer,
      format: "hwpx-preserve",
      fill: { filled: hwpxResult.filled, unmatched: hwpxResult.unmatched }
    };
  }
  const parsed = await parse(buffer);
  if (!parsed.success) {
    throw new Error(`\uC11C\uC2DD \uD30C\uC2F1 \uC2E4\uD328: ${parsed.error}`);
  }
  const fill = fillFormFields(parsed.blocks, values);
  const markdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown.call(void 0, fill.blocks);
  if (outputFormat === "hwpx") {
    const hwpxBuffer = await markdownToHwpx(markdown);
    return { output: hwpxBuffer, format: "hwpx", fill };
  }
  return { output: markdown, format: "markdown", fill };
}
























exports.VERSION = _chunkJ3FHRU5Tcjs.VERSION; exports.blocksToMarkdown = _chunkJ3FHRU5Tcjs.blocksToMarkdown; exports.compare = compare; exports.detectFormat = detectFormat; exports.detectZipFormat = detectZipFormat; exports.diffBlocks = diffBlocks; exports.extractFormFields = extractFormFields; exports.fillForm = fillForm; exports.fillFormFields = fillFormFields; exports.fillHwpx = fillHwpx; exports.isHwpxFile = isHwpxFile; exports.isLabelCell = isLabelCell; exports.isOldHwpFile = isOldHwpFile; exports.isPdfFile = isPdfFile; exports.isZipFile = isZipFile; exports.markdownToHwpx = markdownToHwpx; exports.parse = parse; exports.parseDocx = parseDocx; exports.parseHwp = parseHwp; exports.parseHwpml = parseHwpml; exports.parseHwpx = parseHwpx; exports.parsePdf = parsePdf; exports.parseXlsx = parseXlsx;
//# sourceMappingURL=index.cjs.map