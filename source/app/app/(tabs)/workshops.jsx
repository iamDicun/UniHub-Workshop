import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { getAssignedWorkshops } from '../../src/api/workshop';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function WorkshopsScreen() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchWorkshops = async () => {
    try {
      const data = await getAssignedWorkshops();
      // Dummy data trong trường hợp API chưa có backend hoàn chỉnh
      const displayData = data?.length ? data : [
        { id: '1', title: 'Kỹ năng Phỏng vấn', room: 'Phòng 101', time: '08:00 - 10:00' },
        { id: '2', title: 'Design Pattern', room: 'Phòng 205', time: '13:00 - 15:00' }
      ];
      setWorkshops(displayData);
    } catch (error) {
      console.error('Lỗi khi tải workshop:', error);
      // Fallback dummy
      setWorkshops([
        { id: '1', title: 'Kỹ năng Phỏng vấn', room: 'Phòng 101', time: '08:00 - 10:00' },
        { id: '2', title: 'Design Pattern', room: 'Phòng 205', time: '13:00 - 15:00' }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleSelectWorkshop = async (workshop) => {
    // Lưu workshop ID đang chọn vào storage để Scanner màn hình tự động dùng
    await AsyncStorage.setItem('@selected_workshop', JSON.stringify(workshop));
    // Chuyển sang tab Scanner
    router.navigate('/(tabs)/scanner');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectWorkshop(item)}>
      <View style={styles.cardHeader}>
        <Ionicons name="easel-outline" size={24} color="#6366f1" />
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#94a3b8" />
          <Text style={styles.infoText}>{item.room}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#94a3b8" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.selectText}>Chọn để Check-in</Text>
        <Ionicons name="arrow-forward" size={16} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Workshop Hôm Nay</Text>
      <Text style={styles.subTitle}>Chọn một workshop bạn đang phụ trách để bắt đầu quét QR.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={workshops}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkshops(); }} tintColor="#6366f1" />}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có workshop nào được phân công.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#f1f5f9', marginBottom: 4, marginTop: 10 },
  subTitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#f1f5f9', marginLeft: 12, flex: 1 },
  cardBody: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { fontSize: 14, color: '#cbd5e1', marginLeft: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  selectText: { fontSize: 14, fontWeight: '600', color: '#6366f1', marginRight: 4 },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 16 }
});
