import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMaintenance } from '../contexts/MaintenanceContext';

const AdminMaintenance: React.FC = () => {
  const { isMaintenanceMode, toggleMaintenanceMode, setMaintenanceMode, isLoading, refreshMaintenanceMode } = useMaintenance();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">
          {isMaintenanceMode 
            ? 'Are you sure you want to disable maintenance mode?' 
            : 'Are you sure you want to enable maintenance mode?'}
        </p>
        <p className="text-sm text-gray-600">
          {isMaintenanceMode
            ? 'This will make the site accessible to all visitors.'
            : 'This will show the maintenance page to all visitors except admins.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                setIsSaving(true);
                await toggleMaintenanceMode();
                await refreshMaintenanceMode();
                toast.success(`Maintenance mode ${isMaintenanceMode ? 'disabled' : 'enabled'} successfully!`)
              } catch (error) {
                toast.error('Failed to update maintenance mode. Please try again.');
                console.error('Error toggling maintenance mode:', error);
              } finally {
                setIsSaving(false);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 15000,
      icon: '⚠️'
    })
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-ocean-800 to-forest-800 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Site Maintenance Control</h1>
            <p className="text-white/80">
              Manage maintenance mode for your website
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Status */}
            <div className="mb-8">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Status</h2>
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-lg font-medium text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isMaintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span className={`text-lg font-medium ${isMaintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                        {isMaintenanceMode ? 'Maintenance Mode Active' : 'Site Online'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {isMaintenanceMode 
                      ? 'Visitors see maintenance page' 
                      : 'All visitors can access the site'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status syncs across all devices
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Controls</h2>
              <div className="max-w-md">
                {/* Toggle Button */}
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {isMaintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isMaintenanceMode 
                      ? 'Turn off maintenance mode to make the site accessible to all visitors.'
                      : 'Turn on maintenance mode to show maintenance page to visitors while keeping admin access.'
                    }
                  </p>
                  <button
                    onClick={handleToggle}
                    disabled={isLoading || isSaving}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isMaintenanceMode
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      isMaintenanceMode ? '🟢 Disable Maintenance Mode' : '🔴 Enable Maintenance Mode'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">ℹ️ How Maintenance Mode Works</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• When enabled, only the homepage shows the maintenance page</li>
                <li>• All other pages remain accessible via direct URLs</li>
                <li>• Admin users can still access the admin panel at <code className="bg-blue-100 px-1 rounded">/admin</code></li>
                <li>• The maintenance page includes quick links to other pages</li>
                <li>• <strong>Status is saved in the database and syncs across all devices and browsers</strong></li>
                <li>• Changes are automatically detected every 30 seconds on all devices</li>
                <li>• You can toggle maintenance mode on/off at any time</li>
              </ul>
            </div>

            {/* Preview */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <span className="text-sm text-gray-600">
                    What visitors see when maintenance mode is {isMaintenanceMode ? 'enabled' : 'disabled'}
                  </span>
                </div>
                <div className="p-4">
                  {isMaintenanceMode ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔧</div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Homepage Maintenance Mode</h4>
                      <p className="text-gray-600">
                        Homepage shows maintenance page, other pages remain accessible via direct URLs
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">✅</div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Normal Site</h4>
                      <p className="text-gray-600">
                        All pages accessible normally including homepage
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMaintenance;
