import {WebViewManager} from '../utils/WebViewManager';
import messaging from '@react-native-firebase/messaging';
import {Alert, Vibration} from 'react-native';

export const handleNotificationOpen = (remoteMessage: any) => {
  const {data} = remoteMessage;
  console.log('data', data);

  // 웹뷰 라우팅 처리
  if (data?.route) {
    WebViewManager.webViewRef.current?.injectJavaScript(`
        window.location.href = '${data.route}/${data.taskId}';
        true;
      `);
  }
  // 진동 취소
  Vibration.cancel();
};

// 🔥 FCM 토큰 가져오기 및 서버 저장
export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    console.log('✅ FCM 토큰:', fcmToken);
    // Alert.alert('FCM 토큰', fcmToken);
    if (fcmToken) {
      // 서버에 FCM 토큰 저장
      // await saveTokenToServer(userId, fcmToken);
      return fcmToken;
    } else {
      console.warn('⚠️ FCM 토큰을 가져오지 못했습니다.');
    }
  } catch (error) {
    console.error('🚨 FCM 토큰 가져오기 실패:', error);
  }
};
