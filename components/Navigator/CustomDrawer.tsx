import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PlanningScreen from '../../screens/planning';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TabNavigation from '../../screens/TabNavigation';
import { css } from '../../objects/commonCSS';
import { useAuth } from '../Auth_Provider/Auth_Context';
import { useState } from 'react';
import PickingListScreen from '../../screens/pickinglistScreen';

const Drawer = createDrawerNavigator();

export function CustomDrawer() {

  const navigation = useNavigation();
  const { setIsSignedIn } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <Drawer.Navigator initialRouteName="Dashboard" screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: "#112A08",
      },
      headerTitleStyle: {color: "#FFF"},
      headerTintColor: '#fff', 
      headerTitleAlign: 'center',
    }}
    >
      <Drawer.Screen name="Dashboard" component={TabNavigation} options={{
        headerTitle: 'Dashboard',
        headerRight: () => (
          <View style={css.row}>
            <Ionicons name="log-out-outline" size={35} color="#FFF" style={{marginLeft:5,marginRight:10}} onPress={() => setIsSignedIn(false)} />
          </View>
        ),
      }} />
      <Drawer.Screen name="Picking List" component={PickingListScreen} options={{
        headerTitle: 'Picking List',
        headerRight: () => (
          <View style={css.row}>
            <Ionicons name="log-out-outline" size={35} color="#FFF" style={{marginLeft:5,marginRight:10}} onPress={() => setIsSignedIn(false)} />
          </View>
        ),
      }}  />
      {/* <Drawer.Screen name="Monthly Rental" component={PlanningScreen} /> */}
      
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