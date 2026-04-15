import { FormInput } from '../types';

/**
 * 小数点以下 digits 桁で切捨て（ROUNDDOWN）
 * 国税庁計算明細書の「小数点以下第(digits+1)位切捨て」に対応
 */
function truncate(value: number, digits: number): number {
  const factor = Math.pow(10, digits);
  return Math.floor(value * factor) / factor;
}

/**
 * 小数点以下 digits 桁で切上げ（ROUNDUP = 0から遠ざかる方向）
 * 正の値: Math.ceil、負の値: Math.floor
 * ExcelのROUNDUP関数と同じ挙動
 */
function roundup(value: number, digits: number): number {
  const factor = Math.pow(10, digits);
  if (value === 0) return 0;
  if (value > 0) return Math.ceil(value * factor) / factor;
  return Math.floor(value * factor) / factor;
}

/**
 * 日付文字列 "YYYY-MM-DD" からタイムゾーン影響のない年月日を取得
 */
function parseDateParts(dateStr: string): [number, number, number] {
  const parts = dateStr.split("-");
  return [parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10)];
}

/**
 * 築年数を計算する
 * 国税庁ルール: 新築の時から課税時期までの期間（1年未満の端数は1年とする）
 */
function calcBuildingAge(constructionStr: string, inheritanceStr: string): number {
  const [cY, cM, cD] = parseDateParts(constructionStr);
  const [iY, iM, iD] = parseDateParts(inheritanceStr);

  if (isNaN(cY) || isNaN(iY)) return 1;

  // 経過した完全な年数を計算
  let years = iY - cY;

  // 今年のまだ記念日に達していない場合は1年引く
  if (iM < cM || (iM === cM && iD < cD)) {
    years--;
  }

  // ちょうど記念日の場合は端数なし、そうでなければ1年加算
  if (iM !== cM || iD !== cD) {
    years++;
  }

  return Math.max(years, 1);
}

/**
 * 入力値から評価額を計算する
 * 国税庁通達「居住用の区分所有財産の評価について」（令和5年9月28日付 課評2-74）準拠
 * 国税庁公式Excel計算明細書の数式に完全準拠
 *
 * 丸めルール（公式Excelから確認）:
 *   総階数指数        = ROUNDDOWN(総階数÷33, 3)  ← 切捨て
 *   B                 = ROUNDDOWN(総階数指数×0.239, 3) ← 切捨て
 *   敷地利用権の面積  = ROUNDUP(敷地面積×持分割合, 2) ← 切上げ
 *   敷地持分狭小度    = ROUNDUP(敷地利用権面積÷専有面積, 3) ← 切上げ
 *   D                 = ROUNDUP(敷地持分狭小度×(-1.195), 3) ← 切上げ
 *   A, C              = 丸めなし
 *   評価乖離率        = A+B+C+D+3.220（丸めなし）
 *   区分所有補正率    = 丸めなし
 */
