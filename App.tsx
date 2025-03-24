import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import WebViewScreen from './src/screens/WebViewScreen';
import CameraScreen from './src/screens/CameraScreen';
import {useNotifications} from './src/hooks/useNotifications';
import {FCMProvider} from './src/context/FCMContext';
import {useFCM} from './src/context/FCMContext';
import {Linking} from 'react-native';
import {WebViewManager} from './src/utils/WebViewManager';
import {navigationRef, navigate} from './src/utils/NavigationService';
import PushNotification from 'react-native-push-notification';

const Stack = createNativeStackNavigator();

function NotificationHandler() {
  useNotifications();

  return null;
}

function TokenSender() {
  const {fcmToken} = useFCM();

  useEffect(() => {
    if (fcmToken) {
      console.log('TokenSender: fcmToken 업데이트됨:', fcmToken);
      WebViewManager.postMessage(
        fcmToken,
        'GET_DEVICE_TOKEN',
        '토큰 보내기 센더함수',
      );
    }
  }, [fcmToken]);

  return null;
}

function App(): React.JSX.Element {
  useEffect(() => {
    // 앱이 딥링크로 열렸을 때의 초기 URL 처리
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // 앱이 실행 중일 때 딥링크 이벤트 처리
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('Received deep link URL:', url);
    // URL을 파싱해서 인가 코드 추출 (예: spurt://auth?code=abc123)
    const codeMatch = url.match(/code=([^&]+)/);
    if (codeMatch && codeMatch[1]) {
      const authCode = codeMatch[1];
      console.log('Authorization code:', authCode);
      // 여기서 백엔드로 authCode를 전송하거나 웹뷰에 전달해서 로그인 완료 처리를 할 수 있습니다.
    } else {
      console.log('인가 코드가 URL에 없습니다.');
    }
  };

  // 전역 푸쉬 알림 설정 (예시)
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('알림 클릭:', notification);
      if (notification.userInteraction) {
        // iOS는 userInfo, Android는 notification 객체에 직접 추가한 데이터를 사용할 수 있음
        const route =
          notification.route ||
          notification.data?.route ||
          notification.userInfo?.route;
        if (route) {
          // 전역 네비게이션 함수 사용
          navigate('WebView', {routeToOpen: route});
        }
      }
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

  return (
    <FCMProvider>
      <NavigationContainer ref={navigationRef}>
        <NotificationHandler />
        <TokenSender />
        <Stack.Navigator initialRouteName="WebView">
          <Stack.Screen
            name="WebView"
            component={WebViewScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CameraView"
            component={CameraScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </FCMProvider>
  );
}

export default App;
