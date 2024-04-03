import React, { useEffect, useState } from 'react';
import { Image, Pressable, NativeModules } from 'react-native';
import { View, Text, TextInput as TextInputs, StyleSheet } from 'react-native';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagesAssets } from '../objects/images';
import { useAuth } from '../components/Auth_Provider/Auth_Context';
import RNFetchBlob from 'rn-fetch-blob';
import Snackbar from 'react-native-snackbar';
import { URLAccess } from '../objects/URLAccess';
import { TextInput } from 'react-native-paper';
import i18n from '../language/i18n';
import { useFocusEffect } from '@react-navigation/native';

const STORAGE_KEY = '@app_language';
export const [isLoginSuccess, setLoginStatus] = useState<String | null>("");
interface ApiResponse {
    ipAddress: string;
    isSuccess: string;
}

const LoginScreen = () => {
    const [username, setUserName] = useState('');//admin
    const [password, setPassword] = useState('');//ALLY123
    const [todayDate, setTodayDate] = useState<string | "">(new Date().toISOString().split('T')[0] + " 00:00:00");

    const [branch, setbranch] = useState("");

    const inputRef = React.createRef<TextInputs>();
    const [IPaddress, setIPadress] = useState("");

    const { setIsSignedIn } = useAuth();
    // const { isSignedIn } = useAuth();

    const [locale, setLocale] = React.useState(i18n.locale);

    useFocusEffect(
        React.useCallback(() => {
            setLocale(i18n.locale);
        }, [])
    );

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const language = await AsyncStorage.getItem(STORAGE_KEY);
                if (language) {
                    i18n.locale = language;
                    setLocale(language);
                }
            } catch (error) {
                console.error('Failed to load language', error);
            }
        };

        loadLanguage();
    }, []);
    
    const getIPAdd = async() =>{
        try{
            let url =(URLAccess.getIPAddress+NativeModules.RNDeviceInfo?.bundleId+"&branch="+branch);
            let result = await RNFetchBlob.config({trusty:true}).fetch('get',url);
            let responses: ApiResponse = JSON.parse(result.data);

            console.log("Login API: " + responses.ipAddress);
            setIPadress(responses.ipAddress);
        }
        catch (error) {
            console.error(error);
        }
    };

    useEffect(()=> {
        (async()=> {
            // setIPadress(URLAccess.getLocalIP);
            getIPAdd();

            if (__DEV__) {
                setUserName("admin");
                setPassword("ALLY123");
            }
        })();
    }, [])



    const loginAPI = async () => {
        // http://192.168.1.174:1234/App/Login

        console.log("http://192.168.1.174:1234/App/Login");

        await RNFetchBlob.config({
            trusty: true
        }).fetch('POST', "http://192.168.1.174:1234/App/Login", {
            "Content-Type": "application/json",
        }, JSON.stringify({
            "Code": username as string,
            "Password": password as string,

        }),
        ).then(async (response) => {
            if (response.json().isSuccess == true) {
                await AsyncStorage.setItem('IPaddress', IPaddress),
                await AsyncStorage.setItem('userCode', username);
                await AsyncStorage.setItem('password', password);
                await AsyncStorage.setItem('setDate', todayDate);
                await AsyncStorage.setItem('setYearMonth', todayDate.substr(0, 7));

                await AsyncStorage.setItem('userID', response.json().userId.toString());
                setUserName("");
                setPassword("");
                setIsSignedIn(true);
            } else {
                Snackbar.show({
                    text: response.json().message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        })
            .catch(error => {
                console.log(error.message);
                Snackbar.show({
                    text: error.message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            });
    };

    return (
        <MainContainer>
            <KeyboardAvoidWrapper>
                <View style={styles.container}>
                    <Image
                        source={ImagesAssets.logoImage}
                        style={{ width: 250, height: 250, margin: 50, borderRadius: 20 }}
                    />
                    <View style={styles.subcontainer}>
                        <View style={styles.Icon}>
                            <Ionicons name={"person-circle-sharp" ?? ""} size={40} color={"#112A08"} />
                        </View>
                        <TextInput
                            mode='outlined'
                            style={styles.Input}
                            onSubmitEditing={() => inputRef.current?.focus()}
                            value={username}
                            onChangeText={setUserName}
                            label={i18n.t('Login.Login')}
                        />
                    </View>
                    <View style={styles.subcontainer}>
                        <View style={styles.Icon}>
                            <Ionicons name={"key-sharp" ?? ""} size={40} color={"#112A08"} />
                        </View>
                        <TextInput
                            mode='outlined'
                            style={styles.Input}
                            ref={inputRef}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            label={i18n.t('Login.Password')}
                        />
                    </View>

                    <Pressable style={styles.button} onPress={() => loginAPI()}>
                        <Text style={styles.bttnText}>{i18n.t('Login.Login')}</Text>
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
        marginBottom: 10,
        paddingLeft: 10,
        borderColor: '#fff',
        color: "#000",
    },
    Icon: {
        width: "15%",
        padding: 5,
        alignItems: "flex-end",
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
