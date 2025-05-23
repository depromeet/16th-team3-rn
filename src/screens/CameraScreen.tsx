import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Text,
  Image,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {WebViewManager} from '../utils/WebViewManager';
import RNFS from 'react-native-fs';
import ArrowLeft from '../assets/arrow-left.png';

export default function CameraScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const taskId = route.params?.taskId;
  const action = route.params?.action;

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const progressAnimation = useRef(new Animated.Value(1)).current;
  const PROGRESS_DURATION = 30000; // 30초

  useEffect(() => {
    if (isCameraReady) {
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: PROGRESS_DURATION,
        useNativeDriver: true,
      }).start(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      });
    }
  }, [isCameraReady, navigation, progressAnimation]);

  const handleCapture = async () => {
    if (camera.current && isCameraReady && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await camera.current.takePhoto({
          flash: 'off',
        });
        if (photo?.path) {
          const base64 = await RNFS.readFile(photo.path, 'base64');
          WebViewManager.postMessage(
            {
              image: base64,
              taskId: taskId,
            },
            'CAPTURED_IMAGE',
            '카메라 촬영',
          );
        }
        setTimeout(() => {
          navigation.goBack();
        }, 400);
      } catch (error) {
        console.error('Failed to take photo:', error);
        navigation.goBack();
      } finally {
        setIsCapturing(false);
      }
    }
  };
  if (!device) return null;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsCameraReady(true)}
        onError={error => {
          console.error('Camera error:', error);
        }}
      />

      {/* "작업공간이 보이게 사진을 찍어주세요" 툴팁 */}
      <View style={styles.tooltipContainer}>
        <Text style={styles.tooltipText}>
          {action}
          {'\n'}
          준비가 완료됐다면, 사진을 찍어 인증을 완료해주세요!
        </Text>
      </View>
      {/* 촬영 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            !isCameraReady && styles.captureButtonDisabled,
          ]}
          onPress={handleCapture}
          disabled={!isCameraReady}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* 상단 헤더 영역 */
  headerContainer: {
    position: 'absolute',
    top: 50, // 기기 종류에 따라 SafeAreaView로 감싸거나 여백 조절
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 0,
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  missionText: {
    color: '#fff',
    fontSize: 14,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff', // 아이콘 색상 변경(흰색)
    resizeMode: 'contain',
  },

  /* 진행 상황 바 */
  progressContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C47FF',
    transformOrigin: 'left',
  },

  /* 툴팁 영역 */
  tooltipContainer: {
    position: 'absolute',
    bottom: 120, // 촬영 버튼 위쪽에 배치
    alignSelf: 'center',
    backgroundColor: '#2A2F38',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -10, // 말풍선 아래쪽 화살표
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0,0,0,0.7)',
  },

  /* 촬영 버튼 */
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
});
