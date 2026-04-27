import { useState, useEffect } from 'react';
import { TAXONOMY_DATA } from '../data/taxonomyData';
import type { TaxonomyCategory } from '../data/taxonomyData';
import './TaxonomyModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TaxonomyModal({ open, onClose }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  function toggleCategory(code: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function renderCategory(cat: TaxonomyCategory) {
    const isOpen = openCategories.has(cat.code);
    return (
      <div key={cat.code} className={`taxonomy-category ${isOpen ? 'open' : ''}`}>
        <button className="taxonomy-category-header" onClick={() => toggleCategory(cat.code)}>
          <span className="category-code">{cat.code}</span>
          <span className="category-title">{cat.title}</span>
          <span className="category-count">{cat.patterns.length}개 패턴</span>
          <span className="category-chevron">▼</span>
        </button>

        {isOpen && (
          <div className="taxonomy-category-content">
            <p className="category-definition">{cat.definition}</p>
            <table className="taxonomy-table">
              <thead>
                <tr>
                  <th>패턴ID</th>
                  <th>패턴명</th>
                  <th>심각도</th>
                  <th>예시</th>
                </tr>
              </thead>
              <tbody>
                {cat.patterns.map((p) => (
                  <tr key={p.id}>
                    <td className="col-id">{p.id}</td>
                    <td className="col-name">{p.name}</td>
                    <td className="col-severity">
                      <span className={`severity-badge ${p.severity.toLowerCase()}`}>
                        {p.severity}
                      </span>
                    </td>
                    <td className="col-example">{p.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="taxonomy-modal-overlay" onClick={onClose}>
      <div className="taxonomy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="taxonomy-modal-header">
          <div>
            <h2><span className="header-icon">📚</span> 윤문 기준표</h2>
            <p className="taxonomy-modal-subtitle">
              한덕연 선생님 「우리말 공부」 36개 항목 기반 · 14개 카테고리 · {TAXONOMY_DATA.reduce((sum, c) => sum + c.patterns.length, 0)}개 패턴
            </p>
          </div>
          <button className="taxonomy-close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="severity-legend">
          <div className="severity-legend-item">
            <span className="severity-badge s1">S1</span>
            <span>결정적 — 무조건 수정</span>
          </div>
          <div className="severity-legend-item">
            <span className="severity-badge s2">S2</span>
            <span>강함 — 반복 시 수정</span>
          </div>
          <div className="severity-legend-item">
            <span className="severity-badge s3">S3</span>
            <span>약함 — 수준 저하 시 수정</span>
          </div>
        </div>

        <div className="taxonomy-modal-body">
          {TAXONOMY_DATA.map(renderCategory)}
        </div>
      </div>
    </div>
  );
}
