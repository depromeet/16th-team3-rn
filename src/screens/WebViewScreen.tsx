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
import {requestUserPermission} from '../utils/permission';

import InAppBrowser from 'react-native-inappbrowser-reborn';

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
            navigation.navigate('CameraView', {
              taskId: message.payload?.taskId,
            });
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

        case 'GET_DEVICE_TOKEN': {
          console.log('GET_DEVICE_TOKEN');
          // 알림 권한 요청 후 토큰 받아오기
          const fcmToken = await requestUserPermission();
          if (!fcmToken) {
            WebViewManager.postMessage(
              null,
              'GET_DEVICE_TOKEN',
              '권한이 없어서 토큰이 없음',
            );

            return;
          }

          WebViewManager.postMessage(
            fcmToken,
            'GET_DEVICE_TOKEN',
            '핸들러통해서옴',
          );
          break;
        }
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  // WebView가 로드된 후 (onLoadEnd)에 routeToOpen이 있다면 injectJavaScript로 페이지 이동
  const handleWebViewLoadEnd = useCallback(() => {
    console.log('1. handleWebViewLoadEnd 시작');

    if (routeToOpen && !hasInjected) {
      setHasInjected(true);

      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
        if (window.location.href !== '${routeToOpen}') {
          window.location.href = '${routeToOpen}';
          console.log('9. 페이지 이동 실행: ${routeToOpen}');
        } else {
          console.log('9. 현재 페이지가 이미 해당 route임');
        }
        true;
      `);
      }, 200);
    }
  }, [routeToOpen, hasInjected]);

  // WebView ref (이미 존재하는 경우 사용)
  // 예: const webViewRef = useRef<WebView>(null);

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
      Alert.alert('로그인 완료', `인가 코드: ${authCode}`);
      WebViewManager.postMessage(
        authCode,
        'KAKAO_AUTH_TOKEN',
        '카카오 로그인 완료',
      );
    } else {
      console.log('인가 코드가 URL에 없습니다.');
    }
  };

  // 인앱 브라우저 처리
  const handleLinkPress = async (url: string) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          // iOS 프로퍼티 참고
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: 'white',
          preferredControlTintColor: 'black',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android 프로퍼티 참고
          showTitle: true,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          navigationBarColor: 'black',
          navigationBarDividerColor: 'white',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
        });
      } else {
        Linking.openURL(url);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // iOS에서 커스텀 URL 스킴(예: kakaotalk://) 감지하여 외부 앱 호출
  const handleShouldStartLoadWithRequest = (request: any) => {
    const {url} = request;
    if (url.startsWith('kakaotalk://') || url.startsWith('kakaokommand://')) {
      Linking.openURL(url);
      return false; // 웹뷰에서는 해당 URL 로드하지 않음
    }
    if (!request.url.startsWith('https://spurt.site')) {
      handleLinkPress(request.url);
      return false; // WebView가 직접 열지 않도록 중단
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
        keyboardDisplayRequiresUserAction={false}
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
