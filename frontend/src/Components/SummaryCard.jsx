function SummaryCard({ title, value, icon, color = "purple" }) {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-amber-500",
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg transition hover:shadow-purple-500/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              colorClasses[color] || colorClasses.purple
            } flex items-center justify-center text-2xl`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryCard;
