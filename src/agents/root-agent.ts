import { FormInput } from '../types';
import { calculationAgent } from './calculation-agent';
import { validationAgent } from './validation-agent';

/**
 * root-agent: バリデーション→計算のフロー管理
 */
export function rootAgent(input: FormInput) {
  const validation = validationAgent(input);
  if (!validation.success) {
    return { error: validation.error.format() };
  }
  const result = calculationAgent(input);
  return { result };
} 