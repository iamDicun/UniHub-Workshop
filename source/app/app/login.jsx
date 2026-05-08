import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../src/api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const { user } = await login(email.trim(), password);

      if (user.role !== 'staff') {
        Alert.alert('Không có quyền', 'Ứng dụng này chỉ dành cho nhân sự check-in (staff).');
        return;
      }

      router.replace('/(tabs)/workshops');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      Alert.alert('Đăng nhập thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <Text style={styles.logo}>UniHub</Text>
        <Text style={styles.subtitle}>Hệ thống Check-In Workshop</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Đăng nhập</Text>
        <Text style={styles.cardDesc}>Dành cho nhân sự check-in (Staff)</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="staff@university.edu"
            placeholderTextColor="#475569"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>UniHub Workshop v1.0</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f1f5f9',
  },
  loginBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: {
    backgroundColor: '#4338ca',
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  version: {
    textAlign: 'center',
    color: '#334155',
    fontSize: 12,
    marginTop: 32,
  },
});
