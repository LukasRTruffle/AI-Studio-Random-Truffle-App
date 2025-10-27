'use client';

import { useState } from 'react';

/**
 * Activation Wizard
 *
 * Agentic UI for activating audiences to ad platforms
 * Multi-channel orchestration with AI guidance
 */

interface AgentMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

type ActivationStep =
  | 'intro'
  | 'select-audience'
  | 'select-channels'
  | 'configure-google-ads'
  | 'configure-meta'
  | 'configure-tiktok'
  | 'review'
  | 'activating'
  | 'complete';

type Channel = 'google-ads' | 'meta' | 'tiktok';

interface Audience {
  id: string;
  name: string;
  description: string;
  size: number;
  identifierType: 'email' | 'phone' | 'mobile_ad_id';
  createdAt: Date;
}

interface ChannelConfig {
  channel: Channel;
  enabled: boolean;
  audienceName?: string;
  estimatedMatchRate?: number;
}

interface ActivationResult {
  channel: Channel;
  success: boolean;
  matchedUsers: number;
  matchRate: number;
  platformAudienceId?: string;
  error?: string;
}

export default function ActivationWizardPage() {
  const [step, setStep] = useState<ActivationStep>('intro');
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'agent',
      content:
        '👋 Hi! I&apos;m your AI activation assistant. I&apos;ll help you activate your audience to the right ad platforms with optimal settings. Let&apos;s get started!',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Activation state
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
  const [channelConfigs, setChannelConfigs] = useState<Record<Channel, ChannelConfig>>({
    'google-ads': { channel: 'google-ads', enabled: false },
    meta: { channel: 'meta', enabled: false },
    tiktok: { channel: 'tiktok', enabled: false },
  });
  const [activationResults, setActivationResults] = useState<ActivationResult[]>([]);

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
   * Load audiences
   */
  const loadAudiences = async () => {
    addUserMessage('Start activation');
    setIsLoading(true);

    try {
      // TODO: Fetch audiences from backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock audiences
      const mockAudiences: Audience[] = [
        {
          id: 'aud-001',
          name: 'High-Value Customers',
          description: 'Customers with LTV > $1000 in last 90 days',
          size: 15420,
          identifierType: 'email',
          createdAt: new Date('2025-10-20'),
        },
        {
          id: 'aud-002',
          name: 'Cart Abandoners',
          description: 'Users who added to cart but didn&apos;t purchase',
          size: 8750,
          identifierType: 'email',
          createdAt: new Date('2025-10-22'),
        },
        {
          id: 'aud-003',
          name: 'Mobile App Users',
          description: 'Active mobile app users in last 30 days',
          size: 42300,
          identifierType: 'mobile_ad_id',
          createdAt: new Date('2025-10-25'),
        },
      ];

      setAudiences(mockAudiences);
      setStep('select-audience');
      addAgentMessage(
        `Great! I found ${mockAudiences.length} audiences ready for activation.\n\n` +
          `Which audience would you like to activate?`
      );
    } catch {
      addAgentMessage('Error loading audiences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select audience
   */
  const selectAudience = async (audience: Audience) => {
    setSelectedAudience(audience);
    addUserMessage(`Activate "${audience.name}"`);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('select-channels');
      addAgentMessage(
        `Perfect choice! "${audience.name}" has **${audience.size.toLocaleString()} users** with ${audience.identifierType} identifiers.\n\n` +
          `Now, which ad platforms would you like to activate to? I recommend:\n\n` +
          `🎯 **Google Ads**: Great for search intent and remarketing\n` +
          `📱 **Meta**: Excellent for social engagement and lookalikes\n` +
          `🎬 **TikTok**: Perfect for younger demographics and video ads\n\n` +
          `You can select multiple platforms!`
      );
    } catch {
      addAgentMessage('Error selecting audience. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle channel selection
   */
  const toggleChannel = (channel: Channel) => {
    setChannelConfigs((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: !prev[channel].enabled,
      },
    }));
  };

  /**
   * Proceed to configuration
   */
  const proceedToConfig = async () => {
    const enabledChannels = Object.values(channelConfigs).filter((c) => c.enabled);

    if (enabledChannels.length === 0) {
      addAgentMessage('Please select at least one platform to continue.');
      return;
    }

    addUserMessage(
      `Configure ${enabledChannels.length} platform${enabledChannels.length > 1 ? 's' : ''}`
    );
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Go to first enabled channel config
      if (enabledChannels.length === 0) {
        addAgentMessage('No channels selected. Please select at least one channel.');
        setIsLoading(false);
        return;
      }

      const firstEnabledChannel = enabledChannels[0]!;
      const firstChannel = firstEnabledChannel.channel;
      setStep(`configure-${firstChannel}` as ActivationStep);

      addAgentMessage(
        `Excellent! Let&apos;s configure ${firstEnabledChannel.channel === 'google-ads' ? 'Google Ads' : firstEnabledChannel.channel === 'meta' ? 'Meta' : 'TikTok'}.\n\n` +
          `What would you like to name this audience on the platform?`
      );
    } catch {
      addAgentMessage('Error proceeding to configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Configure channel
   */
  const configureChannel = async (channel: Channel, audienceName: string) => {
    addUserMessage(`Name: "${audienceName}"`);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Estimate match rate
      const estimatedMatchRate = Math.random() * 30 + 60; // 60-90%

      setChannelConfigs((prev) => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          audienceName,
          estimatedMatchRate,
        },
      }));

      // Check if there are more channels to configure
      const remainingChannels = Object.values(channelConfigs).filter(
        (c) => c.enabled && !c.audienceName && c.channel !== channel
      );

      if (remainingChannels.length > 0) {
        const nextChannel = remainingChannels[0]!.channel;
        setStep(`configure-${nextChannel}` as ActivationStep);
        addAgentMessage(
          `✅ ${channel} configured! Estimated match rate: **${estimatedMatchRate.toFixed(1)}%**\n\n` +
            `Now let&apos;s configure ${nextChannel === 'google-ads' ? 'Google Ads' : nextChannel === 'meta' ? 'Meta' : 'TikTok'}.`
        );
      } else {
        setStep('review');
        addAgentMessage(
          `✅ All platforms configured!\n\n` +
            `Here&apos;s a summary of your activation. Review and confirm when ready.`
        );
      }
    } catch {
      addAgentMessage('Error configuring channel.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Execute activation
   */
  const executeActivation = async () => {
    addUserMessage('Activate now');
    setIsLoading(true);
    setStep('activating');

    try {
      const enabledChannels = Object.values(channelConfigs).filter((c) => c.enabled);

      addAgentMessage(
        `🚀 Activating to ${enabledChannels.length} platform${enabledChannels.length > 1 ? 's' : ''}...\n\n` +
          `This may take a few moments. I&apos;ll keep you updated!`
      );

      // Simulate activation for each channel
      const results: ActivationResult[] = [];

      for (const config of enabledChannels) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success/failure (90% success rate)
        const success = Math.random() > 0.1;
        const actualMatchRate = config.estimatedMatchRate
          ? config.estimatedMatchRate + (Math.random() - 0.5) * 5
          : 70;
        const matchedUsers = selectedAudience
          ? Math.floor(selectedAudience.size * (actualMatchRate / 100))
          : 0;

        const result: ActivationResult = {
          channel: config.channel,
          success,
          matchedUsers,
          matchRate: actualMatchRate,
          platformAudienceId: success
            ? `${config.channel}-${Math.random().toString(36).substr(2, 9)}`
            : undefined,
          error: success ? undefined : 'API rate limit exceeded',
        };

        results.push(result);

        addAgentMessage(
          success
            ? `✅ ${config.channel === 'google-ads' ? 'Google Ads' : config.channel === 'meta' ? 'Meta' : 'TikTok'}: Successfully activated ${matchedUsers.toLocaleString()} users (${actualMatchRate.toFixed(1)}% match rate)`
            : `❌ ${config.channel === 'google-ads' ? 'Google Ads' : config.channel === 'meta' ? 'Meta' : 'TikTok'}: Activation failed - ${result.error}`
        );
      }

      setActivationResults(results);
      setStep('complete');

      const successCount = results.filter((r) => r.success).length;
      addAgentMessage(
        `\n🎉 Activation complete! ${successCount}/${results.length} platform${results.length > 1 ? 's' : ''} activated successfully.\n\n` +
          `Your audience is now live and ready to reach!`
      );
    } catch {
      addAgentMessage('Error during activation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start over
   */
  const startOver = () => {
    setStep('intro');
    setSelectedAudience(null);
    setChannelConfigs({
      'google-ads': { channel: 'google-ads', enabled: false },
      meta: { channel: 'meta', enabled: false },
      tiktok: { channel: 'tiktok', enabled: false },
    });
    setActivationResults([]);
    setMessages([
      {
        role: 'agent',
        content: 'Ready to activate another audience?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Activation Wizard</h1>
          <p className="text-gray-600">
            AI-guided audience activation to Google Ads, Meta, and TikTok
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6 max-h-[700px] overflow-y-auto">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                      message.role === 'agent'
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'agent' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl px-6 py-4">
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

          {/* Action Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {step === 'intro' && (
              <button
                onClick={loadAudiences}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
              >
                Start Activation
              </button>
            )}

            {step === 'select-audience' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Audience</h3>
                {audiences.map((audience) => (
                  <button
                    key={audience.id}
                    onClick={() => selectAudience(audience)}
                    disabled={isLoading}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50"
                  >
                    <h4 className="font-semibold text-gray-900 text-sm">{audience.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{audience.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {audience.size.toLocaleString()} users • {audience.identifierType}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {step === 'select-channels' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Platforms</h3>
                {(['google-ads', 'meta', 'tiktok'] as Channel[]).map((channel) => (
                  <label
                    key={channel}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={channelConfigs[channel].enabled}
                      onChange={() => toggleChannel(channel)}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {channel === 'google-ads'
                        ? 'Google Ads'
                        : channel === 'meta'
                          ? 'Meta'
                          : 'TikTok'}
                    </span>
                  </label>
                ))}
                <button
                  onClick={proceedToConfig}
                  disabled={isLoading}
                  className="w-full mt-4 py-3 px-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {(step === 'configure-google-ads' ||
              step === 'configure-meta' ||
              step === 'configure-tiktok') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Audience Name</h3>
                <input
                  type="text"
                  placeholder="e.g., High-Value Customers Q4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      const channel = step.replace('configure-', '') as Channel;
                      configureChannel(channel, e.currentTarget.value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value) {
                      const channel = step.replace('configure-', '') as Channel;
                      configureChannel(channel, input.value);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Review</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Audience</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedAudience?.name}</p>
                    <p className="text-xs text-gray-600">
                      {selectedAudience?.size.toLocaleString()} users
                    </p>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-600 mb-2">Platforms</p>
                    {Object.values(channelConfigs)
                      .filter((c) => c.enabled)
                      .map((config) => (
                        <div key={config.channel} className="mb-2">
                          <p className="text-sm font-medium text-gray-900">
                            {config.channel === 'google-ads'
                              ? 'Google Ads'
                              : config.channel === 'meta'
                                ? 'Meta'
                                : 'TikTok'}
                          </p>
                          <p className="text-xs text-gray-600">{config.audienceName}</p>
                          <p className="text-xs text-green-600">
                            ~{config.estimatedMatchRate?.toFixed(1)}% match rate
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
                <button
                  onClick={executeActivation}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
                >
                  Activate Now
                </button>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-3">
                    ✅ Activation Complete
                  </h3>
                  {activationResults.map((result) => (
                    <div key={result.channel} className="mb-3">
                      <p className="text-xs font-medium text-gray-900">
                        {result.channel === 'google-ads'
                          ? 'Google Ads'
                          : result.channel === 'meta'
                            ? 'Meta'
                            : 'TikTok'}
                      </p>
                      {result.success ? (
                        <>
                          <p className="text-xs text-green-700">
                            {result.matchedUsers.toLocaleString()} users matched
                          </p>
                          <p className="text-xs text-green-600">
                            {result.matchRate.toFixed(1)}% match rate
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={startOver}
                  className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200"
                >
                  Activate Another
                </button>
                <button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
