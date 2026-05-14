import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAutoSync } from '../src/utils/useAutoSync';

export default function RootLayout() {
  // Tự động đồng bộ dữ liệu offline khi có mạng trở lại
  useAutoSync();

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f1f5f9',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
