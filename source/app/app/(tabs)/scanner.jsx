import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { checkInStudent } from '../../src/api/workshop';
import { addOfflineCheckin } from '../../src/utils/storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [workshop, setWorkshop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSelectedWorkshop();
      setScanned(false);
    }, [])
  );

  const loadSelectedWorkshop = async () => {
    try {
      const w = await AsyncStorage.getItem('@selected_workshop');
      if (w) setWorkshop(JSON.parse(w));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    if (!workshop) {
      Alert.alert('Lỗi', 'Vui lòng chọn Workshop ở tab danh sách trước.');
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Kiểm tra trạng thái mạng
      const networkState = await Network.getNetworkStateAsync();
      const isOnline = networkState.isConnected && networkState.isInternetReachable !== false;

      if (isOnline) {
        // 2a. Có mạng: Gọi API Check-in trực tiếp
        try {
          await checkInStudent(workshop.id, data);
          Alert.alert('Thành công', 'Check-in trực tuyến thành công!', [{ text: 'OK', onPress: () => setScanned(false) }]);
        } catch (apiError) {
          // Lỗi từ backend (QR sai, đã checkin, hoặc backend sập)
          const msg = apiError.response?.data?.message || 'Không thể check-in online.';
          Alert.alert('Lỗi Check-in', msg, [{ text: 'Quét lại', onPress: () => setScanned(false) }]);
        }
      } else {
        // 2b. Mất mạng: Lưu offline
        const timestamp = new Date().toISOString();
        const success = await addOfflineCheckin(workshop.id, data, timestamp);
        if (success) {
          Alert.alert(
            'Chế độ Offline', 
            'Đã ghi nhận check-in tạm thời. Vui lòng đồng bộ khi có mạng.',
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
        } else {
          Alert.alert('Thông báo', 'QR Code này đã được quét ở chế độ offline trước đó.', [{ text: 'OK', onPress: () => setScanned(false) }]);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi hệ thống', 'Đã xảy ra lỗi không xác định', [{ text: 'OK', onPress: () => setScanned(false) }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator color="#6366f1" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Cần cấp quyền sử dụng Camera để quét QR.</Text>
        <Button onPress={requestPermission} title="Cấp quyền" />
      </View>
    );
  }

  if (!workshop) {
    return (
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={48} color="#fbbf24" style={{ marginBottom: 16 }} />
        <Text style={styles.text}>Bạn chưa chọn Workshop nào.</Text>
        <Text style={styles.subText}>Vui lòng quay lại tab Workshop để chọn sự kiện bạn đang phụ trách.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Đang quét cho:</Text>
        <Text style={styles.workshopTitle}>{workshop.title}</Text>
        <Text style={styles.roomInfo}>{workshop.room}</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Ionicons name="scan-outline" size={20} color="#fff" />
          <Text style={styles.rescanText}>Chạm để quét tiếp</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#f1f5f9', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  subText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  headerInfo: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: 16, borderRadius: 12, zIndex: 10, alignItems: 'center' },
  headerTitle: { color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' },
  workshopTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  roomInfo: { color: '#6366f1', fontSize: 14, marginTop: 4 },
  cameraContainer: { width: '100%', height: '100%' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#6366f1', backgroundColor: 'transparent', borderRadius: 12 },
  rescanBtn: { position: 'absolute', bottom: 40, backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, zIndex: 10 },
  rescanText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 }
});
