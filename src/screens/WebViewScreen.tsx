import {useCallback, useEffect, useRef, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Vibration} from 'react-native';
import {WebViewManager} from '../utils/WebViewManager';
import {useCameraPermission} from 'react-native-vision-camera';
import {useFCM} from '../context/FCMContext';

export default function WebViewScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const webViewRef = useRef<WebView>(null);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [hasInjected, setHasInjected] = useState(false);
  const {fcmToken} = useFCM();
  // 알림에서 전달받은 경로
  const {routeToOpen} = route.params || {};

  useEffect(() => {
    WebViewManager.setWebViewRef(webViewRef);
  }, [webViewRef]);

  const handleWebViewMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Received message:', message);

      switch (message.type) {
        case 'CAMERA_OPEN':
          // 카메라 권한 확인 및 요청
          if (!hasPermission) {
            const granted = await requestPermission();
            // Alert.alert('카메라 권한 확인', `${granted}`);
            if (!granted) {
              console.log('Permission not granted');
              return;
            }
          } else {
            console.log('Navigating to CameraViewScreen...');
            navigation.navigate('CameraView');
          }
          break;
        case 'VIBRATE_ON':
          Vibration.vibrate([1000, 500], true);
          break;
        case 'VIBRATE_OFF':
          Vibration.cancel();
          break;
        case 'KEY_DOWN':
          console.log('KEY_DOWN');
          break;
        case 'test':
          console.log('test');
          console.log('test');
          console.log('test');
          break;

        case 'GET_DEVICE_TOKEN':
          console.log('GET_DEVICE_TOKEN');
          WebViewManager.postMessage(fcmToken, 'GET_DEVICE_TOKEN');
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // WebView가 로드된 후 (onLoadEnd)에 routeToOpen이 있다면 injectJavaScript로 페이지 이동
  const handleWebViewLoadEnd = useCallback(() => {
    console.log('handleWebViewLoadEnd');
    if (routeToOpen && !hasInjected) {
      setHasInjected(true);
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          if (window.location.href !== '${routeToOpen}') {
            window.location.href = '${routeToOpen}';
          }
          true;
        `);
      }, 200);
    }
  }, [routeToOpen, hasInjected]);

  // WebView ref (이미 존재하는 경우 사용)
  // 예: const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // 앱 실행 시 딥링크로 열렸다면 처리
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('Initial URL:', url);
        // 예: WebView에 JS를 주입하거나 상태 업데이트하여 로그인 완료를 처리
        webViewRef.current?.injectJavaScript(`
        // 카카오 로그인 결과를 처리하는 커스텀 이벤트 발송 예시
        window.dispatchEvent(new CustomEvent('handleKakaoLogin', { detail: { url: '${url}' } }));
        true;
      `);
      }
    });

    // 앱이 백그라운드에서 포그라운드로 전환될 때 처리
    const subscription = Linking.addEventListener('url', ({url}) => {
      console.log('Received URL from Linking:', url);
      webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent('handleKakaoLogin', { detail: { url: '${url}' } }));
      true;
    `);
    });

    return () => subscription.remove();
  }, []);

  // iOS에서 커스텀 URL 스킴(예: kakaotalk://) 감지하여 외부 앱 호출
  const handleShouldStartLoadWithRequest = (request: any) => {
    const {url} = request;
    if (url.startsWith('kakaotalk://') || url.startsWith('kakaokommand://')) {
      Linking.openURL(url);
      return false; // 웹뷰에서는 해당 URL 로드하지 않음
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={false} />
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{uri: 'https://spurt.site'}}
        onMessage={handleWebViewMessage}
        onLoad={() => console.log('onLoad')}
        onLoadEnd={handleWebViewLoadEnd}
        onError={event => {
          console.error('WebView error: ', event.nativeEvent);
        }}
        // 추가: 커스텀 URL 스킴 처리
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        // 추가: Kakao 하이브리드 환경 감지를 위한 user agent 설정 (iOS의 경우)
        userAgent={
          Platform.OS === 'ios'
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            : undefined
        }
        javaScriptEnabled={true}
        sharedCookiesEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingVertical: 10,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 6,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureCore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
  },
});
