import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../components/common/Input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Email" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Input error="Invalid input" />);

    expect(screen.getByText('Invalid input')).toBeInTheDocument();
    expect(screen.getByText('Invalid input')).toHaveClass('text-red-500');
  });

  it('should show helper text when no error', () => {
    render(<Input helperText="Enter your email address" />);

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('should not show helper text when error exists', () => {
    render(
      <Input error="Error" helperText="Helper text" />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('should apply error styles when error exists', () => {
    render(<Input error="Error" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('should accept custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should render with icon', () => {
    const IconComponent = () => <span data-testid="icon">🔍</span>;
    render(<Input icon={<IconComponent />} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});