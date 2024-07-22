import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef, useState } from "react";

import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import ModalEditImage from "./components/ModalEditImage";

export default function App() {
  const camRef = useRef(); //Referência câmera

  const [permission, requestPermission] = useCameraPermissions(); // Permissão para câmera
  const [facing, setFacing] = useState("front"); // Lado da câmera

  const [image, setImage] = useState(); // Foto selecionada/tirada
  const [imageMirror, setImageMirror] = useState(-1); // Imagem espelhada

  const [open, setOpen] = useState(false); // Modal de editar foto aberto/fechado

  // Permissão câmera para câmera
  if (!permission) {
    // Enquanto carrega a permissão
    return <View />;
  }
  if (!permission.granted) {
    // Caso a permissão ainda não tenha sido aceita
    return (
      // Tela para pedir permissão ao usuário
      <View style={styles.container}>
        <Text
          style={{ textAlign: "center", color: "white", marginHorizontal: 16 }}
        >
          Para utilizar o aplicativo é necessário que seja autorizado o uso da
          câmera!
        </Text>
        <Button
          onPress={requestPermission}
          title="Habilitar permissão da câmera"
        />
      </View>
    );
  }

  // Pegar imagem da galeria
  async function pickImage() {
    let data = await ImagePicker.launchImageLibraryAsync({
      //Pega a imagem que o usuário selecionou
      quality: 1, // Qualidade que terá a foto selecionada (1 ➔ 100% / mesma qualidade do original)
    });
    // console.log(data);

    setImageMirror(1); // Define que a imagem não será espelhada

    if (!data.canceled) {
      // Caso a pessoa não tenha cancelado a seleção da imagem na hora de confirmar
      setImage(data.assets[0]); // Salva a imagem selecionada com todas as informações (uri, width, height, ...)
      setOpen(true); // Abre o modal de editar a imagem
    }
  }

  async function takePhoto() {
    setImageMirror(facing === "front" ? -1 : 1); // Caso a foto tirada tenha sida na câmera frontal, espelha a imagem, se for tirada na câmera traseira não espelha a imagem
    if (camRef) {
      let data = await camRef.current.takePictureAsync(); // Tira a foto e salva em "data"
      // console.log(data);

      setImage(data); // Salva a imagem com todas as informações (uri, width e height)
      setOpen(true); // Abre o modal de editar a imagem
    }
  }

  // Inverter câmera
  function toggleFacing() {
    setFacing((current) => (current === "front" ? "back" : "front")); // Caso o lado da câmera seja a frontal, inverte para a traseira, caso contrário define como frontal
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* CÂMERA */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={camRef}>
          {/* BOTÕES */}
          <View style={styles.buttonContainer}>
            {/* GALERIA */}
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <MaterialIcons size={36} name="collections" color={"white"} />
            </TouchableOpacity>

            {/* TIRAR FOTO */}
            <TouchableOpacity style={styles.buttonPhoto} onPress={takePhoto}>
              <View style={styles.buttonPhotoInterior} />
            </TouchableOpacity>

            {/* INVERTER CÂMERA */}
            <TouchableOpacity style={styles.button} onPress={toggleFacing}>
              <MaterialIcons size={36} name="flip-camera-ios" color={"white"} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {image && (
        <ModalEditImage
          image={image}
          imageMirror={imageMirror}
          visible={open}
          onClose={() => {
            setOpen(false);
            setImage(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  //BODY
  container: {
    flex: 1,
    backgroundColor: "#0C0C0C",
    alignItems: "center",
    justifyContent: "center",
  },

  // CONTAINER DA CÂMERA
  cameraContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    overflow: "hidden",
  },

  // CÂMERA
  camera: {
    width: "100%",
    height: "100%",
  },

  // CONTAINER DOS BOTÕES
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 32,
  },

  // BOTÕES LATERAIS
  button: {
    width: 60,
    height: 60,
    backgroundColor: "black",
    opacity: 0.75,
    borderRadius: 100,

    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },

  // BOTÃO DE TIRAR FOTO (BORDA)
  buttonPhoto: {
    width: 80,
    height: 80,
    borderColor: "white",
    borderWidth: 5,
    borderRadius: 100,

    padding: 8,

    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },

  // INTERIOR DO BOTÃO DE TIRAR FOTO
  buttonPhotoInterior: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 100,
  },
});
