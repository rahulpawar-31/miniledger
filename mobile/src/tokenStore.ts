import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// The saved login token. On a phone it goes in the secure store.
// SecureStore does not exist in a web browser, so there we use localStorage (only for testing in Chrome).
const KEY = "miniledger_token";

export async function loadToken(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(KEY);
  return SecureStore.getItemAsync(KEY);
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === "web") return localStorage.setItem(KEY, token);
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") return localStorage.removeItem(KEY);
  await SecureStore.deleteItemAsync(KEY);
}
