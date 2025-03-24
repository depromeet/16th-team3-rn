import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import PushNotification from 'react-native-push-notification';

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

/**
 * 알림 예약 함수
 * @param {number} delaySeconds 알림 예약까지의 지연 시간(초), 기본값은 60초
 * @param {string} title 알림 제목, 기본값은 "알림"
 * @param {string} message 알림 메시지, 기본값은 "지정된 시간이 되었습니다!"
 * @param {string} route 웹뷰에서 열 경로, 기본값은 "/default"
 */
export const scheduleNotification = (
  delaySeconds = 60,
  title = '알림',
  message = '지정된 시간이 되었습니다!',
  route = '/home-page',
) => {
  PushNotification.localNotificationSchedule({
    title, // 알림 제목
    message, // 알림 메시지
    date: new Date(Date.now() + delaySeconds * 1000), // 예약 시간 설정
    playSound: true, // 소리 재생 활성화
    soundName: 'default', // iOS 기본 사운드 사용
    userInfo: {route},
  });
};
