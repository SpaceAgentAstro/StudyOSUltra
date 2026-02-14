/** @vitest-environment jsdom */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import App from './App';
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
vi.mock('./components/KnowledgeUniverse', () => ({
  default: () => <div data-testid="knowledge-universe">Knowledge Universe View</div>
}));

describe('App Performance Optimization', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.localStorage.clear();
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

  test('ChatInterface remains mounted but hidden on view change (Optimization)', async () => {
    render(<App />);

    // Check if ChatInterface is present
    const chatText = /Welcome to your Study Universe/i;
    const chatElement = await screen.findByText(chatText);
    expect(chatElement).toBeInTheDocument();
    expect(chatElement).toBeVisible();

    // Navigate to Knowledge Universe
    const universeButtons = screen.getAllByText('Universe');
    const universeButton = universeButtons[0];

    fireEvent.click(universeButton);

    // Wait for the view to change.
    await waitFor(() => {
        expect(screen.getByTestId('knowledge-universe')).toBeInTheDocument();
    });

    // Assert that ChatInterface is STILL present in the DOM
    expect(screen.getByText(chatText)).toBeInTheDocument();

    // Assert it is not visible (hidden via display: none on parent)
    expect(screen.getByText(chatText)).not.toBeVisible();

    // Navigate back to Chat
    const chatButtons = screen.getAllByText('Council Chat');
    fireEvent.click(chatButtons[0]);

    // Assert it becomes visible again
    await waitFor(() => {
        expect(screen.getByText(chatText)).toBeVisible();
    });
  });
});
