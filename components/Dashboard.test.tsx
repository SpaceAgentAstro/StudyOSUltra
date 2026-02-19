import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';
import { AppView, UserProfile } from '../types';

describe('Dashboard Component', () => {
  const mockSetCurrentView = vi.fn();
  const mockUserProfile: UserProfile = {
    name: 'Test Student',
    goal: 'Ace the exam',
    hasCompletedOnboarding: true,
    subjects: ['Math', 'Science'],
    digitalTwin: {
      examSkills: {
        precision: 85,
        timeManagement: 70,
        reasoning: 90,
      },
      knowledgeMap: {},
      weaknesses: [],
      recentMood: 'focused',
    },
    lifeMode: 'STUDENT',
    knowledgeGraph: [],
    metaInsights: [],
  };

  const mockFiles = [
    { id: '1', name: 'File 1', type: 'pdf', content: '', uploadDate: 123, status: 'ready' },
    { id: '2', name: 'File 2', type: 'docx', content: '', uploadDate: 124, status: 'ready' },
  ] as any[];

  it('renders user greeting and goal', () => {
    render(
      <Dashboard
        userProfile={mockUserProfile}
        files={[]}
        setCurrentView={mockSetCurrentView}
      />
    );

    expect(screen.getByText(/Good Afternoon, Test Student/i)).toBeInTheDocument();
    expect(screen.getByText(/Goal: Ace the exam/i)).toBeInTheDocument();
  });

  it('renders default greeting when userProfile is null', () => {
    render(
      <Dashboard
        userProfile={null}
        files={[]}
        setCurrentView={mockSetCurrentView}
      />
    );

    expect(screen.getByText(/Good Afternoon, Student/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready to continue your mastery\?/i)).toBeInTheDocument();
  });

  it('displays correct file count', () => {
    render(
      <Dashboard
        userProfile={mockUserProfile}
        files={mockFiles}
        setCurrentView={mockSetCurrentView}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays digital twin precision', () => {
    render(
      <Dashboard
        userProfile={mockUserProfile}
        files={[]}
        setCurrentView={mockSetCurrentView}
      />
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('calls setCurrentView with correct view on click', () => {
    render(
      <Dashboard
        userProfile={mockUserProfile}
        files={[]}
        setCurrentView={mockSetCurrentView}
      />
    );

    // Knowledge Universe
    fireEvent.click(screen.getByText(/Knowledge Universe/i));
    expect(mockSetCurrentView).toHaveBeenCalledWith(AppView.KNOWLEDGE_UNIVERSE);

    // Chat
    fireEvent.click(screen.getByText(/Talk to The Coach/i));
    expect(mockSetCurrentView).toHaveBeenCalledWith(AppView.CHAT);

    // Meta Learning
    fireEvent.click(screen.getByText(/Meta Analysis/i));
    expect(mockSetCurrentView).toHaveBeenCalledWith(AppView.META_LEARNING);
  });
});
