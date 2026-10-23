import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = { onAdd: (friendName: string, amount: number, dueDate: string) => Promise<void> };

// Today plus 30 days as "YYYY-MM-DD", so the due date field starts with a sensible value.
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function AddLoanForm({ onAdd }: Props) {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      await onAdd(friendName.trim(), Number(amount), dueDate.trim());
      setFriendName("");
      setAmount("");
      setDueDate(defaultDueDate());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the loan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.box}>
      <Text style={styles.heading}>Add a loan</Text>
      <TextInput style={styles.input} placeholder="Friend's name" value={friendName} onChangeText={setFriendName} />
      <TextInput style={styles.input} placeholder="Amount in rupees" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      <TextInput style={styles.input} placeholder="Due date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} autoCapitalize="none" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={submit}>
        <Text style={styles.buttonText}>Add loan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  heading: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#1b3a57" },
  input: { backgroundColor: "#f5f7fa", borderRadius: 8, borderWidth: 1, borderColor: "#d5dde5", padding: 12, fontSize: 15, marginBottom: 8 },
  button: { backgroundColor: "#1b6ef3", borderRadius: 8, padding: 12, alignItems: "center" },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#c0392b", marginBottom: 8 },
});
