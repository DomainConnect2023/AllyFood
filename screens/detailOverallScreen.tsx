import * as React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, TextInput, Pressable, Image, Dimensions } from "react-native";
import MainContainer from '../components/MainContainer';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { css, datepickerCSS } from '../objects/commonCSS';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { ImagesAssets } from '../objects/images';
import i18n from '../language/i18n'

const DetailOverallScreen = () => {
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0] + " 00:00:00"); // for API

    // data information
    const [type, setType] = useState<string | null>("Overall");
    const [customerName, setCustomerName] = useState<string | null>("");
    const [customerCode, setCustomerCode] = useState<string | null>("");
    const [totalRental, setTotalRental] = useState<number>(0);
    const [totalGoodsReceivingCharges, setTotalGoodsReceivingCharges] = useState<number>(0);
    const [totalGoodsIssueCharges, setTotalGoodsIssueCharges] = useState<number>(0);
    const [overallTotal, setOverallTotal] = useState<number>(0);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    useEffect(() => {
        (async () => {
            setDataProcess(true);
            setType(await AsyncStorage.getItem('type') ?? "");
            setTodayDate(await AsyncStorage.getItem('setDate') ?? "");
            await fetchDataApi(await AsyncStorage.getItem('setDate'), await AsyncStorage.getItem('type'));
        })();
    }, [])

    const fetchDataApi = async (theDate: any, type: any) => {
        var getIPaddress = await AsyncStorage.getItem('IPaddress');
        var code = await AsyncStorage.getItem('customerCode');
        var name = await AsyncStorage.getItem('customerName');
        var runDate = theDate.split(' ')[0];

        setCustomerCode(code);
        setCustomerName(name);

        await RNFetchBlob.config({
            trusty: true
        })
            .fetch('GET', "https://" + getIPaddress + "/App/GetOverallDetail?todayDate=" + runDate + "&customerId=" + code, {
                "Content-Type": "application/json",
            }).then((response) => {
                if (response.json().isSuccess == true) {
                    setCustomerCode(response.json().customerId);
                    setCustomerName(response.json().customerName);
                    setTotalGoodsIssueCharges(response.json().totalGoodsIssueCharges);
                    setTotalGoodsReceivingCharges(response.json().totalGoodsReceivingCharges);
                    setOverallTotal(response.json().overallTotal);
                    setTotalRental(response.json().totalRental);
                } else {
                    console.log(response.json().message);
                    Snackbar.show({
                        text: response.json().message,
                        duration: Snackbar.LENGTH_SHORT,
                    });
                }
            })
            .catch(error => {
                Snackbar.show({
                    text: error.message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            });
        setDataProcess(false);
    };

    return (
        <MainContainer>
            <KeyboardAvoidWrapper>
                <View style={css.mainView}>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={css.listThing}>
                            <Ionicons
                                name="arrow-back-circle-outline"
                                size={30}
                                color="#FFF"
                                onPress={() => [navigation.goBack()]} />
                        </View>
                    </View>
                    <View style={css.HeaderView}>
                        <Text numberOfLines={2} style={css.PageName}> {type} - {customerName}</Text>
                    </View>
                </View>

                {dataProcess == true ? (
                    <View style={[css.container]}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Detail-Overall-Screen.Date')}:</Text>
                            <Text style={css.subTitle}>{todayDate.toString().substring(0, 10)}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Detail-Overall-Screen.Customer-Name')}:</Text>
                            <TouchableOpacity style={[css.subTitle]} onPress={async () => {
                                console.log(customerCode);
                            }}>
                                <Text style={css.subTitle}>{customerName}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Detail-Overall-Screen.Total-Rental')}:</Text>
                            <Text style={css.subTitle}>{totalRental}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Detail-Overall-Screen.Total-GR-Charges')}:</Text>
                            <Text style={css.subTitle}>{totalGoodsReceivingCharges}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Detail-Overall-Screen.Total-GI-Charges')}:</Text>
                            <Text style={css.subTitle}>{totalGoodsIssueCharges}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Detail-Overall-Screen.Overall-Total')}:</Text>
                            <Text style={css.subTitle}>{overallTotal}</Text>
                        </View>
                    </View>
                )}
            </KeyboardAvoidWrapper>


        </MainContainer>
    );
}

export default DetailOverallScreen;