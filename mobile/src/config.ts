// Address of the backend. The phone cannot use "localhost" (that would mean the phone itself),
// so this is the Mac's Wi-Fi address. Find yours with: ipconfig getifaddr en0
// If the Mac joins another network, change this line.
// To test in a browser instead, start Expo with EXPO_PUBLIC_API_URL=http://localhost:4000
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.70:4000";
