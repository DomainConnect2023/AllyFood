import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileScreen from './profile';
import DashboardScreen from './dashboard';
import PlanningScreen from './planning';
import i18n from '../language/i18n';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === i18n.t('Bottom-Navigation.Receiving')) {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === i18n.t('Bottom-Navigation.Outgoing')) {
            iconName = focused ? 'return-down-forward' : 'return-down-forward-outline';
          } else if (route.name === i18n.t('Bottom-Navigation.Overall')) {
            iconName = focused ? 'home' : 'home-outline';
          }

          return <Ionicons name={iconName ?? ""} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >

      <Tab.Screen options={{ unmountOnBlur: true, }} name={i18n.t('Bottom-Navigation.Overall')} component={DashboardScreen} initialParams={{ stayPage: i18n.t('Bottom-Navigation.Overall') }} />
      <Tab.Screen options={{ unmountOnBlur: true, }} name={i18n.t('Bottom-Navigation.Receiving')} component={DashboardScreen} initialParams={{ stayPage: i18n.t('Bottom-Navigation.Receiving') }} />
      <Tab.Screen options={{ unmountOnBlur: true, }} name={i18n.t('Bottom-Navigation.Outgoing')} component={DashboardScreen} initialParams={{ stayPage: i18n.t('Bottom-Navigation.Outgoing') }} />
    </Tab.Navigator>
  );
}

export default TabNavigation;
