import {
  StyleSheet,
  Modal,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Gesture,
  GestureHandlerRootView,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import StickerPicker from "./stickerPicker";
import { useState } from "react";
import Sticker from "./Sticker";

const { width, height } = Dimensions.get("screen");
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export default function ModalEditImage({
  image,
  imageMirror,
  visible,
  onClose,
}) {
  const [modalSticker, setModalSticker] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState();

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
      { scaleX: imageMirror },
      { scale: scale.value },
      { translateX: imageMirror === -1 ? -translateX.value : translateX.value },
      { translateY: translateY.value },
      {
        rotate: imageMirror === -1 ? `${-angle.value}rad` : `${angle.value}rad`,
      },
    ],
  }));

  return (
    <Modal style={styles.container} visible={visible} animationType="slide">
      {/* IMAGEM */}
      <GestureHandlerRootView>
        <GestureDetector gesture={gestures}>
          <SafeAreaView style={styles.container}>
            {/* ÁREA DELIMITADA DA IMAGEM */}
            <View style={styles.imageArea}>
              {selectedSticker && <Sticker stickerSource={selectedSticker} />}

              {/* IMAGEM */}
              <Animated.Image
                source={{ uri: image.uri }}
                style={[
                  {
                    width: (image.width * height) / image.height,
                    height: height,
                  },
                  imageAnimatedStyles,
                ]}
              />
            </View>
          </SafeAreaView>
        </GestureDetector>
      </GestureHandlerRootView>

      {/* BOTÕES */}
      <View style={styles.buttonContainerModal}>
        {/* BOTÃO DE FECHAR MODAL DE EDITAR FOTO */}
        <TouchableOpacity style={styles.buttonModal} onPress={onClose}>
          <MaterialIcons size={30} name="close" color={"white"} />
        </TouchableOpacity>

        <View style={styles.buttonContainerModal2}>
          {/* BOTÃO DE ADICIONAR STICKER */}
          <TouchableOpacity
            style={styles.buttonModal}
            onPress={() => setModalSticker(true)}
          >
            <MaterialIcons size={30} name="filter-frames" color={"white"} />
          </TouchableOpacity>

          {/* BOTÃO DELETAR STICKERS */}
          <TouchableOpacity style={styles.buttonModal}>
            <MaterialIcons size={30} name="delete" color={"white"} />
          </TouchableOpacity>

          {/* BOTÃO DE SALVAR FOTO */}
          <TouchableOpacity style={styles.buttonModal}>
            <MaterialIcons size={30} name="download" color={"white"} />
          </TouchableOpacity>
        </View>
      </View>

      <StickerPicker
        isVisible={modalSticker}
        onClose={() => setModalSticker(false)}
        onSelect={setSelectedSticker}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0C0C0C",
    alignItems: "center",
    justifyContent: "center",
  },
  imageArea: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0C0C0C",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
  },
  buttonContainerModal: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    alignSelf: "flex-start",
    justifyContent: "space-between",

    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  buttonContainerModal2: {
    flexDirection: "row",
    gap: 8,
  },
  buttonModal: {
    width: 48,
    height: 48,
    backgroundColor: "black",
    opacity: 0.75,
    borderRadius: 100,

    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
});
