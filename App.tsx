import React, {  } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { AuthProvider } from './components/Auth_Provider/Auth_Context';
import { StackNavigator } from './components/Navigator/StackNavigator';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  LogBox.ignoreAllLogs();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <PaperProvider>
        <BottomSheetModalProvider>
          <AuthProvider>
            <NavigationContainer>
              <StackNavigator />
            </NavigationContainer>
          </AuthProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </SafeAreaView>
  );
}

export default App;