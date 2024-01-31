import * as React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, TextInput, Pressable, Image, Dimensions, FlatList } from "react-native";
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
import { previousBillingData, setNumberFormat2, showData } from '../objects/objects';

const DetailPreviousBillingScreen = () => {
    const navigation = useNavigation();

    const [theDate, setTheDate] = useState<string | "">("");

    // data information
    const [customerName, setCustomerName] = useState<string | null>("");
    const [fetchedData, setFetchedData] = useState<previousBillingData[]>([]);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    useEffect(()=> {
        (async()=> {
            setTheDate(await AsyncStorage.getItem('setDate') ?? "");
            await fetchDataApi();
        })();
    }, [])

    const fetchDataApi = async() => {
        setDataProcess(true);
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var customerID=await AsyncStorage.getItem('customerID');
        var setDate=await AsyncStorage.getItem('setDate');

        await RNFetchBlob.config({
            trusty: true
        })
        .fetch('GET', "https://"+getIPaddress+"/App/GetPreviousBillingDetail?todayDate="+setDate+"&customerId="+customerID,{
            "Content-Type": "application/json",  
        }).then((response) => {
            if(response.json().isSuccess==true){
                setCustomerName(response.json().customerName);

                setFetchedData(response.json().previousBillingDetail.map((item: { 
                    month: string; 
                    date: string; 
                    amount: number;

                }) => ({
                    key: item.month,
                    date: item.date,
                    amount: setNumberFormat2(item.amount),
                })));

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

    const FlatListItem = ({ item }: { item: previousBillingData }) => {
        return (
            <View style={[css.listItem,{padding:5}]} key={item.key}>
                <View style={[css.cardBody]}>
                    <View style={{alignItems:'flex-start',justifyContent:'center',}}>
                        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', borderWidth: 1, margin:5, borderRadius:10 }}>
                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ alignSelf: 'stretch', margin:5}}>
                                        <Text style={[css.basicTextHeader,{fontSize:18}]} numberOfLines={2}>Month: {item.key}</Text>
                                    </View>
                                </View>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ alignSelf: 'stretch', margin:5}}>
                                        <Text style={[css.basicTextDiscription,{fontSize:14}]}>Date: {item.date}</Text>
                                    </View>
                                </View>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ alignSelf: 'stretch', margin:5}}>
                                        <Text style={[css.basicTextDiscription,{fontSize:14}]}>Amount: {item.amount}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <MainContainer>
            {/* <KeyboardAvoidWrapper> */}
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
                        <Text numberOfLines={2} style={css.PageName}> Previous Billing Detail: </Text>
                    </View>
                </View>
                
                {dataProcess== true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
                ) : (
                    <View style={[{height:Dimensions.get("screen").height/100*82,justifyContent: 'center',alignItems: 'center'}]}>
                        <View style={[css.detailContainer,{height: '15%',}]}>
                            <View style={css.row}>
                                <Text style={css.Title}>Date:</Text>
                                <Text style={css.subTitle}>{theDate}</Text>
                            </View>  
                            <View style={css.row}>
                                <Text style={css.Title}>Customer Name:</Text>
                                <Text style={css.subTitle}>{customerName}</Text>
                            </View>
                        </View>
                    
                        <FlatList
                            data={fetchedData}
                            renderItem={FlatListItem}
                            keyExtractor={(item) => item.key}
                        />
                    </View>
                )}
            
            {/* </KeyboardAvoidWrapper> */}
        </MainContainer>
    );
}

export default DetailPreviousBillingScreen;