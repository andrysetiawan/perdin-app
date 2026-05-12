import { RouterProvider } from 'react-router-dom';

import { router } from '@/presentation/app/router';

/**
 * Root application component.
 * Providers (QueryClient, Auth, Notifications) are wrapped inside the
 * router's RootLayout so they are accessible to all route components.
 */
export function App() {
  return <RouterProvider router={router} />;
}

export default App;
