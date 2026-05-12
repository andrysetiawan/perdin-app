import { Outlet } from 'react-router-dom';

/**
 * AuthLayout - Centered card layout for the login page.
 * Full-height viewport with centered content card.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <Outlet />
      </div>
    </div>
  );
}
