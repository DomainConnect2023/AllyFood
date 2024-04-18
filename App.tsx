import React, {  } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Dimensions, LogBox, SafeAreaView, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { CustomDrawer } from './components/CustomDrawer';
import ProfileScreen from './screens/profile';
import DetailScreen from './screens/detailScreen';
import DetailOverallScreen from './screens/detailOverallScreen';
import SettingScreen from './screens/setting';
import PlanningScreen from './screens/planning';
import PickingListScreen from './screens/pickinglistScreen';
import DetailPickingListScreen from './screens/detailPickingList';
import ForeCastScreen from './screens/forecastScreen';
import PreviousBillingScreen from './screens/previousBillingScreen';
import DetailPreviousBillingScreen from './screens/detailPreviousBilling';
import ReportScreen from './screens/reportScreen';
import ViewPDFScreen from './screens/generateReportScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/loginScreen';
import i18n from './language/i18n';

const Stack = createNativeStackNavigator();
const STORAGE_KEY = '@app_language';

function App(): JSX.Element {
  LogBox.ignoreAllLogs();

  const [loading, setLoading] = React.useState(true);
  const [initialRouteName, setInitialRouteName] = React.useState("LoginScreen");

  React.useEffect(() => {
    const checkUserCode = async () => {
      const userCode = await AsyncStorage.getItem('userID');

      const language = await AsyncStorage.getItem(STORAGE_KEY);
      if (language) {
        i18n.locale = language;
        await AsyncStorage.setItem(STORAGE_KEY, language);
      }

      if (userCode === null) {
        setInitialRouteName('LoginScreen');
      }else{
        setInitialRouteName('CustomDrawer');
      }
      setLoading(false);
    };

    checkUserCode();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading ? (
      <View style={{ flex: 1, marginVertical: Dimensions.get('screen').height / 100 * 10 }}>
        <ActivityIndicator size={40} color="#000000" />
      </View>
      ) : (
      <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{headerShown: false}}>
            <Stack.Screen name="LoginScreen" component={LoginScreen}/>
            <Stack.Screen name = "CustomDrawer" component={CustomDrawer}/>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="DetailScreen" component={DetailScreen} />
            <Stack.Screen name="DetailOverallScreen" component={DetailOverallScreen} />
            <Stack.Screen name="Setting" component={SettingScreen} />
            <Stack.Screen name="Planning" component={PlanningScreen} />
            <Stack.Screen name="PickingList" component={PickingListScreen} />
            <Stack.Screen name="DetailPickingListScreen" component={DetailPickingListScreen} />
            <Stack.Screen name="ForceCastScreen" component={ForeCastScreen} />
            <Stack.Screen name="PreviousBillingScreen" component={PreviousBillingScreen} />
            <Stack.Screen name="DetailPreviousBillingScreen" component={DetailPreviousBillingScreen} />
            <Stack.Screen name="ReportScreen" component={ReportScreen} />
            <Stack.Screen name="ViewPDFScreen" component={ViewPDFScreen} />
          </Stack.Navigator>
      </NavigationContainer>
      )}
    </SafeAreaView>
  );
}

export default App;