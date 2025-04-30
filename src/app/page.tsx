"use client";
import { useState } from "react";
import Layout from "../components/layout";
import InputForm from "../components/input-form";
import ResultDisplay from "../components/result-display";
import { CalculationResult } from "../types";

export default function Home() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-2 text-center">居住用区分所有財産の相続税評価額計算</h1>
      <div className="text-center text-sm text-gray-600 mb-4">居宅（居住用）の場合に適用</div>
      <InputForm onResult={setResult} />
      {result && <ResultDisplay result={result} />}
    </Layout>
  );
}
