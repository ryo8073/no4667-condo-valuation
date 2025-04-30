// import { CalculationResult } from "../types";

function formatNumber(n: number, digits = 0) {
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

interface CalculationDetails {
  buildingAgeRaw: number;
  landRightAreaRaw: number;
  landRightPriceRaw: number;
  A: number;
  B: number;
  C: number;
  D: number;
  landRightAreaD: number | null;
  sectionalCorrectionRate: number;
  deviationRate: number;
  evaluationLevel: number;
  sectionalBuildingPrice: number;
  rentalBuildingPrice: number;
  landRightValue: number;
  leasedLandValue: number;
  totalSelf: number;
  totalRental: number;
  totalFloorsIndexDisplay: number;
  totalFloorsIndex: number;
  shareNarrowness: number;
  shareNarrownessDegree: number;
}

interface ResultWithDetails {
  sectionalBuildingPrice: number;
  landRightValue: number;
  totalSelf: number;
  rentalBuildingPrice: number;
  leasedLandValue: number;
  totalRental: number;
  landRightArea: number;
  landRightPrice: number;
  details: CalculationDetails;
  buildingAge: number;
}

export default function ResultDisplay({ result }: { result: ResultWithDetails }) {
  const details = result.details;
  return (
    <div className="p-4 bg-gray-50 rounded shadow mt-4">
      <h2 className="text-lg font-bold mb-2">計算結果</h2>
      <div className="mb-4">
        <h3 className="font-semibold text-blue-700 mb-1">自用地の場合</h3>
        <ul className="space-y-1">
          <li>区分所有権の価格（建物）: {formatNumber(result.sectionalBuildingPrice, 0)} 円</li>
          <li>敷地利用権の価格（土地）: {formatNumber(result.landRightValue, 0)} 円</li>
          <li className="font-bold">評価額合計: {formatNumber(result.totalSelf, 0)} 円</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-green-700 mb-1">賃貸した場合</h3>
        <ul className="space-y-1">
          <li>区分所有権の価格（建物）: {formatNumber(result.rentalBuildingPrice, 0)} 円</li>
          <li>敷地利用権の価格（土地）: {formatNumber(result.leasedLandValue, 0)} 円</li>
          <li className="font-bold">評価額合計: {formatNumber(result.totalRental, 0)} 円</li>
        </ul>
      </div>
      <div className="mt-6">
        <h4 className="font-semibold mb-2">計算ロジック詳細</h4>
        <ul className="text-xs space-y-1">
          <li>築年数: {details.buildingAgeRaw} → {result.buildingAge} 年（切り上げ）</li>
          <li>敷地利用権の面積: {details.landRightAreaRaw} → {result.landRightArea} ㎡（小数点2位繰上げ）</li>
          <li>従来の敷地利用権の価格（土地）: {Number(details.landRightPriceRaw).toLocaleString()} → {Number(result.landRightPrice).toLocaleString()} 円（0円の位で四捨五入）</li>
          <li>A = 築年数 × (-0.033): {details.A}</li>
          <li>総階数指数: {details.totalFloorsIndex.toFixed(3)}</li>
          <li>B = 総階数指数 × 0.239: {details.B.toFixed(3)}</li>
          <li>C = 所在階 × 0.018: {details.C}</li>
          <li>D = 敷地持分狭小度 × (−1.195): {details.D.toFixed(3)}</li>
          <li>敷地持分狭小度: {details.shareNarrownessDegree.toFixed(3)}</li>
          <li>評価乖離率: {details.deviationRate}</li>
          <li>評価水準: {details.evaluationLevel}</li>
          <li>区分所有補正率: {details.sectionalCorrectionRate}</li>
          <li>区分所有権の価格（建物）: {Number(details.sectionalBuildingPrice).toLocaleString()} 円</li>
          <li>借家建物の価格（賃貸）: {Number(details.rentalBuildingPrice).toLocaleString()} 円</li>
          <li>敷地利用権の価額（土地）: {Number(details.landRightValue).toLocaleString()} 円</li>
          <li>貸家建付地価額（賃貸）: {Number(details.leasedLandValue).toLocaleString()} 円</li>
          <li>自用地合計: {Number(details.totalSelf).toLocaleString()} 円</li>
          <li>賃貸合計: {Number(details.totalRental).toLocaleString()} 円</li>
        </ul>
      </div>
    </div>
  );
} 