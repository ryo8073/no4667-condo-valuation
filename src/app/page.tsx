"use client";
import { useState } from "react";
import InputForm from "../components/input-form";
import ResultDisplay from "../components/result-display";
import { ResultWithDetails } from "../types";

export default function Page() {
  const [result, setResult] = useState<ResultWithDetails | null>(null);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center justify-center py-12 px-2">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 tracking-tight text-center drop-shadow">配偶者居住権 評価額計算ツール</h1>
      <InputForm onResult={setResult} />
      <ResultDisplay result={result} />
    </div>
  );
}
