import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'

function page() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Shipped Orders" />

      {/* Main Container Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        
        {/* Header Actions & Search Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-3">
                Shipped Order List
              </h3>
              <p className="text-md text-gray-500 dark:text-gray-400">
                Track your store&apos;s progress to boost your sales.
              </p>
            </div>
          
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-9 pr-4 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

    

      </div>
    </div>
  )
}

export default page