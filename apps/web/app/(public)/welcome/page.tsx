'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Welcome & Onboarding Flow
 *
 * Agent-guided conversational onboarding for new users
 *
 * Flow:
 * 1. Welcome message from Claude
 * 2. Company information collection
 * 3. Goals & use case discovery
 * 4. Tenant creation
 * 5. Interactive platform tour
 */

type OnboardingStep = 'welcome' | 'company-info' | 'goals' | 'creating-workspace' | 'tour-intro';

interface AgentMessage {
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

interface CompanyInfo {
  companyName: string;
  industry: string;
  teamSize: string;
}

interface UserGoals {
  primaryGoal: string;
  platforms: string[];
  hasGA4: boolean;
}

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'agent',
      content:
        "👋 Hi! I'm Claude, your AI marketing assistant. I'm here to help you get the most out of Random Truffle. Let's get you set up - this will only take a few minutes!",
      timestamp: new Date(),
    },
  ]);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    industry: '',
    teamSize: '',
  });

  const [userGoals, setUserGoals] = useState<UserGoals>({
    primaryGoal: '',
    platforms: [],
    hasGA4: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Add agent message to conversation
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
   * Add user message to conversation
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
   * Handle welcome screen - start onboarding
   */
  const handleStartOnboarding = () => {
    addUserMessage("I'm ready! Let's get started.");
    setTimeout(() => {
      addAgentMessage(
        "Great! First, let me learn a bit about your company. What's your company name?"
      );
      setStep('company-info');
    }, 800);
  };

  /**
   * Handle company info submission
   */
  const handleCompanyInfoSubmit = () => {
    if (!companyInfo.companyName || !companyInfo.industry || !companyInfo.teamSize) {
      return;
    }

    addUserMessage(
      `My company is ${companyInfo.companyName}, we're in the ${companyInfo.industry} industry with a team of ${companyInfo.teamSize}.`
    );

    setTimeout(() => {
      addAgentMessage(
        `Perfect! ${companyInfo.companyName} in ${companyInfo.industry} - I'll tailor the experience for you. Now, what are you looking to achieve with Random Truffle?`
      );
      setStep('goals');
    }, 1000);
  };

  /**
   * Handle goals submission
   */
  const handleGoalsSubmit = () => {
    if (!userGoals.primaryGoal || userGoals.platforms.length === 0) {
      return;
    }

    const platformText = userGoals.platforms.join(', ');
    addUserMessage(
      `I want to ${userGoals.primaryGoal} using ${platformText}. ${userGoals.hasGA4 ? 'I have Google Analytics 4 set up.' : "I don't have GA4 yet."}`
    );

    setTimeout(() => {
      addAgentMessage(
        `Excellent! I'll help you ${userGoals.primaryGoal.toLowerCase()}. ${userGoals.hasGA4 ? "Since you have GA4, we'll connect that first." : 'We can help you set up GA4 later.'} Let me create your workspace...`
      );
      setStep('creating-workspace');
      createTenantWorkspace();
    }, 1000);
  };

  /**
   * Create tenant workspace
   */
  const createTenantWorkspace = async () => {
    setIsLoading(true);

    try {
      // TODO: Call backend API to create tenant
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      addAgentMessage(
        `🎉 Your workspace is ready! Welcome to Random Truffle, ${companyInfo.companyName}! Let me give you a quick tour of what you can do here.`
      );

      setTimeout(() => {
        setStep('tour-intro');
      }, 1500);
    } catch {
      addAgentMessage("Oops, something went wrong creating your workspace. Let's try that again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start platform tour
   */
  const handleStartTour = () => {
    router.push('/tour');
  };

  /**
   * Skip tour and go to dashboard
   */
  const handleSkipTour = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Random Truffle</h1>
          <p className="text-gray-600">AI-powered marketing intelligence & audience activation</p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 min-h-[500px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Forms */}
          <div className="border-t pt-6">
            {step === 'welcome' && (
              <div className="flex justify-center">
                <button
                  onClick={handleStartOnboarding}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Let&apos;s Get Started →
                </button>
              </div>
            )}

            {step === 'company-info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                    }
                    placeholder="e.g., Acme Corp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={companyInfo.industry}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select industry...</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Retail">Retail</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                  <select
                    value={companyInfo.teamSize}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, teamSize: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select team size...</option>
                    <option value="1-10">1-10 people</option>
                    <option value="11-50">11-50 people</option>
                    <option value="51-200">51-200 people</option>
                    <option value="201+">201+ people</option>
                  </select>
                </div>

                <button
                  onClick={handleCompanyInfoSubmit}
                  disabled={
                    !companyInfo.companyName || !companyInfo.industry || !companyInfo.teamSize
                  }
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 'goals' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s your primary goal?
                  </label>
                  <select
                    value={userGoals.primaryGoal}
                    onChange={(e) => setUserGoals({ ...userGoals, primaryGoal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select goal...</option>
                    <option value="Build & activate high-value audiences">
                      Build & activate high-value audiences
                    </option>
                    <option value="Measure marketing effectiveness (MMM)">
                      Measure marketing effectiveness (MMM)
                    </option>
                    <option value="Discover data insights with AI">
                      Discover data insights with AI
                    </option>
                    <option value="All of the above">All of the above</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which ad platforms do you use?
                  </label>
                  <div className="space-y-2">
                    {['Google Ads', 'Meta (Facebook/Instagram)', 'TikTok'].map((platform) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={userGoals.platforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserGoals({
                                ...userGoals,
                                platforms: [...userGoals.platforms, platform],
                              });
                            } else {
                              setUserGoals({
                                ...userGoals,
                                platforms: userGoals.platforms.filter((p) => p !== platform),
                              });
                            }
                          }}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-gray-700">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={userGoals.hasGA4}
                      onChange={(e) => setUserGoals({ ...userGoals, hasGA4: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-gray-700">I have Google Analytics 4 set up</span>
                  </label>
                </div>

                <button
                  onClick={handleGoalsSubmit}
                  disabled={!userGoals.primaryGoal || userGoals.platforms.length === 0}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create My Workspace →
                </button>
              </div>
            )}

            {step === 'tour-intro' && (
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    I can show you around, or you can explore on your own.
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={handleStartTour}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Show Me Around
                    </button>
                    <button
                      onClick={handleSkipTour}
                      className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      I&apos;ll Explore Myself
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2">
          {['welcome', 'company-info', 'goals', 'creating-workspace', 'tour-intro'].map(
            (s, index) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  ['welcome', 'company-info', 'goals', 'creating-workspace', 'tour-intro'].indexOf(
                    step
                  ) >= index
                    ? 'bg-indigo-600'
                    : 'bg-gray-200'
                }`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
