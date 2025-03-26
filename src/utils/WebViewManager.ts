import {Platform} from 'react-native';

export const WebViewManager = {
  webViewRef: null,
  setWebViewRef: (ref: any) => {
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
      WebViewManager.webViewRef?.current?.postMessage(message);
    }
  },
};
