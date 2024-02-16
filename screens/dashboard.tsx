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
import { showData, BarData, BarData2, currencyFormat, setNumberFormat2 } from '../objects/objects';
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
import { format, parseISO } from 'date-fns';


const DashboardScreen = ({route}: {route: any}) => {
    
    
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00");
    const [myYear, setMyYear] = useState<string>(getDate.getFullYear().toString());

    // DatePicker
    const [showPicker, setShowPicker] = useState(false);
    const [selectedIOSDate, setSelectedIOSDate] = useState(new Date());

    const [fetchedData, setFetchedData] = useState<showData[]>([]);
    const [BarData2, setBarData2] = useState<BarData2[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0); // total
    const [maxChartValue, setMaxChartValue] = useState<number>(100);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    // IOS Date picker modal setup
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const hideIOSDatePicker = () => {
        setDatePickerVisible(false);
    };
    // END IOS Date Picker modal setup

    useEffect(()=> {
        (async()=> {
            setFetchedData([]);
            setBarData2([]);
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchDataApi(route.params.stayPage);       
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
                    await fetchDataApi(route.params.stayPage);
                    
                }else{
                    setTodayDate(currentDate.toISOString().split('T')[0]);
                    await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
                    setShowPicker(false);
                    await fetchDataApi(route.params.stayPage);
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
            await fetchDataApi(route.params.stayPage);
        }else{
            setTodayDate(currentDate.toISOString().split('T')[0]);
            await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
            setDatePickerVisible(false);
            await fetchDataApi(route.params.stayPage);
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
    const fetchDataApi = async(type: any) => {
        setDataProcess(true);
        setFetchedData([]);
        setBarData2([]);

        setTodayDate(await AsyncStorage.getItem('setDate') ?? todayDate);
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var runDate=await AsyncStorage.getItem('setDate');
        let setURL;
        if(type=="Receiving"){
            setURL="GetGoodsReceiving";
        }else if(type=="Outgoing"){
            setURL="GetGoodsIssue";
        }else if(type=="Overall"){
            setURL="GetOverall";
        }

        await RNFetchBlob.config({
            trusty: true
        }).fetch('GET', "https://"+getIPaddress+"/App/"+setURL+"?todayDate="+runDate,{
            "Content-Type": "application/json",  
        }).then(async (response) => {
            if(response.json().isSuccess==true){

                if(response.json().customerData.length!=0){
                    setFetchedData(response.json().customerData.map((item: {
                        customerId: string;
                        customerName: any;
                        overallAmount: number;
                        handlingChargesAmount: number;
                        rentalAmount: number;
                        palletBalance: string;
                        cartonBalance: string;
                        grAmount: number;
                        giAmount: number;
                    }) => ({
                        key: item.customerId,
                        name: item.customerName,
                        amount: type == "Overall" ? item.overallAmount : item.handlingChargesAmount,
                        rentalAmount: item.rentalAmount,
                        palletBalance: item.palletBalance,
                        cartonBalance: item.cartonBalance,
                        grAmount: item.grAmount,
                        giAmount: item.giAmount,
                    })));
                }

                setBarData2(response.json().barChart.map(type == "Overall" ? (item: { overallAmount: number; days: any; date: any }) => ({
                    label: format(parseISO(item.date), 'MMM dd'),
                    value: item.overallAmount,
                    date: item.date,
                }) : (item: { handlingChargesAmount: number; days: any; date: any; }) =>({
                    label: format(parseISO(item.date), 'MMM dd'),
                    value: item.handlingChargesAmount,
                    date: item.date,
                })));

                const WeightArray=(response.json().barChart.map(type == "Overall" ? (item: { overallAmount: any; }) => item.overallAmount : (item: { handlingChargesAmount: any; }) => item.handlingChargesAmount));
                const MaxWeight = Math.max.apply(Math, WeightArray);
                const MaxWeight_Rounded = Math.ceil(MaxWeight/100) * 100;

                if(MaxWeight_Rounded==0){
                    setMaxChartValue(10);
                }else{
                    setMaxChartValue(MaxWeight_Rounded);
                }

                setTotalAmount(response.json().todayTotalAmount);
                
                setDataProcess(false);
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
    };

    const FlatListItem = ({ item }: { item: showData }) => {
        return (
            <TouchableOpacity onPress={async () => {
                await AsyncStorage.setItem('type', route.params.stayPage);
                await AsyncStorage.setItem('customerCode', item.key.toString());
                await AsyncStorage.setItem('customerName', item.name);
                await AsyncStorage.setItem('setDate', todayDate);
                if(route.params.stayPage=="Overall"){
                    // navigation.navigate(DetailOverallScreen as never);
                }else{
                    navigation.navigate(DetailScreen as never);
                }
            }}>
                <View style={css.listItem} key={parseInt(item.key)}>
                    <View style={[css.cardBody]}>
                        
                        {route.params.stayPage=="Overall" ? (
                        <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.textHeader} numberOfLines={2}>{item.name}</Text>
                                <Text style={[css.textDescription,{textAlign:"right"}]}>
                                    Amount: {parseFloat(item.amount).toFixed(2)}
                                </Text>
                            </View>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.text2ndHeader}>
                                    {item.rentalAmount.toFixed(2)}(RA) + {item.grAmount.toFixed(2)}(GR) + {item.giAmount.toFixed(2)}(GI) = {parseFloat(item.amount).toFixed(2)}
                                </Text>
                                <Text style={[css.textDescription,{textAlign:"right"}]}>
                                    { (item.amount==null || item.amount=="Infinity") ? (
                                        0
                                    ) : (
                                        totalAmount==0 ? (
                                            100
                                        ) : (
                                            Math.round(parseInt(item.amount)/totalAmount*100)
                                        )
                                    )}%
                                </Text>
                            </View>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.text2ndHeader}>
                                    Pallet Balance: {item.palletBalance}
                                </Text>
                                <Text style={[css.textDescription,{textAlign:"right"}]}></Text>
                            </View>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.text2ndHeader}>
                                    Carton Balance: {item.cartonBalance}
                                </Text>
                                <Text style={[css.textDescription,{textAlign:"right"}]}></Text>
                            </View> 
                        </View>
                        ) : (
                        <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.textHeader} numberOfLines={2}>{item.name}</Text>
                                <Text style={[css.textDescription,{textAlign:"right"}]}>
                                    Amount: {parseInt(item.amount).toFixed(2)}
                                </Text>
                            </View>
                            <View style={{flexDirection: 'row',}}>
                                { (item.amount==null || item.amount=="0") ? (
                                    <ProgressBar
                                        style={{width:200, height: 10}}
                                        progress={0}
                                        color={colorThemeDB.colors.primary}
                                    />
                                ) : (
                                    totalAmount==0 ? (
                                        <ProgressBar
                                            style={{width:200, height: 10}}
                                            progress={100}
                                            color={colorThemeDB.colors.primary}
                                        />
                                    ) : (
                                        <ProgressBar
                                            style={{width:200, height: 10}}
                                            progress={Math.round(parseInt(item.amount)/totalAmount*100)/100}
                                            color={colorThemeDB.colors.primary}
                                        />
                                    )
                                )}
                                <Text style={[css.textDescription,{textAlign:"center"}]}>
                                    { (item.amount==null || item.amount=="Infinity") ? (
                                        0
                                    ) : (
                                        totalAmount==0 ? (
                                            100
                                        ) : (
                                            Math.round(parseInt(item.amount)/totalAmount*100)
                                        )
                                    )}%
                                </Text>
                            </View>
                        </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    
    return (
        <MainContainer>
            {dataProcess== true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
            <View style={{height:Dimensions.get("screen").height/100*77}}>
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

                <View style={css.secondContainer}>              
                    <LineChart
                        data={BarData2}
                        height={160}
                        width={Dimensions.get("screen").width}
                        noOfSections={4}
                        maxValue={maxChartValue}
                        areaChart
                        startFillColor={colorThemeDB.colors.primary}
                        spacing={65}
                        yAxisLabelWidth={45}
                        initialSpacing={25}
                        color1={colorThemeDB.colors.primary}
                        textColor1="black"
                        dataPointsHeight={4}
                        dataPointsWidth={6}
                        dataPointsColor1={colorThemeDB.colors.primary}
                        textShiftY={0}
                        textShiftX={10}
                        textFontSize={8}
                        showValuesAsDataPointsText={true}
                        adjustToWidth={true}
                        focusEnabled={true}
                        onFocus={async (item: any) => {
                            var getYear = item.date.split(' ')[0].substr(0, 4);
                            setMyYear(getYear);

                            const parsedDate = moment(item.label, "MMM DD");
                            const formattedDate = parsedDate.format("MM-DD");
                            
                            setTodayDate(getYear+"-"+formattedDate)
                            await AsyncStorage.setItem('setDate', getYear+"-"+formattedDate+" 00:00:00");
                            fetchDataApi(route.params.stayPage);
                        }}
                        // curved
                        // showArrow1
                    />
                    <View style={[css.row,{marginTop:5,marginBottom:5}]}>
                        {route.params.stayPage=="Overall" ? (
                            <View style={{width:"75%"}}>
                                <Text style={{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                                    {route.params.stayPage} Amount: {setNumberFormat2(totalAmount)}
                                </Text>
                            </View>
                        ) : (
                            <View style={{width:"100%"}}>
                                <Text style={{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                                    {route.params.stayPage} Amount: {setNumberFormat2(totalAmount)}
                                </Text>
                            </View>
                        )}

                        {route.params.stayPage=="Overall" ? (
                            <View style={{width:"25%",alignItems:'flex-start',justifyContent:'center',margin:5}}>
                                <View style={css.row}>
                                    <Text style={{fontSize:8,fontWeight:'bold',textAlign:"left",fontStyle:"italic"}}>
                                        RA: Rental Amount
                                    </Text>
                                </View>
                                <View style={css.row}>
                                    <Text style={{fontSize:8,fontWeight:'bold',textAlign:"left",fontStyle:"italic"}}>
                                        GR: Goods Receive
                                    </Text>
                                </View>
                                <View style={css.row}>
                                    <Text style={{fontSize:8,fontWeight:'bold',textAlign:"left",fontStyle:"italic"}}>
                                        GI: Goods Issue
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <></>
                        )}
                    </View>
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
export default DashboardScreen;