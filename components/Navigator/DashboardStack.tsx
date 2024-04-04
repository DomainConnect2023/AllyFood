import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from '../../screens/profile';
import DetailScreen from '../../screens/detailScreen';
import SettingScreen from '../../screens/setting';
import PlanningScreen from '../../screens/planning';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomDrawer } from './CustomDrawer';
import DetailOverallScreen from '../../screens/detailOverallScreen';
import PickingListScreen from '../../screens/pickinglistScreen';
import DetailPickingListScreen from '../../screens/detailPickingList';
import ForeCastScreen from '../../screens/forecastScreen';
import PreviousBillingScreen from '../../screens/previousBillingScreen';
import DetailPreviousBillingScreen from '../../screens/detailPreviousBilling';
import ReportScreen from '../../screens/reportScreen';
import ViewPDFScreen from '../../screens/generateReportScreen';

  const Drawer = createDrawerNavigator();

  const Stack = createNativeStackNavigator();

  export function DashboardStack() {
    
    return (
      <Stack.Navigator initialRouteName="CustomDrawer" screenOptions={{headerShown: false}}>
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
    );
  }