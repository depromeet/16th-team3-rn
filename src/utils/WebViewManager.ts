import {Platform} from 'react-native';

// WebViewRef 타입 정의
type WebViewRef = {
  current: {
    postMessage: (message: string) => void;
  } | null;
};

export const WebViewManager = {
  webViewRef: null as WebViewRef | null,
  setWebViewRef: (ref: WebViewRef) => {
    WebViewManager.webViewRef = ref;
  },
  postMessage: (data: any, type: string, msg?: string) => {
    if (type === 'CAPTURED_IMAGE') {
      console.log('CAPTURED_IMAGE', data);
      const message = JSON.stringify({
        type: type,
        payload: {
          image: `data:image/jpeg;base64,${data.image}`,
          taskId: data.taskId,
        },
      });
      WebViewManager.webViewRef?.current?.postMessage(message);
    }
    if (type === 'GET_DEVICE_TOKEN') {
      const message = JSON.stringify({
        type: type,
        payload: {
          fcmToken: data,
          deviceType: Platform.OS.toUpperCase(),
          message: msg,
        },
      });
      console.log('RN에서 WebView로 메시지 전송:', message);
      console.log(
        'webViewRef 상태:',
        WebViewManager.webViewRef ? '존재함' : '존재하지 않음',
      );
      console.log(
        'webViewRef.current 상태:',
        WebViewManager.webViewRef?.current ? '존재함' : '존재하지 않음',
      );

      if (WebViewManager.webViewRef?.current) {
        try {
          WebViewManager.webViewRef.current.postMessage(message);
          console.log('메시지가 성공적으로 전송됨');
        } catch (error) {
          console.error('메시지 전송 중 오류 발생:', error);
        }
      } else {
        console.error(
          'webViewRef.current가 존재하지 않아 메시지를 전송할 수 없음',
        );
      }
    }
    if (type === 'GET_DEVICE_TYPE') {
      const message = JSON.stringify({
        type: type,
        payload: {
          deviceType: Platform.OS.toUpperCase(),
        },
      });
      WebViewManager.webViewRef?.current?.postMessage(message);
    }
  },
};
