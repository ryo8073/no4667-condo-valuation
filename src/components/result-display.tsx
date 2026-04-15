"use client";
import { useState } from "react";
import { ResultWithDetails, CorrectionCase } from "../types";

function formatYen(n: number): string {
  return Math.floor(n).toLocaleString();
}

function formatDecimal(n: number, digits: number): string {
  return n.toFixed(digits);
}

function correctionCaseLabel(c: CorrectionCase): string {
  switch (c) {
    case "none":
      return "評価乖離率 ≤ 0 のため補正なし";
    case "multiply06":
      return "評価水準 < 0.6 → 評価乖離率 × 0.6";
    case "deviation":
      return "評価水準 > 1 → 評価乖離率をそのまま適用";
    case "no_correction":
      return "0.6 ≤ 評価水準 ≤ 1 → 補正なし (1.000)";
  }
}

export default function ResultDisplay({
  result,
  showDetails,
}: {
  result: ResultWithDetails | null;
  showDetails?: boolean;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!result) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-lg mt-8 max-w-2xl mx-auto border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[160px]">
        <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">上のフォームに入力後、「計算する」を押してください</p>
      </div>
    );
  }

  const d = result.details;

  return (
    <div className="mt-8 max-w-2xl mx-auto space-y-4">
      {/* メイン結果 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">計算結果</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 自用の場合 */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="font-bold text-blue-800 text-sm mb-4 pb-2 border-b border-blue-200">
                自用の場合
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">建物（区分所有権）</dt>
                  <dd className="font-semibold text-gray-900">{formatYen(result.sectionalBuildingPrice)} 円</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">土地（敷地利用権）</dt>
                  <dd className="font-semibold text-gray-900">{formatYen(result.landRightValue)} 円</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-blue-200">
                  <dt className="font-bold text-blue-900">評価額合計</dt>
                  <dd className="font-bold text-blue-900 text-lg">{formatYen(result.totalSelf)} 円</dd>
                </div>
              </dl>
            </div>

            {/* 賃貸の場合 */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 text-sm mb-4 pb-2 border-b border-emerald-200">
                賃貸の場合
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">建物（借家建物）</dt>
                  <dd className="font-semibold text-gray-900">{formatYen(result.rentalBuildingPrice)} 円</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">土地（貸家建付地）</dt>
                  <dd className="font-semibold text-gray-900">{formatYen(result.leasedLandValue)} 円</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-emerald-200">
                  <dt className="font-bold text-emerald-900">評価額合計</dt>
                  <dd className="font-bold text-emerald-900 text-lg">{formatYen(result.totalRental)} 円</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* 区分所有補正率の概要 */}
          <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div>
                <p className="text-gray-500">評価乖離率</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{formatDecimal(result.deviationRate, 3)}</p>
              </div>
              <div>
                <p className="text-gray-500">評価水準</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  {result.deviationRate > 0 ? formatDecimal(result.evaluationLevel, 3) : "---"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">区分所有補正率</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{formatDecimal(result.sectionalCorrectionRate, 3)}</p>
              </div>
              <div>
                <p className="text-gray-500">判定</p>
                <p className="font-bold text-sm mt-0.5">
                  {result.correctionCase === "multiply06" && <span className="text-orange-600">引上げ補正</span>}
                  {result.correctionCase === "deviation" && <span className="text-blue-600">引下げ補正</span>}
                  {result.correctionCase === "no_correction" && <span className="text-green-600">補正なし</span>}
                  {result.correctionCase === "none" && <span className="text-gray-500">対象外</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 計算ロジック詳細（折りたたみ） */}
      {showDetails && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <span>計算過程の詳細</span>
            <svg
              className={`w-5 h-5 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {detailsOpen && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 space-y-4">
                {/* 基礎数値 */}
                <DetailSection title="基礎数値">
                  <DetailRow label="築年数" value={`${result.buildingAge} 年`} />
                  <DetailRow label="敷地利用権の面積" value={`${formatDecimal(d.landRightAreaRaw, 4)} → ${formatDecimal(result.landRightArea, 2)} m²（ROUNDUP）`} />
                  <DetailRow label="従来の敷地利用権の価格（土地）" value={`${formatYen(result.landRightPrice)} 円`} />
                </DetailSection>

                {/* 評価乖離率 */}
                <DetailSection title="評価乖離率の計算">
                  <DetailRow
                    label="A = 築年数 × (−0.033)"
                    value={`${result.buildingAge} × (−0.033) = ${formatDecimal(d.A, 4)}`}
                  />
                  <DetailRow
                    label="総階数指数 = 総階数 ÷ 33"
                    value={`${formatDecimal(d.totalFloorsIndex, 3)}（ROUNDDOWN、上限1.000）`}
                  />
                  <DetailRow
                    label="B = 総階数指数 × 0.239"
                    value={`${formatDecimal(d.totalFloorsIndex, 3)} × 0.239 = ${formatDecimal(d.B, 3)}（ROUNDDOWN）`}
                  />
                  <DetailRow
                    label="C = 所在階 × 0.018"
                    value={`${formatDecimal(d.C, 4)}`}
                  />
                  <DetailRow
                    label="敷地持分狭小度 = 敷地利用権面積 ÷ 専有面積"
                    value={`${formatDecimal(d.shareNarrownessDegree, 3)}（ROUNDUP）`}
                  />
                  <DetailRow
                    label="D = 敷地持分狭小度 × (−1.195)"
                    value={`${formatDecimal(d.shareNarrownessDegree, 3)} × (−1.195) = ${formatDecimal(d.D, 3)}（ROUNDUP）`}
                  />
                  <DetailRow
                    label="評価乖離率 = A + B + C + D + 3.220"
                    value={formatDecimal(d.deviationRate, 4)}
                    highlight
                  />
                </DetailSection>

                {/* 区分所有補正率 */}
                <DetailSection title="区分所有補正率">
                  <DetailRow
                    label="評価水準 = 1 ÷ 評価乖離率"
                    value={result.deviationRate > 0 ? formatDecimal(d.evaluationLevel, 4) : "---"}
                  />
                  <DetailRow
                    label="適用区分"
                    value={correctionCaseLabel(result.correctionCase)}
                  />
                  <DetailRow
                    label="区分所有補正率"
                    value={formatDecimal(d.sectionalCorrectionRate, 3)}
                    highlight
                  />
                </DetailSection>

                {/* 最終計算 */}
                <DetailSection title="最終計算">
                  <div className="text-xs font-semibold text-blue-700 mb-1">【自用の場合】</div>
                  <DetailRow label="建物 = 従来の価格 × 補正率" value={`${formatYen(d.sectionalBuildingPrice)} 円`} />
                  <DetailRow label="土地 = 従来の土地価格 × 補正率" value={`${formatYen(d.landRightValue)} 円`} />
                  <DetailRow label="合計" value={`${formatYen(d.totalSelf)} 円`} highlight />

                  <div className="text-xs font-semibold text-emerald-700 mt-3 mb-1">【賃貸の場合】</div>
                  <DetailRow label="建物 = 区分所有権の価格 × (1 − 0.3)" value={`${formatYen(d.rentalBuildingPrice)} 円`} />
                  <DetailRow label="土地 = 貸家建付地の計算" value={`${formatYen(d.leasedLandValue)} 円`} />
                  <DetailRow label="合計" value={`${formatYen(d.totalRental)} 円`} highlight />
                </DetailSection>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 注意事項 */}
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">注意:</span> この計算結果は参考値です。
          実際の相続税申告にあたっては、税理士等の専門家にご相談ください。
          本ツールは国税庁通達「居住用の区分所有財産の評価について」（令和6年1月1日以後適用）に基づいています。
          路線価の各種補正（奥行価格補正等）は考慮していません。
        </p>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-start text-xs gap-4 py-0.5 ${highlight ? "font-bold text-gray-900 bg-yellow-50 -mx-2 px-2 py-1 rounded" : "text-gray-600"}`}>
      <span className="shrink-0">{label}</span>
      <span className={`text-right font-mono ${highlight ? "text-gray-900" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}
