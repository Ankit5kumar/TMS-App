import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const axiosinstance = axios.create({
  baseURL: 'http://fluid3.cloud:8010/api',
});
axiosinstance.interceptors.request.use(
    async (config) => {
   try {
    const Token =await AsyncStorage.getItem('token');
   
    if(Token){
        config.headers.Authorization=`Bearer ${Token}`
      }
      return config;
   } catch (error) {
    console.error('Error getting token from AsyncStorage:', error);
    return Promise.reject(error);
   }
    },
    (error)=>{
        return Promise.reject(error);
    }
  
  );
  export default axiosinstance;

 

