import { useEffect, useRef, useState } from 'react';
import init, { HwpDocument } from '@rhwp/core';
import { renderAsync as renderDocxAsync } from 'docx-preview';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'pdfjs-dist/web/pdf_viewer.css';
import DOMPurify from 'dompurify';
import type { ErrorItem } from '../types';
import './InlineDocView.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// HWP SVG 는 사용자 업로드 파일에서 생성되므로 신뢰할 수 없는 소스로 취급한다.
// SVG 본연의 그래픽 요소는 보존하되 스크립트/외부참조는 차단한다.
function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  'SW-01': '#e74c3c', 'SW-02': '#e67e22', 'SW-03': '#d4ac0d',
  'SW-04': '#27ae60', 'SW-05': '#16a085', 'SW-06': '#2980b9',
  'SW-07': '#8e44ad', 'SW-08': '#c0392b', 'SW-09': '#d35400',
  'SW-10': '#6d4c41', 'SW-11': '#546e7a', 'SW-12': '#388e3c',
};

let ctx: CanvasRenderingContext2D | null = null;
let lastFont = '';
// @ts-ignore
window.measureTextWidth = globalThis.measureTextWidth = (font: string, text: string) => {
  if (!ctx) {
    const canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  }
  if (ctx) {
    if (font !== lastFont) {
      ctx.font = font;
      lastFont = font;
    }
    return ctx.measureText(text).width;
  }
  return 0;
};

type RenderMode = 'idle' | 'hwp' | 'docx' | 'pdf';

interface Props {
  file?: File | null;
  errors?: ErrorItem[];
  activeId?: number | null;
  onSelect?: (id: number) => void;
  onSortedErrors?: (sortedErrors: ErrorItem[]) => void;
}

function detectMode(file: File): RenderMode {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'hwp' || ext === 'hwpx') return 'hwp';
  if (ext === 'docx') return 'docx';
  if (ext === 'pdf') return 'pdf';
  return 'idle';
}

/**
 * SVG 내 tspan/text 노드를 순회해 오류 텍스트를 찾아 fill 색상 변경 + 클릭 핸들러 부착.
 * HWP SVG는 글자 단위 tspan이 많으므로 문자 배열을 조합해 검색한다.
 */
function applySvgHighlights(
  container: HTMLElement,
  errors: ErrorItem[],
  onSelectRef: { current: ((id: number) => void) | undefined }
): Map<number, number> {
  const positionMap = new Map<number, number>(); // errorId → 문서 내 위치 인덱스

  // 기존 하이라이트 원복
  container.querySelectorAll<Element>('[data-error-id]').forEach(el => {
    const orig = el.getAttribute('data-original-fill');
    if (orig !== null) el.setAttribute('fill', orig);
    el.removeAttribute('data-error-id');
    el.removeAttribute('data-original-fill');
    el.removeAttribute('data-active');
    (el as SVGElement).style.cursor = '';
    (el as SVGElement).style.stroke = '';
    (el as SVGElement).style.strokeWidth = '';
    (el as SVGElement).style.paintOrder = '';
  });

  // tspan/text 문자 수집은 한 번만
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const tag = node.parentElement?.tagName.toLowerCase();
      if (tag === 'tspan') return NodeFilter.FILTER_ACCEPT;
      if (tag === 'text' && !node.parentElement?.querySelector('tspan'))
        return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    },
  });

  const chars: { char: string; el: Element }[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    for (const char of node.textContent ?? '') {
      chars.push({ char, el: node.parentElement! });
    }
  }

  // NFC 정규화된 전체 텍스트 (공백 포함 / 공백 제외 두 가지)
  const fullText = chars.map(c => c.char).join('').normalize('NFC');
  const nonWsChars = chars.filter(c => !/\s/.test(c.char));
  const fullTextNoWs = nonWsChars.map(c => c.char).join('').normalize('NFC');

  // 동일 원문이 여러 오류에 등장할 때 각각 고유한 문서 위치를 매핑하기 위해
  // 이미 사용된 구간(usedRanges)을 추적한다.
  const usedRanges: { start: number; end: number }[] = [];
  const usedRangesNoWs: { start: number; end: number }[] = [];

  function findNextIndex(haystack: string, needle: string, used: { start: number; end: number }[]): number {
    let from = 0;
    while (true) {
      const idx = haystack.indexOf(needle, from);
      if (idx === -1) return -1;
      const end = idx + needle.length;
      // 이미 사용된 구간과 겹치는지 확인
      const overlaps = used.some(r => idx < r.end && end > r.start);
      if (!overlaps) return idx;
      from = idx + 1;
    }
  }

  for (const err of errors) {
    const color = CATEGORY_COLORS[err.category] ?? '#888';
    const normOrig = err.original.normalize('NFC');

    // 1차: 공백 포함 정확 매칭 (이미 사용된 위치는 건너뜀)
    let matchChars: { char: string; el: Element }[];
    const exactIdx = findNextIndex(fullText, normOrig, usedRanges);
    if (exactIdx !== -1) {
      matchChars = chars.slice(exactIdx, exactIdx + normOrig.length);
      positionMap.set(err.id, exactIdx);
      usedRanges.push({ start: exactIdx, end: exactIdx + normOrig.length });
    } else {
      // 2차 폴백: HWP SVG에서 공백이 좌표 오프셋으로만 표현되는 경우
      const normOrigNoWs = normOrig.replace(/\s+/g, '');
      if (!normOrigNoWs) continue;
      const wsIdx = findNextIndex(fullTextNoWs, normOrigNoWs, usedRangesNoWs);
      if (wsIdx === -1) continue;
      matchChars = nonWsChars.slice(wsIdx, wsIdx + normOrigNoWs.length);
      positionMap.set(err.id, wsIdx);
      usedRangesNoWs.push({ start: wsIdx, end: wsIdx + normOrigNoWs.length });
    }

    const matched = new Set<Element>(matchChars.map(c => c.el));
    matched.forEach(el => {
      if (!el.hasAttribute('data-error-id')) {
        el.setAttribute('data-original-fill', el.getAttribute('fill') ?? '');
      }
      el.setAttribute('data-error-id', String(err.id));
      el.setAttribute('fill', color);
      (el as SVGElement).style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectRef.current?.(err.id);
      });
    });
  }

  return positionMap;
}

