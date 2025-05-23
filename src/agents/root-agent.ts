import { FormInput } from '../types';
import { calculationAgent } from './calculation-agent';
import { validationAgent } from './validation-agent';
import { ResultWithDetails } from '../types';

/**
 * root-agent: バリデーション→計算のフロー管理
 */
export function rootAgent(input: FormInput): { result?: ResultWithDetails; error?: Record<string, unknown> } {
  const validation = validationAgent(input);
  if (!validation.success) {
    return { error: validation.error.format() as Record<string, unknown> };
  }
  const result = calculationAgent(input) as ResultWithDetails;
  return { result };
} 