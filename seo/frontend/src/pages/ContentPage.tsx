import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import ContentCalendar from '../components/Content/ContentCalendar';

const ContentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Content Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your content schedule, track status, and collaborate with your team.</p>
        </div>

        <ContentCalendar />
      </div>
    </DashboardLayout>
  );
};

export default ContentPage;
