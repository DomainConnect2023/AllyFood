import * as React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, Image, Platform, Pressable, TextInput } from "react-native";
import { useEffect, useState } from 'react';
// import { LineChart,} from "react-native-chart-kit";
import Snackbar from 'react-native-snackbar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagesAssets } from '../objects/images';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { css, datepickerCSS } from '../objects/commonCSS';
import { showData, BarData, BarData2, currencyFormat, forceCastData, setNumberFormat2 } from '../objects/objects';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFetchBlob from 'rn-fetch-blob';
import 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ProgressBar } from 'react-native-paper';
import DetailScreen from './detailScreen';
import DetailOverallScreen from './detailOverallScreen';
import { LineChart } from 'react-native-gifted-charts';
import { colorThemeDB } from '../objects/colors';
import moment from 'moment';


const ForeCastScreen = ({route}: {route: any}) => {
    
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00");

    // DatePicker
    const [showPicker, setShowPicker] = useState(false);
    const [selectedIOSDate, setSelectedIOSDate] = useState(new Date());

    const [fetchedData, setFetchedData] = useState<forceCastData[]>([]);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    // IOS Date picker modal setup
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const hideIOSDatePicker = () => {
        setDatePickerVisible(false);
    };
    // END IOS Date Picker modal setup


    useEffect(()=> { // when starting the page
        (async()=> {
            setFetchedData([]);
            fetchDataApi();
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchDataApi();       
        }, [])
    );

    // Date Picker
    const onChangeDate = async ({type}: any, selectedDate: any) => {
        setShowPicker(false);
        if(type=="set"){
            const currentDate=selectedDate;
            setSelectedIOSDate(currentDate);

            if(Platform.OS==="android"){
                //If user= admin show january data
                if(await AsyncStorage.getItem('userCode') == 'admin'){
                    
                    let Ddata=currentDate.toISOString().split('T')[0]
                    let day =Ddata.split('-')[2]
                    let year="2024";
                    let month="01";
                    setTodayDate(currentDate.toISOString().split('T')[0])
                    await AsyncStorage.setItem('setDate', year+"-"+month+"-"+day);
                    setShowPicker(false);
                    await fetchDataApi();
                    
                }
                else{
                    setTodayDate(currentDate.toISOString().split('T')[0]);
                    await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
                    setShowPicker(false);
                    await fetchDataApi();
                }
            }
        }
    }  

    const confirmIOSDate = async(date:any) => {
        const currentDate=date;
        setSelectedIOSDate(date);
        //If user= admin show january data
        if(await AsyncStorage.getItem('userCode') == 'admin'){
            let Ddata=currentDate.toISOString().split('T')[0]
            let day =Ddata.split('-')[2]
            let year="2024";
            let month="01";
            setTodayDate(currentDate.toISOString().split('T')[0])
            await AsyncStorage.setItem('setDate', year+"-"+month+"-"+day);
            setDatePickerVisible(false);
            await fetchDataApi();
        }
        else{
            setTodayDate(currentDate.toISOString().split('T')[0]);
            await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
            setDatePickerVisible(false);
            await fetchDataApi();
        }

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

    // get data from database
    const fetchDataApi = async() => {
        setDataProcess(true);
        setTodayDate(await AsyncStorage.getItem('setDate') ?? todayDate);
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        
        var runDate=await AsyncStorage.getItem('setDate') ?? todayDate;


        await RNFetchBlob.config({
            trusty: true
        }).fetch('GET', "https://"+getIPaddress+"/App/GetForecast?todayDate="+runDate,{
            "Content-Type": "application/json",  
        }).then((response) => {
            if(response.json().isSuccess==true){
                setFetchedData(response.json().customerData.map((item: {
                    customerName: string;
                    yesterdayTotalAmount: number;
                    todayRental: number;
                    todayGR: number;
                    todayGI: number;
                    todayTotalAmount: number;
                    monthEndTotalAmount: number;
                }) => ({
                    key: item.customerName,
                    yesterdayTotalAmount: item.yesterdayTotalAmount,
                    todayRental: item.todayRental,
                    todayGR: item.todayGR,
                    todayGI: item.todayGI,
                    todayTotalAmount: item.todayTotalAmount,
                    monthEndTotalAmount: item.monthEndTotalAmount,
                })));

            }else{
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
        setDataProcess(false);
    };

    const FlatListItem = ({ item }: { item: forceCastData }) => {
        return (
            <View style={css.listItem} key={parseInt(item.key)}>
                <View style={[css.cardBody]}>
                    <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.textHeader} numberOfLines={2}>{item.key}</Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}>
                                Amount: {(item.yesterdayTotalAmount)}
                            </Text> */}
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.text2ndHeader}>
                                Yesterday Total Amount: {setNumberFormat2(item.yesterdayTotalAmount)}
                            </Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}></Text> */}
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.text2ndHeader}>
                                Today Rental: {setNumberFormat2(item.todayRental)}
                            </Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}>
                                100000%
                            </Text> */}
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.text2ndHeader}>
                                Today GR: {setNumberFormat2(item.todayGR)}
                            </Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}></Text> */}
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.text2ndHeader}>
                                Today GI: {setNumberFormat2(item.todayGI)}
                            </Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}></Text> */}
                        </View> 
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.text2ndHeader}>
                                Today Total Amount: {setNumberFormat2(item.todayTotalAmount)}
                            </Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}></Text> */}
                        </View>
                        <View style={{flexDirection: 'row',}}>
                            <Text style={css.text2ndHeader}>
                                Month End Total Amount: {setNumberFormat2(item.monthEndTotalAmount)}
                            </Text>
                            {/* <Text style={[css.textDescription,{textAlign:"right"}]}></Text> */}
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    
    return (
        <MainContainer>
            {dataProcess== true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
            <View style={{height:Dimensions.get("screen").height/100*83}}>
                <View style={css.firstContainer}>
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

                    {Platform.OS === "ios" && (<DateTimePickerModal
                        date={selectedIOSDate}
                        isVisible={datePickerVisible}
                        mode="date"
                        display='inline'
                        onConfirm={confirmIOSDate}
                        onCancel={hideIOSDatePicker}
                    />)}
                </View>

                <FlatList
                    data={fetchedData}
                    renderItem={FlatListItem}
                    keyExtractor={(item) => item.key}
                />
                
            </View>
            )}
        </MainContainer>
    );
}
export default ForeCastScreen;