export function calculateValuation(input: FormInput) {
  const rentRightRate = 0.3; // 借家権割合（固定値30%）

  // ⑦ 築年数（1年未満の端数は1年）
  const buildingAge = calcBuildingAge(input.constructionDate, input.inheritanceDate);

  // ⑤ 敷地利用権の面積（小数点以下第3位切上げ = ROUNDUP(x, 2)）
  const landRightAreaRaw = input.landArea * (input.landShareNumerator / input.landShareDenominator);
  const landRightArea = roundup(landRightAreaRaw, 2);

  // 従来の敷地利用権の価格（土地）= 路線価 × 敷地利用権の面積 × 調整率（1円未満切捨て）
  const landRightPriceRaw = input.roadPrice * landRightArea * input.roadPriceRate;
  const landRightPrice = Math.floor(landRightPriceRaw);

  // ⑥ 総階数指数 = 総階数 ÷ 33（小数点以下第4位切捨て = ROUNDDOWN(x, 3)、1.000を超える場合は1.000）
  const totalFloorsIndex = input.totalFloors >= 33
    ? 1.000
    : truncate(input.totalFloors / 33, 3);

  // 評価乖離率の各要素
  // A = 築年数 × △0.033（丸めなし）
  const A = buildingAge * -0.033;

  // B = 総階数指数 × 0.239（小数点以下第4位切捨て = ROUNDDOWN(x, 3)）
  const B = truncate(totalFloorsIndex * 0.239, 3);

  // C = 所在階 × 0.018（丸めなし、地階の場合は0）
  const C = input.floor > 0 ? input.floor * 0.018 : 0;

  // ⑧ 敷地持分狭小度 = 敷地利用権の面積 ÷ 専有部分の面積
  //    （小数点以下第4位切上げ = ROUNDUP(x, 3)）
  const shareNarrownessDegree = roundup(landRightArea / input.exclusiveArea, 3);

  // D = 敷地持分狭小度 × △1.195（小数点以下第4位切上げ = ROUNDUP(x, 3)）
  const D = roundup(shareNarrownessDegree * -1.195, 3);

  // ⑨ 評価乖離率 = A + B + C + D + 3.220（丸めなし）
  const deviationRateRaw = A + B + C + D + 3.220;
  const deviationRate = deviationRateRaw;

  // ⑩ 評価水準 = 1 ÷ 評価乖離率
  const evaluationLevel = deviationRate > 0 ? 1 / deviationRate : Infinity;

  // ⑪ 区分所有補正率（国税庁通達5項、丸めなし）
  // (1) 評価乖離率が零又はマイナス → 補正なし（この通達による評価を行わない）
  // (2) 評価水準 < 0.6 → 評価乖離率 × 0.6
  // (3) 評価水準 > 1 → 評価乖離率
  // (4) 0.6 ≤ 評価水準 ≤ 1 → 1（補正なし）
  let sectionalCorrectionRate: number;
  let correctionCase: 'none' | 'multiply06' | 'deviation' | 'no_correction';

  if (deviationRate <= 0) {
    sectionalCorrectionRate = 1;
    correctionCase = 'none';
  } else if (evaluationLevel < 0.6) {
    sectionalCorrectionRate = deviationRate * 0.6;
    correctionCase = 'multiply06';
  } else if (evaluationLevel > 1) {
    sectionalCorrectionRate = deviationRate;
    correctionCase = 'deviation';
  } else {
    sectionalCorrectionRate = 1;
    correctionCase = 'no_correction';
  }

  // 区分所有権の価格（建物）= 従来の価格 × 区分所有補正率（1円未満切捨て）
  const sectionalBuildingPrice = Math.floor(input.buildingPrice * sectionalCorrectionRate);

  // 借家建物の価格（賃貸している場合）= 区分所有権の価格 × (1 - 借家権割合)（1円未満切捨て）
  const rentalBuildingPrice = Math.floor(sectionalBuildingPrice * (1 - rentRightRate));

  // 敷地利用権の価額（土地）= 従来の敷地利用権の価格 × 区分所有補正率（1円未満切捨て）
  const landRightValue = Math.floor(landRightPrice * sectionalCorrectionRate);

  // 貸家建付地価額（賃貸している場合）（1円未満切捨て）
  // = 自用地価額 - (自用地価額 × 借地権割合 × 借家権割合 × 賃貸割合)
  const leasedLandValue = Math.floor(
    landRightValue - (landRightValue * input.leaseholdRate * rentRightRate * (input.rentalRate / 100))
  );

  // 合計
  const totalSelf = sectionalBuildingPrice + landRightValue;
  const totalRental = rentalBuildingPrice + leasedLandValue;

  return {
    buildingAge,
    landRightArea,
    landRightPrice,
    deviationRate,
    deviationRateRaw,
    evaluationLevel,
    sectionalCorrectionRate,
    correctionCase,
    sectionalBuildingPrice,
    rentalBuildingPrice,
    landRightValue,
    leasedLandValue,
    totalSelf,
    totalRental,
    details: {
      buildingAgeRaw: buildingAge,
      landRightAreaRaw,
      landRightPriceRaw,
      A,
      B,
      C,
      D,
      totalFloorsIndex,
      totalFloorsIndexDisplay: totalFloorsIndex,
      shareNarrownessDegree,
      shareNarrowness: shareNarrownessDegree,
      landRightAreaD: null,
      sectionalCorrectionRate,
      correctionCase,
      deviationRate,
      deviationRateRaw,
      evaluationLevel,
      sectionalBuildingPrice,
      rentalBuildingPrice,
      landRightValue,
      leasedLandValue,
      totalSelf,
      totalRental,
    },
  };
}
