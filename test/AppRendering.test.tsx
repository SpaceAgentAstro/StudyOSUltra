/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from '../App';
import React from 'react';
import { vi, describe, beforeEach, test, expect } from 'vitest';

expect.extend(matchers);

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key: string) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock lazy components
vi.mock('../components/KnowledgeUniverse', () => ({
  default: () => <div data-testid="knowledge-universe">Knowledge Universe View</div>
}));

// Mock services/authService to bypass AuthGate
vi.mock('../services/authService', () => ({
  isFirebaseAuthConfigured: () => false,
  subscribeToAuth: vi.fn(),
  signInWithProvider: vi.fn(),
  signOutCurrentUser: vi.fn(),
  toAuthErrorMessage: (err: any) => err.message,
}));

// Mock geminiService to prevent real calls
vi.mock('../services/geminiService', () => ({
  streamChatResponse: vi.fn(),
}));

describe('App Duplicate Rendering Check', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.localStorage.clear();
    // Simulate logged-in user to go straight to main app
    window.localStorage.setItem('study_os_profile', JSON.stringify({
      name: 'Test User',
      subjects: [],
      goal: 'Test',
      hasCompletedOnboarding: true,
      digitalTwin: {
          examSkills: { precision: 50, timeManagement: 50, reasoning: 50 },
          knowledgeMap: {},
          weaknesses: [],
          recentMood: 'focused'
      },
      lifeMode: 'STUDENT',
      knowledgeGraph: [],
      metaInsights: []
    }));
  });

  test('ChatInterface should be rendered exactly once', async () => {
    render(<App />);

    // Wait for the welcome message
    const welcomeText = "Welcome to your Study Universe. I am The Council. I can teach, quiz, analyze, and ground answers in your uploaded sources.";

    // We expect ONLY ONE instance of this text.
    // getAllByText returns an array of all matching elements.
    const messageElements = await screen.findAllByText(welcomeText);

    // If there are duplicates, length will be > 1
    expect(messageElements).toHaveLength(1);
  });
});
