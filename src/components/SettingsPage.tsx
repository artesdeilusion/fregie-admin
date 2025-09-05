"use client";

import { useState } from "react";
import { 
  Cog6ToothIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  BellIcon,
  // UserIcon, // Unused import
  // GlobeAltIcon, // Unused import
  // DocumentTextIcon, // Unused import
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import AdminManagement from "./AdminManagement";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Fregie Admin',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    },
    security: {
      passwordExpiry: 90,
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAttempts: 5
    },
    database: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      compressionEnabled: true
    },
    notifications: {
      emailNotifications: true,
      importNotifications: true,
      errorAlerts: true,
      weeklyReports: false
    }
  });

  const sections: SettingSection[] = [
    {
      id: 'general',
      title: 'General',
      description: 'Basic system settings and preferences',
      icon: Cog6ToothIcon
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Authentication and access control',
      icon: ShieldCheckIcon
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user roles and permissions',
      icon: UsersIcon
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Backup and maintenance settings',
      icon: CircleStackIcon
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email and alert preferences',
      icon: BellIcon
    }
  ];

  const handleSettingChange = (section: string, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleExportData = () => {
    console.log('Exporting data...');
    // Implementation for data export
  };

  const handleImportData = () => {
    console.log('Importing data...');
    // Implementation for data import
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="en">English</option>
          <option value="tr">Turkish</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="UTC">UTC</option>
          <option value="Europe/Istanbul">Europe/Istanbul</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
        </select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Expiry (days)
        </label>
        <input
          type="number"
          value={settings.security.passwordExpiry}
          onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="twoFactorAuth"
          checked={settings.security.twoFactorAuth}
          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
          Enable Two-Factor Authentication
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoBackup"
          checked={settings.database.autoBackup}
          onChange={(e) => handleSettingChange('database', 'autoBackup', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-700">
          Enable Automatic Backups
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Backup Frequency
        </label>
        <select
          value={settings.database.backupFrequency}
          onChange={(e) => handleSettingChange('database', 'backupFrequency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Retention Period (days)
        </label>
        <input
          type="number"
          value={settings.database.retentionDays}
          onChange={(e) => handleSettingChange('database', 'retentionDays', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="emailNotifications"
          checked={settings.notifications.emailNotifications}
          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
          Email Notifications
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="importNotifications"
          checked={settings.notifications.importNotifications}
          onChange={(e) => handleSettingChange('notifications', 'importNotifications', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="importNotifications" className="ml-2 block text-sm text-gray-700">
          Import Completion Notifications
        </label>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="errorAlerts"
          checked={settings.notifications.errorAlerts}
          onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="errorAlerts" className="ml-2 block text-sm text-gray-700">
          Error Alerts
        </label>
      </div>
    </div>
  );

  const renderSettingContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'users':
        return <AdminManagement />;
      case 'database':
        return renderDatabaseSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure system preferences and administrative settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-sm text-gray-600">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            
            <div className="px-6 py-6">
              {renderSettingContent()}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Save Changes
              </button>
            </div>
          </div>

          {/* Data Management Section */}
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
              <p className="text-sm text-gray-600">
                Import and export your data for backup or migration purposes.
              </p>
            </div>
            
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium">Export Data</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Download all your products and preferences as JSON files.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Export All Data
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ArrowUpTrayIcon className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium">Import Data</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload JSON files to restore or migrate your data.
                  </p>
                  <button
                    onClick={handleImportData}
                    className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
