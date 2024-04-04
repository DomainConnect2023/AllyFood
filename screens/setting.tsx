import React, { useEffect, useState } from 'react';
import { View, Text, Platform, Image, Dimensions, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import MainContainer from '../components/MainContainer';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { css } from '../objects/commonCSS';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { ImagesAssets } from '../objects/images';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Switch } from 'react-native-paper';
import Collapsible from 'react-native-collapsible';
import i18n from '../language/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileScreen from './profile';
import { colorThemeDB } from '../objects/colors';

const STORAGE_KEY = '@app_language';

const SettingScreen = ({ navigation }: any) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showLanguage, setShowLanguage] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = React.useState(i18n.locale);
    const isFocused = useIsFocused();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        (async () => {
            setUserName(await AsyncStorage.getItem('userCode') ?? "");
            loadLanguage();
        })();
    }, []);

    const loadLanguage = async () => {
        try {
            const language = await AsyncStorage.getItem(STORAGE_KEY);
            if (language) {
                i18n.locale = language;
                setSelectedLanguage(language);
            }
        } catch (error) {
            console.error('Failed to load language', error);
        }
    };

    const saveLanguage = async (language: string) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, language);
        } catch (error) {
            console.error('Failed to save language', error);
        }
    };

    const changeLanguage = async (language: string) => {
        i18n.locale = language;
        setSelectedLanguage(language);
        saveLanguage(language);
        setShowLanguage(false);
        showLanguageUpdateAlert();
    };

    const showLanguageUpdateAlert = () => {
        Alert.alert(
            i18n.t('Language-Update'),
            i18n.t('Update'),
            [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('CustomDrawer', { screen: i18n.t('Left-Navigation.Setting') }),
                    style: 'cancel',
                },
            ],
            { cancelable: false }
        );
    };
    useEffect(() => {
        (async () => {

        })();
    }, []);

    const onToggleSwitch = () => {
        setIsDarkMode(!isDarkMode);
    };

    const onToggleLanguage = () => {
        setShowLanguage(!showLanguage);
    };
    return (
        <MainContainer>
            <StatusBar animated={true} backgroundColor={colorThemeDB.colors.primary} barStyle={'dark-content'} />
            <KeyboardAvoidWrapper>
                <View style={[css.row, { width: Dimensions.get("screen").width, padding: 10, justifyContent: 'center', alignItems: "center" }]}>
                    <View style={{ width: "30%", alignItems: "center", padding: 10 }}>
                        <Image
                            source={ImagesAssets.logoImage}
                            style={{ width: 80, height: 80, backgroundColor: colorThemeDB.colors.primary, borderRadius: 50 }}
                        />
                    </View>
                    <View style={{ flexDirection: "row", width: "50%", padding: 5, alignSelf: "center" }}>
                        <Text style={[css.textDescription,{width:"50%", textAlign: "left", verticalAlign:"middle"}]}>{i18n.t('SettingPage.UserName')} : </Text>
                        <Text style={[css.textHeader,{width:"50%", textAlign: "left", verticalAlign:"middle"}]}> {userName}</Text>
                        {/* <Text style={css.textHeader}>{i18n.t('SettingPage.Company-Name')}</Text> */}
                    </View>
                    <View style={{ width: "20%", padding: 10, alignItems: "center" }}>
                        <TouchableOpacity>
                            <AntDesign name={"right" ?? ""} size={20} color={"black"} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.container}>
                    <View style={styles.preferenceContainer}>
                        <View>
                            <Text style={[css.textHeader, { fontSize: 20, color: '#FFF', }]}>{i18n.t('SettingPage.Preference')}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={() => onToggleLanguage()}>
                    <View style={[css.row, { width: Dimensions.get("screen").width, padding: 10, justifyContent: 'center', alignItems: "center" }]}>
                        <View style={{ width: "20%", alignItems: "center", padding: 10 }}>
                            <Ionicons name={"earth" ?? ""} size={40} color={"black"} />
                        </View>
                        <View style={{ width: "60%", padding: 10, flexDirection: "row" }}>
                            <Text style={[css.textHeader, { flex: 1, }]}>{i18n.t('SettingPage.Language')}</Text>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={{ color: "gray" }}>{i18n.t('Language')}</Text>
                            </View>
                        </View>
                        <View style={{ width: "20%", padding: 10, alignItems: "center" }}>
                            <AntDesign name={showLanguage ? 'down' : 'right'} size={20} color={"black"} />
                        </View>
                    </View>
                </TouchableOpacity>

                <Collapsible collapsed={!showLanguage}>
                    <View style={[styles.container]}>
                        <TouchableOpacity onPress={() => {
                            changeLanguage('en');
                        }}>
                            <View style={{ padding: 20, margin: 5, borderRadius: 10, alignSelf: 'center', backgroundColor: 'lightgray', width: Dimensions.get("screen").width / 100 * 80, borderWidth: 1 }}>
                                <Text>English</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            changeLanguage('zh');
                        }}>
                            <View style={{ padding: 20, margin: 5, borderRadius: 10, alignSelf: 'center', backgroundColor: 'lightgray', width: Dimensions.get("screen").width / 100 * 80, borderWidth: 1 }}>
                                <Text>中文</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            changeLanguage('my')
                        }}>
                            <View style={{ padding: 20, margin: 5, borderRadius: 10, alignSelf: 'center', backgroundColor: 'lightgray', width: Dimensions.get("screen").width / 100 * 80, borderWidth: 1 }}>
                                <Text>Malay</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Collapsible>

                {/* <View style={[css.row, { width: Dimensions.get("screen").width, padding: 10, justifyContent: 'center', alignItems: "center" }]}>
                    <View style={{ width: "20%", alignItems: "center", padding: 10 }}>
                        <Ionicons name={"moon" ?? ""} size={40} color={"black"} />
                    </View>
                    <View style={{ width: "60%", padding: 10 }}>
                        <Text style={css.textHeader}>{i18n.t('SettingPage.Dark-Mode')}</Text>
                    </View>
                    <View style={{ width: "20%", padding: 10, alignItems: "center" }}>
                        <Switch style={styles.switch} value={isDarkMode} onValueChange={onToggleSwitch} />
                    </View>
                </View> */}
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
    preferenceContainer: {
        width: Dimensions.get('screen').width / 100 * 90,
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 10,
        alignSelf: 'center',
    },
    switch: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    },
});

export default SettingScreen;