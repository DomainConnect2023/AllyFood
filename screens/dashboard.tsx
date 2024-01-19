import * as React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, Image, Platform, Pressable, TextInput } from "react-native";
import { useEffect, useState } from 'react';
import { LineChart,} from "react-native-chart-kit";
import Snackbar from 'react-native-snackbar';
import { useNavigation } from '@react-navigation/native';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagesAssets } from '../objects/images';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { css, datepickerCSS } from '../objects/commonCSS';
import { showData, BarData, currencyFormat } from '../objects/objects';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFetchBlob from 'rn-fetch-blob';
import 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ProgressBar } from 'react-native-paper';
import DetailScreen from './detailScreen';
import DetailOverallScreen from './detailOverallScreen';

const DashboardScreen = ({route}: {route: any}) => {
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00");

    // DatePicker
    const [showPicker, setShowPicker] = useState(false);
    const [selectedIOSDate, setSelectedIOSDate] = useState(new Date());

    const [fetchedData, setFetchedData] = useState<showData[]>([]); // Flatlist with Pie
    const [BarData, setBarData] = useState<BarData>({ labels: [], datasets: [{ data: [] }] });
    const [totalAmount, setTotalAmount] = useState<number>(0); // total

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
            setBarData({ labels: [], datasets: [{ data: [] }] });
            if(await AsyncStorage.getItem('setDate')==null){
                setTodayDate(await AsyncStorage.getItem('setDate') ?? todayDate);
                fetchDataApi(route.params.stayPage,todayDate);
            }else{
                setTodayDate(await AsyncStorage.getItem('setDate') ?? todayDate);
                fetchDataApi(route.params.stayPage,await AsyncStorage.getItem('setDate'));
            }
        })();
    }, [])

    // Date Picker
    const onChangeDate = async ({type}: any, selectedDate: any) => {
        setShowPicker(false);
        if(type=="set"){
            const currentDate=selectedDate;
            setSelectedIOSDate(currentDate);
            if(Platform.OS==="android"){
                setTodayDate(currentDate.toISOString().split('T')[0]);
                await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
                setShowPicker(false);
                await fetchDataApi(route.params.stayPage,currentDate.toISOString().split('T')[0]);
            }
        }
    } 

    const confirmIOSDate = async() => {
        const currentDate=selectedIOSDate;
        setTodayDate(currentDate.toISOString().split('T')[0]);
        await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
        setDatePickerVisible(false);
        await fetchDataApi(route.params.stayPage,currentDate.toISOString().split('T')[0]);
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
    const fetchDataApi = async(type: any, todayDate: any) => {
        setDataProcess(true);
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var runDate=todayDate.split(' ')[0];
        console.log("today date "+ todayDate);
        let setURL

        if(type=="Receiving"){
            setURL="GetGoodsReceiving";
        }else if(type=="Outgoing"){
            setURL="GetGoodsIssue";
        }else if(type=="Overall"){
            setURL="GetOverall";
        }

        // console.log(getIPaddress+" "+setURL+" "+runDate);

        await RNFetchBlob.config({
            trusty: true
        }).fetch('GET', "https://"+getIPaddress+"/App/"+setURL+"?todayDate="+runDate,{
            "Content-Type": "application/json",  
        }).then((response) => {
            if(response.json().isSuccess==true){
                setFetchedData(response.json().customerData.map((item: { 
                    customerId: string; 
                    customerName: any; 
                    overallAmount: number;
                    handlingChargesAmount: number;
                }) => ({
                    key: item.customerId,
                    name: item.customerName,
                    amount: type == "Overall" ? item.overallAmount : item.handlingChargesAmount,
                })));

                const WeightArray=(response.json().barChart.map(type == "Overall" ? (item: { overallAmount: any; }) => item.overallAmount : (item: { handlingChargesAmount: any; }) => item.handlingChargesAmount));
                const MaxWeight = Math.max.apply(Math, WeightArray);
                const MaxWeight_Rounded = Math.ceil(MaxWeight/500) * 500;

                const convertedData: BarData = {
                    labels: response.json().barChart.map((item: { days: any; }) => item.days),
                    datasets: [
                        {
                            data: response.json().barChart.map( type == "Overall" ? (item: { overallAmount: any; }) => item.overallAmount : (item: { handlingChargesAmount: any; }) => item.handlingChargesAmount),
                        },
                        {
                            data: [MaxWeight_Rounded],
                            withDots: false,
                        },
                    ],
                };
                setBarData(convertedData);
                setTotalAmount(response.json().todayTotalAmount);
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

    const FlatListItem = ({ item }: { item: showData }) => {
        return (
            <TouchableOpacity onPress={async () => {
                await AsyncStorage.setItem('type', route.params.stayPage);
                await AsyncStorage.setItem('customerCode', item.key.toString());
                await AsyncStorage.setItem('customerName', item.name);
                await AsyncStorage.setItem('setDate', todayDate);
                if(route.params.stayPage=="Overall"){
                    navigation.navigate(DetailOverallScreen as never);
                }else{
                    navigation.navigate(DetailScreen as never);
                }
            }}>
                <View style={css.listItem} key={parseInt(item.key)}>
                    <View style={[css.cardBody]}>
                        <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.textHeader}>{item.name}</Text>
                                <Text style={css.textDescription}>
                                    Amount: {item.amount}
                                </Text>
                            </View>
                            <View style={{flexDirection: 'row',}}>
                                {item.amount==null ? (
                                    <ProgressBar
                                        style={{width:200, height: 10}}
                                        progress={0}
                                        color={"#8561c5"}
                                    />
                                ) : (
                                    <ProgressBar
                                        style={{width:200, height: 10}}
                                        progress={Math.round(parseInt(item.amount)/totalAmount*100)/100}
                                        color={"#8561c5"}
                                    />
                                )}
                                <Text style={[css.textDescription,{textAlign:"center"}]}>
                                    { item.amount==null ? (
                                        0
                                    ) : (
                                        Math.round(parseInt(item.amount)/totalAmount*100)
                                    )}%
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    
    return (
        <MainContainer>
            {/* <KeyboardAvoidWrapper> */}

            {/* Set Date */}
            <View style={css.row}>
                {showPicker && Platform.OS === 'android' && <DateTimePicker 
                    mode="date"
                    display="calendar"
                    value={getDate}
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
                    {(fetchedData.length==0 ) ? (
                        <View style={{alignItems: 'center',justifyContent: 'center'}}>
                            <Image
                                source={ImagesAssets.noData}
                                style={{width: Dimensions.get("window").width/100*80, height: 200}}
                            />
                            <Text style={{fontSize:16,margin:30}}>Today No data yet</Text>
                        </View>
                    ) : (
                    <View>
                        <View style={{alignItems: 'center',justifyContent: 'center'}}>
                            <View>
                            <LineChart
                                data={BarData}
                                width={Dimensions.get("window").width/100*90}
                                height={160}
                                yAxisSuffix=""
                                yAxisLabel=""
                                chartConfig={{
                                    backgroundColor: '#1cc910',
                                    backgroundGradientFrom: '#eff3ff',
                                    backgroundGradientTo: '#efefef',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                }}
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16, 
                                }}
                            />
                            </View>
                        </View>
                        
                        <View style={[css.row,{marginTop:5,marginBottom:5}]}>
                            <Text style={{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                                {route.params.stayPage} Amount: {totalAmount}
                            </Text>
                        </View>
                        
                        <View style={{alignItems: 'center',justifyContent: 'center',}}>
                            {/* <View> */}
                            <View style={{height:Dimensions.get("screen").height/100*45}}>
                            {/* <View style={{height:"auto"}}> */}
                                {/* TODO: review this on responsive part */}
                                <FlatList
                                    data={fetchedData}
                                    renderItem={FlatListItem}
                                    keyExtractor={(item) => item.key}
                                />
                            </View>
                        </View>
                    </View>
                    )}
                </View>
            )}
            {/* </KeyboardAvoidWrapper> */}
        </MainContainer>
    );
}
export default DashboardScreen;