/**
 * 컨테이너 내 SVG tspan/text 노드를 글자 단위로 모아 search 와 매칭되는 element 들을 반환.
 * applySvgHighlights 의 매칭 로직과 동일한 방식 (NFC 정규화 + 공백 무시 폴백).
 */
function findSvgElementsByText(container: HTMLElement, search: string): Element[] {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const tag = node.parentElement?.tagName.toLowerCase();
      if (tag === 'tspan') return NodeFilter.FILTER_ACCEPT;
      if (tag === 'text' && !node.parentElement?.querySelector('tspan'))
        return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_REJECT;
    },
  });
  const chars: { char: string; el: Element }[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    for (const ch of node.textContent ?? '') {
      chars.push({ char: ch, el: node.parentElement! });
    }
  }
  const fullText = chars.map(c => c.char).join('').normalize('NFC');
  const norm = search.normalize('NFC');
  const idx = fullText.indexOf(norm);
  if (idx !== -1) {
    return Array.from(new Set(chars.slice(idx, idx + norm.length).map(c => c.el)));
  }
  // 공백 제거 폴백
  const nonWs = chars.filter(c => !/\s/.test(c.char));
  const fullNoWs = nonWs.map(c => c.char).join('').normalize('NFC');
  const normNoWs = norm.replace(/\s+/g, '');
  if (!normNoWs) return [];
  const idx2 = fullNoWs.indexOf(normNoWs);
  if (idx2 === -1) return [];
  return Array.from(new Set(nonWs.slice(idx2, idx2 + normNoWs.length).map(c => c.el)));
}

/**
 * HTML 모드(DOCX/PDF) 하이라이트.
 * 텍스트 노드를 글자 단위로 모아 매칭한 뒤, 매칭된 구간을 wrapper span 으로 감싼다.
 * - DOCX: 본문 텍스트가 보이므로 색상/밑줄로 표시
 * - PDF: pdfjs textLayer 의 span 들은 색이 transparent 이므로 background 만 표시
 */
