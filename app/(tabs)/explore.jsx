import { 
  View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../components/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

console.log(auth, 'this is auth')

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(auth, 'this is auth')


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
      style={{ flex: 1, backgroundColor: '#2F8F48' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 50, marginLeft: 16 }}
              >
                <AntDesign name="arrowleft" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image 
                source={require("../../assets/images/login.png")} 
                style={{ width: 200, height: 200 }} 
              />
            </View>
          </SafeAreaView>

          <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 32, marginTop: 8, paddingTop: 32, borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#4B5563', marginLeft: 8, marginBottom: 4, fontWeight: '600' }}>Email Address</Text>
              <TextInput
                style={{ padding: 16, backgroundColor: '#F3F4F6', color: '#4B5563', borderRadius: 20, marginBottom: 12 }}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={{ color: '#4B5563', marginLeft: 8, marginBottom: 4, fontWeight: '600' }}>Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 20 }}>
                <TextInput
                  style={{ flex: 1, color: '#4B5563' }}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter Password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
              </View>


              <TouchableOpacity 
                onPress={handleSubmit} 
                style={{ paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 20, marginTop: 16 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ fontWeight: '700', textAlign: 'center', color: '#4B5563' }}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
