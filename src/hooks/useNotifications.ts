import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {requestUserPermission} from '../utils/permission';
import {handleNotificationOpen} from '../services/notificationService';
import {Vibration} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export const useNotifications = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // 앱 시작 시 알림 권한 요청
    requestUserPermission();

    // 1. 앱이 완전히 종료된 상태에서 알림을 클릭한 경우
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const {data} = remoteMessage;
          console.log('data', data);
          if (data?.route) {
            // 네이티브 라우터를 통해 WebViewScreen으로 이동,
            // 파라미터(routeToOpen)에 실제 경로를 담아 보냄
            navigation.navigate('WebView', {
              routeToOpen: `${data.route}/${data.taskId}`,
            });
          }
        }
      });

    // 2. 앱이 백그라운드 상태에서 알림을 클릭한 경우
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        const {data} = remoteMessage;
        console.log('data', data);
        handleNotificationOpen(remoteMessage);
      }
    });

    return unsubscribe; // 컴포넌트 언마운트 시 정리
  }, []);
};
