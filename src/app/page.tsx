"use client";
import { useState } from "react";
import InputForm from "../components/input-form";
import ResultDisplay from "../components/result-display";
import { ResultWithDetails } from "../types";

export default function Page() {
  const [result, setResult] = useState<ResultWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-2">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2 tracking-tight text-center drop-shadow">タワマン税制</h1>
      <h2 className="text-lg md:text-2xl font-semibold text-blue-800 mb-8 text-center">居住用区分所有財産の相続税評価額計算</h2>
      <InputForm onResult={setResult} />
      <div className="flex items-center gap-2 mt-4">
        <label className="flex items-center cursor-pointer text-sm text-gray-700">
          <input type="checkbox" checked={showDetails} onChange={e => setShowDetails(e.target.checked)} className="mr-2" />
          計算過程の詳細を表示
        </label>
      </div>
      <ResultDisplay result={result} showDetails={showDetails} />
    </div>
  );
}
