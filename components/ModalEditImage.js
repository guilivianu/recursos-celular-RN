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

const { width, height } = Dimensions.get("screen");

export default function ModalEditImage({
  image,
  imageMirror,
  visible,
  onClose,
}) {
  return (
    <Modal style={styles.container} visible={visible} animationType="slide">
      {/* IMAGEM */}
      <SafeAreaView style={styles.container}>
        {/* ÁREA DELIMITADA DA IMAGEM */}
        <View style={styles.imageArea}>
          {/* IMAGEM */}
          <Image
            source={{ uri: image.uri }}
            style={{
              width: (image.width * height) / image.height,
              height: height,
              transform: [{ scaleX: imageMirror }],
            }}
          />
        </View>
      </SafeAreaView>

      {/* BOTÕES */}
      <View style={styles.buttonContainerModal}>
        {/* BOTÃO DE FECHAR MODAL DE EDITAR FOTO */}
        <TouchableOpacity style={styles.buttonModal} onPress={onClose}>
          <MaterialIcons size={30} name="close" color={"white"} />
        </TouchableOpacity>

        <View style={styles.buttonContainerModal2}>
          {/* BOTÃO DE ADICIONAR STICKER */}
          <TouchableOpacity style={styles.buttonModal}>
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
