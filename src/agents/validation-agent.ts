import { FormInput } from '../types';
import { validateFormInput } from '../utils/validations';

/**
 * バリデーションエージェント: 入力値をZodで検証
 */
export function validationAgent(input: FormInput) {
  return validateFormInput(input);
} 