import {useCallback, useEffect, useRef, useState} from 'react';
import {StatusBar, StyleSheet, View, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {Vibration} from 'react-native';
import {WebViewManager} from '../utils/WebViewManager';
import {useCameraPermission} from 'react-native-vision-camera';

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
    if (webViewRef.current === null) {
      WebViewManager.setWebViewRef(webViewRef);
    }
  }, []);

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
      webViewRef.current?.injectJavaScript(`
        if (window.location.href !== '${routeToOpen}') {
          window.location.href = '${routeToOpen}';
        }
        true;
      `);
    }
  }, [routeToOpen, hasInjected]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={false} />
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{uri: 'https://spurt-tau.vercel.app'}}
        onMessage={handleWebViewMessage}
        onLoad={() => console.log('onLoad')}
        onLoadEnd={handleWebViewLoadEnd}
        javaScriptEnabled={true}
        sharedCookiesEnabled={true}
        domStorageEnabled={true}
        onError={event => {
          console.error('WebView error: ', event.nativeEvent);
        }}
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
