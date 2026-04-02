import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import { Colors } from './src/constants/colors';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Light status bar content on a dark background or dark icons on light. Slate White is light, so use auto or dark */}
      <StatusBar style="dark" />
      <HomeScreen />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
