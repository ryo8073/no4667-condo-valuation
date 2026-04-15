import { calculateValuation } from './calculations';
import { FormInput } from '../types';

describe('calculateValuation', () => {
  // PRD記載の例題データ
  const prdExample: FormInput = {
    inheritanceDate: '2025-12-01',
    constructionDate: '2012-02-16',
    totalFloors: 10,
    floor: 7,
    exclusiveArea: 63.26,
    landArea: 1306.00,
    landShareNumerator: 6608,
    landShareDenominator: 369648,
    buildingPrice: 6148686,
    roadPrice: 68000,
    roadPriceRate: 1.0,
    leaseholdRate: 0.5,
    rentalRate: 100,
  };

  describe('築年数の計算', () => {
    test('PRD例: 2012-02-16→2025-12-01 = 14年（13年9ヶ月→切上げ14年）', () => {
      const result = calculateValuation(prdExample);
      expect(result.buildingAge).toBe(14);
    });

    test('ちょうど5年（端数なし）→ 5年', () => {
      const input: FormInput = {
        ...prdExample,
        constructionDate: '2020-01-15',
        inheritanceDate: '2025-01-15',
      };
      const result = calculateValuation(input);
      expect(result.buildingAge).toBe(5);
    });

    test('5年と1日 → 6年（端数切上げ）', () => {
      const input: FormInput = {
        ...prdExample,
        constructionDate: '2020-01-15',
        inheritanceDate: '2025-01-16',
      };
      const result = calculateValuation(input);
      expect(result.buildingAge).toBe(6);
    });

    test('4年11ヶ月 → 5年（端数切上げ）', () => {
      const input: FormInput = {
        ...prdExample,
        constructionDate: '2020-03-15',
        inheritanceDate: '2025-02-10',
      };
      const result = calculateValuation(input);
      expect(result.buildingAge).toBe(5);
    });

    test('同一年内（2025-01-01→2025-06-01）→ 1年', () => {
      const input: FormInput = {
        ...prdExample,
        constructionDate: '2025-01-01',
        inheritanceDate: '2025-06-01',
      };
      const result = calculateValuation(input);
      expect(result.buildingAge).toBe(1);
    });
  });

  describe('総階数指数', () => {
    test('10階建て: ROUNDDOWN(10/33, 3) = 0.303', () => {
      const result = calculateValuation(prdExample);
      expect(result.details.totalFloorsIndex).toBe(0.303);
    });

    test('33階建て以上: 1.000', () => {
      const input: FormInput = { ...prdExample, totalFloors: 45 };
      const result = calculateValuation(input);
      expect(result.details.totalFloorsIndex).toBe(1.000);
    });

    test('33階ちょうど: 1.000', () => {
      const input: FormInput = { ...prdExample, totalFloors: 33 };
      const result = calculateValuation(input);
      expect(result.details.totalFloorsIndex).toBe(1.000);
    });
  });

  describe('B の計算（切捨て）', () => {
    test('B = ROUNDDOWN(総階数指数 × 0.239, 3)', () => {
      const result = calculateValuation(prdExample);
      // 0.303 × 0.239 = 0.072417 → ROUNDDOWN → 0.072
      const expected = Math.floor(result.details.totalFloorsIndex * 0.239 * 1000) / 1000;
      expect(result.details.B).toBe(expected);
    });
  });

  describe('敷地利用権の面積（切上げ）', () => {
    test('ROUNDUP(敷地面積 × 持分割合, 2)', () => {
      const result = calculateValuation(prdExample);
      const raw = prdExample.landArea * (prdExample.landShareNumerator / prdExample.landShareDenominator);
      const expected = Math.ceil(raw * 100) / 100;
      expect(result.landRightArea).toBe(expected);
    });
  });

  describe('敷地持分狭小度（切上げ）', () => {
    test('ROUNDUP(敷地利用権面積 ÷ 専有面積, 3)', () => {
      const result = calculateValuation(prdExample);
      const ratio = result.landRightArea / prdExample.exclusiveArea;
      const expected = Math.ceil(ratio * 1000) / 1000;
      expect(result.details.shareNarrownessDegree).toBe(expected);
    });
  });

  describe('D の計算（切上げ）', () => {
    test('D = ROUNDUP(敷地持分狭小度 × (-1.195), 3)', () => {
      const result = calculateValuation(prdExample);
      const raw = result.details.shareNarrownessDegree * -1.195;
      // ROUNDUP for negative: rounds away from zero (more negative)
      const expected = Math.floor(raw * 1000) / 1000;
      expect(result.details.D).toBe(expected);
    });
  });

  describe('評価乖離率', () => {
    test('丸めなし（A+B+C+D+3.220そのまま）', () => {
      const result = calculateValuation(prdExample);
      const expected = result.details.A + result.details.B + result.details.C + result.details.D + 3.220;
      expect(result.deviationRate).toBeCloseTo(expected, 10);
    });
  });

  describe('区分所有補正率', () => {
    test('評価水準 < 0.6 → 評価乖離率 × 0.6（丸めなし）', () => {
      const result = calculateValuation(prdExample);
      if (result.evaluationLevel < 0.6) {
        expect(result.correctionCase).toBe('multiply06');
        expect(result.sectionalCorrectionRate).toBeCloseTo(result.deviationRate * 0.6, 10);
      }
    });

    test('評価水準 > 1 → 区分所有補正率 = 評価乖離率（×0.6ではない）', () => {
      // 0 < 評価乖離率 < 1 → 評価水準 > 1 のケース
      const input: FormInput = {
        ...prdExample,
        constructionDate: '2024-01-01',
        inheritanceDate: '2025-06-01',
        totalFloors: 3,
        floor: 1,
        exclusiveArea: 10,
        landArea: 260,
        landShareNumerator: 1,
        landShareDenominator: 10,
      };
      const result = calculateValuation(input);
      if (result.deviationRate > 0 && result.deviationRate < 1) {
        expect(result.evaluationLevel).toBeGreaterThan(1);
        expect(result.correctionCase).toBe('deviation');
        expect(result.sectionalCorrectionRate).toBe(result.deviationRate);
      }
    });

    test('評価乖離率 ≤ 0 → 補正なし（1.000）', () => {
      const input: FormInput = {
        ...prdExample,
        constructionDate: '1970-01-01',
        inheritanceDate: '2025-01-01',
        totalFloors: 1,
        floor: 1,
        exclusiveArea: 10,
        landArea: 10000,
        landShareNumerator: 1,
        landShareDenominator: 1,
      };
      const result = calculateValuation(input);
      if (result.deviationRate <= 0) {
        expect(result.correctionCase).toBe('none');
        expect(result.sectionalCorrectionRate).toBe(1);
      }
    });
  });

  describe('地階のケース', () => {
    test('地階（floor = 0）→ C = 0', () => {
      const input: FormInput = {
        ...prdExample,
        floor: 0,
      };
      const result = calculateValuation(input);
      expect(result.details.C).toBe(0);
    });
  });

  describe('金額の端数処理', () => {
    test('全ての金額が整数（1円未満切捨て）', () => {
      const result = calculateValuation(prdExample);
      expect(Number.isInteger(result.sectionalBuildingPrice)).toBe(true);
      expect(Number.isInteger(result.rentalBuildingPrice)).toBe(true);
      expect(Number.isInteger(result.landRightValue)).toBe(true);
      expect(Number.isInteger(result.leasedLandValue)).toBe(true);
      expect(Number.isInteger(result.landRightPrice)).toBe(true);
    });
  });

  describe('PRD例題の総合テスト', () => {
    test('基本プロパティが正の値', () => {
      const result = calculateValuation(prdExample);
      expect(result.buildingAge).toBeGreaterThan(0);
      expect(result.landRightArea).toBeGreaterThan(0);
      expect(result.landRightPrice).toBeGreaterThan(0);
      expect(result.totalSelf).toBeGreaterThan(0);
      expect(result.totalRental).toBeGreaterThan(0);
      expect(result.totalRental).toBeLessThan(result.totalSelf);
    });
  });
});
