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
import * as MediaLibrary from "expo-media-library";

import StickerPicker from "./stickerPicker";
import { useState, useRef } from "react";
import Sticker from "./Sticker";
import { captureRef } from "react-native-view-shot";

const { width, height } = Dimensions.get("screen"); // Dimensões da tela
function clamp(val, min, max) {
  // Função para limitar o valor da escala entre o mínimo e máximo
  return Math.min(Math.max(val, min), max);
}

export default function ModalEditImage({
  image,
  imageMirror,
  visible,
  onClose,
}) {
  const imageRef = useRef(); // Referência da imagem (para salvar)
  const [modalSticker, setModalSticker] = useState(false); // Visibilidade do modal dos stickers
  const [selectedSticker, setSelectedSticker] = useState(); // Sticker selecionado

  // ----------------------------------------------------------------------------------------------------------------------

  // ALTERAR TAMANHO DA IMAGEM
  // Variáveis
  const startScale = useSharedValue(0); // Escala inicial
  const scale = useSharedValue(1); // Escala atual

  // Gesto de "pinça"
  const pinch = Gesture.Pinch()
    .onStart(() => {
      // Início do gesto
      startScale.value = scale.value; // Iguala a escala inicial a escala atual da imagem no momento que o gesto inicia
    })
    .onUpdate((event) => {
      // Durante o gesto (em cada mudança)
      scale.value = clamp(
        startScale.value * event.scale, // val ➔ Escala inicial x o aumento da escala (event.scale ➔ a porcentagem que o movimento de pinça capta que aumentou)
        0.3, // min ➔ Escala mínima que a imagem pode chegar
        Math.min(width / 100, height / 100) // max ➔ Escala máxima que a imagem pode chegar
      );
    })
    .runOnJS(true);

  // ----------------------------------------------------------------------------------------------------------------------

  // ALTERAR POSIÇÃO DA IMAGEM
  // Variáveis
  const translateX = useSharedValue(0); // Posição no eixo X
  const translateY = useSharedValue(0); // Posição no eixo Y

  // Gesto de arrastar
  const drag = Gesture.Pan().onChange((event) => {
    // Posição antes do gesto + mudança de posição (Obs: Está sendo dividido pela escala para dar fluidez ao movimento)
    translateX.value += event.changeX / scale.value; // Eixo X
    translateY.value += event.changeY / scale.value; // Eixo y
  });

  // ----------------------------------------------------------------------------------------------------------------------

  // GIRAR A IMAGEM
  // Variáveis
  const startAngle = useSharedValue(0); // Ângulo inicial (radianos)
  const angle = useSharedValue(0); // Ângulo atual (radianos)

  // Rotacionar imagem
  const rotation = Gesture.Rotation()
    .onStart(() => {
      // Início do gesto
      startAngle.value = angle.value; // Iguala o ângulo inicial ao ângulo atual da imagem no momento que o gesto inicia
    })
    .onUpdate((event) => {
      // Durante o gesto (em cada mudança)
      angle.value = startAngle.value + event.rotation; // Ângulo final é igual a soma do ângulo inicial com a rotação durante o gesto
    });

  // ----------------------------------------------------------------------------------------------------------------------

  // Gesto composto com todos os gestos ("Simultaneous" para que seja possível executar todos os gestos juntos)
  const gestures = Gesture.Simultaneous(pinch, drag, rotation);

  // Atualizar o style
  const imageAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scaleX: imageMirror }, // Define se a imagem deve ser espelhada ou nâo (Obs: Imagem só é espelhada no eixo X)
      { scale: scale.value }, // Escala da imagem (gesto "drag")
      { translateX: imageMirror === -1 ? -translateX.value : translateX.value }, // Deslocamento no eixo X
      { translateY: translateY.value }, // Deslocamento no eixo Y
      {
        rotate: imageMirror === -1 ? `${-angle.value}rad` : `${angle.value}rad`, // Ângulo de rotação da imagem (radianos)
      },
    ],
  }));

  // ----------------------------------------------------------------------------------------------------------------------

  // Salvar a imagem
  async function saveImage() {
    try {
      // Captura a imagem de acordo com uma referência (imageRef => View da área delimitada da imagem)
      const data = await captureRef(imageRef, { quality: 1 }); // Define a qualidade da imagem como a máxima (escala vai de 0 => 1)
      console.log(data);

      await MediaLibrary.saveToLibraryAsync(data); // Salva a imagem na galeria do dispositivo

      if (data) {
        // Caso de certo (A imagem tenha sido capturada)...
        alert("Imagem foi salva com sucesso!"); // Avisa o usuário de que a imagem foi salva
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Modal style={styles.container} visible={visible} animationType="slide">
      {/* IMAGEM */}
      <GestureHandlerRootView>
        <GestureDetector gesture={gestures}>
          <SafeAreaView style={styles.container}>
            {/* ÁREA DELIMITADA DA IMAGEM */}
            <View style={styles.imageArea} ref={imageRef}>
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
          <TouchableOpacity
            style={styles.buttonModal}
            onPress={() => setSelectedSticker(null)}
          >
            <MaterialIcons size={30} name="delete" color={"white"} />
          </TouchableOpacity>

          {/* BOTÃO DE SALVAR FOTO */}
          <TouchableOpacity style={styles.buttonModal} onPress={saveImage}>
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
