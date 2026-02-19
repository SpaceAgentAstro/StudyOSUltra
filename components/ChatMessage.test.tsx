import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatMessage from './ChatMessage';
import { Message, FileDocument } from '../types';

// Mock Icons to simplify testing
vi.mock('./Icons', () => ({
  Brain: () => <div data-testid="icon-brain" />,
  Globe: () => <div data-testid="icon-globe" />,
}));

const mockFiles: FileDocument[] = [
  { id: '1', name: 'bio.pdf', type: 'pdf', content: '', uploadDate: 0, status: 'ready' }
];

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const msg: Message = {
      id: '1',
      role: 'user',
      text: 'Hello world',
      timestamp: Date.now()
    };

    render(<ChatMessage msg={msg} files={[]} onExplain={vi.fn()} useThinking={false} useSearch={false} />);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument(); // User avatar
  });

  it('renders model message with agent styling', () => {
    const msg: Message = {
      id: '2',
      role: 'model',
      agent: 'TEACHER',
      text: 'I am a teacher',
      timestamp: Date.now()
    };

    render(<ChatMessage msg={msg} files={[]} onExplain={vi.fn()} useThinking={false} useSearch={false} />);

    expect(screen.getByText('I am a teacher')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument(); // Label
  });

  it('renders thinking state', () => {
    const msg: Message = {
      id: '3',
      role: 'model',
      text: '',
      isThinking: true,
      timestamp: Date.now()
    };

    render(<ChatMessage msg={msg} files={[]} onExplain={vi.fn()} useThinking={true} useSearch={false} />);

    expect(screen.getByText('Thinking deeply...')).toBeInTheDocument();
  });

  it('renders code block and handles explain click', () => {
    const code = 'console.log("test")';
    const msg: Message = {
      id: '4',
      role: 'model',
      text: 'Here is code:\n```javascript\n' + code + '\n```',
      timestamp: Date.now()
    };
    const onExplain = vi.fn();

    render(<ChatMessage msg={msg} files={[]} onExplain={onExplain} useThinking={false} useSearch={false} />);

    expect(screen.getByText(code)).toBeInTheDocument();

    const explainBtn = screen.getByTitle('Ask Teacher to explain');
    fireEvent.click(explainBtn);

    expect(onExplain).toHaveBeenCalledWith(
      expect.stringContaining(code),
      'TEACHER'
    );
  });

  it('highlights citations', () => {
      const msg: Message = {
          id: '5',
          role: 'model',
          text: 'This is a fact [bio.pdf]',
          timestamp: Date.now()
      };

      render(<ChatMessage msg={msg} files={mockFiles} onExplain={vi.fn()} useThinking={false} useSearch={false} />);

      const citation = screen.getByText('[bio.pdf]');
      expect(citation).toHaveClass('text-emerald-700'); // Green for found file
  });
});
