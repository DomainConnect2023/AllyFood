import * as React from 'react';
import { DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import PlanningScreen from '../screens/planning';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TabNavigation from '../screens/TabNavigation';
import { css } from '../objects/commonCSS';
import { useState } from 'react';
import PickingListScreen from '../screens/pickinglistScreen';
import { colorThemeDB } from '../objects/colors';
import ForeCastScreen from '../screens/forecastScreen';
import previousBillingScreen from '../screens/previousBillingScreen';
import SettingScreen from '../screens/setting';
import i18n from '../language/i18n';
import ReportScreen from '../screens/reportScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
    const navigation = useNavigation();

    return (
        <DrawerContentScrollView {...props}
        // style={{backgroundColor:colorThemeDB.colors.primaryContainer}}
        >
        <DrawerItemList {...props} />
        <DrawerItem label={i18n.t('Left-Navigation.LogOut')} onPress={async () => {await AsyncStorage.removeItem("UserID"), navigation.navigate("LoginScreen" as never)}} />
        </DrawerContentScrollView>
    );
}

export function CustomDrawer() {

  const navigation = useNavigation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [initialRoute, setInitialRoute] = React.useState(i18n.t('Left-Navigation.Dashboard'));

  React.useEffect(() => {
    setInitialRoute(i18n.t('Left-Navigation.Dashboard'));
  }, [i18n.locale]);

  return (
    <Drawer.Navigator initialRouteName={initialRoute} screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: colorThemeDB.colors.primary,
      },
      headerTitleStyle: { color: "#FFF" },
      headerTintColor: '#fff',
      headerTitleAlign: 'center',
    }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name={i18n.t('Left-Navigation.Dashboard')} component={TabNavigation} options={{
        headerTitle: i18n.t('Left-Navigation.Dashboard'),
        headerRight: () => (
          <View style={css.row}>
            {/* <Ionicons name="log-out-outline" size={35} color="#FFF" style={{marginLeft:5,marginRight:10}} onPress={() => setIsSignedIn(false)} /> */}
          </View>
        ),
      }} />
      <Drawer.Screen name={i18n.t('Left-Navigation.Picking-List')} component={PickingListScreen} options={{
        headerTitle: i18n.t('Left-Navigation.Picking-List'),
        headerRight: () => (
          <View style={css.row}>
            {/* <Ionicons name="log-out-outline" size={35} color="#FFF" style={{marginLeft:5,marginRight:10}} onPress={() => setIsSignedIn(false)} /> */}
          </View>
        ),
      }} />
      <Drawer.Screen name={i18n.t('Left-Navigation.ForeCast')} component={ForeCastScreen} />
      <Drawer.Screen name={i18n.t('Left-Navigation.Previous-Billing')} component={previousBillingScreen} />
      <Drawer.Screen name={i18n.t("Report-Screen.Report")} component={ReportScreen} />
      <Drawer.Screen name={i18n.t('Left-Navigation.Setting')} component={SettingScreen} />
    </Drawer.Navigator>
  );
}