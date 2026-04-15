"use client";
import { useState, useMemo, useCallback } from "react";
import { FormInput, ResultWithDetails } from "../types";
import { rootAgent } from "../agents/root-agent";

interface FormState {
  inheritanceDate: string;
  constructionDate: string;
  totalFloors: number;
  floor: number;
  exclusiveArea: string;
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
  exclusiveArea: "",
  landArea: "",
  landShareNumerator: "",
  landShareDenominator: "",
  buildingPrice: "",
  roadPrice: "",
  roadPriceRate: 1.0,
  leaseholdRate: 0.5,
  rentalRate: 100,
};

const LEASEHOLD_RATES = [
  { label: "A", rate: 0.9 },
  { label: "B", rate: 0.8 },
  { label: "C", rate: 0.7 },
  { label: "D", rate: 0.6 },
  { label: "E", rate: 0.5 },
  { label: "F", rate: 0.4 },
  { label: "G", rate: 0.3 },
] as const;

function formatComma(val: string | number): string {
  const raw = typeof val === "string" ? val.replace(/,/g, "") : String(val);
  const n = Number(raw);
  if (raw === "" || isNaN(n)) return "";
  return n.toLocaleString();
}

function formatLandAreaDisplay(val: string): string {
  const n = Number(val.replace(/,/g, ""));
  if (isNaN(n) || val === "") return "";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 pb-2 border-b-2 border-blue-200">
      <h3 className="text-base font-bold text-blue-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ htmlFor, label, hint }: { htmlFor: string; label: string; hint?: string }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor={htmlFor}>
      {label}
      {hint && <span className="text-xs font-normal text-gray-400 ml-2">{hint}</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2.5 rounded-lg border bg-white text-gray-900 text-sm shadow-sm transition
   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
   ${hasError ? "border-red-400" : "border-gray-300"}`;

export default function InputForm({ onResult }: { onResult: (result: ResultWithDetails | null) => void }) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [landAreaFocused, setLandAreaFocused] = useState(false);

  const handleCommaInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "landArea") {
      const raw = value.replace(/,/g, "");
      let sanitized = raw.replace(/[^\d.]/g, "");
      const parts = sanitized.split(".");
      if (parts.length > 2) {
        sanitized = parts[0] + "." + parts.slice(1).join("");
      }
      sanitized = sanitized.replace(/^(\d+)(\.(\d{0,2})).*$/, "$1$2");
      setForm((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^\d]/g, "") }));
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "inheritanceDate" || name === "constructionDate") {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
    }
  }, []);

  const getNumericForm = useCallback((): FormInput => ({
    inheritanceDate: form.inheritanceDate,
    constructionDate: form.constructionDate,
    totalFloors: form.totalFloors,
    floor: form.floor,
    exclusiveArea: form.exclusiveArea ? Number(form.exclusiveArea) : 0,
    landArea: form.landArea ? Number(form.landArea.replace(/,/g, "")) : 0,
    landShareNumerator: Number((form.landShareNumerator || "0").replace(/,/g, "")),
    landShareDenominator: Number((form.landShareDenominator || "0").replace(/,/g, "")) || 1,
    buildingPrice: Number((form.buildingPrice || "0").replace(/,/g, "")),
    roadPrice: Number((form.roadPrice || "0").replace(/,/g, "")),
    roadPriceRate: form.roadPriceRate,
    leaseholdRate: form.leaseholdRate,
    rentalRate: form.rentalRate,
  }), [form]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const numericForm = getNumericForm();
    const res = rootAgent(numericForm);
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
  }, [getNumericForm, onResult]);

  const handleReset = useCallback(() => {
    setForm(initialFormState);
    setErrors({});
    onResult(null);
  }, [onResult]);

  // 築年数（タイムゾーンの影響を避けるため文字列から直接パース）
  const buildingAge = useMemo(() => {
    if (!form.inheritanceDate || !form.constructionDate) return null;
    const cp = form.constructionDate.split("-").map(Number);
    const ip = form.inheritanceDate.split("-").map(Number);
    if (cp.some(isNaN) || ip.some(isNaN)) return null;
    const [cY, cM, cD] = cp;
    const [iY, iM, iD] = ip;
    let years = iY - cY;
    if (iM < cM || (iM === cM && iD < cD)) years--;
    if (iM !== cM || iD !== cD) years++;
    return Math.max(years, 1);
  }, [form.inheritanceDate, form.constructionDate]);

  // 敷地権割合（％）
  const landSharePercent = useMemo(() => {
    const num = Number((form.landShareNumerator || "0").replace(/,/g, ""));
    const denom = Number((form.landShareDenominator || "0").replace(/,/g, ""));
    if (!num || !denom) return null;
    return ((num / denom) * 100).toFixed(4);
  }, [form.landShareNumerator, form.landShareDenominator]);

  // 敷地利用権の面積
  const landRightArea = useMemo(() => {
    const area = Number((form.landArea || "0").replace(/,/g, ""));
    const num = Number((form.landShareNumerator || "0").replace(/,/g, ""));
    const denom = Number((form.landShareDenominator || "0").replace(/,/g, ""));
    if (!area || !num || !denom) return null;
    return area * (num / denom);
  }, [form.landArea, form.landShareNumerator, form.landShareDenominator]);

  // 従来の敷地利用権の価格（土地）
  const landRightPrice = useMemo(() => {
    if (landRightArea === null || !form.roadPrice) return null;
    return Math.floor(Number((form.roadPrice || "0").replace(/,/g, "")) * landRightArea);
  }, [form.roadPrice, landRightArea]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 p-6 md:p-8 bg-white rounded-2xl shadow-lg max-w-2xl w-full mx-auto border border-gray-200">

      {/* 基本情報 */}
      <section>
        <SectionHeader title="基本情報" subtitle="被相続人の死亡日と建物の新築年月日を入力" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="inheritanceDate" label="相続開始日" hint="被相続人の死亡日" />
            <input id="inheritanceDate" type="date" name="inheritanceDate" value={form.inheritanceDate} onChange={handleChange} className={inputClass(!!errors.inheritanceDate)} />
            <FieldError message={errors.inheritanceDate} />
          </div>
          <div>
            <FieldLabel htmlFor="constructionDate" label="新築年月日" hint="登記簿を参照" />
            <input id="constructionDate" type="date" name="constructionDate" value={form.constructionDate} onChange={handleChange} className={inputClass(!!errors.constructionDate)} />
            <FieldError message={errors.constructionDate} />
          </div>
        </div>
        {buildingAge !== null && (
          <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg text-sm">
            <span className="text-gray-600">築年数: </span>
            <span className="font-bold text-blue-800">{buildingAge} 年</span>
            <span className="text-xs text-gray-400 ml-2">（1年未満の端数は1年に切上げ）</span>
          </div>
        )}
      </section>

      {/* 建物情報 */}
      <section>
        <SectionHeader title="建物情報" subtitle="登記簿謄本の情報を入力" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel htmlFor="totalFloors" label="総階数" />
            <input id="totalFloors" type="number" name="totalFloors" value={form.totalFloors} onChange={handleChange} className={inputClass(!!errors.totalFloors)} min={1} inputMode="numeric" />
            <FieldError message={errors.totalFloors} />
          </div>
          <div>
            <FieldLabel htmlFor="floor" label="所在階" hint="地階は0" />
            <input id="floor" type="number" name="floor" value={form.floor} onChange={handleChange} className={inputClass(!!errors.floor)} min={0} inputMode="numeric" />
            <FieldError message={errors.floor} />
          </div>
          <div>
            <FieldLabel htmlFor="exclusiveArea" label="専有面積 (m²)" />
            <input id="exclusiveArea" type="number" name="exclusiveArea" value={form.exclusiveArea} onChange={handleChange} className={inputClass(!!errors.exclusiveArea)} step="0.01" placeholder="63.26" inputMode="decimal" />
            <FieldError message={errors.exclusiveArea} />
          </div>
        </div>
      </section>

      {/* 土地・敷地情報 */}
      <section>
        <SectionHeader title="土地・敷地情報" subtitle="登記簿謄本と路線価図から入力" />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <FieldLabel htmlFor="landArea" label="敷地の面積 (m²)" />
            <input
              id="landArea"
              type="text"
              name="landArea"
              value={landAreaFocused ? form.landArea : formatLandAreaDisplay(form.landArea)}
              onChange={handleCommaInput}
              onFocus={() => setLandAreaFocused(true)}
              onBlur={() => setLandAreaFocused(false)}
              className={inputClass(!!errors.landArea)}
              placeholder="1,306.00"
              inputMode="decimal"
            />
            <FieldError message={errors.landArea} />
          </div>

          <div>
            <FieldLabel htmlFor="landShareNumerator" label="敷地権の割合" hint="登記簿に記載の分子/分母" />
            <div className="flex items-center gap-2">
              <input
                id="landShareNumerator"
                type="text"
                name="landShareNumerator"
                value={formatComma(form.landShareNumerator)}
                onChange={handleCommaInput}
                className={`${inputClass(!!errors.landShareNumerator)} text-center`}
                placeholder="6,608"
                inputMode="numeric"
                style={{ maxWidth: "140px" }}
              />
              <span className="font-bold text-gray-500 text-lg">/</span>
              <input
                id="landShareDenominator"
                type="text"
                name="landShareDenominator"
                value={formatComma(form.landShareDenominator)}
                onChange={handleCommaInput}
                className={`${inputClass(!!errors.landShareDenominator)} text-center`}
                placeholder="369,648"
                inputMode="numeric"
                style={{ maxWidth: "140px" }}
              />
              {landSharePercent !== null && (
                <span className="text-xs text-gray-500 whitespace-nowrap">= {landSharePercent}%</span>
              )}
            </div>
            <FieldError message={errors.landShareNumerator || errors.landShareDenominator} />
          </div>

          {landRightArea !== null && (
            <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm">
              <span className="text-gray-600">敷地利用権の面積: </span>
              <span className="font-bold text-blue-800">
                {landRightArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} m²
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="roadPrice" label="前面路線価 (円/m²)" hint="路線価図を参照" />
              <input id="roadPrice" type="text" name="roadPrice" value={formatComma(form.roadPrice)} onChange={handleCommaInput} className={inputClass(!!errors.roadPrice)} placeholder="68,000" inputMode="numeric" />
              <FieldError message={errors.roadPrice} />
            </div>
            <div>
              <FieldLabel htmlFor="roadPriceRate" label="路線価調整率" hint="奥行等の調整なし" />
              <input id="roadPriceRate" type="number" name="roadPriceRate" value={form.roadPriceRate} readOnly className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 text-sm cursor-not-allowed" />
            </div>
          </div>

          {landRightPrice !== null && (
            <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm">
              <span className="text-gray-600">従来の敷地利用権の価格（土地）: </span>
              <span className="font-bold text-blue-800">{landRightPrice.toLocaleString()} 円</span>
            </div>
          )}
        </div>
      </section>

      {/* 価格情報 */}
      <section>
        <SectionHeader title="建物価格" />
        <div>
          <FieldLabel htmlFor="buildingPrice" label="従来の区分所有権の価格 (円)" hint="固定資産税評価額" />
          <input id="buildingPrice" type="text" name="buildingPrice" value={formatComma(form.buildingPrice)} onChange={handleCommaInput} className={inputClass(!!errors.buildingPrice)} placeholder="6,148,686" inputMode="numeric" />
          <FieldError message={errors.buildingPrice} />
        </div>
      </section>

      {/* 賃貸情報 */}
      <section>
        <SectionHeader title="賃貸情報" subtitle="賃貸している場合の評価に使用" />
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="leaseholdRate" label="借地権割合" hint="路線価図のアルファベット記号" />
            <div className="flex flex-wrap gap-1.5 mt-1">
              {LEASEHOLD_RATES.map(({ label, rate }) => (
                <button
                  type="button"
                  key={rate}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition
                    ${form.leaseholdRate === rate
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  onClick={() => setForm((prev) => ({ ...prev, leaseholdRate: rate }))}
                >
                  {label} {Math.round(rate * 100)}%
                </button>
              ))}
            </div>
            <FieldError message={errors.leaseholdRate} />
          </div>
          <div>
            <FieldLabel htmlFor="rentalRate" label="賃貸割合 (%)" hint="相続時に賃貸されている面積割合" />
            <input id="rentalRate" type="number" name="rentalRate" value={form.rentalRate} onChange={handleChange} className={inputClass(!!errors.rentalRate)} min={0} max={100} placeholder="100" inputMode="decimal" />
            <FieldError message={errors.rentalRate} />
          </div>
        </div>
      </section>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 h-12 text-base rounded-xl bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 active:bg-blue-800 transition"
        >
          計算する
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 h-12 text-base rounded-xl bg-gray-100 text-gray-600 font-semibold border border-gray-300 hover:bg-gray-200 active:bg-gray-300 transition"
        >
          クリア
        </button>
      </div>
    </form>
  );
}
