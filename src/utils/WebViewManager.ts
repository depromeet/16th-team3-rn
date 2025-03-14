export const WebViewManager = {
  webViewRef: null,
  setWebViewRef: (ref: any) => {
    WebViewManager.webViewRef = ref;
  },
  postMessage: (data: any) => {
    const message = JSON.stringify({
      type: 'CAPTURED_IMAGE',
      payload: {
        image: `data:image/jpeg;base64,${data}`,
      },
    });
    console.log('message', message);
    console.log('message', WebViewManager.webViewRef);
    console.log(
      'WebViewManager.webViewRef?.current:',
      WebViewManager.webViewRef?.current,
    );

    WebViewManager.webViewRef?.current?.injectJavaScript(`
      window.postMessage(${JSON.stringify(message)}, '*');
      true;
    `);
  },
};
