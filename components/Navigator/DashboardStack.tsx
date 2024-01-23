import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigationScreen from '../../screens/TabNavigation';
import ProfileScreen from '../../screens/profile';
import DetailScreen from '../../screens/detailScreen';
import SettingScreen from '../../screens/setting';
import DashboardScreen from '../../screens/dashboard';
import PlanningScreen from '../../screens/planning';
import SearchScreen from '../../screens/searchScreen';
import SearchCustomerDetail from '../../screens/SearchCustomerDetail';
import SerachProductDetail from '../../screens/SearchProductDetail';
import DetailCustomerScreen from '../../screens/detailCustomer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomDrawer } from './CustomDrawer';
import SearchReport from '../../screens/searchReport';
import SearchReportScreen from '../../screens/searchReportScreen';
import DetailOverallScreen from '../../screens/detailOverallScreen';
import PickingListScreen from '../../screens/pickinglistScreen';
import DetailPickingListScreen from '../../screens/detailPickingList';

  const Drawer = createDrawerNavigator();

  const Stack = createNativeStackNavigator();

  
  export function DashboardStack() {
    
    return (
      <Stack.Navigator initialRouteName="CustomDrawer" screenOptions={{headerShown: false}}>
      <Stack.Screen name = "CustomDrawer" component={CustomDrawer}/>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
      <Stack.Screen name="DetailOverallScreen" component={DetailOverallScreen} />
      <Stack.Screen name="DetailCustomerScreen" component={DetailCustomerScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
      <Stack.Screen name="Planning" component={PlanningScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="SearchCustomerDetail" component={SearchCustomerDetail} />
      <Stack.Screen name="SerachProductDetail" component={SerachProductDetail} />
      <Stack.Screen name="PickingList" component={PickingListScreen} />
      <Stack.Screen name="SearchReport" component={SearchReport} />
      <Stack.Screen name="SearchReportScreen" component={SearchReportScreen} />
      <Stack.Screen name="DetailPickingListScreen" component={DetailPickingListScreen} />
    </Stack.Navigator>
    );
  }