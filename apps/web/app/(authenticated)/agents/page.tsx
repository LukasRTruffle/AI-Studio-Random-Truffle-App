'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useAgentChat, type AgentType, type ConversationMessage } from '@/hooks/useAgentChat';

/**
 * Agent Chat Page
 *
 * Provides a conversational interface for interacting with AI agents.
 */
export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('data-science');
  const [inputMessage, setInputMessage] = useState('');

  const { conversationHistory, loading, error, sendMessage, clearHistory } =
    useAgentChat(selectedAgent);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const agentOptions: { value: AgentType; label: string; description: string }[] = [
    {
      value: 'data-science',
      label: 'Data Science Agent',
      description: 'Query and analyze marketing data with natural language',
    },
    {
      value: 'audience-builder',
      label: 'Audience Builder Agent',
      description: 'Create and optimize marketing audiences',
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b">
        <PageHeader
          title="AI Agents"
          subtitle="Chat with AI agents to analyze data and build audiences"
        />

        {/* Agent Selector */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentOptions.map((agent) => (
            <button
              key={agent.value}
              onClick={() => {
                setSelectedAgent(agent.value);
                clearHistory();
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedAgent === agent.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{agent.label}</div>
              <div className="text-sm text-gray-600 mt-1">{agent.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {conversationHistory.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-2">
              {selectedAgent === 'data-science'
                ? 'Ask questions about your marketing data, generate SQL queries, or analyze trends.'
                : 'Get help creating audiences, optimizing targeting strategies, or recommending activation channels.'}
            </p>

            {/* Example Prompts */}
            <div className="mt-8 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Example for Data Science Agent:
                </div>
                <button
                  onClick={() => setInputMessage('Show me user growth over the last 30 days')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Show me user growth over the last 30 days
                </button>
              </div>
              <div className="text-left p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Example for Audience Builder Agent:
                </div>
                <button
                  onClick={() =>
                    setInputMessage('Help me create an audience of high-value customers')
                  }
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Help me create an audience of high-value customers
                </button>
              </div>
            </div>
          </div>
        )}

        {conversationHistory.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Agent is thinking...</div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${selectedAgent === 'data-science' ? 'Data Science Agent' : 'Audience Builder Agent'}...`}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Chat message component
 */
function ChatMessage({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl p-4 rounded-lg ${
          isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium opacity-70">
            {isUser ? 'You' : message.role === 'assistant' ? 'Agent' : 'System'}
          </span>
          <span className="text-xs opacity-50">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
      </div>
    </div>
  );
}
