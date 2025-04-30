export type FormInput = {
  inheritanceDate: string; // 相続開始日
  constructionDate: string; // 新築年月日
  totalFloors: number; // 総階数
  floor: number; // 所在階
  exclusiveArea: number; // 専有部分の面積
  landArea: number; // 敷地の面積
  landShareNumerator: number; // 敷地権の割合（分子）
  landShareDenominator: number; // 敷地権の割合（分母）
  buildingPrice: number; // 従来の区分所有権の価格（建物）
  roadPrice: number; // 前面路線価
  roadPriceRate: number; // 路線価調整率
  leaseholdRate: number; // 借地権割合
  rentalRate: number; // 賃貸割合
};

export type CalculationResult = {
  buildingAge: number;
  landRightArea: number;
  landRightPrice: number;
  deviationRate: number;
  evaluationLevel: number;
  sectionalCorrectionRate: number;
  sectionalBuildingPrice: number;
  rentalBuildingPrice: number;
  landRightValue: number;
  leasedLandValue: number;
};

export type CalculationDetails = {
  buildingAgeRaw: number;
  landRightAreaRaw: number;
  landRightPriceRaw: number;
  A: number;
  B: number;
  C: number;
  D: number;
  totalFloorsIndex: number;
  shareNarrownessDegree: number;
  landRightAreaD: null;
  sectionalCorrectionRate: number;
  deviationRate: number;
  deviationRateRaw: number;
  evaluationLevel: number;
  sectionalBuildingPrice: number;
  rentalBuildingPrice: number;
  landRightValue: number;
  leasedLandValue: number;
  totalSelf: number;
  totalRental: number;
};

export type ResultWithDetails = CalculationResult & {
  totalSelf: number;
  totalRental: number;
  details: CalculationDetails;
}; 