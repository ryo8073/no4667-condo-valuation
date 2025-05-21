import { calculateValuation } from './calculations';
import { FormInput } from '../types';

describe('calculateValuation', () => {
  const baseInput: FormInput = {
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

  it('正常な入力で正しい計算結果を返す', () => {
    const result = calculateValuation(baseInput);
    expect(result).toHaveProperty('sectionalBuildingPrice');
    expect(result).toHaveProperty('landRightValue');
    expect(result).toHaveProperty('totalSelf');
    expect(result).toHaveProperty('rentalBuildingPrice');
    expect(result).toHaveProperty('leasedLandValue');
    expect(result).toHaveProperty('totalRental');
    expect(result).toHaveProperty('details');
    // 端数処理の例
    expect(result.landRightArea).toBeCloseTo(23.35, 2); // 小数点2位切り上げ
    expect(result.details.C).toBeCloseTo(0.126, 3); // 小数点3位四捨五入
    expect(result.details.D).toBeLessThan(0); // Dは負値
  });

  it('敷地権割合が極端な場合も計算できる', () => {
    const input = { ...baseInput, landShareNumerator: 1, landShareDenominator: 1 };
    const result = calculateValuation(input);
    expect(result.landRightArea).toBeCloseTo(1306.00, 2);
  });

  it('floor=0（地階）でCが0になる', () => {
    const input = { ...baseInput, floor: 0 };
    const result = calculateValuation(input);
    expect(result.details.C).toBe(0);
  });

  it('総階数が33超でBが1*0.239で計算される', () => {
    const input = { ...baseInput, totalFloors: 40 };
    const result = calculateValuation(input);
    expect(result.details.B).toBeCloseTo(0.239, 3);
  });

  it('exclusiveArea=0やlandArea=0など異常値でNaNやInfinityにならない', () => {
    const input = { ...baseInput, exclusiveArea: 0 };
    const result = calculateValuation(input);
    expect(Number.isFinite(result.details.shareNarrownessDegree)).toBe(false);
  });

  it('借地権割合や賃貸割合が0でも計算できる', () => {
    const input = { ...baseInput, leaseholdRate: 0, rentalRate: 0 };
    const result = calculateValuation(input);
    expect(result.leasedLandValue).toBeCloseTo(result.landRightValue, 2);
  });

  it('借地権割合や賃貸割合が1でも計算できる', () => {
    const input = { ...baseInput, leaseholdRate: 1, rentalRate: 100 };
    const result = calculateValuation(input);
    expect(result.leasedLandValue).toBeLessThan(result.landRightValue);
  });
}); 