import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from './Dashboardscreen';
import Profile from './Profile';
import { View,Image, } from 'react-native';
import tw from 'twrnc';
const Tab = createBottomTabNavigator();

const MainTab = ({ route }) => {
    const userinfo = route.params?.userinfo;

    return (
        <Tab.Navigator
        screenOptions={{
            tabBarStyle: {
              backgroundColor: 'white', 
              paddingBottom: 10, 
              height: 70, 
            },
            tabBarLabelStyle: {
              fontSize: 12, 
              marginBottom: 5, 
            },
          }}
            
        >
            <Tab.Screen 
                name='Dashboard' 
                initialParams={{ userinfo }} 
                component={DashboardScreen}
                options={{
                    
                    tabBarIcon:({color,size})=>(

            <Image
              source={require('../assets/home.png')}
              style={[tw `w-8 h-8`, { tintColor: color }]} // Increase icon size
            />
        
                    )
                }} 
            />
            <Tab.Screen 
                name='Profile'
                initialParams={{ userinfo }} 
                component={Profile} 
                options={{
                  
                    tabBarIcon:({color,size})=>(

            <Image
              source={require('../assets/profile.png')}
              style={[tw `w-8 h-8`, { tintColor: color }]} // Increase icon size
            />
        
                    )
                }} 
            />
        </Tab.Navigator>
    );
};

export default MainTab;