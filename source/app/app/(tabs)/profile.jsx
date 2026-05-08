import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { logout } from '../../src/api/auth';
import { getUserInfo } from '../../src/utils/storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Staff'}</Text>
        <Text style={styles.email}>{user?.email || 'staff@unihub.edu.vn'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Nhân sự Check-in</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}><Ionicons name="settings-outline" size={20} color="#94a3b8" /></View>
          <Text style={styles.menuText}>Cài đặt ứng dụng</Text>
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}><Ionicons name="help-circle-outline" size={20} color="#94a3b8" /></View>
          <Text style={styles.menuText}>Hỗ trợ & Trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>UniHub App v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  email: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  roleBadge: { backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: '#818cf8', fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  menuIcon: { width: 32, alignItems: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: '#f1f5f9' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  version: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 40 }
});
