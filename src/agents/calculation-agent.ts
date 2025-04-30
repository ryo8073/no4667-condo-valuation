import { FormInput, CalculationResult } from '../types';
import { calculateValuation } from '../utils/calculations';

/**
 * 計算エージェント: 入力値から評価額を計算
 */
export function calculationAgent(input: FormInput): CalculationResult {
  return calculateValuation(input);
} 