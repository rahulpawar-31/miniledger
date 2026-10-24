import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import LoansScreen from "./src/LoansScreen";
import LoginScreen from "./src/LoginScreen";
import { clearToken, loadToken, saveToken } from "./src/tokenStore";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true while we look for a saved login

  // On start, reuse the saved token so the user does not log in every time.
  useEffect(() => {
    loadToken()
      .then(setToken)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (t: string) => {
    await saveToken(t);
    setToken(t);
  }, []);

  const logout = useCallback(async () => {
    await clearToken().catch(() => {});
    setToken(null);
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator /></View>;
  }

  return (
    <>
      <StatusBar style="dark" />
      {token ? <LoansScreen token={token} onLogout={logout} /> : <LoginScreen onLoggedIn={login} />}
    </>
  );
}
