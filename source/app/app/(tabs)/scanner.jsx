import React, { useState, useEffect, useRef } from 'react';
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
  const [resultMessage, setResultMessage] = useState(null); // {type: 'success'|'error'|'offline', text: string}
  // Ref ngăn chặn quét trùng lặp — dùng ref thay vì state vì state update không kịp giữa các frame
  const lastScannedRef = useRef(null);
  const lockRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadSelectedWorkshop();
      // Reset khi quay lại tab
      setScanned(false);
      setResultMessage(null);
      lockRef.current = false;
      lastScannedRef.current = null;
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

  // Cho phép quét lại — user bấm nút xác nhận
  const handleRescan = () => {
    setScanned(false);
    setResultMessage(null);
    lockRef.current = false;
    lastScannedRef.current = null;
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    // === CHỐNG QUÉT TRÙNG LẶP ===
    // Kiểm tra lock ngay lập tức bằng ref (nhanh hơn state)
    if (lockRef.current) return;
    // Nếu cùng mã QR vừa quét → bỏ qua
    if (lastScannedRef.current === data) return;

    // Khóa ngay lập tức
    lockRef.current = true;
    lastScannedRef.current = data;
    setScanned(true);
    setIsProcessing(true);
    setResultMessage(null);

    if (!workshop) {
      setResultMessage({ type: 'error', text: 'Vui lòng chọn Workshop ở tab danh sách trước.' });
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
          setResultMessage({ type: 'success', text: 'Check-in trực tuyến thành công!' });
        } catch (apiError) {
          // Lỗi từ backend (QR sai, đã checkin, hoặc backend sập)
          const msg = apiError.response?.data?.message || 'Không thể check-in online.';
          setResultMessage({ type: 'error', text: msg });
        }
      } else {
        // 2b. Mất mạng: Lưu offline
        const timestamp = new Date().toISOString();
        const success = await addOfflineCheckin(workshop.id, data, timestamp);
        if (success) {
          setResultMessage({
            type: 'offline',
            text: 'Đã ghi nhận check-in tạm thời.\nSẽ tự động đồng bộ khi có mạng.',
          });
        } else {
          setResultMessage({
            type: 'error',
            text: 'QR Code này đã được quét ở chế độ offline trước đó.',
          });
        }
      }
    } catch (error) {
      setResultMessage({ type: 'error', text: 'Đã xảy ra lỗi không xác định.' });
    } finally {
      setIsProcessing(false);
      // KHÔNG tự mở khóa — chờ user bấm nút "Quét tiếp"
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

  // Xác định icon và màu cho kết quả
  const getResultStyle = () => {
    if (!resultMessage) return {};
    switch (resultMessage.type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' };
      case 'offline':
        return { icon: 'cloud-offline', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' };
      case 'error':
      default:
        return { icon: 'close-circle', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' };
    }
  };

  const resultStyle = getResultStyle();

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Đang quét cho:</Text>
        <Text style={styles.workshopTitle}>{workshop.title}</Text>
        <Text style={styles.roomInfo}>{workshop.room}</Text>
      </View>

      <View style={styles.cameraContainer}>
        {/* Camera chỉ active khi chưa quét xong */}
        {!scanned ? (
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
        ) : (
          <View style={styles.camera} />
        )}
        <View style={styles.overlay}>
          {!scanned && <View style={styles.scanFrame} />}
        </View>
      </View>

      {/* Hiển thị kết quả quét */}
      {scanned && (
        <View style={styles.resultOverlay}>
          {isProcessing ? (
            <View style={styles.resultCard}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.processingText}>Đang xử lý...</Text>
            </View>
          ) : resultMessage ? (
            <View style={[styles.resultCard, { borderColor: resultStyle.color }]}>
              <View style={[styles.resultIconBg, { backgroundColor: resultStyle.bgColor }]}>
                <Ionicons name={resultStyle.icon} size={48} color={resultStyle.color} />
              </View>
              <Text style={[styles.resultText, { color: resultStyle.color }]}>
                {resultMessage.text}
              </Text>
              <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}>
                <Ionicons name="scan-outline" size={20} color="#fff" />
                <Text style={styles.rescanText}>Quét tiếp</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
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
  camera: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#6366f1', backgroundColor: 'transparent', borderRadius: 12 },

  // Kết quả quét
  resultOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.92)', zIndex: 20 },
  resultCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 32, alignItems: 'center', marginHorizontal: 32, borderWidth: 1, borderColor: '#334155' },
  resultIconBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  resultText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  processingText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
  rescanBtn: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30 },
  rescanText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
