import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';

const LeadsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Leads</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">This section is under active development.</p>
        <div className="inline-flex items-center space-x-3 px-5 py-3 rounded-xl bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span>Working in progress...</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;


