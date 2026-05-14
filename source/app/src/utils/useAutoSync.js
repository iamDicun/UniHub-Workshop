import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';
import { Alert, AppState } from 'react-native';
import { getOfflineQueue, clearOfflineQueue } from './storage';
import { syncOfflineCheckins } from '../api/workshop';

/**
 * Hook tự động đồng bộ dữ liệu offline khi có mạng trở lại.
 * - Lắng nghe AppState (foreground/background)
 * - Poll kiểm tra mạng mỗi 10 giây khi app đang active
 * - Khi phát hiện online + có queue → tự đồng bộ
 */
export function useAutoSync() {
  const isSyncing = useRef(false);
  const wasOffline = useRef(false);
  const intervalRef = useRef(null);

  const attemptSync = async () => {
    // Nếu đang sync thì bỏ qua
    if (isSyncing.current) return;

    try {
      const networkState = await Network.getNetworkStateAsync();
      const isOnline = networkState.isConnected && networkState.isInternetReachable !== false;

      if (!isOnline) {
        wasOffline.current = true;
        return;
      }

      // Chỉ sync khi có dữ liệu trong queue
      const queue = await getOfflineQueue();
      if (queue.length === 0) return;

      // Đánh dấu đang sync
      isSyncing.current = true;

      console.log(`[AutoSync] Đang tự động đồng bộ ${queue.length} check-in...`);

      const result = await syncOfflineCheckins(queue);

      // Xóa queue sau khi đồng bộ thành công
      await clearOfflineQueue();

      console.log(`[AutoSync] Hoàn tất: ${result.syncedCount} thành công, ${result.failedCount} thất bại`);

      // Hiển thị thông báo cho user biết
      Alert.alert(
        '✅ Tự động đồng bộ',
        `Đã đồng bộ ${result.syncedCount} check-in offline lên hệ thống.${result.failedCount > 0 ? `\n${result.failedCount} check-in thất bại.` : ''}`,
      );

      wasOffline.current = false;
    } catch (error) {
      console.error('[AutoSync] Lỗi khi đồng bộ:', error);
    } finally {
      isSyncing.current = false;
    }
  };

  useEffect(() => {
    // Thử sync ngay khi app khởi động
    attemptSync();

    // Poll mỗi 10 giây khi app đang active
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(attemptSync, 10000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startPolling();

    // Lắng nghe app state: chỉ poll khi app active
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // Khi app quay lại foreground → thử sync ngay + tiếp tục poll
        attemptSync();
        startPolling();
      } else {
        // App vào background → dừng poll để tiết kiệm pin
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      appStateSub.remove();
    };
  }, []);
}
