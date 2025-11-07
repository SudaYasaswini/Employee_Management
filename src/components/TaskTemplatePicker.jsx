import React from "react";
import { Plus, Check } from "lucide-react";

export default function TaskTemplatePicker({ templates, selected, onSelect }) {
  if (!templates?.length)
    return <p className="text-sm text-gray-500">No templates found for this type.</p>;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {templates.map((t) => {
        const added = selected.includes(t.id);
        return (
          <div
            key={t.id}
            className={`border rounded-lg p-4 bg-white hover:shadow-sm transition ${
              added ? "ring-2 ring-blue-600" : ""
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-3">{t.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {t.defaultRole || "—"} • {t.defaultEstimateHours || "?"} hrs
              </span>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className={`text-sm px-2 py-1 border rounded-md ${
                  added
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                {added ? <Check className="inline w-4 h-4" /> : <Plus className="inline w-4 h-4" />}{" "}
                {added ? "Added" : "Add"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
