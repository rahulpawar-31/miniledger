import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { requestOtp, verifyOtp } from "./api";

type Props = { onLoggedIn: (token: string) => void };

// Two steps on one screen: first the phone number, then the 6 digit code.
export default function LoginScreen({ onLoggedIn }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const sendCode = () => run(async () => {
    await requestOtp(phone);
    setCodeSent(true);
  });

  const login = () => run(async () => {
    const { token } = await verifyOtp(phone, otp);
    onLoggedIn(token);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniLedger</Text>
      <Text style={styles.hint}>Track money you lent to friends.</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone, for example +919876543210"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!codeSent}
      />
      {codeSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="6 digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <Text style={styles.hint}>Demo login: the code is printed in the backend terminal window.</Text>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={codeSent ? login : sendCode}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{codeSent ? "Log in" : "Send code"}</Text>}
      </Pressable>
      {codeSent && (
        <Pressable onPress={() => { setCodeSent(false); setOtp(""); setError(""); }}>
          <Text style={styles.link}>Use a different number</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f5f7fa" },
  title: { fontSize: 32, fontWeight: "700", color: "#1b3a57", marginBottom: 4 },
  hint: { color: "#5b6b7b", marginBottom: 16 },
  input: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#d5dde5", padding: 14, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: "#1b6ef3", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 4 },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: "#c0392b", marginBottom: 8 },
  link: { color: "#1b6ef3", textAlign: "center", marginTop: 16 },
});
