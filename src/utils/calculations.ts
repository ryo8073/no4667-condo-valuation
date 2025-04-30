import { FormInput } from '../types';

function roundup(value: number, digits: number) {
  const factor = Math.pow(10, digits);
  if (value === 0) return 0;
  if (value > 0) return Math.ceil(value * factor) / factor;
  return Math.floor(value * factor) / factor;
}
function floor(value: number, digits: number) {
  const factor = Math.pow(10, digits);
  return Math.floor(value * factor) / factor;
}

/**
 * 入力値から評価額を計算する（端数処理厳密対応・詳細値も返す）
 * @param input フォーム入力値
 * @returns 計算結果＋詳細
 */
export function calculateValuation(input: FormInput) {
  const rentRightRate = 0.3; // 借家権割合（固定値）

  // 築年数（切り上げ）
  const buildingAgeRaw = new Date(input.inheritanceDate).getFullYear() - new Date(input.constructionDate).getFullYear() + 1;
  const buildingAge = Math.ceil(buildingAgeRaw);

  // 敷地利用権の面積（小数点2位繰上げ）
  const landRightAreaRaw = input.landArea * (input.landShareNumerator / input.landShareDenominator);
  const landRightArea = roundup(landRightAreaRaw, 2);

  // 従来の敷地利用権の価格（土地）（0円の位で四捨五入）
  const landRightPriceRaw = input.roadPrice * landRightArea * input.roadPriceRate;
  const landRightPrice = Math.round(landRightPriceRaw / 1) * 1;

  // 評価乖離率の計算
  // A = 築年数 × (-0.033)（築年数は1年未満の端数は1年）
  const A = buildingAge * -0.033;

  // B = 総階数 ÷ 33 × 0.239（小数点第3位で切捨て、33超は1.000）
  const totalFloorsIndex = input.totalFloors > 33 ? 1 : floor(input.totalFloors / 33, 3);
  const B = floor(totalFloorsIndex * 0.239, 3);

  // C = 所在階 × 0.018（地階の場合は0）
  const C = input.floor > 0 ? input.floor * 0.018 : 0;

  // D = 敷地持分狭小度 × (−1.195)
  // 敷地持分狭小度 = 敷地利用権の面積 ÷ 専有部分の面積（小数点第3位で繰上げ）
  const shareNarrownessDegree = roundup(landRightAreaRaw / input.exclusiveArea, 3);
  // Dも小数点第3位で繰上げ
  const D = roundup(shareNarrownessDegree * -1.195, 3);

  // 評価乖離率
  const deviationRateRaw = A + B + C + D + 3.22;
  const deviationRate = Math.round(deviationRateRaw * 1000) / 1000;

  // 評価水準
  const evaluationLevel = 1 / deviationRate;

  // 区分所有補正率
  let sectionalCorrectionRate = 1;
  if (evaluationLevel < 0.6) {
    sectionalCorrectionRate = deviationRate * 0.6;
  } else if (evaluationLevel > 1) {
    sectionalCorrectionRate = deviationRate * 0.6;
  }

  // 区分所有権の価格（建物）
  const sectionalBuildingPrice = input.buildingPrice * sectionalCorrectionRate;

  // 借家建物の価格（賃貸している場合）
  const rentalBuildingPrice = sectionalBuildingPrice * (1 - rentRightRate);

  // 敷地利用権の価額（土地）
  const landRightValue = landRightPrice * sectionalCorrectionRate;

  // 貸家建付地価額（賃貸している場合）
  const leasedLandValue = landRightValue - (landRightValue * input.leaseholdRate * rentRightRate * (input.rentalRate / 100));

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
    sectionalBuildingPrice,
    rentalBuildingPrice,
    landRightValue,
    leasedLandValue,
    totalSelf,
    totalRental,
    details: {
      buildingAgeRaw,
      landRightAreaRaw,
      landRightPriceRaw,
      A,
      B,
      C,
      D,
      totalFloorsIndex,
      shareNarrownessDegree,
      landRightAreaD: null, // 使わなくなったのでnull
      sectionalCorrectionRate,
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