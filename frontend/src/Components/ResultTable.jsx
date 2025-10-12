import React from "react";

export default function ResultTable({ data, dark }) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-auto mt-4 rounded-2xl shadow-inner">
      <table className={`min-w-full border-collapse rounded-xl ${dark ? "border-gray-600" : "border-gray-300"}`}>
        <thead>
          <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {columns.map(col => (
              <th
                key={col}
                className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={`transition hover:bg-gray-600 ${
                idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              {columns.map(col => {
                const value = row[col];
                return (
                  <td
                    key={col}
                    className="px-6 py-3 text-sm text-gray-200 border-b border-gray-600"
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
