import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../components/common/Input';

describe('Input', () => {
  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle value change', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('should render with label', () => {
    render(<Input label="Username" />);

    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should render error message', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should be disabled', () => {
    render(<Input disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should render different sizes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-2 py-1');

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-3 py-2');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-4 py-3');
  });

  it('should render with icon', () => {
    render(
      <Input
        icon={<span data-testid="icon">🔍</span>}
        placeholder="Search"
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should handle focus and blur', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    render(<Input onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });
});