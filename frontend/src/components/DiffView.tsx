import './DiffView.css';

interface Props {
  original: string;
  rewritten: string;
}

export default function DiffView({ original, rewritten }: Props) {
  return (
    <div className="diff-view">
      <div className="diff-panel">
        <div className="diff-panel-header original">📄 원문</div>
        <pre className="diff-content">{original}</pre>
      </div>
      <div className="diff-panel">
        <div className="diff-panel-header rewritten">✏️ 윤문 결과</div>
        <pre className="diff-content">{rewritten}</pre>
      </div>
    </div>
  );
}
