import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders child route content via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<div>Login Form</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });

  it('renders a centered card container', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<div>Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-screen');
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
  });

  it('renders a card with shadow and max-width', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<div>Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const wrapper = container.firstChild as HTMLElement;
    const card = wrapper.firstChild as HTMLElement;
    expect(card.className).toContain('max-w-md');
    expect(card.className).toContain('shadow-lg');
    expect(card.className).toContain('rounded-lg');
  });
});
