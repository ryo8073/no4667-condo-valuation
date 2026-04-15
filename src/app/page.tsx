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
    if (newResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            区分所有補正率 計算ツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            居住用区分所有財産の相続税評価額（タワマン税制）
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <InputForm onResult={handleResult} />
        <div ref={resultRef}>
          <ResultDisplay result={result} showDetails={true} />
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          国税庁通達「居住用の区分所有財産の評価について」（令和6年1月1日以後適用）に基づく計算
        </div>
      </footer>
    </div>
  );
}
