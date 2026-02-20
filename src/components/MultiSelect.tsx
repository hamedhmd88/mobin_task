import { useState, useEffect, useMemo } from "react";

/* =======================
   Types
======================= */

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  company: { name: string };
  address: { city: string };
}

interface MultiSelectProps<T> {
  items: T[];
  selectedItems: T[];
  onChange: (items: T[]) => void;
  identifier: keyof T;
  children: (props: {
    filteredItems: T[];
    selectedItems: T[];
    isSelected: (item: T) => boolean;
    toggle: (item: T) => void;
    clear: () => void;
    search: (query: string, fields: (keyof T)[]) => void;
  }) => React.ReactNode;
}

/* =======================
   Headless MultiSelect
======================= */

function MultiSelect<T>({
  items,
  selectedItems,
  onChange,
  identifier,
  children,
}: MultiSelectProps<T>) {
  const [query, setQuery] = useState("");
  const [searchFields, setSearchFields] = useState<(keyof T)[]>([]);

  const isSelected = (item: T) => {
    return selectedItems.some((s) => s[identifier] === item[identifier]);
  };

  const toggle = (item: T) => {
    if (isSelected(item)) {
      onChange(selectedItems.filter((s) => s[identifier] !== item[identifier]));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  const clear = () => {
    onChange([]);
  };

  const search = (q: string, fields: (keyof T)[]) => {
    setQuery(q);
    setSearchFields(fields);
  };

  const filteredItems = useMemo(() => {
    if (!query || searchFields.length === 0) {
      return items;
    }

    const lower = query.toLowerCase();

    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(lower);
      })
    );
  }, [items, query, searchFields]);

  return (
    <>
      {children({
        filteredItems,
        selectedItems,
        isSelected,
        toggle,
        clear,
        search,
      })}
    </>
  );
}

/* =======================
   App
======================= */

const PAGE_SIZE = 5;

export default function MultiSelectComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users", {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await res.json();

        setUsers(
          data.map((u: any) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            company: { name: u.company?.name || "" },
            address: { city: u.address?.city || "" },
          }))
        );
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError("خطا در دریافت دیتا");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();

    return () => controller.abort();
  }, []);

  const visibleCount = expanded ? users.length : PAGE_SIZE;

  return (
    <div className="w-full bg-zinc-950 text-white flex items-center justify-center p-8 font-mono">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-emerald-400 mb-1">
          Headless MultiSelect
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          Simple · Reusable · Searchable
        </p>

        {loading && (
          <div className="space-y-2 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-zinc-800 rounded-xl"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="border border-red-800 bg-red-900/20 rounded-xl p-6 text-center">
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <MultiSelect<User>
            items={users.slice(0, visibleCount)}
            selectedItems={selected}
            onChange={setSelected}
            identifier="id"
          >
            {({
              filteredItems,
              isSelected,
              toggle,
              clear,
              search,
              selectedItems,
            }) => (
              <div className="space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    onChange={(e) =>
                      search(e.target.value, ["name", "username", "email"])
                    }
                  />

                  {selectedItems.length > 0 && (
                    <button
                      onClick={clear}
                      className="px-3 py-2 text-xs text-red-400 border border-red-800 rounded-lg hover:bg-red-900/30"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Selected badges */}
                {selectedItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((user) => (
                      <span
                        key={user.id}
                        onClick={() => toggle(user)}
                        className="cursor-pointer px-3 py-1 bg-emerald-900/50 border border-emerald-600 text-emerald-300 text-xs rounded-full hover:bg-red-900/40 hover:border-red-600 hover:text-red-300"
                      >
                        {user.name} ✕
                      </span>
                    ))}
                  </div>
                )}

                {/* List */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
                  {filteredItems.length === 0 ? (
                    <p className="text-center py-8 text-zinc-600 text-sm">
                      No users found
                    </p>
                  ) : (
                    filteredItems.map((user) => {
                      const selected = isSelected(user);

                      return (
                        <div
                          key={user.id}
                          onClick={() => toggle(user)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
                            selected
                              ? "bg-emerald-900/20"
                              : "bg-zinc-900 hover:bg-zinc-800"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                              @{user.username} · {user.company.name}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded border ${
                              selected
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-zinc-600"
                            }`}
                          />
                        </div>
                      );
                    })
                  )}

                  {users.length > PAGE_SIZE && (
                    <button
                      onClick={() => setExpanded((p) => !p)}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 cursor-pointer hover:text-emerald-500 transition-all"
                    >
                      {expanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-600 text-right">
                  {selectedItems.length} of {users.length} selected
                </p>
              </div>
            )}
          </MultiSelect>
        )}
      </div>
    </div>
  );
}
