import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});