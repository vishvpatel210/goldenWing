import { View, ImageBackground, StyleSheet } from "react-native";

export default function GoldenWingSplash() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/splashlogo.png")}
        style={styles.background}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
  },
});