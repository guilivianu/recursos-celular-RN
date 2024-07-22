import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen"); // Dimensões da tela
function clamp(val, min, max) {
  // Função para limitar o valor da escala entre o mínimo e máximo
  return Math.min(Math.max(val, min), max);
}

export default function Sticker({ stickerSource }) {
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
      { scale: scale.value }, // Escala da imagem (gesto "drag")
      { translateX: translateX.value }, // Deslocamento no eixo X
      { translateY: translateY.value }, // Deslocamento no eixo Y
      {
        rotate: `${angle.value}rad`, // Ângulo de rotação da imagem (radianos)
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