function applyHtmlHighlights(
  container: HTMLElement,
  errors: ErrorItem[],
  onSelectRef: { current: ((id: number) => void) | undefined },
  mode: 'docx' | 'pdf',
): Map<number, number> {
  const positionMap = new Map<number, number>(); // errorId → 문서 내 위치 인덱스

  // 기존 wrapper unwrap (자식들을 wrapper 자리로 옮긴 뒤 wrapper 제거)
  container.querySelectorAll<HTMLElement>('span.urimal-error').forEach(span => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
  });
  container.normalize();

  // 텍스트 노드 수집 (script/style 등은 제외)
  type CharRef = { char: string; node: Text; offset: number };
  const chars: CharRef[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'noscript') return NodeFilter.FILTER_REJECT;
      const text = node.textContent ?? '';
      if (text.length === 0) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Text | null;
  while ((n = walker.nextNode() as Text | null)) {
    const text = n.textContent ?? '';
    for (let i = 0; i < text.length; i++) {
      chars.push({ char: text[i], node: n, offset: i });
    }
  }

  const fullText = chars.map(c => c.char).join('').normalize('NFC');
  const nonWs = chars.filter(c => !/\s/.test(c.char));
  const fullNoWs = nonWs.map(c => c.char).join('').normalize('NFC');

  type R = { node: Text; start: number; end: number; errorId: number; color: string };
  const allRanges: R[] = [];

  // 동일 원문이 여러 오류에 등장할 때 각각 고유한 문서 위치를 매핑하기 위해
  // 이미 사용된 구간(usedRanges)을 추적한다.
  const usedRanges: { start: number; end: number }[] = [];
  const usedRangesNoWs: { start: number; end: number }[] = [];

  function findNextIndex(haystack: string, needle: string, used: { start: number; end: number }[]): number {
    let from = 0;
    while (true) {
      const idx = haystack.indexOf(needle, from);
      if (idx === -1) return -1;
      const end = idx + needle.length;
      const overlaps = used.some(r => idx < r.end && end > r.start);
      if (!overlaps) return idx;
      from = idx + 1;
    }
  }

  for (const err of errors) {
    const color = CATEGORY_COLORS[err.category] ?? '#888';
    const normOrig = err.original.normalize('NFC');
    let matched: CharRef[];
    const idx = findNextIndex(fullText, normOrig, usedRanges);
    if (idx !== -1) {
      matched = chars.slice(idx, idx + normOrig.length);
      positionMap.set(err.id, idx);
      usedRanges.push({ start: idx, end: idx + normOrig.length });
    } else {
      const noWs = normOrig.replace(/\s+/g, '');
      if (!noWs) continue;
      const idx2 = findNextIndex(fullNoWs, noWs, usedRangesNoWs);
      if (idx2 === -1) continue;
      matched = nonWs.slice(idx2, idx2 + noWs.length);
      positionMap.set(err.id, idx2);
      usedRangesNoWs.push({ start: idx2, end: idx2 + noWs.length });
    }
    // 같은 text node 안에서 연속된 offset 구간으로 묶기
    let i = 0;
    while (i < matched.length) {
      const startNode = matched[i].node;
      const startOffset = matched[i].offset;
      let j = i;
      while (
        j + 1 < matched.length &&
        matched[j + 1].node === startNode &&
        matched[j + 1].offset === matched[j].offset + 1
      ) {
        j++;
      }
      allRanges.push({
        node: startNode,
        start: startOffset,
        end: matched[j].offset + 1,
        errorId: err.id,
        color,
      });
      i = j + 1;
    }
  }

  // text node 별로 그룹핑하여 한 번에 split
  const byNode = new Map<Text, R[]>();
  for (const r of allRanges) {
    let arr = byNode.get(r.node);
    if (!arr) { arr = []; byNode.set(r.node, arr); }
    arr.push(r);
  }

  for (const [node, ranges] of byNode) {
    if (!node.parentNode) continue;
    ranges.sort((a, b) => a.start - b.start || a.end - b.end);
    // overlap 제거: 먼저 등장한 range 우선
    const cleaned: R[] = [];
    let lastEnd = -1;
    for (const r of ranges) {
      if (r.start < lastEnd) continue;
      cleaned.push(r);
      lastEnd = r.end;
    }
    const text = node.textContent ?? '';
    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const r of cleaned) {
      if (r.start > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, r.start)));
      }
      const span = document.createElement('span');
      span.className = `urimal-error mode-${mode}`;
      span.setAttribute('data-error-id', String(r.errorId));
      span.style.setProperty('--err-color', r.color);
      span.textContent = text.slice(r.start, r.end);
      const errorId = r.errorId;
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectRef.current?.(errorId);
      });
      frag.appendChild(span);
      cursor = r.end;
    }
    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }
    node.parentNode.replaceChild(frag, node);
  }

  return positionMap;
}

/**
 * PDF 페이지를 lazy 렌더링한다.
 * - 모든 페이지는 우선 정확한 크기의 placeholder 로 만들어 스크롤 길이를 확정
 * - 화면에 들어오는 페이지만 IntersectionObserver 가 canvas + textLayer 를 채움
 * - 페이지가 채워질 때마다 onPageRendered 가 호출되어 호스트에서 하이라이트 재적용
 *
 * 100+ 페이지 문서에서 모든 canvas 를 미리 만들면 ~수 GB 메모리 폭증으로 탭이 멈춰서
 * 반드시 lazy 렌더가 필요하다.
 */
