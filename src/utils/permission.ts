import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import {getFCMToken} from '../services/notificationService';

const requestAndroidPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: '알림 권한',
          message: '앱 알림을 받기 위해 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '거부',
          buttonPositive: '허용',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

// 알림 권한 요청
export async function requestUserPermission() {
  // Android 권한 먼저 확인
  try {
    const androidPermissionGranted = await requestAndroidPermission();
    if (!androidPermissionGranted) return;

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await getFCMToken();
      console.log('Authorization status:', authStatus);
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    }
  } catch (error) {
    console.error('Error requesting user permission:', error);
  }
}

/**
 * 알림 권한이 이미 허용되어 있는지 확인하고, 허용된 경우 푸시 알림을 요청하는 함수
 * @returns 성공 시 FCM 토큰, 실패 시 null
 */
export async function checkPermissionAndRequestPush() {
  try {
    // 현재 알림 권한 상태 확인
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // 권한이 있으면 FCM 토큰 발급 요청
      const fcmToken = await getFCMToken();
      console.log('알림 권한 확인 완료. 푸시 알림 요청 성공');
      console.log('FCM 토큰:', fcmToken);
      return fcmToken;
    } else {
      console.log('알림 권한이 허용되어 있지 않습니다.');
      return null;
    }
  } catch (error) {
    console.error('푸시 알림 요청 중 오류 발생:', error);
    return null;
  }
}
