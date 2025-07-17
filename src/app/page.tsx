"use client";
import { useState, useRef } from "react";
import InputForm from "../components/input-form";
import ResultDisplay from "../components/result-display";
import { ResultWithDetails } from "../types";

export default function Page() {
  const [result, setResult] = useState<ResultWithDetails | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleResult = (newResult: ResultWithDetails | null) => {
    setResult(newResult);
    // 計算結果が表示されたら自動スクロール
    if (newResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-2">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2 tracking-tight text-center drop-shadow">タワマン税制</h1>
      <h2 className="text-lg md:text-2xl font-semibold text-blue-800 mb-8 text-center">居住用区分所有財産の相続税評価額計算</h2>
      <InputForm onResult={handleResult} />
      <div ref={resultRef}>
        <ResultDisplay result={result} showDetails={true} />
      </div>
    </div>
  );
}
