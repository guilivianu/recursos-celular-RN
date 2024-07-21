import {
  Gesture,
  GestureHandlerRootView,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Image, Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen");
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export default function Sticker({ stickerSource }) {
  // Alterar o tamanho da imagem
  const startScale = useSharedValue(0);
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(
        startScale.value * event.scale,
        0.3,
        Math.min(width / 100, height / 100)
      );
    })
    .runOnJS(true);

  // Alterar a posição da imagem
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const drag = Gesture.Pan().onChange((event) => {
    translateX.value += event.changeX / scale.value;
    translateY.value += event.changeY / scale.value;
  });

  // Rotacionar imagem
  const startAngle = useSharedValue(0);
  const angle = useSharedValue(0);

  const rotation = Gesture.Rotation()
    .onStart(() => {
      startAngle.value = angle.value;
    })
    .onUpdate((event) => {
      angle.value = startAngle.value + event.rotation;
    });

  const gestures = Gesture.Simultaneous(pinch, drag, rotation);

  const imageAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${angle.value}rad`,
      },
    ],
  }));
  return (
    <GestureDetector gesture={gestures}>
      <Animated.Image
        source={stickerSource}
        style={[
          {
            width: 125,
            height: 125,
            position: "absolute",
            zIndex: 2,
            top: 350,
            objectFit: "contain",
          },
          imageAnimatedStyles,
        ]}
      />
    </GestureDetector>
  );
}
