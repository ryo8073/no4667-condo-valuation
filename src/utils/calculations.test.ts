import { calculateValuation } from './calculations';
import { FormInput } from '../types';

describe('calculateValuation', () => {
  // 正常系テスト
  describe('正常系', () => {
    const validInput: FormInput = {
      inheritanceDate: '2025-01-01',
      constructionDate: '2010-01-01',
      totalFloors: 10,
      floor: 5,
      exclusiveArea: 80.5,
      landArea: 1000,
      landShareNumerator: 1,
      landShareDenominator: 100,
      buildingPrice: 5000000,
      roadPrice: 50000,
      roadPriceRate: 1.0,
      leaseholdRate: 0.5,
      rentalRate: 100,
    };

    test('基本的な計算が正しく実行される', () => {
      const result = calculateValuation(validInput);
      
      console.log('テスト結果:', result);
      
      // 基本的なプロパティが存在することを確認
      expect(result).toHaveProperty('buildingAge');
      expect(result).toHaveProperty('landRightArea');
      expect(result).toHaveProperty('landRightPrice');
      expect(result).toHaveProperty('sectionalBuildingPrice');
      expect(result).toHaveProperty('totalSelf');
      expect(result).toHaveProperty('totalRental');
      expect(result).toHaveProperty('details');
      
      // 数値が正しく計算されていることを確認
      expect(typeof result.buildingAge).toBe('number');
      expect(typeof result.landRightArea).toBe('number');
      expect(typeof result.totalSelf).toBe('number');
      expect(typeof result.totalRental).toBe('number');
      
      // 正の値であることを確認
      expect(result.buildingAge).toBeGreaterThan(0);
      expect(result.landRightArea).toBeGreaterThan(0);
      expect(result.totalSelf).toBeGreaterThan(0);
      expect(result.totalRental).toBeGreaterThan(0);
    });

    test('築年数が正しく計算される', () => {
      const result = calculateValuation(validInput);
      // 2025 - 2010 + 1 = 16年
      expect(result.buildingAge).toBe(16);
    });

    test('敷地利用権の面積が正しく計算される', () => {
      const result = calculateValuation(validInput);
      // 1000 * (1/100) = 10.00
      expect(result.landRightArea).toBe(10.00);
    });
  });

  // エッジケーステスト
  describe('エッジケース', () => {
    test('最小値での計算', () => {
      const minInput: FormInput = {
        inheritanceDate: '2025-01-01',
        constructionDate: '2024-01-01',
        totalFloors: 1,
        floor: 1,
        exclusiveArea: 0.01,
        landArea: 0.01,
        landShareNumerator: 1,
        landShareDenominator: 1,
        buildingPrice: 1,
        roadPrice: 1,
        roadPriceRate: 1.0,
        leaseholdRate: 0.3,
        rentalRate: 0,
      };

      const result = calculateValuation(minInput);
      expect(result).toBeDefined();
      expect(result.buildingAge).toBe(2); // 2025 - 2024 + 1
    });

    test('地階（floor = 0）での計算', () => {
      const basementInput: FormInput = {
        inheritanceDate: '2025-01-01',
        constructionDate: '2020-01-01',
        totalFloors: 10,
        floor: 0, // 地階
        exclusiveArea: 100,
        landArea: 1000,
        landShareNumerator: 1,
        landShareDenominator: 10,
        buildingPrice: 1000000,
        roadPrice: 50000,
        roadPriceRate: 1.0,
        leaseholdRate: 0.5,
        rentalRate: 50,
      };

      const result = calculateValuation(basementInput);
      expect(result).toBeDefined();
      // 地階の場合、C = 0 になることを確認
      expect(result.details.C).toBe(0);
    });
  });

  // エラーケーステスト
  describe('エラーケース', () => {
    test('無効な日付での計算', () => {
      const invalidDateInput: FormInput = {
        inheritanceDate: 'invalid-date',
        constructionDate: '2020-01-01',
        totalFloors: 10,
        floor: 5,
        exclusiveArea: 100,
        landArea: 1000,
        landShareNumerator: 1,
        landShareDenominator: 10,
        buildingPrice: 1000000,
        roadPrice: 50000,
        roadPriceRate: 1.0,
        leaseholdRate: 0.5,
        rentalRate: 50,
      };

      // 無効な日付でもエラーを投げずに計算を続行することを確認
      expect(() => calculateValuation(invalidDateInput)).not.toThrow();
    });
  });
}); 