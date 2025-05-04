// utils/hapticFeedback.js
import HapticFeedback from 'react-native-haptic-feedback';

// 공통 옵션
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * 지원 가능한 스타일 목록
 */
export const HapticStyles = {
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',
  selection: 'selection',
  notificationSuccess: 'notificationSuccess',
  notificationWarning: 'notificationWarning',
  notificationError: 'notificationError',
};

/**
 * 햅틱 효과 트리거
 * @param {string} style
 */
export function triggerHaptic(style: string) {
  // style이 HapticStyles에 없으면 기본 impactLight 사용
  const chosen =
    style in HapticStyles
      ? (style as keyof typeof HapticStyles)
      : 'impactLight';
  HapticFeedback.trigger(chosen, options);
}
