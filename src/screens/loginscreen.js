import React, { useEffect, useState } from 'react';
import { View, Text, TextInput,Image, TouchableOpacity,Alert, ImageBackground} from 'react-native';
import bg  from '../assets/bg.jpg'
import tw from 'twrnc';

import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({route,navigation}) => {
const [username , setUsername] = useState('');
const [password , setpassword] = useState('');
const [passwordVisible, setPasswordVisible] = useState(false);

const handleLogin = () => {
  // Validation
  if (!username || !password) {
    Alert.alert('Missing Credentials','Please Provide the username and password',[
     {
      text:'Cancel',
      style:'cancel'
     },
     {
      text:'OK'
     }
    ]);
    return; 
  }

  fetch('http://fluid3.cloud:8010/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
  
  .then(async (res) => {
    if (!res.ok) {
      const text = await res.json();
     
      throw new Error(text); 
    }
   
    return res.json();
  })
  .then((response) => {
    console.log("response",response)
    AsyncStorage.setItem('token', response.access_token);
    navigation.navigate('MainTab', { userinfo: response });
    setUsername('');
    setpassword('');
  })
  .catch((error) => {
    Alert.alert('Incorrect Credentials','Provide correct Credentials',[
      {
       text:'Cancel',
       style:'cancel'
      },
      {
       text:'OK'
      }
     ]);
    return ;
    
  });
};



  
  

  return (
    
    <ImageBackground
      source={bg} 
      style={tw`flex-1 justify-center items-center`}
    >
   
   <View style={tw `flex-col items-center gap-8`}>
   <Image
        source={require('../assets/TMS.png')}
        style={tw `size-32`}
        />


      <Text style={tw`text-white text-base font-bold mb-6`}>Login to your account</Text>
   </View>

      <View style={tw`w-full  px-8`}>
       
      <View style={tw`flex-row items-center border-b-2 border-gray-300 mb-6 py-2`}>
<Image
source={require('../assets/user.png')}
style={tw `size-12`}
/>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={tw`flex-1 ml-2 p-2 text-base font-bold text-gray-700`}
          />
        </View>
        <View style={tw`flex-row items-center  border-b-2 border-gray-300 mb-6 py-2`}>
        <Image
source={require('../assets/lock.png')}
style={tw `size-12`}
/>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setpassword}
            secureTextEntry={!passwordVisible}
            style={tw`flex-1 ml-2 p-2 font-bold text-base text-gray-700`}
          />
          <TouchableOpacity 
          onPress={()=>{
            setPasswordVisible(!passwordVisible)
          }}
          >  
          <Image
source={require('../assets/eye.png')}
style={tw `size-8`}
/>

          </TouchableOpacity>
        </View>
        <TouchableOpacity style={tw`bg-green-700 py-3 rounded-full`} onPress={handleLogin}>
          <Text style={tw`text-white text-center text-lg`}>Login</Text>
        </TouchableOpacity>
        {/* <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-gray-700`}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={tw`text-green-700 font-bold`}>Sign up</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </ImageBackground>
   
  );
  
};

export default LoginScreen;
