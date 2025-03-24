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
            JSON.stringify({
              image: base64,
              taskId: taskId,
            }),
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
      {/* 상단 헤더: 뒤로가기 버튼 + "오늘의 미션" + 추가 텍스트 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          {/* 
            실제 아이콘(예: Ionicons, Feather 등)을 쓰려면:
            <Ionicons name="chevron-back" size={24} color="#fff" />
            또는 <Image source={...} style={styles.backIcon} />
          */}
          <Image source={ArrowLeft} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 미션</Text>
        <Text style={styles.missionText}>책상에서 피그마 프로그램 켜기</Text>
      </View>
      {/* 진행 상황 표시 바 (30초 타이머) */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              transform: [
                {
                  scaleX: progressAnimation,
                },
              ],
            },
          ]}
        />
      </View>
      {/* "작업공간이 보이게 사진을 찍어주세요" 툴팁 */}
      <View style={styles.tooltipContainer}>
        <Text style={styles.tooltipText}>
          작업공간이 보이게 사진을 찍어주세요
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
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tooltipText: {
    color: 'black',
    fontSize: 14,
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
