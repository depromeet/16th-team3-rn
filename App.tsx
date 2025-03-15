import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import WebViewScreen from './src/screens/WebViewScreen';
import CameraScreen from './src/screens/CameraScreen';
import {useNotifications} from './src/hooks/useNotifications';
import {FCMProvider} from './src/context/FCMContext';
import {getFCMToken} from './src/services/notificationService';
import {useFCM} from './src/context/FCMContext';

const Stack = createNativeStackNavigator();

function NotificationHandler() {
  useNotifications();
  const {setFcmToken} = useFCM();

  useEffect(() => {
    const initFCM = async () => {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
      }
    };

    initFCM();
  }, [setFcmToken]);

  return null;
}

function App(): React.JSX.Element {
  return (
    <FCMProvider>
      <NavigationContainer>
        <NotificationHandler />
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
