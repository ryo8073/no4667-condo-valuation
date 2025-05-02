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
    <div className="p-6 bg-white rounded-xl shadow-lg mt-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center border-b pb-2">計算結果</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-blue-800 text-lg mb-3 border-b pb-1">自用地の場合</h3>
          <ul className="space-y-2 text-gray-900 text-base">
            <li><span className="font-medium">区分所有権の価格（建物）:</span> <span className="font-mono">{formatNumber(result.sectionalBuildingPrice, 0)} 円</span></li>
            <li><span className="font-medium">敷地利用権の価格（土地）:</span> <span className="font-mono">{formatNumber(result.landRightValue, 0)} 円</span></li>
            <li className="font-bold text-lg text-blue-900 mt-2">評価額合計: <span className="font-mono">{formatNumber(result.totalSelf, 0)} 円</span></li>
          </ul>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-green-800 text-lg mb-3 border-b pb-1">賃貸した場合</h3>
          <ul className="space-y-2 text-gray-900 text-base">
            <li><span className="font-medium">区分所有権の価格（建物）:</span> <span className="font-mono">{formatNumber(result.rentalBuildingPrice, 0)} 円</span></li>
            <li><span className="font-medium">敷地利用権の価格（土地）:</span> <span className="font-mono">{formatNumber(result.leasedLandValue, 0)} 円</span></li>
            <li className="font-bold text-lg text-green-900 mt-2">評価額合計: <span className="font-mono">{formatNumber(result.totalRental, 0)} 円</span></li>
          </ul>
        </div>
      </div>
      <div className="mt-8">
        <h4 className="font-semibold mb-2 text-gray-900">計算ロジック詳細</h4>
        <ul className="text-xs space-y-1 text-gray-900">
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