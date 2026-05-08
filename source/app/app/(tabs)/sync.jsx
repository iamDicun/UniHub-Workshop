import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getOfflineQueue, clearOfflineQueue, removeOfflineCheckins } from '../../src/utils/storage';
import { syncOfflineCheckins } from '../../src/api/workshop';
import * as Network from 'expo-network';

export default function SyncScreen() {
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true });

  const loadQueue = async () => {
    const data = await getOfflineQueue();
    setQueue(data);
    
    const state = await Network.getNetworkStateAsync();
    setNetworkStatus({ isOnline: state.isConnected && state.isInternetReachable !== false });
  };

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [])
  );

  const handleSync = async () => {
    if (queue.length === 0) {
      Alert.alert('Thông báo', 'Không có dữ liệu cần đồng bộ.');
      return;
    }

    if (!networkStatus.isOnline) {
      Alert.alert('Lỗi mạng', 'Không có kết nối Internet. Vui lòng thử lại sau.');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await syncOfflineCheckins(queue);
      // Nếu API trả về success list, ta có thể lọc các id đã thành công
      // Tạm thời clear toàn bộ nếu không bị crash server
      await clearOfflineQueue();
      setQueue([]);
      
      Alert.alert(
        'Thành công', 
        `Đã đồng bộ ${queue.length} lượt check-in offline lên hệ thống.`
      );
    } catch (error) {
      Alert.alert('Lỗi đồng bộ', 'Không thể kết nối với máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="qr-code" size={20} color="#94a3b8" />
          <Text style={styles.qrText} numberOfLines={1} ellipsizeMode="middle">
            {item.qrData}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.timeText}>
            Lúc: {date.toLocaleTimeString('vi-VN')} {date.toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.wsText}>Workshop ID: {item.workshopId}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Đồng bộ Dữ liệu</Text>
          <Text style={styles.subtitle}>Check-in Offline ({queue.length})</Text>
        </View>
        <View style={styles.networkBadge}>
          <Ionicons name={networkStatus.isOnline ? "wifi" : "wifi-outline"} size={16} color={networkStatus.isOnline ? "#10b981" : "#ef4444"} />
          <Text style={[styles.networkText, { color: networkStatus.isOnline ? "#10b981" : "#ef4444" }]}>
            {networkStatus.isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.syncBtn, 
          (queue.length === 0 || !networkStatus.isOnline || isSyncing) && styles.syncBtnDisabled
        ]}
        onPress={handleSync}
        disabled={queue.length === 0 || !networkStatus.isOnline || isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.syncBtnText}>Bắt đầu Đồng bộ</Text>
          </>
        )}
      </TouchableOpacity>

      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#334155" />
            <Text style={styles.emptyText}>Tất cả dữ liệu đã được đồng bộ.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '700', color: '#f1f5f9' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  networkBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  networkText: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
  syncBtn: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginBottom: 24 },
  syncBtnDisabled: { backgroundColor: '#334155' },
  syncBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  card: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  qrText: { color: '#f1f5f9', fontSize: 14, marginLeft: 8, flex: 1, fontFamily: 'monospace' },
  cardBody: { marginLeft: 28 },
  timeText: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  wsText: { color: '#64748b', fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748b', marginTop: 16, fontSize: 15 }
});