async function renderPdfPages(
  buffer: ArrayBuffer,
  host: HTMLElement,
  scrollRoot: Element | null,
  isCanceled: () => boolean,
  onPageRendered: (pageDiv: HTMLElement, pageNum: number) => void,
  registerCleanup: (fn: () => void) => void,
  onPageTexts: (texts: { pageNum: number; text: string }[]) => void,
): Promise<number> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  if (isCanceled()) { pdf.destroy(); return 0; }

  const totalPages = pdf.numPages;

  // host 폭에 맞춰 scale 산정 (페이지마다 동일 scale 적용; 첫 페이지 기준)
  const firstPage = await pdf.getPage(1);
  const baseViewport = firstPage.getViewport({ scale: 1 });
  const containerWidth = Math.min(host.clientWidth || 800, 1200);
  const scale = Math.max(1.0, Math.min(2.5, (containerWidth - 4) / baseViewport.width));
  firstPage.cleanup();

  const baseW = baseViewport.width * scale;
  const baseH = baseViewport.height * scale;
  const dpr = Math.min(3, window.devicePixelRatio || 1);

  // 모든 페이지의 placeholder 생성 (스크롤 길이 확정)
  const pageDivs: HTMLDivElement[] = [];
  for (let i = 1; i <= totalPages; i++) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'pdf-page pdf-page-pending';
    pageDiv.setAttribute('data-page-num', String(i));
    pageDiv.style.position = 'relative';
    pageDiv.style.width = `${baseW}px`;
    pageDiv.style.height = `${baseH}px`;
    pageDiv.style.background = 'white';
    pageDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    pageDiv.style.setProperty('--scale-factor', String(scale));
    pageDiv.style.setProperty('--total-scale-factor', String(scale));
    host.appendChild(pageDiv);
    pageDivs.push(pageDiv);
  }

  if (isCanceled()) { pdf.destroy(); return 0; }

  // 모든 페이지의 텍스트를 미리 추출 (canvas 렌더 없이 가벼움)
  // 이를 통해 오류가 어느 페이지에 있는지 DOM 렌더 전에 알 수 있다.
  const pageTexts: { pageNum: number; text: string }[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (isCanceled()) { pdf.destroy(); return 0; }
    try {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      const text = tc.items.map((item: any) => item.str ?? '').join('');
      pageTexts.push({ pageNum: i, text });
      pg.cleanup();
    } catch {
      pageTexts.push({ pageNum: i, text: '' });
    }
  }
  if (!isCanceled()) onPageTexts(pageTexts);

  const renderedOrPending = new Set<number>();

  async function renderPageOnDemand(pageNum: number) {
    if (renderedOrPending.has(pageNum)) return;
    renderedOrPending.add(pageNum);
    if (isCanceled()) return;
    const pageDiv = pageDivs[pageNum - 1];
    if (!pageDiv) return;

    let page: Awaited<ReturnType<typeof pdf.getPage>> | null = null;
    try {
      page = await pdf.getPage(pageNum);
      if (isCanceled()) return;
      const viewport = page.getViewport({ scale });

      // 실제 viewport 로 placeholder 크기 정정 (페이지마다 size 가 다른 PDF 대비)
      pageDiv.style.width = `${viewport.width}px`;
      pageDiv.style.height = `${viewport.height}px`;

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.style.display = 'block';
      pageDiv.appendChild(canvas);

      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      textLayerDiv.style.width = `${viewport.width}px`;
      textLayerDiv.style.height = `${viewport.height}px`;
      pageDiv.appendChild(textLayerDiv);

      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;
      const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;
      await page.render({
        canvasContext: canvasCtx,
        viewport,
        ...(transform ? { transform } : {}),
      } as Parameters<typeof page.render>[0]).promise;
      if (isCanceled()) return;

      const textContent = await page.getTextContent();
      if (isCanceled()) return;
      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport,
      });
      await textLayer.render();
      if (isCanceled()) return;

      pageDiv.classList.remove('pdf-page-pending');
      onPageRendered(pageDiv, pageNum);
    } catch (err) {
      console.warn(`[PDF] 페이지 ${pageNum} 렌더 실패`, err);
      // 재시도 가능하도록 표시 해제
      renderedOrPending.delete(pageNum);
    } finally {
      page?.cleanup();
    }
  }

  // 화면에 들어오는 페이지만 렌더 (스크롤 방향 prefetch 위해 rootMargin 1 화면)
  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const num = Number((e.target as HTMLElement).dataset.pageNum);
        if (num) renderPageOnDemand(num);
      }
    },
    { root: scrollRoot, rootMargin: '1000px 0px' }
  );
  pageDivs.forEach((d) => obs.observe(d));

  registerCleanup(() => {
    obs.disconnect();
    pdf.destroy();
  });

  return totalPages;
}

/**
 * positionMap(오류 ID → 문서 내 텍스트 위치)을 이용해
 * 오류 목록을 문서 등장 순서대로 정렬하여 콜백으로 전달한다.
 */
function emitSortedErrors(
  errors: ErrorItem[],
  positionMap: Map<number, number>,
  callbackRef: { current: ((sorted: ErrorItem[]) => void) | undefined },
) {
  if (!callbackRef.current || errors.length === 0) return;

  const sorted = [...errors].sort((a, b) => {
    const posA = positionMap.get(a.id) ?? Infinity;
    const posB = positionMap.get(b.id) ?? Infinity;
    return posA - posB;
  });

  callbackRef.current(sorted);
}

