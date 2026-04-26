import { useState, Suspense, lazy } from 'react';
import type { AppStep, AnalyzeResult, ProgressInfo } from './types';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import './App.css';

const ResultPage = lazy(() => import('./pages/ResultPage'));

export default function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  function handleProgress(info: ProgressInfo) {
    setProgress(info);
  }

  function handleResult(data: AnalyzeResult, uploadedFile: File) {
    setResult(data);
    setFile(uploadedFile);
    setStep('result');
  }

  function handleError(msg: string) {
    setError(msg);
    setStep('upload');
  }

  function handleLoading() {
    setError(null);
    setProgress(null);
    setStep('loading');
  }

  function handleReset() {
    setResult(null);
    setFile(null);
    setError(null);
    setProgress(null);
    setStep('upload');
  }

  return (
    <div className="app">
      {step === 'upload' && (
        <UploadPage
          onLoading={handleLoading}
          onProgress={handleProgress}
          onResult={handleResult}
          onError={handleError}
          errorMsg={error}
        />
      )}
      {step === 'loading' && <LoadingPage progress={progress} />}
      {step === 'result' && result && file && (
        <Suspense fallback={<LoadingPage />}>
          <ResultPage result={result} file={file} onReset={handleReset} />
        </Suspense>
      )}
    </div>
  );
}
