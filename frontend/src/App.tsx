import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthForm, PhoneBook } from "./components";
import { Loader2 } from "lucide-react";
import "./App.css";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <Loader2 className="spinner" size={48} />
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <PhoneBook /> : <AuthForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
