import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import LoansScreen from "./src/LoansScreen";
import LoginScreen from "./src/LoginScreen";

const TOKEN_KEY = "miniledger_token";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true while we look for a saved login

  // On start, reuse the saved token so the user does not log in every time.
  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then(setToken)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (t: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, t);
    setToken(t);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
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