export default function InlineDocView({ file, errors = [], activeId, onSelect, onSortedErrors }: Props) {
  const [isInit, setIsInit] = useState(false);
  const [renderMode, setRenderMode] = useState<RenderMode>('idle');
  const [pageSvgs, setPageSvgs] = useState<string[]>([]);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const externalHostRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onSortedErrorsRef = useRef(onSortedErrors);
  onSortedErrorsRef.current = onSortedErrors;

  // PDF lazy 렌더에서 비동기 콜백이 항상 최신 errors 를 보도록 유지
  const errorsRef = useRef<ErrorItem[]>(errors);
  errorsRef.current = errors;

  // 비동기 렌더 취소용 카운터
  const renderTokenRef = useRef(0);

  // PDF lazy 렌더 cleanup (IntersectionObserver disconnect + pdf.destroy)
  const pdfCleanupRef = useRef<(() => void) | null>(null);

  // PDF 페이지별 하이라이트 결과를 누적해 두는 positionMap (pageNum * BASE + 페이지 내 오프셋)
  const pdfPositionMapRef = useRef<Map<number, number>>(new Map());
  const PDF_PAGE_OFFSET = 10_000_000;

  // PDF 페이지가 렌더될 때마다 ErrorPanel 정렬을 갱신 — 다발 호출 방지용 debounce
  const pdfEmitTimerRef = useRef<number | null>(null);
  // PDF 각 페이지의 텍스트를 미리 추출해 오류가 어느 페이지에 있는지 찾는 데 사용
  const pdfPageTextsRef = useRef<{ pageNum: number; text: string }[]>([]);
  // lazy 렌더 안 된 페이지의 오류를 클릭했을 때, 렌더 완료 후 재스크롤하기 위한 대기 ID
  const pendingActiveScrollRef = useRef<number | null>(null);
  const zoomLevelRef = useRef(zoomLevel);
  zoomLevelRef.current = zoomLevel;
  const schedulePdfEmit = () => {
    if (pdfEmitTimerRef.current != null) return;
    pdfEmitTimerRef.current = window.setTimeout(() => {
      pdfEmitTimerRef.current = null;
      emitSortedErrors(errorsRef.current, pdfPositionMapRef.current, onSortedErrorsRef);
    }, 100);
  };

  useEffect(() => {
    init({ module_or_path: '/rhwp_bg.wasm' })
      .then(() => setIsInit(true))
      .catch(() => setRenderError('WASM 모듈을 불러오는 데 실패했습니다.'));
  }, []);

  useEffect(() => {
    if (!file) return;
    const mode = detectMode(file);
    setRenderMode(mode);
    setRenderError(null);
    setPageSvgs([]);
    setPageImages([]);
    setTotalPages(0);
    setCurrentPage(1);
    setZoomLevel(1);
    if (externalHostRef.current) externalHostRef.current.innerHTML = '';

    // 이전 effect 의 cleanup 이 이미 PDF observer 를 끊고 pdf.destroy 를 호출했지만,
    // 새 파일에 대비해 누적 positionMap 만 초기화한다.
    pdfPositionMapRef.current = new Map();
    pdfPageTextsRef.current = [];
    pendingActiveScrollRef.current = null;

    if (mode === 'idle') {
      setRenderError('지원하지 않는 파일 형식입니다.');
      return;
    }
    if (mode === 'hwp' && !isInit) return;

    const token = ++renderTokenRef.current;
    const isCanceled = () => token !== renderTokenRef.current;
    setLoading(true);

    file.arrayBuffer().then(async (buffer) => {
      if (isCanceled()) return;
      try {
        if (mode === 'hwp') {
          const doc = new HwpDocument(new Uint8Array(buffer));
          const total = doc.pageCount();
          const svgs: string[] = [];
          for (let i = 0; i < total; i++) svgs.push(doc.renderPageSvg(i));
          if (isCanceled()) return;
          if (svgs.some(s => s.trim().length > 0)) {
            setPageSvgs(svgs);
          } else {
            const images: string[] = [];
            for (let i = 0; i < total; i++) {
              const canvas = document.createElement('canvas');
              doc.renderPageToCanvas(i, canvas, 2);
              images.push(canvas.toDataURL('image/png'));
            }
            if (isCanceled()) return;
            setPageImages(images);
          }
        } else if (mode === 'docx') {
          const host = externalHostRef.current;
          if (!host) return;
          await renderDocxAsync(new Blob([buffer]), host, undefined, {
            inWrapper: true,
            ignoreLastRenderedPageBreak: false,
            experimental: false,
            useBase64URL: true,
          });
          if (isCanceled()) host.innerHTML = '';
        } else if (mode === 'pdf') {
          const host = externalHostRef.current;
          if (!host) return;
          const onPageRendered = (pageDiv: HTMLElement, pageNum: number) => {
            // 새 파일 로드 직후 stale 콜백 무시
            if (isCanceled()) return;
            const pagePositions = applyHtmlHighlights(
              pageDiv,
              errorsRef.current,
              onSelectRef,
              'pdf',
            );
            const base = pageNum * PDF_PAGE_OFFSET;
            for (const [errId, localPos] of pagePositions) {
              if (!pdfPositionMapRef.current.has(errId)) {
                pdfPositionMapRef.current.set(errId, base + localPos);
              }
            }
            schedulePdfEmit();

            // 대기 중인 스크롤이 이 페이지에 해당하면 실행
            const pendingId = pendingActiveScrollRef.current;
            if (pendingId != null) {
              const el = pageDiv.querySelector<HTMLElement>(`[data-error-id="${pendingId}"]`);
              if (el) {
                pendingActiveScrollRef.current = null;
                el.classList.add('active');
                requestAnimationFrame(() => {
                  const body = bodyRef.current;
                  if (!body) return;
                  const zoom = zoomLevelRef.current;
                  const elRect = el.getBoundingClientRect();
                  const cRect = body.getBoundingClientRect();
                  const scrollOffset = (elRect.top - cRect.top) / zoom;
                  const target = body.scrollTop + scrollOffset - body.clientHeight / 2 + elRect.height / (2 * zoom);
                  body.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
                });
              }
            }
          };
          const registerCleanup = (fn: () => void) => {
            if (isCanceled()) {
              fn();
              return;
            }
            pdfCleanupRef.current = fn;
          };
          const pages = await renderPdfPages(
            buffer,
            host,
            bodyRef.current,
            isCanceled,
            onPageRendered,
            registerCleanup,
            (texts) => { pdfPageTextsRef.current = texts; },
          );
          if (isCanceled()) host.innerHTML = '';
          else setTotalPages(pages);
        }
      } catch (err) {
        if (isCanceled()) return;
        console.error('[InlineDocView] 렌더 실패', err);
        setRenderError(
          mode === 'hwp' ? 'HWP 문서를 렌더링하는 데 실패했습니다.'
          : mode === 'docx' ? 'DOCX 문서를 렌더링하는 데 실패했습니다.'
          : 'PDF 문서를 렌더링하는 데 실패했습니다.'
        );
      }
    }).catch(() => {
      if (isCanceled()) return;
      setRenderError('파일을 읽는 데 실패했습니다.');
    }).finally(() => {
      if (!isCanceled()) setLoading(false);
    });

    return () => {
      renderTokenRef.current++;
      if (pdfCleanupRef.current) {
        pdfCleanupRef.current();
        pdfCleanupRef.current = null;
      }
      if (pdfEmitTimerRef.current != null) {
        clearTimeout(pdfEmitTimerRef.current);
        pdfEmitTimerRef.current = null;
      }
    };
  }, [file, isInit]);

  // SVG 가 DOM 에 들어온 뒤 오류 하이라이트 적용 (HWP)
  useEffect(() => {
    if (renderMode !== 'hwp') return;
    if (!bodyRef.current || pageSvgs.length === 0) return;
    const posMap = applySvgHighlights(bodyRef.current, errors, onSelectRef);
    emitSortedErrors(errors, posMap, onSortedErrorsRef);
  }, [pageSvgs, errors, renderMode]);

  // DOCX 렌더 완료 후 하이라이트 일괄 적용 (DOCX 는 한꺼번에 그려지므로 단발 처리로 충분).
  // PDF 는 페이지가 lazy 로 채워지므로 renderPdfPages 의 onPageRendered 에서 페이지별로 처리.
  useEffect(() => {
    if (renderMode !== 'docx') return;
    if (loading) return;
    const host = externalHostRef.current;
    if (!host) return;
    if (host.children.length === 0) return;
    const posMap = applyHtmlHighlights(host, errors, onSelectRef, 'docx');
    emitSortedErrors(errors, posMap, onSortedErrorsRef);
  }, [loading, errors, renderMode]);

  // PDF: errors 바뀌면 이미 렌더된 페이지에 다시 하이라이트 적용 (재분석/오류목록 변경 대비).
  useEffect(() => {
    if (renderMode !== 'pdf') return;
    const host = externalHostRef.current;
    if (!host) return;
    const renderedPages = host.querySelectorAll<HTMLElement>('.pdf-page:not(.pdf-page-pending)');
    if (renderedPages.length === 0) return;
    pdfPositionMapRef.current = new Map();
    renderedPages.forEach((pageDiv) => {
      const pageNum = Number(pageDiv.dataset.pageNum) || 0;
      const pagePositions = applyHtmlHighlights(pageDiv, errors, onSelectRef, 'pdf');
      const base = pageNum * PDF_PAGE_OFFSET;
      for (const [errId, localPos] of pagePositions) {
        if (!pdfPositionMapRef.current.has(errId)) {
          pdfPositionMapRef.current.set(errId, base + localPos);
        }
      }
    });
    schedulePdfEmit();
  }, [errors, renderMode]);


  // activeId 변경 시 해당 요소 강조 + 스크롤
  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;

    // 이전 active 원복
    container.querySelectorAll<Element>('[data-active-bg]').forEach(el => el.remove());
    container.querySelectorAll<Element>('[data-active]').forEach(el => {
      el.removeAttribute('data-active');
    });
    container.querySelectorAll<HTMLElement>('span.urimal-error.active').forEach(el => {
      el.classList.remove('active');
    });
    pendingActiveScrollRef.current = null;

    if (activeId == null) return;

    let targetEls: Element[] = [];
    if (renderMode === 'hwp') {
      targetEls = Array.from(
        container.querySelectorAll<Element>(`[data-error-id="${activeId}"]`)
      );
      // 폴백: 매칭 실패 시 원문 텍스트 직접 검색
      if (targetEls.length === 0) {
        const err = errors.find(e => e.id === activeId);
        if (err) targetEls = findSvgElementsByText(container, err.original);
      }
    } else {
      targetEls = Array.from(
        container.querySelectorAll<HTMLElement>(`span.urimal-error[data-error-id="${activeId}"]`)
      );
    }

    // PDF 모드에서 요소를 못 찾으면: 아직 렌더 안 된 페이지에 있을 수 있음
    if (targetEls.length === 0 && renderMode === 'pdf') {
      const err = errors.find(e => e.id === activeId);
      if (err) {
        // pdfPageTextsRef에서 해당 오류의 original이 있는 페이지를 찾기
        const normOrig = err.original.normalize('NFC');
        const normOrigNoWs = normOrig.replace(/\s+/g, '');
        let targetPageNum = -1;
        for (const { pageNum, text } of pdfPageTextsRef.current) {
          const normText = text.normalize('NFC');
          if (normText.includes(normOrig) || normText.replace(/\s+/g, '').includes(normOrigNoWs)) {
            targetPageNum = pageNum;
            break;
          }
        }
        if (targetPageNum > 0) {
          // 해당 페이지 placeholder로 스크롤 → IntersectionObserver가 렌더 트리거
          const host = externalHostRef.current;
          const pageDiv = host?.querySelector<HTMLElement>(`.pdf-page[data-page-num="${targetPageNum}"]`);
          if (pageDiv) {
            pendingActiveScrollRef.current = activeId;
            const zoom = zoomLevel;
            const pdRect = pageDiv.getBoundingClientRect();
            const cRect = container.getBoundingClientRect();
            const scrollOffset = (pdRect.top - cRect.top) / zoom;
            const target = container.scrollTop + scrollOffset - container.clientHeight / 3;
            container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
          }
        } else {
          console.warn('[InlineDocView] activeId', activeId, '에 해당하는 텍스트를 어떤 페이지에서도 찾지 못했습니다.');
        }
      }
      return;
    }

    if (targetEls.length === 0) {
      console.warn('[InlineDocView] activeId', activeId, '에 해당하는 요소를 찾지 못했습니다.');
      return;
    }

    if (renderMode === 'hwp') {
      // 각 매칭 요소 뒤에 빨간 반투명 배경 rect 삽입
      const SVG_NS = 'http://www.w3.org/2000/svg';
      targetEls.forEach(el => {
        el.setAttribute('data-active', '1');
        let textEl: Element | null = el;
        while (textEl && textEl.tagName.toLowerCase() !== 'text') {
          textEl = textEl.parentElement;
        }
        if (!textEl || !textEl.parentNode) return;
        let bbox: DOMRect;
        try {
          bbox = (el as SVGGraphicsElement).getBBox();
        } catch {
          return;
        }
        if (bbox.width === 0 || bbox.height === 0) return;
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', String(bbox.x - 1));
        rect.setAttribute('y', String(bbox.y));
        rect.setAttribute('width', String(bbox.width + 2));
        rect.setAttribute('height', String(bbox.height));
        rect.setAttribute('fill', 'rgba(231, 76, 60, 0.35)');
        rect.setAttribute('data-active-bg', '1');
        (rect as SVGElement).style.pointerEvents = 'none';
        textEl.parentNode.insertBefore(rect, textEl);
      });
    } else {
      targetEls.forEach(el => (el as HTMLElement).classList.add('active'));
    }

    const first = targetEls[0] as HTMLElement | SVGGraphicsElement;

    // PDF: zoom(scale)이 적용되어 있으므로 좌표 보정 필요
    const zoom = renderMode === 'pdf' ? zoomLevel : 1;

    // 스크롤은 3단계로 나눠 진행한다. 한 번의 scrollTo 만으로는 도중에 layout shift
    // (폰트/이미지 늦은 로드, content-visibility 전환, transform 변환 등) 가 일어나면
    // 타겟이 어긋나므로 단계별 재측정으로 누적 오차를 흡수한다.
    //
    //  1) scrollIntoView({block:'center', behavior:'auto'}):
    //     브라우저가 직접 layout 을 trigger 하면서 대상 요소를 화면에 일단 넣음.
    //     content-visibility 나 lazy 렌더가 있더라도 여기서 강제로 layout 됨.
    //  2) 다음 프레임에 좌표를 다시 측정해 컨테이너를 정확히 중앙으로 보정.
    //  3) 폰트/이미지 늦은 로드로 layout 이 또 흔들릴 수 있어 짧은 딜레이 후 한 번 더 보정.
    const computeTarget = (): number => {
      const elRect = first.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const scrollOffset = (elRect.top - cRect.top) / zoom;
      const elH = elRect.height / zoom;
      return Math.max(
        0,
        container.scrollTop + scrollOffset - container.clientHeight / 2 + elH / 2
      );
    };
    (first as Element).scrollIntoView({ block: 'center', behavior: 'auto' });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTo({ top: computeTarget(), behavior: 'smooth' });
        // 늦은 layout shift(폰트/이미지) 대비 한 번 더 보정. 동일 위치면 사실상 no-op.
        window.setTimeout(() => {
          container.scrollTo({ top: computeTarget(), behavior: 'smooth' });
        }, 350);
      });
    });
  }, [activeId, errors, renderMode, zoomLevel]);

  // PDF 현재 페이지 감지 (IntersectionObserver)
  useEffect(() => {
    if (renderMode !== 'pdf' || loading || totalPages === 0) return;
    const host = externalHostRef.current;
    const body = bodyRef.current;
    if (!host || !body) return;
    const pages = host.querySelectorAll<HTMLElement>('.pdf-page[data-page-num]');
    if (pages.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        let topPage = currentPage;
        let topY = Infinity;
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const rect = e.boundingClientRect;
            if (rect.top < topY) {
              topY = rect.top;
              topPage = Number((e.target as HTMLElement).dataset.pageNum) || 1;
            }
          }
        });
        setCurrentPage(topPage);
      },
      { root: body, threshold: 0.1 }
    );
    pages.forEach((p) => obs.observe(p));
    return () => obs.disconnect();
  }, [renderMode, loading, totalPages]);

  const handleZoomIn = () => setZoomLevel(z => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel(z => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleZoomReset = () => setZoomLevel(1);

  const isSvgMode = pageSvgs.length > 0;
  const headerLabel =
    renderMode === 'docx' ? '📄 DOCX 원본 문서 뷰어'
    : renderMode === 'pdf' ? '📄 PDF 원본 문서 뷰어'
    : '📄 HWP 원본 문서 뷰어';
  const headerHint =
    renderMode === 'hwp'
      ? (isSvgMode
          ? '(오류 텍스트를 클릭하면 상세 설명이 표시됩니다)'
          : '(읽기 전용 모드 - 클릭 상호작용은 우측 패널을 이용하세요)')
      : '(오류 텍스트를 클릭하면 상세 설명이 표시됩니다)';
  const isInteractive = renderMode === 'hwp' ? isSvgMode : true;

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <div className="inline-doc">
      <div className="inline-doc-header">
        <span>{headerLabel}</span>
        {renderMode === 'pdf' && totalPages > 0 && (
          <div className="pdf-toolbar">
            <span className="pdf-page-info">{currentPage} / {totalPages}쪽</span>
            <div className="pdf-zoom-controls">
              <button className="pdf-zoom-btn" onClick={handleZoomOut} title="축소">−</button>
              <button className="pdf-zoom-pct" onClick={handleZoomReset} title="원래 크기">{zoomPercent}%</button>
              <button className="pdf-zoom-btn" onClick={handleZoomIn} title="확대">+</button>
            </div>
          </div>
        )}
        <span
          className="inline-doc-hint"
          style={{ color: isInteractive ? '#2980b9' : '#e74c3c', marginLeft: '8px' }}
        >
          {headerHint}
        </span>
      </div>
      <div
        ref={bodyRef}
        className="inline-doc-body"
        style={{ backgroundColor: '#e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
      >
        {!file && <div style={{ color: '#666' }}>왼쪽 영역: 원본 파일이 전달되지 않았습니다.</div>}
        {loading && <div style={{ color: '#333' }}>문서를 렌더링하는 중입니다...</div>}
        {renderError && <div style={{ color: 'red', fontWeight: 'bold' }}>{renderError}</div>}

        {!loading && !renderError && pageSvgs.map((svg, idx) => (
          <div
            key={idx}
            className="hwp-page"
            style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
          />
        ))}

        {!loading && !renderError && pageImages.map((src, idx) => (
          <img
            key={idx}
            className="hwp-page-image"
            src={src}
            alt={`페이지 ${idx + 1}`}
            style={{ display: 'block', width: '100%', maxWidth: '800px', backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
          />
        ))}

        {/* DOCX/PDF imperative 렌더 호스트 */}
        <div
          ref={externalHostRef}
          className={`external-render-host mode-${renderMode}`}
          style={{
            display: renderMode === 'docx' || renderMode === 'pdf' ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${20 * zoomLevel}px`,
            width: '100%',
            maxWidth: renderMode === 'pdf' ? 'none' : '820px',
            transform: renderMode === 'pdf' ? `scale(${zoomLevel})` : undefined,
            transformOrigin: 'top center',
          }}
        />
      </div>
    </div>
  );
}
