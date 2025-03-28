// utilities.js
import {Platform} from 'react-native';

export const getDeepLink = (path = '') => {
  const scheme = 'spurt'; // Info.plist, AndroidManifest에 등록한 스킴

  // Android에서는 "my-scheme://my-host/" 형태, iOS는 "my-scheme://"
  const prefix =
    Platform.OS === 'android' ? `${scheme}://my-host/` : `${scheme}://`;

  return prefix + path;
};
