import { 
    View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard 
  } from 'react-native';
  import React, { useState } from 'react';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import AntDesign from '@expo/vector-icons/AntDesign';
  import { useNavigation } from '@react-navigation/native';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '../components/firebase';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import Ionicons from '@expo/vector-icons/Ionicons';
  
  export default function LoginScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async () => {
      if (email && password) {
        try {
          setLoading(true);
          await signInWithEmailAndPassword(auth, email, password);
          const jsonValue = JSON.stringify(auth);
          await AsyncStorage.setItem('my-key', jsonValue);
          navigation.navigate('(tabs)');
          Alert.alert('Success', 'You are now logged in');
          console.log(auth);
        } catch (err) {
          console.log("got error", err.message);
          Alert.alert('Incorrect Email or Password', 'Please try again');
        } finally {
          setLoading(false);
        }
      }
    };
  
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1 bg-green-700"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <SafeAreaView className="flex">
              <View className="flex-row justify-start">
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-green-400 p-2 rounded-full ml-4">
                  <AntDesign name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-center">
                <Image source={require("../assets/images/login.png")} style={{ width: 200, height: 200 }} />
              </View>
            </SafeAreaView>
  
            <View className="flex-1 bg-white px-8 mt-2 pt-8 rounded-t-[50px]">
              <View className="flex my-2 ">
                <Text className="text-gray-700 ml-4 mb-1 font-semibold">Email Address</Text>
                <TextInput
                  className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
  
                <Text className="text-gray-700 ml-4 mb-1 font-semibold">Password</Text>
                <View className="flex-row items-center px-2 py-3  bg-gray-100 rounded-2xl">
                  <TextInput
                    className="flex-1 text-gray-700"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter Password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                  </TouchableOpacity>
                </View>
  
                <TouchableOpacity className="flex items-end mb-5">
                  <Text className="text-gray-700">Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSubmit} className="py-3 bg-green-400 rounded-xl">
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="font-bold text-center text-gray-700">Login</Text>
                  )}
                </TouchableOpacity>
              </View>
  
              <View className="flex-row justify-center mt-7 gap-2">
                <Text className="text-gray-500 font-semibold">Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                  <Text className="font-semibold text-green-500">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
  