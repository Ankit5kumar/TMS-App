import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity,Alert, Image, Switch, StyleSheet } from 'react-native';
import tw from 'twrnc';

import axiosinstance from '../api/axiosconfig';

const Profile = ({ route,navigation }) => {
    const { userinfo } = route.params;
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fname, setFname] = useState("");
    const toggleSwitch = () => setIsDarkMode(previousState => !previousState);
    const fnameshow = () => {
        let nameParts = userinfo.user.name.split(" ");
        let initials = nameParts[0][0]; // First letter of first name
        if (nameParts.length > 1) {
            initials += nameParts[1][0]; // First letter of last name
        }
        setFname(initials.toUpperCase()); // Set initials in uppercase
    };
  

    const logout = async ()=>{
        
       try {
       const response = await axiosinstance.get('/logout')
       if(response.status == 200){
        navigation.navigate('Login',{})
        
       }
       } catch (error) {
        console.log(error)
       }
    }
    const AlertBox = ()=>{
        Alert.alert('Do you want to logout','', [
            {
              text: 'NO',
              
              style: 'cancel',
            },
            {text: 'YES', onPress: () => {logout()}},
            
          ],
          {cancelable:true}
        );
    }


    useEffect(() => {
        fnameshow();
    }, [userinfo]);
    return (
        <View style={[tw`flex-1 p-4`, isDarkMode ? tw`bg-gray-800` : tw`bg-white`]}>
            {/* Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-2xl font-bold text-black`}>{userinfo.user.name}</Text>
                <TouchableOpacity>
                    <Image source={require('../assets/bell.png')} style={tw`w-6 h-6`} />
                </TouchableOpacity>
            </View>

            {/* User Info Card */}
            <View style={tw`bg-white flex-row items-center justify-between p-4 rounded-lg shadow-md mb-4`}>
                
                <View style={tw``}>
                <Text style={tw`text-xl font-bold text-black mb-2`}>{userinfo.user.username}</Text>
                <Text style={tw`text-gray-600 text-black`}>{userinfo.user.email}</Text>
                    
                </View>
                <View style={tw`w-24 h-24 bg-blue-500 rounded-full justify-center items-center`}>
                        <Text style={tw`text-white text-3xl font-bold`}>{fname}</Text>
                    </View>
            </View>

            {/* Toggle Button for Dark/Light Mode */}
            {/* <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-lg`}>Toggle Dark/Light Mode</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                    onValueChange={toggleSwitch}
                    value={isDarkMode}
                />
            </View> */}
            <View >
                <TouchableOpacity style={tw`flex-row bg-red-100 items-center justify-between border p-6 border-gray-200`} onPress={AlertBox}>
                <Text style={tw`text-lg text-gray-800`}>Logout</Text>
                <Image source={require('../assets/logout.png')} style={tw`w-6 h-6`} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default Profile;

    
    

   

  

    
