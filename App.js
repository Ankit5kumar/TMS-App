import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/loginscreen';
import Dashboardscreen from './src/screens/Dashboardscreen'
import Toast from 'react-native-toast-message';
import MainTab from './src/screens/TabNavigator';
import Profile from './src/screens/Profile';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" options={{headerShown:false}}  component={LoginScreen} />
        <Stack.Screen name="Dashboardscreen" options={{headerShown:false}} component={Dashboardscreen} />
        <Stack.Screen name="Profile" options={{headerShown:false}} component={Profile} />
        <Stack.Screen name='MainTab' options={{headerShown:false}} component={MainTab}/>
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default App;