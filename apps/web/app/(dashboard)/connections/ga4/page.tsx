'use client';

import { useState } from 'react';

/**
 * GA4 Connection Flow
 *
 * Agentic UI for connecting Google Analytics 4 property
 * Validates BigQuery export and shows data preview
 */

interface AgentMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

type ConnectionStep =
  | 'intro'
  | 'auth'
  | 'select-property'
  | 'check-bigquery'
  | 'validate-dataset'
  | 'preview-data'
  | 'complete';

interface GA4Property {
  propertyId: string;
  displayName: string;
  industryCategory: string;
  timeZone: string;
}

export default function GA4ConnectionPage() {
  const [step, setStep] = useState<ConnectionStep>('intro');
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'agent',
      content:
        '👋 Hi! I&apos;m here to help you connect your Google Analytics 4 property to Random Truffle. This will enable powerful audience insights and activation.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // GA4 connection state
  const [properties, setProperties] = useState<GA4Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<GA4Property | null>(null);
  const [bigQueryEnabled, setBigQueryEnabled] = useState(false);
  const [_datasetId, setDatasetId] = useState<string>('');
  const [sampleData, setSampleData] = useState<Record<string, unknown>[]>([]);

  /**
   * Add agent message
   */
  const addAgentMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'agent',
        content,
        timestamp: new Date(),
      },
    ]);
  };

  /**
   * Add user message
   */
  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content,
        timestamp: new Date(),
      },
    ]);
  };

  /**
   * Start Google OAuth flow
   */
  const startGoogleAuth = async () => {
    addUserMessage('Connect my Google account');
    setIsLoading(true);

    try {
      // TODO: Implement Google OAuth
      // For now, simulate with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock properties
      const mockProperties: GA4Property[] = [
        {
          propertyId: '123456789',
          displayName: 'My E-commerce Store',
          industryCategory: 'E-commerce',
          timeZone: 'America/Los_Angeles',
        },
        {
          propertyId: '987654321',
          displayName: 'Marketing Website',
          industryCategory: 'Professional Services',
          timeZone: 'America/New_York',
        },
      ];

      setProperties(mockProperties);
      setStep('select-property');
      addAgentMessage(
        `Great! I found ${mockProperties.length} GA4 properties in your account. Please select the one you&apos;d like to connect.`
      );
    } catch {
      addAgentMessage('Oops, something went wrong with Google authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select GA4 property
   */
  const selectProperty = async (property: GA4Property) => {
    setSelectedProperty(property);
    addUserMessage(`Connect ${property.displayName}`);
    setIsLoading(true);
    setStep('check-bigquery');

    try {
      // TODO: Check if BigQuery export is enabled via API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock: 50% chance BigQuery is already enabled
      const isEnabled = Math.random() > 0.5;
      setBigQueryEnabled(isEnabled);

      if (isEnabled) {
        addAgentMessage(
          `✅ Perfect! BigQuery export is already enabled for ${property.displayName}. Let me validate your dataset...`
        );
        setStep('validate-dataset');
        validateDataset(property);
      } else {
        addAgentMessage(
          `I see that BigQuery export isn&apos;t enabled yet for ${property.displayName}. No worries! Here&apos;s how to enable it:\n\n` +
            `1. Go to your GA4 Admin panel\n` +
            `2. Click "BigQuery Links" under Property\n` +
            `3. Click "Link" and follow the setup wizard\n` +
            `4. Choose "Daily" export (recommended for marketing data)\n` +
            `5. Come back here when done!\n\n` +
            `Would you like me to open the GA4 Admin panel for you?`
        );
      }
    } catch {
      addAgentMessage('Error checking BigQuery status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate BigQuery dataset
   */
  const validateDataset = async (property: GA4Property) => {
    setIsLoading(true);

    try {
      // TODO: Query BigQuery to check if dataset exists
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock dataset ID (GA4 uses analytics_<property_id>)
      const mockDatasetId = `analytics_${property.propertyId}`;
      setDatasetId(mockDatasetId);

      addAgentMessage(
        `✅ Found your BigQuery dataset: \`${mockDatasetId}\`\n\nLet me pull a sample of your data to make sure everything&apos;s working...`
      );

      setStep('preview-data');
      previewData(mockDatasetId);
    } catch {
      addAgentMessage('Could not find BigQuery dataset. Please check your export settings.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Preview sample data from BigQuery
   */
  const previewData = async (dataset: string) => {
    setIsLoading(true);

    try {
      // TODO: Query BigQuery for sample data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock sample data
      const mockData = [
        {
          event_date: '20251027',
          event_name: 'page_view',
          user_pseudo_id: 'abc123',
          device_category: 'mobile',
          geo_country: 'US',
        },
        {
          event_date: '20251027',
          event_name: 'purchase',
          user_pseudo_id: 'def456',
          device_category: 'desktop',
          geo_country: 'CA',
        },
        {
          event_date: '20251027',
          event_name: 'add_to_cart',
          user_pseudo_id: 'ghi789',
          device_category: 'tablet',
          geo_country: 'MX',
        },
      ];

      setSampleData(mockData);
      setStep('complete');

      addAgentMessage(
        `🎉 Perfect! Your GA4 data is flowing correctly. I can see ${mockData.length} recent events from dataset \`${dataset}\`.\n\n` +
          `You&apos;re all set! You can now:\n` +
          `• Create audiences from your GA4 data\n` +
          `• Build custom segments using our AI agent\n` +
          `• Activate audiences to ad platforms\n\n` +
          `What would you like to do next?`
      );
    } catch {
      addAgentMessage('Error previewing data. Please check your BigQuery permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retry BigQuery check (after user enables export)
   */
  const retryBigQueryCheck = async () => {
    addUserMessage('I&apos;ve enabled BigQuery export');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setBigQueryEnabled(true);
      addAgentMessage('Great! Let me validate your BigQuery dataset now...');
      setStep('validate-dataset');
      if (selectedProperty) {
        validateDataset(selectedProperty);
      }
    } catch {
      addAgentMessage('Still not seeing BigQuery export. Please make sure it&apos;s enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Connect Google Analytics 4</h1>
          <p className="text-gray-600">
            Link your GA4 property to unlock audience insights and activation
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.role === 'agent'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'agent' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'intro' && (
            <button
              onClick={startGoogleAuth}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
            >
              Connect with Google
            </button>
          )}

          {step === 'select-property' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your GA4 Property</h3>
              {properties.map((property) => (
                <button
                  key={property.propertyId}
                  onClick={() => selectProperty(property)}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left disabled:opacity-50"
                >
                  <h4 className="font-semibold text-gray-900">{property.displayName}</h4>
                  <p className="text-sm text-gray-600">
                    ID: {property.propertyId} • {property.industryCategory}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Time Zone: {property.timeZone}</p>
                </button>
              ))}
            </div>
          )}

          {step === 'check-bigquery' && !bigQueryEnabled && (
            <div className="space-y-4">
              <button
                onClick={() => window.open('https://analytics.google.com/analytics/web/', '_blank')}
                className="w-full py-4 px-6 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200"
              >
                Open GA4 Admin Panel
              </button>
              <button
                onClick={retryBigQueryCheck}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
              >
                I&apos;ve Enabled BigQuery Export
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Connection Successful
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  {selectedProperty?.displayName} is now connected to Random Truffle
                </p>

                {/* Sample Data Preview */}
                <div className="bg-white rounded-lg p-4 overflow-x-auto">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Sample Data Preview:</p>
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Event</th>
                        <th className="text-left py-2 px-2">Device</th>
                        <th className="text-left py-2 px-2">Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleData.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-2">{String(row.event_date)}</td>
                          <td className="py-2 px-2">{String(row.event_name)}</td>
                          <td className="py-2 px-2">{String(row.device_category)}</td>
                          <td className="py-2 px-2">{String(row.geo_country)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
