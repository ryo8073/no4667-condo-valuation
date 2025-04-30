"use client";
import { useState, useMemo } from "react";
import { FormInput } from "../types";
import { CalculationResult } from "../types";
import { rootAgent } from "../agents/root-agent";

// 敷地面積・分子・分母はstringで管理
interface FormState {
  inheritanceDate: string;
  constructionDate: string;
  totalFloors: number;
  floor: number;
  exclusiveArea: number;
  landArea: string;
  landShareNumerator: string;
  landShareDenominator: string;
  buildingPrice: string;
  roadPrice: string;
  roadPriceRate: number;
  leaseholdRate: number;
  rentalRate: number;
}

const initialFormState: FormState = {
  inheritanceDate: "",
  constructionDate: "",
  totalFloors: 10,
  floor: 1,
  exclusiveArea: 0,
  landArea: "0",
  landShareNumerator: "1",
  landShareDenominator: "1",
  buildingPrice: "0",
  roadPrice: "0",
  roadPriceRate: 1.0,
  leaseholdRate: 0.5,
  rentalRate: 100,
};

const leaseholdOptions = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

export default function InputForm({ onResult }: { onResult: (result: CalculationResult | null) => void }) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // カンマ区切り入力用onChange
  const handleCommaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.replace(/[^\d]/g, "") }));
  };

  // 通常の数値入力
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "inheritanceDate" || name === "constructionDate") {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    }
  };

  const handleLeaseholdClick = (rate: number) => {
    setForm((prev) => ({ ...prev, leaseholdRate: rate }));
  };

  // 計算用に数値へ変換
  const getNumericForm = (): FormInput => ({
    inheritanceDate: form.inheritanceDate,
    constructionDate: form.constructionDate,
    totalFloors: form.totalFloors,
    floor: form.floor,
    exclusiveArea: form.exclusiveArea,
    landArea: Number(form.landArea.replace(/,/g, "")),
    landShareNumerator: Number(form.landShareNumerator.replace(/,/g, "")),
    landShareDenominator: Number(form.landShareDenominator.replace(/,/g, "")),
    buildingPrice: Number(form.buildingPrice.replace(/,/g, "")),
    roadPrice: Number(form.roadPrice.replace(/,/g, "")),
    roadPriceRate: form.roadPriceRate,
    leaseholdRate: form.leaseholdRate,
    rentalRate: form.rentalRate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = rootAgent(getNumericForm());
    if (res.error) {
      setErrors(
        Object.fromEntries(
          Object.entries(res.error).map(([k, v]) => [k, (v as { _errors?: string[] })?._errors?.[0] || ""])
        )
      );
      onResult(null);
    } else {
      setErrors({});
      onResult(res.result);
    }
  };

  // 築年数
  const buildingAge = useMemo(() => {
    if (!form.inheritanceDate || !form.constructionDate) return "";
    const y1 = new Date(form.inheritanceDate).getFullYear();
    const y2 = new Date(form.constructionDate).getFullYear();
    if (isNaN(y1) || isNaN(y2)) return "";
    return y1 - y2 + 1;
  }, [form.inheritanceDate, form.constructionDate]);

  // 敷地権割合（％）
  const landSharePercent = useMemo(() => {
    const num = Number(form.landShareNumerator.replace(/,/g, ""));
    const denom = Number(form.landShareDenominator.replace(/,/g, ""));
    if (!num || !denom) return "";
    return ((num / denom) * 100).toFixed(2);
  }, [form.landShareNumerator, form.landShareDenominator]);

  // 敷地利用権の面積
  const landRightArea = useMemo(() => {
    const area = Number(form.landArea.replace(/,/g, ""));
    const num = Number(form.landShareNumerator.replace(/,/g, ""));
    const denom = Number(form.landShareDenominator.replace(/,/g, ""));
    if (!area || !num || !denom) return "";
    return (area * (num / denom)).toFixed(2);
  }, [form.landArea, form.landShareNumerator, form.landShareDenominator]);

  // 従来の敷地権の価格（土地）
  const landRightPrice = useMemo(() => {
    if (!landRightArea || !form.roadPrice) return "";
    return (Number(form.roadPrice) * Number(landRightArea)).toLocaleString();
  }, [form.roadPrice, landRightArea]);

  // カンマ区切り表示
  const formatCommaNumber = (val: string | number) => {
    const n = typeof val === "string" ? Number(val.replace(/,/g, "")) : val;
    return isNaN(n) ? "" : n.toLocaleString();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-md max-w-lg w-full mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">相続開始日</label>
          <input type="date" name="inheritanceDate" value={form.inheritanceDate} onChange={handleChange} className={`input${errors.inheritanceDate ? ' border-red-400' : ''}`} />
          {errors.inheritanceDate && <span className="text-red-500 text-xs mt-1 block">{errors.inheritanceDate}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">新築年月日</label>
          <input type="date" name="constructionDate" value={form.constructionDate} onChange={handleChange} className={`input${errors.constructionDate ? ' border-red-400' : ''}`} />
          {errors.constructionDate && <span className="text-red-500 text-xs mt-1 block">{errors.constructionDate}</span>}
          {buildingAge !== "" && <span className="text-lg text-blue-700 font-bold mt-2 block">築年数: {buildingAge} 年</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">総階数</label>
          <input type="number" name="totalFloors" value={form.totalFloors} onChange={handleChange} className={`input${errors.totalFloors ? ' border-red-400' : ''}`} min={1} />
          {errors.totalFloors && <span className="text-red-500 text-xs mt-1 block">{errors.totalFloors}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">所在階</label>
          <input type="number" name="floor" value={form.floor} onChange={handleChange} className={`input${errors.floor ? ' border-red-400' : ''}`} min={0} max={form.totalFloors} />
          {errors.floor && <span className="text-red-500 text-xs mt-1 block">{errors.floor}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">専有部分の面積(㎡)</label>
          <input type="number" name="exclusiveArea" value={form.exclusiveArea} onChange={handleChange} className={`input${errors.exclusiveArea ? ' border-red-400' : ''}`} min={0} step="0.01" />
          {errors.exclusiveArea && <span className="text-red-500 text-xs mt-1 block">{errors.exclusiveArea}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">敷地の面積(㎡)</label>
          <input type="text" name="landArea" value={formatCommaNumber(form.landArea)} onChange={handleCommaInput} className={`input${errors.landArea ? ' border-red-400' : ''}`} min={0} step="0.01" />
          {errors.landArea && <span className="text-red-500 text-xs mt-1 block">{errors.landArea}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">敷地権の割合</label>
          <div className="flex items-center gap-2">
            <input type="text" name="landShareNumerator" value={formatCommaNumber(form.landShareNumerator)} onChange={handleCommaInput} className={`input w-20${errors.landShareNumerator ? ' border-red-400' : ''}`} min={1} />
            <span>/</span>
            <input type="text" name="landShareDenominator" value={formatCommaNumber(form.landShareDenominator)} onChange={handleCommaInput} className={`input w-20${errors.landShareDenominator ? ' border-red-400' : ''}`} min={1} />
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {formatCommaNumber(form.landShareNumerator)} / {formatCommaNumber(form.landShareDenominator)}
            {landSharePercent !== "" && <>（{landSharePercent}%）</>}
          </span>
          {(errors.landShareNumerator || errors.landShareDenominator) && <span className="text-red-500 text-xs mt-1 block">{errors.landShareNumerator || errors.landShareDenominator}</span>}
          {landRightArea !== "" && (
            <div className="text-base text-blue-700 font-bold mt-2">敷地利用権の面積: {Number(landRightArea).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ㎡</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">従来の区分所有権の価格（建物）<span className="text-xs text-gray-500 ml-1">（固定資産税評価）</span></label>
          <input type="text" name="buildingPrice" value={formatCommaNumber(form.buildingPrice)} onChange={handleCommaInput} className={`input${errors.buildingPrice ? ' border-red-400' : ''}`} min={0} />
          {errors.buildingPrice && <span className="text-red-500 text-xs mt-1 block">{errors.buildingPrice}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">前面路線価(円)</label>
          <input type="text" name="roadPrice" value={formatCommaNumber(form.roadPrice)} onChange={handleCommaInput} className={`input${errors.roadPrice ? ' border-red-400' : ''}`} min={0} />
          {errors.roadPrice && <span className="text-red-500 text-xs mt-1 block">{errors.roadPrice}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">路線価調整率</label>
          <input type="number" name="roadPriceRate" value={form.roadPriceRate} readOnly className="input bg-gray-100 cursor-not-allowed" />
          <span className="text-xs text-gray-500">1で固定</span>
          {landRightPrice !== "" && (
            <div className="text-base text-blue-700 font-bold mt-2">従来の敷地利用権の価格（土地）: {landRightPrice} 円</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">借地権割合</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {leaseholdOptions.map((rate) => (
              <button
                type="button"
                key={rate}
                className={`px-3 py-2 rounded border ${form.leaseholdRate === rate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'} font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400`}
                onClick={() => handleLeaseholdClick(rate)}
              >
                {Math.round(rate * 100)}%
              </button>
            ))}
          </div>
          {errors.leaseholdRate && <span className="text-red-500 text-xs mt-1 block">{errors.leaseholdRate}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">賃貸割合（%）</label>
          <input type="number" name="rentalRate" value={form.rentalRate} onChange={handleChange} className="input" min={0} max={100} />
          {errors.rentalRate && <span className="text-red-500 text-xs mt-1 block">{errors.rentalRate}</span>}
        </div>
      </div>
      <button type="submit" className="btn btn-primary w-full h-12 text-lg mt-2">計算する</button>
    </form>
  );
} 