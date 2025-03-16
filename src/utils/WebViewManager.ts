import {Alert, Platform} from 'react-native';

export const WebViewManager = {
  webViewRef: null,
  setWebViewRef: (ref: any) => {
    WebViewManager.webViewRef = ref;
  },
  postMessage: (data: any, type: string) => {
    if (type === 'CAPTURED_IMAGE') {
      const message = JSON.stringify({
        type: type,
        payload: {
          image: `data:image/jpeg;base64,${data}`,
        },
      });
      WebViewManager.webViewRef?.current?.postMessage(message);
    } else {
      Alert.alert('postMessage', Platform.OS.toUpperCase());
      const message = JSON.stringify({
        type: type,
        payload: {
          fcmToken: data,
          deviceType: Platform.OS.toUpperCase(),
        },
      });
      WebViewManager.webViewRef?.current?.postMessage(message);
    }
  },
};
