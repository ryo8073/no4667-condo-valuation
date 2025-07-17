import { z } from 'zod';
import { FormInput } from '../types';

export const formInputSchema = z.object({
  inheritanceDate: z.string().min(1, '相続開始日を入力してください'),
  constructionDate: z.string().min(1, '新築年月日を入力してください'),
  totalFloors: z.number().min(1, '総階数は1以上で入力してください'),
  floor: z.number().min(0, '所在階は0以上で入力してください'),
  exclusiveArea: z.number().gt(0, '専有部分の面積を入力してください'),
  landArea: z.number().gt(0, '敷地の面積を入力してください'),
  landShareNumerator: z.number().min(1, '敷地権の分子を入力してください'),
  landShareDenominator: z.number().min(1, '敷地権の分母を入力してください'),
  buildingPrice: z.number().min(0, '従来の区分所有権の価格を入力してください'),
  roadPrice: z.number().min(0, '前面路線価を入力してください'),
  roadPriceRate: z.number().min(0, '路線価調整率を入力してください'),
  leaseholdRate: z.number().min(0).max(1, '借地権割合は0〜1で入力してください'),
  rentalRate: z.number().min(0).max(100, '賃貸割合は0〜100で入力してください'),
});

export function validateFormInput(input: FormInput) {
  return formInputSchema.safeParse(input);
} 