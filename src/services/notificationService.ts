import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

export const checkNotificationPermission = async () => {
  try {
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log(
      '알림 권한 상태:',
      authStatus === messaging.AuthorizationStatus.AUTHORIZED
        ? '허용됨'
        : authStatus === messaging.AuthorizationStatus.PROVISIONAL
        ? '임시 허용됨'
        : authStatus === messaging.AuthorizationStatus.DENIED
        ? '거부됨'
        : '결정되지 않음',
    );

    return enabled;
  } catch (error) {
    console.error('알림 권한 확인 실패:', error);
    return false;
  }
};

// 🔥 FCM 토큰 가져오기 및 서버 저장
export const getFCMToken = async () => {
  try {
    // 푸시 알림 권한 확인 - await 추가
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      Alert.alert('알림 권한 필요', '앱 설정에서 알림을 허용해주세요.');
      console.warn('푸시 알림 권한이 거부되었습니다.');
      return null;
    }

    // 나머지 코드는 동일
    const fcmToken = await messaging().getToken();
    console.log('✅ FCM 토큰:', fcmToken);

    return fcmToken || null;
  } catch (error) {
    console.error('🚨 FCM 토큰 가져오기 실패:', error);
    return null;
  }
};
