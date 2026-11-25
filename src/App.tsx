import { AuthProvider } from './context/AuthContext';
import { DashboardWorkspace } from './components/DashboardWorkspace';

export default function App() {
  return (
    <AuthProvider>
      <DashboardWorkspace />
    </AuthProvider>
  );
}
