import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../pages/Settings';

// Mock store
vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { email: 'test@example.com', nickname: 'Test' },
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Settings Page', () => {
  it('should render page title', () => {
    renderWithRouter(<Settings />);

    expect(screen.getByText(/设置/i)).toBeInTheDocument();
  });

  it('should render profile section', () => {
    renderWithRouter(<Settings />);

    expect(screen.getByText(/个人资料/i)).toBeInTheDocument();
  });

  it('should render password section', () => {
    renderWithRouter(<Settings />);

    expect(screen.getByText(/密码/i)).toBeInTheDocument();
  });

  it('should render theme section', () => {
    renderWithRouter(<Settings />);

    expect(screen.getByText(/主题/i)).toBeInTheDocument();
  });

  it('should render theme toggle buttons', () => {
    renderWithRouter(<Settings />);

    expect(screen.getByRole('button', { name: /亮色/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /暗色/i })).toBeInTheDocument();
  });
});