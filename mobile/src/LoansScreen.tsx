import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { AuthError, addLoan, getLoans, getSummary, markRepaid, type Loan, type Summary } from "./api";
import AddLoanForm from "./AddLoanForm";
import { rupees } from "./money";

type Props = { token: string; onLogout: () => void };

export default function LoansScreen({ token, onLogout }: Props) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Both calls together, so the summary card and the list always agree.
  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([getLoans(token), getSummary(token)]);
      setLoans(l);
      setSummary(s);
      setError("");
    } catch (e) {
      if (e instanceof AuthError) return onLogout(); // token expired: back to login
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, [token, onLogout]);

  useEffect(() => { load(); }, [load]);

  async function pullToRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function add(friendName: string, amount: number, dueDate: string) {
    await addLoan(token, friendName, amount, dueDate); // throws on bad input, the form shows the message
    await load();
  }

  async function repay(loan: Loan) {
    try {
      await markRepaid(token, loan.id);
      await load();
    } catch (e) {
      if (e instanceof AuthError) return onLogout();
      Alert.alert("Error", e instanceof Error ? e.message : "Something went wrong");
    }
  }

  function confirmRepaid(loan: Loan) {
    const question = `${loan.friendName} paid back ${rupees(loan.amount)}.`;
    // Alert.alert with buttons does nothing in a web browser, so the browser test uses confirm().
    if (Platform.OS === "web") {
      if (window.confirm(`Mark as repaid? ${question}`)) repay(loan);
      return;
    }
    Alert.alert("Mark as repaid?", question, [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => repay(loan) },
    ]);
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={loans}
      keyExtractor={(l) => String(l.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={pullToRefresh} />}
      ListHeaderComponent={
        <View>
          <View style={styles.top}>
            <Text style={styles.title}>MiniLedger</Text>
            <Pressable onPress={onLogout}><Text style={styles.logout}>Log out</Text></Pressable>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Lent</Text>
              <Text style={styles.summaryValue}>{rupees(summary?.totalLent ?? 0)}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Repaid</Text>
              <Text style={styles.summaryValue}>{rupees(summary?.totalRepaid ?? 0)}</Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Overdue</Text>
              <Text style={[styles.summaryValue, (summary?.overdueAmount ?? 0) > 0 && styles.overdueText]}>
                {rupees(summary?.overdueAmount ?? 0)}
              </Text>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AddLoanForm onAdd={add} />
          <Text style={styles.heading}>Your loans</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No loans yet. Add your first one above.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.row, item.overdue && styles.rowOverdue, item.repaid && styles.rowRepaid]}>
          <View style={styles.rowMain}>
            <Text style={styles.name}>{item.friendName}</Text>
            <Text style={styles.due}>
              {item.repaid ? "Repaid" : item.overdue ? `Overdue, was due ${item.dueDate}` : `Due ${item.dueDate}`}
            </Text>
          </View>
          <View style={styles.rowSide}>
            <Text style={styles.amount}>{rupees(item.amount)}</Text>
            {!item.repaid && (
              <Pressable onPress={() => confirmRepaid(item)}>
                <Text style={styles.repaidButton}>Mark repaid</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#f5f7fa" },
  content: { padding: 16, paddingTop: 56 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "700", color: "#1b3a57" },
  logout: { color: "#1b6ef3", fontWeight: "600" },
  summary: { flexDirection: "row", backgroundColor: "#1b3a57", borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryCol: { flex: 1 },
  summaryLabel: { color: "#a9bdd1", fontSize: 12, marginBottom: 4 },
  summaryValue: { color: "#fff", fontSize: 18, fontWeight: "700" },
  overdueText: { color: "#ff9a8d" },
  heading: { fontSize: 16, fontWeight: "600", color: "#1b3a57", marginBottom: 8 },
  row: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#1b6ef3" },
  rowOverdue: { backgroundColor: "#fdecea", borderLeftColor: "#c0392b" },
  rowRepaid: { opacity: 0.55, borderLeftColor: "#2e9e5b" },
  rowMain: { flex: 1 },
  rowSide: { alignItems: "flex-end" },
  name: { fontSize: 16, fontWeight: "600", color: "#1b3a57" },
  due: { color: "#5b6b7b", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700", color: "#1b3a57" },
  repaidButton: { color: "#1b6ef3", marginTop: 6, fontWeight: "600" },
  empty: { color: "#5b6b7b", textAlign: "center", marginTop: 16 },
  error: { color: "#c0392b", marginBottom: 12 },
});
