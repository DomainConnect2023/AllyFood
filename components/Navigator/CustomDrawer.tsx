import * as React from 'react';
import { DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import PlanningScreen from '../../screens/planning';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TabNavigation from '../../screens/TabNavigation';
import { css } from '../../objects/commonCSS';
import { useAuth } from '../Auth_Provider/Auth_Context';
import { useState } from 'react';
import PickingListScreen from '../../screens/pickinglistScreen';
import { colorThemeDB } from '../../objects/colors';
import ForceCastScreen from '../../screens/forcecastScreen';
import previousBillingScreen from '../../screens/previousBillingScreen';

const Drawer = createDrawerNavigator();
const { setIsSignedIn } = useAuth();

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} 
    // style={{backgroundColor:colorThemeDB.colors.primaryContainer}}
    >
      <DrawerItemList {...props} />
      <DrawerItem label="Logout" onPress={() => setIsSignedIn(false)} />
    </DrawerContentScrollView>
  );
}

export function CustomDrawer() {

  const navigation = useNavigation();
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <Drawer.Navigator initialRouteName="Dashboard" screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: colorThemeDB.colors.primary,
      },
      headerTitleStyle: {color: "#FFF"},
      headerTintColor: '#fff', 
      headerTitleAlign: 'center',
    }}
    drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard" component={TabNavigation} options={{
        headerTitle: 'Dashboard',
        headerRight: () => (
          <View style={css.row}>
            {/* <Ionicons name="log-out-outline" size={35} color="#FFF" style={{marginLeft:5,marginRight:10}} onPress={() => setIsSignedIn(false)} /> */}
          </View>
        ),
      }} />
      <Drawer.Screen name="Picking List" component={PickingListScreen} options={{
        headerTitle: 'Picking List',
        headerRight: () => (
          <View style={css.row}>
            {/* <Ionicons name="log-out-outline" size={35} color="#FFF" style={{marginLeft:5,marginRight:10}} onPress={() => setIsSignedIn(false)} /> */}
          </View>
        ),
      }}  />
      <Drawer.Screen name="Force Cast" component={ForceCastScreen} />
      <Drawer.Screen name="Previous Billing" component={previousBillingScreen} />
      
      {/* <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Setting" component={SettingScreen} /> */}
      {/* <Drawer.Screen name="PreviosDashboard" component={DashboardScreen} options={{
        headerTitle: 'Dashboard',
        headerRight: () => (
          <View>
            <Ionicons name="search-circle-sharp" size={40} color="#FFF" onPress={() => navigation.navigate(SearchScreen as never)} />
          </View>
        ),
      }} /> */}
    </Drawer.Navigator>
  );
}