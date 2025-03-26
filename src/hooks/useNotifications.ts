import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {requestUserPermission} from '../utils/permission';
import {WebViewManager} from '../utils/WebViewManager';
import {useNavigation} from '@react-navigation/native';

export const useNotifications = () => {
  const navigation = useNavigation();
  // 알림 클릭 시 네비게이션 처리 공통 함수
  const handleNotification = (remoteMessage: any) => {
    if (remoteMessage) {
      const {data} = remoteMessage;
      console.log('1. Notification clicked:', data);
      if (data?.route) {
        const routeToOpen = data.taskId
          ? data.route.includes('?')
            ? `${data.route.split('?')[0]}/${data.taskId}?${
                data.route.split('?')[1]
              }`
            : `${data.route}/${data.taskId}`
          : data.route;
        console.log('2. routeToOpen:', routeToOpen);

        console.log('4. 네비게이션이 준비된 상태');
        navigation.navigate('WebView', {routeToOpen});
        console.log('5. 네비게이션 실행됨');
      }
    }
  };

  useEffect(() => {
    // 앱 시작 시 알림 권한 요청
    // requestUserPermission();

    // 앱이 quit(종료) 상태였다가 알림 클릭으로 실행된 경우
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('앱이 종료되었는데, 알림 클릭으로 실행된 경우');
        handleNotification(remoteMessage);
      });

    // 앱이 백그라운드 상태에서 알림을 클릭한 경우
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('백그라운드시,알림 클릭');
      const {data} = remoteMessage;
      const routeToOpen = data.taskId
        ? data.route.includes('?')
          ? `${data.route.split('?')[0]}/${data.taskId}?${
              data.route.split('?')[1]
            }`
          : `${data.route}/${data.taskId}`
        : data.route;

      WebViewManager.webViewRef?.current?.injectJavaScript(`
        if (window.location.href !== '${routeToOpen}') {
          window.location.href = '${routeToOpen}';
        } else {
        }
        true;
      `);
      //   handleNotification(remoteMessage);
    });

    // 포그라운드 상태에서 수신되는 메시지 (필요 시 처리)
    const unsubscribeForeground = messaging().onMessage(remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      // 포그라운드 알림에 대한 추가 처리가 필요하다면 여기에 작성
    });

    return () => {
      unsubscribe();
      unsubscribeForeground();
    };
  }, []);
};
