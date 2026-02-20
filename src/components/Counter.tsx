import { useState, useEffect, useMemo, useCallback, memo } from "react";

// Heavy Process
function heavyCalc(item: any) {
  let sum = 0;
  for (let i = 0; i < 50_000_000; i++) {
    sum += i * item.value;
  }
  return sum;
}

// ✅ Fix 4: memo → فقط وقتی props واقعاً عوض بشه re-render میشه
const ItemCard = memo(({ item, onSelect }: any) => {
  useEffect(() => {
    console.log("Rendering item:", item.id);
  }, []); // این log فقط mount اول رو نشون میده

  return (
    <div
      onClick={() => onSelect(item.id)}
      className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 cursor-pointer transition-colors hover:bg-zinc-800 hover:border-zinc-700"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">
          {item.name}
        </p>
        <p className="text-xs text-zinc-500">Click to select</p>
      </div>
      <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-200">
        Value: {item.value}
      </span>
    </div>
  );
});

export default function Counter() {
  const [items, setItems] = useState<any>([
    { id: 1, name: "Apple", value: 10 },
    { id: 2, name: "Orange", value: 15 },
    { id: 3, name: "Banana", value: 8 },
  ]);

  const [count, setCount] = useState(0);

  // ✅ Fix 1: dependency array خالی → فقط یکبار mount اجرا میشه (اگه واقعاً نیاز بود)
  // اگه هدف شمارش رندرها بود → useRef بدون re-render
  // useEffect(() => { setCount(c => c + 1); }, []); ← یکبار اجرا

  // ✅ Fix 2: useMemo → فقط وقتی items عوض بشه محاسبه سنگین دوباره اجرا میشه
  const totalValue = useMemo(
    () => items.reduce((sum: any, item: any) => sum + heavyCalc(item), 0),
    [items]
  );

  // ✅ Fix 3: useCallback → reference ثابت بین رندرها، memo روی ItemCard کار میکنه
  const handleSelect = useCallback(
    (id: any) => {
      console.log("Selected item with current count:", id, "count:", count);
    },
    [count]
  ); // اگه به count نیاز نداره → dependency array خالی

  // ✅ Fix 5: کلون بی‌دلیل حذف شد

  return (
    <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500">Count</p>
          <p className="text-3xl font-bold tracking-tight text-zinc-100">
            {count}
          </p>
        </div>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-500 active:bg-emerald-700"
        >
          Increment
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs text-zinc-500">Total Value</p>
        <p className="text-lg font-semibold text-zinc-100">{totalValue}</p>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item: any) => (
          <ItemCard key={item.id} item={item} onSelect={handleSelect} />
        ))}
      </div>

      <button
        onClick={() =>
          setItems((prev: any) => [
            {
              id: Date.now(),
              name: "Coconut",
              value: Math.floor(Math.random() * 100),
            },
            ...prev,
          ])
        }
        className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 hover:border-zinc-700 active:bg-zinc-900"
      >
        Add Coconut
      </button>
    </div>
  );
}
