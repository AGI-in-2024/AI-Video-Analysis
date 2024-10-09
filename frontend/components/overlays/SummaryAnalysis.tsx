import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

function SummaryAnalysis() {
  // Remove the state for showing summary
  // const [showSummary, setShowSummary] = useState(false);

  // Example data (replace with your actual data)
  const totalRevenue = 1000000;
  const revenueChange = 5.2;
  const activeUsers = 50000;
  const userChange = -2.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Summary Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change={revenueChange}
        />
        <AnalysisCard
          title="Active Users"
          value={activeUsers.toLocaleString()}
          change={userChange}
        />
      </div>

      {/* Add more analysis content here */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Detailed Insights</h3>
        {/* Add charts, graphs, or additional analysis here */}
      </div>
    </motion.div>
  );
}

function AnalysisCard({ title, value, change }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-100 p-4 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
      <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
        <span className="font-semibold">{Math.abs(change)}%</span>
      </div>
    </motion.div>
  );
}

export default SummaryAnalysis;