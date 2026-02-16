/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect, describe, it } from 'vitest';
import MessageContent from './MessageContent';
import { FileDocument } from '../types';

// Mock Brain icon since it's used in the component
vi.mock('./Icons', () => ({
  Brain: () => <div data-testid="brain-icon" />
}));

describe('MessageContent', () => {
  const mockFiles: FileDocument[] = [
    { id: '1', name: 'citation.pdf', type: 'pdf', content: '', uploadDate: 0, status: 'ready' }
  ];
  const mockOnExplain = vi.fn();

  it('renders regular text', () => {
    render(<MessageContent text="Hello world" files={[]} onExplain={mockOnExplain} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders citations correctly', () => {
    render(<MessageContent text="Read this [citation.pdf]" files={mockFiles} onExplain={mockOnExplain} />);
    expect(screen.getByText('Read this')).toBeInTheDocument();
    const citation = screen.getByText('[citation.pdf]');
    expect(citation).toBeInTheDocument();
    expect(citation).toHaveClass('text-emerald-700'); // Valid file style
  });

  it('renders invalid citations with different style', () => {
    render(<MessageContent text="Read this [missing.pdf]" files={mockFiles} onExplain={mockOnExplain} />);
    const citation = screen.getByText('[missing.pdf]');
    expect(citation).toBeInTheDocument();
    expect(citation).toHaveClass('text-indigo-600'); // Invalid file style
  });

  it('renders code blocks correctly', () => {
    const code = 'console.log("test");';
    const text = `Here is code:\n\`\`\`javascript\n${code}\`\`\``;
    render(<MessageContent text={text} files={[]} onExplain={mockOnExplain} />);

    expect(screen.getByText('Code Snippet')).toBeInTheDocument();
    // The component replaces the language tag, so we expect the code content
    expect(screen.getByText(code)).toBeInTheDocument();
  });

  it('calls onExplain when Explain button is clicked', () => {
    const code = 'console.log("test");';
    const text = `\`\`\`javascript\n${code}\`\`\``;
    render(<MessageContent text={text} files={[]} onExplain={mockOnExplain} />);

    const button = screen.getByRole('button', { name: /explain/i });
    fireEvent.click(button);
    expect(mockOnExplain).toHaveBeenCalledWith(code);
  });
});
