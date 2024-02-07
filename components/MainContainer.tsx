import { StyleSheet, SafeAreaView } from "react-native";
import { IProps } from "../auth-app";

const MainContainer: React.FC<IProps> = ({ children }) => {
  return (
    <SafeAreaView style={styles.setMainContainer}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  setMainContainer: {
    flex: 1,
    // backgroundColor: '#201520',
  }
})

export default MainContainer;
