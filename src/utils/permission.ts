import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';

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

    // const fcmToken = await getFCMToken();
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  } catch (error) {
    console.error('Error requesting user permission:', error);
  }
}
