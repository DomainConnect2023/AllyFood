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

const DetailOverallScreen = () => {
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00"); // for API
    const [showPicker, setShowPicker] = useState(false);
    const [selectedIOSDate, setSelectedIOSDate] = useState(new Date());

    // data information
    const [isSuccess, setIsSuccess] = useState(true);
    const [type, setType] = useState<string | null>("Overall");
    const [customerName, setCustomerName] = useState<string | null>("");
    const [customerCode, setCustomerCode] = useState<string | null>("");
    const [totalRental, setTotalRental] = useState<number>(0);
    const [totalGoodsReceivingCharges, setTotalGoodsReceivingCharges] = useState<number>(0);
    const [totalGoodsIssueCharges, setTotalGoodsIssueCharges] = useState<number>(0);
    const [overallTotal, setOverallTotal] = useState<number>(0);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    // IOS Date picker modal setup
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const hideIOSDatePicker = () => {
        setDatePickerVisible(false);
    };

    useEffect(()=> {
        (async()=> {
            setDataProcess(true);
            setType(await AsyncStorage.getItem('type') ?? "");
            setTodayDate(await AsyncStorage.getItem('setDate') ?? "");
            await fetchDataApi(await AsyncStorage.getItem('setDate'), await AsyncStorage.getItem('type'));
        })();
    }, [])

    // Date Picker
    const onChangeDate = async ({type}: any, selectedDate: any) => {
        if(type=="set"){
            const currentDate=selectedDate;
            setSelectedIOSDate(currentDate);
            if(Platform.OS==="android"){
                tonggleDatePicker();
                setTodayDate(currentDate);
                setShowPicker(false);
                await fetchDataApi(currentDate, type);
            }
        }else{
            tonggleDatePicker();
        }
    }

    const confirmIOSDate = async(date:any) => {
        const currentDate=date;
        setTodayDate(currentDate.toISOString().split('T')[0]);
        // tonggleDatePicker();
        setDatePickerVisible(false);
        await fetchDataApi(currentDate.toISOString().split('T')[0], type);
    }
    const tonggleDatePicker = () => {
        if (Platform.OS === 'android') {
            setShowPicker(!showPicker);
        }
        else if (Platform.OS === 'ios') {
            setDatePickerVisible(true);
        }
    }
    // End Date Picker

    const fetchDataApi = async(theDate: any, type: any) => {
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var code=await AsyncStorage.getItem('customerCode');
        var name=await AsyncStorage.getItem('customerName');
        var runDate=theDate.split(' ')[0];

        setCustomerCode(code);
        setCustomerName(name);

        await RNFetchBlob.config({
            trusty: true
        })
        .fetch('GET', "https://"+getIPaddress+"/App/GetOverallDetail?todayDate="+runDate+"&customerId="+code,{
            "Content-Type": "application/json",  
        }).then((response) => {
            if(response.json().isSuccess==true){
                setCustomerCode(response.json().customerId);
                setCustomerName(response.json().customerName);
                setTotalGoodsIssueCharges(response.json().totalGoodsIssueCharges);
                setTotalGoodsReceivingCharges(response.json().totalGoodsReceivingCharges);
                setOverallTotal(response.json().overallTotal);
                setTotalRental(response.json().totalRental);
                
                setIsSuccess(true);
            }else{
                setIsSuccess(false);
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
                <View style={{flexDirection: 'row',}}>
                    <View style={css.listThing}>
                        <Ionicons 
                        name="arrow-back-circle-outline" 
                        size={30} 
                        color="#FFF" 
                        onPress={()=>[navigation.goBack()]} />
                    </View>
                </View>
                <View style={css.HeaderView}>
                    <Text numberOfLines={2} style={css.PageName}> {type} - {customerName}</Text>
                </View>
            </View>

            {/* Set Date */}
            <View style={css.row}>
                {showPicker && Platform.OS === 'android' && <DateTimePicker 
                    mode="date"
                    display="calendar"
                    value={selectedIOSDate}
                    onChange={onChangeDate}
                    style={datepickerCSS.datePicker}
                />}        
                <Pressable style={css.pressableCSS} onPress={tonggleDatePicker} >
                    <TextInput
                        style={datepickerCSS.textInput}
                        placeholder="Select Date"
                        value={todayDate.toString().substring(0,10)}
                        onChangeText={setTodayDate}
                        placeholderTextColor="#11182744"
                        editable={false}
                        onPressIn={tonggleDatePicker}
                    />
                </Pressable>
            </View>    

            {/* End Select Date */}
            {Platform.OS === "ios" && (<DateTimePickerModal
                date={selectedIOSDate}
                isVisible={datePickerVisible}
                mode="date"
                display='inline'
                onConfirm={confirmIOSDate}
                onCancel={hideIOSDatePicker}
            />)}

            {dataProcess== true ? (
            <View style={[css.container]}>
                <ActivityIndicator size="large" />
            </View>
            ) : (
                <View>
                    {isSuccess==false ? (
                        <View style={{alignItems: 'center',justifyContent: 'center'}}>
                            <Image
                                source={ImagesAssets.noData}
                                style={{width: Dimensions.get("window").width/100*80, height: 200}}
                            />
                            <Text style={{fontSize:16,margin:30}}>Today No data yet</Text>
                        </View>
                    ) : (
                    <View>
                        <View style={css.row}>
                            <Text style={css.Title}>Customer Name:</Text>
                            <TouchableOpacity style={[css.subTitle]} onPress={async () => {
                                console.log(customerCode);
                            }}>
                                <Text style={css.subTitle}>{customerName}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Total Rental:</Text>
                            <Text style={css.subTitle}>{totalRental}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Total Goods Receiving Charges:</Text>
                            <Text style={css.subTitle}>{totalGoodsReceivingCharges}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Total Goods Issue Charges:</Text>
                            <Text style={css.subTitle}>{totalGoodsIssueCharges}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Overall Total:</Text>
                            <Text style={css.subTitle}>{overallTotal}</Text>
                        </View>
                    </View>
                    )}
                </View>
            )}
            </KeyboardAvoidWrapper>
            

        </MainContainer>
    );
}

export default DetailOverallScreen;