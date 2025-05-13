"use client";
import { useState, useMemo } from "react";
import { FormInput } from "../types";
import { ResultWithDetails } from "../types";
import { rootAgent } from "../agents/root-agent";
import Tooltip from "./tooltip";

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

export default function InputForm({ onResult }: { onResult: (result: ResultWithDetails | null) => void }) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // カンマ区切り入力用onChange
  const handleCommaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // landAreaのみ小数点2桁まで許可
    if (name === "landArea") {
      // カンマを除去
      const raw = value.replace(/,/g, "");
      // 数字と小数点のみ許可し、小数点以下2桁まで
      let sanitized = raw.replace(/[^\d.]/g, "");
      // 小数点が複数ある場合は最初の1つだけ残す
      const parts = sanitized.split('.');
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      }
      // 小数点以下2桁まで
      sanitized = sanitized.replace(/^(\d+)(\.(\d{0,2})).*$/, '$1$2');
      setForm((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^\d]/g, "") }));
    }
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
      onResult(res.result ?? null);
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

  // landArea専用のカンマ区切り+小数点2桁表示関数
  const formatLandArea = (val: string | number) => {
    const n = typeof val === "string" ? Number(val.replace(/,/g, "")) : val;
    return isNaN(n) ? "" : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // カンマ区切り表示（従来の）
  const formatCommaNumber = (val: string | number) => {
    const n = typeof val === "string" ? Number(val.replace(/,/g, "")) : val;
    return isNaN(n) ? "" : n.toLocaleString();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-blue-50 rounded-2xl shadow-xl max-w-lg w-full mx-auto border border-blue-100">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="inheritanceDate">
            相続開始日
            <Tooltip content={"被相続人の死亡した日を入力してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="inheritanceDate" type="date" name="inheritanceDate" value={form.inheritanceDate} onChange={handleChange} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.inheritanceDate ? ' border-red-400' : ''}`} placeholder="例: 2025-12-01" />
          {errors.inheritanceDate && <span className="text-red-500 text-xs mt-1 block">{errors.inheritanceDate}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="constructionDate">
            新築年月日
            <Tooltip content={"建物が完成した日を入力してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="constructionDate" type="date" name="constructionDate" value={form.constructionDate} onChange={handleChange} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.constructionDate ? ' border-red-400' : ''}`} placeholder="例: 2012-02-16" />
          {errors.constructionDate && <span className="text-red-500 text-xs mt-1 block">{errors.constructionDate}</span>}
          {buildingAge !== "" && <span className="text-lg text-blue-700 font-bold mt-2 block">築年数: {buildingAge} 年</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="totalFloors">
            総階数
            <Tooltip content={"登記簿謄本から参照してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="totalFloors" type="number" name="totalFloors" value={form.totalFloors} onChange={handleChange} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.totalFloors ? ' border-red-400' : ''}`} min={1} placeholder="例: 10" />
          {errors.totalFloors && <span className="text-red-500 text-xs mt-1 block">{errors.totalFloors}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="floor">
            所在階
            <Tooltip content={"登記簿謄本から参照してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="floor" type="number" name="floor" value={form.floor} onChange={handleChange} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.floor ? ' border-red-400' : ''}`} min={0} max={form.totalFloors} placeholder="例: 7" />
          {errors.floor && <span className="text-red-500 text-xs mt-1 block">{errors.floor}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="exclusiveArea">
            専有部分の面積(㎡)
            <Tooltip content={"登記簿謄本から参照してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="exclusiveArea" type="number" name="exclusiveArea" value={form.exclusiveArea} onChange={handleChange} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.exclusiveArea ? ' border-red-400' : ''}`} min={0} step="0.01" placeholder="例: 63.26" />
          {errors.exclusiveArea && <span className="text-red-500 text-xs mt-1 block">{errors.exclusiveArea}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="landArea">
            敷地の面積(㎡)
            <Tooltip content={"登記簿謄本から参照してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="landArea" type="text" name="landArea" value={formatLandArea(form.landArea)} onChange={handleCommaInput} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.landArea ? ' border-red-400' : ''}`} min={0} step="0.01" placeholder="例: 1306.00" />
          {errors.landArea && <span className="text-red-500 text-xs mt-1 block">{errors.landArea}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="landShareNumerator">
            敷地権の割合
            <Tooltip content={"登記簿謄本に記載の敷地権割合（例：6608 / 369648）\n分子・分母ともに入力してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <div className="flex items-center gap-2">
            <input id="landShareNumerator" type="text" name="landShareNumerator" value={formatCommaNumber(form.landShareNumerator)} onChange={handleCommaInput} className={`p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition w-24 ${errors.landShareNumerator ? ' border-red-400' : ''}`} min={1} placeholder="分子 例: 6608" />
            <span className="font-bold text-lg text-gray-700">/</span>
            <input id="landShareDenominator" type="text" name="landShareDenominator" value={formatCommaNumber(form.landShareDenominator)} onChange={handleCommaInput} className={`p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition w-24 ${errors.landShareDenominator ? ' border-red-400' : ''}`} min={1} placeholder="分母 例: 369648" />
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
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="buildingPrice">
            従来の区分所有権の価格（建物）
            <Tooltip content={"固定資産税評価額を入力してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
            <span className="text-xs text-gray-500 ml-1">（固定資産税評価）</span>
          </label>
          <input id="buildingPrice" type="text" name="buildingPrice" value={formatCommaNumber(form.buildingPrice)} onChange={handleCommaInput} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.buildingPrice ? ' border-red-400' : ''}`} min={0} placeholder="例: 6148686" />
          {errors.buildingPrice && <span className="text-red-500 text-xs mt-1 block">{errors.buildingPrice}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="roadPrice">
            前面路線価(円)
            <Tooltip content={"国税庁全国路線価図を参照してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="roadPrice" type="text" name="roadPrice" value={formatCommaNumber(form.roadPrice)} onChange={handleCommaInput} className={`w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.roadPrice ? ' border-red-400' : ''}`} min={0} placeholder="例: 68000" />
          {errors.roadPrice && <span className="text-red-500 text-xs mt-1 block">{errors.roadPrice}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="roadPriceRate">
            路線価調整率
            <Tooltip content={"奥行、間口等の調整はしない（1で固定）"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="roadPriceRate" type="number" name="roadPriceRate" value={form.roadPriceRate} readOnly className="w-full p-3 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed" />
          <span className="text-xs text-gray-500">1で固定</span>
          {landRightPrice !== "" && (
            <div className="text-base text-blue-700 font-bold mt-2">従来の敷地利用権の価格（土地）: {landRightPrice} 円</div>
          )}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="leaseholdRate">
            賃貸している場合、借地権割合
            <Tooltip content={"A:90% B:80% C:70% D:60% E:50% F:40% G:30%\n該当する割合を選択してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[0.9,0.8,0.7,0.6,0.5,0.4,0.3].map((rate, idx) => (
              <button
                type="button"
                key={rate}
                className={`px-4 py-2 rounded-lg border font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${form.leaseholdRate === rate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                onClick={() => handleLeaseholdClick(rate)}
              >
                {String.fromCharCode(65+idx)}{Math.round(rate*100)}%
              </button>
            ))}
          </div>
          {errors.leaseholdRate && <span className="text-red-500 text-xs mt-1 block">{errors.leaseholdRate}</span>}
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2 flex items-center gap-1" htmlFor="rentalRate">
            賃貸割合（%）
            <Tooltip content={"全国路線価図に表示。\n相続時に実際に賃貸されている面積割合を入力してください。"}>
              <span className="ml-1 text-blue-600 cursor-pointer font-bold border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center bg-white">？</span>
            </Tooltip>
          </label>
          <input id="rentalRate" type="number" name="rentalRate" value={form.rentalRate} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" min={0} max={100} placeholder="例: 100" />
          {errors.rentalRate && <span className="text-red-500 text-xs mt-1 block">{errors.rentalRate}</span>}
        </div>
      </div>
      <button type="submit" className="w-full h-14 text-lg mt-4 rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition">計算する</button>
      <p className="text-sm text-gray-500 mt-4 text-center">計算ボタンを押すと、下記に計算結果が表示されます</p>
    </form>
  );
} 