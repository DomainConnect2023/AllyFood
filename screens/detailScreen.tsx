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

const DetailScreen = () => {
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00"); // for API

    // data information
    const [type, setType] = useState<string | null>("Receiving");
    const [customerName, setCustomerName] = useState<string | null>("");
    const [customerCode, setCustomerCode] = useState<string | null>("");
    const [parkingCharges, setParkingCharges] = useState<number>(0);
    const [overtimeCharges, setOvertimeCharges] = useState<number>(0);
    const [electricityCharges, setElectricityCharges] = useState<number>(0);
    const [transportFee, setTransportFee] = useState<number>(0);

    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [chargesAmount, setChargesAmount] = useState<number>(0);
    const [loadingAmount, setLoadingAmount] = useState<number>(0);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    useEffect(()=> {
        (async()=> {
            setDataProcess(true);
            setType(await AsyncStorage.getItem('type') ?? "");
            setTodayDate(await AsyncStorage.getItem('setDate') ?? "");
            await fetchDataApi(await AsyncStorage.getItem('type'));
        })();
    }, [])

    const fetchDataApi = async(type: any) => {
        var goIPAddress="";
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var theDate=await AsyncStorage.getItem('setDate') ?? "";
        var code=await AsyncStorage.getItem('customerCode');
        var name=await AsyncStorage.getItem('customerName');
        var runDate=theDate.split(' ')[0];

        setCustomerCode(code);
        setCustomerName(name);

        if(type=="Receiving"){
            goIPAddress = "https://"+getIPaddress+"/App/GetGRDetail?todayDate="+runDate+"&customerId="+code;
        }else if(type=="Outgoing"){
            goIPAddress = "https://"+getIPaddress+"/App/GetGIDetail?todayDate="+runDate+"&customerId="+code;
        }
        
        await RNFetchBlob.config({
            trusty: true
        }).fetch('GET', goIPAddress,{
            "Content-Type": "application/json",  
        }).then((response) => {
            if(response.json().isSuccess==true){
                // console.log(response.json());
                setCustomerCode(response.json().customerId);
                setCustomerName(response.json().customerName);
                setElectricityCharges(response.json().containerElectricityCharges);
                setParkingCharges(response.json().containerParkingCharges);
                setOvertimeCharges(response.json().overtimeCharges);
                setTransportFee(response.json().transportFee);
                
                setChargesAmount(type == "Receiving" ? response.json().handlingCharges : response.json().blockStackingCharges);
                setLoadingAmount(type == "Receiving" ? response.json().unloadingAmount : response.json().loadingAmount);
                setTotalAmount(type == "Receiving" ? response.json().totalGRAmount : response.json().totalGIAmount);
            }else{
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

            {dataProcess== true ? (
            <View style={[css.container]}>
                <ActivityIndicator size="large" />
            </View>
            ) : (
                <View>
                    <View style={css.row}>
                        <Text style={css.Title}>Date:</Text>
                        <Text style={css.subTitle}>{todayDate.toString().substring(0,10)}</Text>
                    </View>   
                    <View style={css.row}>
                        <Text style={css.Title}>Customer Name:</Text>
                        <TouchableOpacity style={css.subTitle} onPress={async () => {
                            console.log(customerCode);
                        }}>
                            <Text style={css.subTitle}>{customerName}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>Total {type=="Receiving" ? "GR" : "GI"} Amount:</Text>
                        <Text style={css.subTitle}>{totalAmount.toFixed(2)}</Text>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>{type=="Receiving" ? "Handling Charges" : "Block Stacking"} Charges:</Text>
                        <Text style={css.subTitle}>{chargesAmount.toFixed(2)}</Text>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>Electricity Charges:</Text>
                        <Text style={css.subTitle}>{electricityCharges.toFixed(2)}</Text>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>Parking Charges:</Text>
                        <Text style={css.subTitle}>{parkingCharges.toFixed(2)}</Text>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>Overtime Charges:</Text>
                        <Text style={css.subTitle}>{overtimeCharges.toFixed(2)}</Text>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>{type=="Receiving" ? "Unloading" : "Loading"} Amount:</Text>
                        <Text style={css.subTitle}>{loadingAmount.toFixed(2)}</Text>
                    </View>
                    <View style={css.row}>
                        <Text style={css.Title}>Transport Fee:</Text>
                        <Text style={css.subTitle}>{transportFee.toFixed(2)}</Text>
                    </View>
                </View>
            )}
            </KeyboardAvoidWrapper>
            
        </MainContainer>
    );
}

export default DetailScreen;