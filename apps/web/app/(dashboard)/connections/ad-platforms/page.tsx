'use client';

import { useState, useEffect } from 'react';
import { platformsApi } from '@/lib/api-client';

/**
 * Ad Platform Connections
 *
 * Agentic UI for connecting Google Ads, Meta, and TikTok
 * Handles OAuth flows and account selection
 */

interface AgentMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

type Platform = 'google-ads' | 'meta' | 'tiktok';

type ConnectionStep =
  | 'intro'
  | 'select-platform'
  | 'auth'
  | 'select-account'
  | 'permissions'
  | 'complete';

interface AdAccount {
  id: string;
  name: string;
  currency: string;
  status: string;
}

interface PlatformConnection {
  platform: Platform;
  connected: boolean;
  accounts: AdAccount[];
  selectedAccount: AdAccount | null;
}

export default function AdPlatformConnectionsPage() {
  const [step, setStep] = useState<ConnectionStep>('intro');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'agent',
      content:
        '👋 Hi! I&apos;m here to help you connect your ad platforms. This will enable you to activate audiences directly to Google Ads, Meta (Facebook/Instagram), and TikTok.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Load tenant ID from localStorage
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    setTenantId(storedTenantId);
  }, []);

  // Connection state
  const [connections, setConnections] = useState<Record<Platform, PlatformConnection>>({
    'google-ads': {
      platform: 'google-ads',
      connected: false,
      accounts: [],
      selectedAccount: null,
    },
    meta: {
      platform: 'meta',
      connected: false,
      accounts: [],
      selectedAccount: null,
    },
    tiktok: {
      platform: 'tiktok',
      connected: false,
      accounts: [],
      selectedAccount: null,
    },
  });

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
   * Get platform display name
   */
  const getPlatformName = (platform: Platform): string => {
    switch (platform) {
      case 'google-ads':
        return 'Google Ads';
      case 'meta':
        return 'Meta (Facebook & Instagram)';
      case 'tiktok':
        return 'TikTok';
    }
  };

  /**
   * Start platform connection
   */
  const startConnection = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep('select-platform');
    addUserMessage(`Connect ${getPlatformName(platform)}`);
    addAgentMessage(
      `Great choice! Let&apos;s connect your ${getPlatformName(platform)} account.\n\n` +
        `I&apos;ll need permission to:\n` +
        `• Read your ad account information\n` +
        `• Create and manage custom audiences\n` +
        `• View campaign performance data\n\n` +
        `Click "Authorize" when you&apos;re ready!`
    );
  };

  /**
   * Authorize platform (OAuth flow)
   */
  const authorizePlatform = async () => {
    if (!selectedPlatform) return;

    if (!tenantId) {
      addAgentMessage('No tenant ID found. Please complete onboarding first.');
      return;
    }

    addUserMessage('Authorize access');
    setIsLoading(true);
    setStep('auth');

    try {
      // For Meta, redirect to real OAuth
      if (selectedPlatform === 'meta') {
        const oauthUrl = platformsApi.getMetaAuthUrl(tenantId);
        window.location.href = oauthUrl;
        return; // Don't continue - user will be redirected
      }

      // For other platforms, simulate for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock ad accounts
      const mockAccounts: Record<Platform, AdAccount[]> = {
        'google-ads': [
          {
            id: '123-456-7890',
            name: 'Main Advertising Account',
            currency: 'USD',
            status: 'ENABLED',
          },
          {
            id: '098-765-4321',
            name: 'Seasonal Campaigns',
            currency: 'USD',
            status: 'ENABLED',
          },
        ],
        meta: [
          {
            id: 'act_1234567890',
            name: 'E-commerce Ad Account',
            currency: 'USD',
            status: 'ACTIVE',
          },
        ],
        tiktok: [
          {
            id: '7123456789',
            name: 'TikTok Ads Manager',
            currency: 'USD',
            status: 'STATUS_ENABLE',
          },
        ],
      };

      const accounts = mockAccounts[selectedPlatform];

      setConnections((prev) => ({
        ...prev,
        [selectedPlatform]: {
          ...prev[selectedPlatform],
          accounts,
        },
      }));

      setStep('select-account');
      addAgentMessage(
        `✅ Authorization successful!\n\n` +
          `I found ${accounts.length} ad account${accounts.length > 1 ? 's' : ''} in your ${getPlatformName(selectedPlatform)} account. ` +
          `Please select the one you&apos;d like to use for audience activation.`
      );
    } catch {
      addAgentMessage(`Oops, something went wrong with authorization. Please try again.`);
      setStep('select-platform');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select ad account
   */
  const selectAccount = async (account: AdAccount) => {
    if (!selectedPlatform) return;

    addUserMessage(`Use ${account.name}`);
    setIsLoading(true);

    try {
      // TODO: Save connection to backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setConnections((prev) => ({
        ...prev,
        [selectedPlatform]: {
          ...prev[selectedPlatform],
          connected: true,
          selectedAccount: account,
        },
      }));

      setStep('complete');
      addAgentMessage(
        `🎉 Perfect! ${getPlatformName(selectedPlatform)} account "${account.name}" is now connected.\n\n` +
          `You can now:\n` +
          `• Activate audiences to ${getPlatformName(selectedPlatform)}\n` +
          `• Sync campaign performance data\n` +
          `• Track conversions and ROI\n\n` +
          `Would you like to connect another platform?`
      );
    } catch {
      addAgentMessage('Error saving connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get connection status badge
   */
  const getStatusBadge = (connected: boolean) => {
    if (connected) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          ✓ Connected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        Not Connected
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Connect Ad Platforms</h1>
          <p className="text-gray-600">
            Link your advertising accounts to activate audiences and sync campaign data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Interface */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-6 py-4 ${
                      message.role === 'agent'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'agent' ? 'text-purple-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl px-6 py-4">
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

          {/* Platform Selection / Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {(step === 'intro' || step === 'complete') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Platforms</h3>

                {/* Google Ads */}
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Google Ads</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Search, Display, YouTube campaigns
                      </p>
                    </div>
                    {getStatusBadge(connections['google-ads'].connected)}
                  </div>
                  {connections['google-ads'].connected &&
                  connections['google-ads'].selectedAccount ? (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      📊 {connections['google-ads'].selectedAccount.name}
                    </p>
                  ) : (
                    <button
                      onClick={() => startConnection('google-ads')}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                    >
                      Connect Google Ads
                    </button>
                  )}
                </div>

                {/* Meta */}
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Meta</h4>
                      <p className="text-sm text-gray-600 mt-1">Facebook, Instagram, Messenger</p>
                    </div>
                    {getStatusBadge(connections.meta.connected)}
                  </div>
                  {connections.meta.connected && connections.meta.selectedAccount ? (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      📊 {connections.meta.selectedAccount.name}
                    </p>
                  ) : (
                    <button
                      onClick={() => startConnection('meta')}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                    >
                      Connect Meta
                    </button>
                  )}
                </div>

                {/* TikTok */}
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">TikTok</h4>
                      <p className="text-sm text-gray-600 mt-1">Short-form video advertising</p>
                    </div>
                    {getStatusBadge(connections.tiktok.connected)}
                  </div>
                  {connections.tiktok.connected && connections.tiktok.selectedAccount ? (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      📊 {connections.tiktok.selectedAccount.name}
                    </p>
                  ) : (
                    <button
                      onClick={() => startConnection('tiktok')}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                    >
                      Connect TikTok
                    </button>
                  )}
                </div>

                {step === 'complete' && (
                  <button
                    onClick={() => (window.location.href = '/dashboard')}
                    className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                  >
                    Continue to Dashboard
                  </button>
                )}
              </div>
            )}

            {step === 'select-platform' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Authorize {selectedPlatform && getPlatformName(selectedPlatform)}
                </h3>
                <button
                  onClick={authorizePlatform}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
                >
                  Authorize Access
                </button>
                <button
                  onClick={() => {
                    setStep('intro');
                    setSelectedPlatform(null);
                  }}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            )}

            {step === 'select-account' && selectedPlatform && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Ad Account</h3>
                {connections[selectedPlatform].accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => selectAccount(account)}
                    disabled={isLoading}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left disabled:opacity-50"
                  >
                    <h4 className="font-semibold text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-600">
                      ID: {account.id} • {account.currency} • {account.status}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
