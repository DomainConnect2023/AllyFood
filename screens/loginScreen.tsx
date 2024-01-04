import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import MainContainer from '../components/MainContainer';
import { useNavigation } from '@react-navigation/native';
import TabNavigation from './TabNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Snackbar from 'react-native-snackbar';
import { URLAccess } from '../objects/URLAccess';
import { ImagesAssets } from '../objects/images';
import { Dropdown } from 'react-native-searchable-dropdown-kj';
import RNFetchBlob from 'rn-fetch-blob';
import { useAuth } from '../components/Auth_Provider/Auth_Context';


export const [isLoginSuccess, setLoginStatus] = useState<String | null>("");

const LoginScreen = () => {
    const [username, setUserName] = useState('admin');
    const [password, setPassword] = useState('ALLY123');

    const inputRef = React.createRef<TextInput>();
    const [IPaddress, setIPadress] = useState("192.168.1.164:1234");

    const { setIsSignedIn } = useAuth();
    // const { isSignedIn } = useAuth();

    useEffect(()=> {
        (async()=> {
            if (IPaddress.length === 0) {
                // setIPadress(URLAccess.getLiveSiteIP);
            }
        })();
    }, [])
    
    const loginAPI = async() => {
        await AsyncStorage.setItem('IPaddress', IPaddress);
        await AsyncStorage.setItem('userCode', username);
        await AsyncStorage.setItem('password', password);
        setIsSignedIn(true);
        // await RNFetchBlob.config({
        //     trusty: true
        // }).fetch('POST', "https://"+IPaddress+"/App/Login",{
        //         "Content-Type": "application/json",  
        // }, JSON.stringify({
        //         "Code": username as string,
        //         "Password": password as string,
        // }),
        // ).then(async (response) => {
        //     if(response.json().isSuccess==true){
        //         await AsyncStorage.setItem('IPaddress', IPaddress),
        //         await AsyncStorage.setItem('userID', response.json().userId.toString()),
        //         setUserName("");
        //         setPassword("");
        //         setIsSignedIn(true);
        //     }else{
        //         Snackbar.show({
        //             text: response.json().message,
        //             duration: Snackbar.LENGTH_SHORT,
        //         });
        //     }
        // })
        // .catch(error => {
        //     console.log(error.message);
        //     Snackbar.show({
        //         text: error.message,
        //         duration: Snackbar.LENGTH_SHORT,
        //     });
        // });
    };

    return (
        <MainContainer>
            <KeyboardAvoidWrapper>
                <View style={styles.container}>
                    <Image
                    source={ImagesAssets.logoImage}
                    style={{width: 250, height: 250, margin:50, borderRadius:20}}
                    />
                    <View style={styles.subcontainer}>
                        <View style={styles.Icon}>
                            <Ionicons name={"person-circle-sharp" ?? ""} size={40} color={"#112A08"} />
                        </View>
                        <TextInput
                            style={styles.Input}
                            onSubmitEditing={() => inputRef.current?.focus()}
                            placeholder="User Name"
                            value={username}
                            onChangeText={setUserName}
                        />
                    </View>
                    <View style={styles.subcontainer}>
                        <View style={styles.Icon}>
                            <Ionicons name={"key-sharp" ?? ""} size={40} color={"#112A08"} />
                        </View>
                        <TextInput
                            style={styles.Input}
                            ref={inputRef}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    
                    <Pressable style={styles.button} onPress={()=>loginAPI()}>
                        <Text style={styles.bttnText}>Login</Text>
                    </Pressable>
                </View>
                
            </KeyboardAvoidWrapper>
        </MainContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subcontainer: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    Input: {
        width: '70%',
        height: 70,
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        color: "#000",
    },
    Icon: {
        width:"15%",
        padding:5,
        alignItems:"flex-end",
        marginBottom: 10
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'black',
        marginRight: 5,
        marginLeft: 5,
    },
    bttnText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    textInput: { 
        width: "80%", 
        borderRadius: 5, 
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderColor: "rgba(0, 0, 0, 0.2)", 
        borderWidth: 1, 
    }, 
    row: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        width: "70%",
        height: 70,
        marginBottom: 10,
        padding: 10,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});

export default LoginScreen;
