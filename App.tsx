import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import WebViewScreen from './src/screens/WebViewScreen';
import CameraScreen from './src/screens/CameraScreen';
import {useNotifications} from './src/hooks/useNotifications';
const Stack = createNativeStackNavigator();

function NotificationHandler() {
  useNotifications();
  return null;
}

function App(): React.JSX.Element {
  return (
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
  );
}

export default App;
