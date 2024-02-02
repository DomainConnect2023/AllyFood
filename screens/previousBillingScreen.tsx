import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Platform, Pressable, TextInput, Dimensions, Image, FlatList, TouchableOpacity } from "react-native";
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainContainer from '../components/MainContainer';
import { css, datepickerCSS } from '../objects/commonCSS';
import RNFetchBlob from 'rn-fetch-blob';
import { BarData, BarData2, monthNumberToName, setNumberFormat2, showData } from '../objects/objects';
// import { LineChart } from 'react-native-chart-kit';
import { ImagesAssets } from '../objects/images';
import { LineChart } from 'react-native-gifted-charts';
import { colorThemeDB } from '../objects/colors';
import DetailPickingListScreen from './detailPickingList';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import DetailPreviousBillingScreen from './detailPreviousBilling';
import MonthPicker from 'react-native-month-year-picker';
import { parse, format } from 'date-fns';

const PreviousBillingScreen = () => {
    const navigation = useNavigation();

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const [myYear, setMyYear] = useState<string>(date.getFullYear().toString());
    const [myMonth, setMyMonth] = useState<string>(date.toISOString().split('T')[0].substring(5,7));
    
    // const [theMonth, setTheMonth] = useState<string>(new Date().getMonth().toString());

    const [fetchedData, setFetchedData] = useState<showData[]>([]);
    const [BarData2, setBarData2] = useState<BarData2[]>([]);
    const [AverageData, setAverageData] = useState<BarData2[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const [maxChartValue, setMaxChartValue] = useState<number>(100);
    
    const [dataProcess, setDataProcess] = useState(false);

    const showPicker = useCallback((value: any) => setShow(value), []);

    const onValueChange = useCallback( (event: any, newDate: any) => {
        showPicker(false);
        const selectedDate = newDate || date;

        const formattedYear = format(selectedDate, 'yyyy');
        const formattedMonth = format(selectedDate, 'MM');

        setMyYear(formattedYear);
        setMyMonth(formattedMonth);

        setDate(selectedDate);
        fetchDataApi(formattedYear,formattedMonth);
        },
        [date, showPicker],
    );

    useEffect(()=> {
        (async()=> {
            setFetchedData([]);
            setBarData2([]);
            fetchDataApi(myYear,myMonth);
        })();
    }, []);

    const fetchDataApi = async(theYear: string, theMonth: string) => {
        setDataProcess(true);
        
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var theDate=theYear+"-"+theMonth;

        await RNFetchBlob.config({
            trusty: true,
        }).fetch('GET', "https://"+getIPaddress+"/App/GetPreviousBilling?todayDate="+theDate,{
            "Content-Type": "application/json",
        }).then(async (response) => {
            if(await response.json().isSuccess==true){
                setFetchedData(response.json().customerData.map((item: { 
                    customerId: number; 
                    customerName: string; 
                    previousBillingAverageAmount: number;

                }) => ({
                    key: item.customerId,
                    name: item.customerName,
                    amount: item.previousBillingAverageAmount.toFixed(2),
                })));

                setBarData2(response.json().barChart.map((item: { amount: any; month: any; date: any; }) => ({
                    label: item.month,
                    value: item.amount.toFixed(2),
                    date: item.date,
                    textFontSize: 8
                })));

                setAverageData(response.json().barChart.map((item: { amount: any; month: any; date: any; }) => ({
                    label: item.month,
                    value: response.json().totalAverageAmount,
                    date: item.date,
                    textFontSize: 1,
                })));
                
                const AmountArray=(response.json().barChart.map((item: { amount: any; }) => item.amount));
                const MaxAmount = Math.max.apply(Math, AmountArray);
                const MaxAmount_Rounded = Math.ceil(MaxAmount/5000) * 5000;

                setMaxChartValue(MaxAmount_Rounded);
                setTotalAmount(response.json().totalAverageAmount);
            }else{
                // console.log(response.json().message);
                Snackbar.show({
                    text: response.json().message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        }).catch(error => {
            // console.error(error.message);
        });
        setDataProcess(false);
    }

    

    const FlatListItem = ({ item }: { item: showData }) => {
        return (
            <TouchableOpacity onPress={async () => {
                await AsyncStorage.setItem('customerID', item.key.toString());
                await AsyncStorage.setItem('setYearMonth', myYear+"-"+myMonth);

                navigation.navigate(DetailPreviousBillingScreen as never);
            }}>
                <View style={[css.listItem,{padding:5,height:75,}]} key={item.key}>
                    <View style={[css.cardBody]}>
                        <View style={{alignItems:'flex-start',justifyContent:'center',}}>
                            <View style={{flexDirection:'row'}}>
                                <View style={{flexDirection:'column',width:"100%"}}>
                                    <View>
                                        <Text style={[css.basicTextHeader,{fontSize:16}]} numberOfLines={2}>Customer: {item.name}</Text>
                                    </View>
                                    <View>
                                        <Text style={[css.basicTextDiscription,{fontSize:12,color:"black"}]}>Total {myYear +" "+ monthNumberToName(myMonth)} Amount: </Text>
                                    </View>
                                    <View>
                                        <Text style={[css.basicTextDiscription,{fontSize:12}]}>6 Months Average Amount: {item.amount}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <MainContainer>
            {(dataProcess==true) ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
            <View style={{height:Dimensions.get("screen").height/100*83}}>
                <View style={css.firstContainer}>
                    <View style={css.row}>
                        <TouchableOpacity style={css.pressableCSS} onPress={() => showPicker(true)}>
                            <TextInput
                                style={datepickerCSS.textInput}
                                value={myYear +"-"+ myMonth}
                                placeholderTextColor="#11182744"
                                editable={false}
                            />
                        </TouchableOpacity>
                        {show && (
                            <MonthPicker
                                onChange={onValueChange}
                                value={date}
                                locale="en"
                                mode='number'
                            />
                        )}
                    </View>    
                </View>

                <View style={css.secondContainer}>
                    {/* <LineChart
                        data={BarData2}
                        height={160}
                        width={Dimensions.get("screen").width}
                        noOfSections={4}
                        maxValue={maxChartValue}
                        areaChart
                        startFillColor={colorThemeDB.colors.primary}
                        yAxisLabelWidth={45}
                        spacing={50}
                        initialSpacing={20}
                        color1={colorThemeDB.colors.primary}
                        textColor1="black"
                        dataPointsColor1={colorThemeDB.colors.primary}
                        textShiftY={2}
                        textShiftX={8}
                        textFontSize={8}
                        showValuesAsDataPointsText={true}
                        adjustToWidth={true}
                        focusEnabled={true}
                        // curved
                        // showArrow1
                        onFocus={async (item: any) => {
                            var getYear = item.date.substr(item.date.length - 4);
                            var monthNumber = format(parse(item.label, 'MMM', new Date()), 'MM');
                            setMyYear(getYear);
                            setMyMonth(monthNumber);
                            await AsyncStorage.setItem('setYearMonth', getYear+"-"+monthNumber);
                            fetchDataApi(getYear,monthNumber);
                        }}
                    /> */}
                    <LineChart
                        data={BarData2}
                        data2={AverageData}
                        hideDataPoints2={true}
                        height={160}
                        width={Dimensions.get("screen").width}
                        noOfSections={4}
                        maxValue={maxChartValue}
                        color1={colorThemeDB.colors.primary}
                        yAxisLabelWidth={45}
                        textShiftY={2}
                        textShiftX={8}
                        showValuesAsDataPointsText={true}
                        spacing={50}
                        thickness1={2}
                        thickness2={1}
                        xAxisThickness={1}
                        yAxisThickness={1}
                        adjustToWidth={true}
                        focusEnabled={true}
                        highlightedRange={{
                            from: 0,
                            to: totalAmount-0.01,
                            color: "red",
                        }}
                        onFocus={async (item: any) => {
                            var getYear = item.date.substr(item.date.length - 4);
                            var monthNumber = format(parse(item.label, 'MMM', new Date()), 'MM');
                            setMyYear(getYear);
                            setMyMonth(monthNumber);
                            await AsyncStorage.setItem('setYearMonth', getYear+"-"+monthNumber);
                            fetchDataApi(getYear,monthNumber);
                        }}
                    />
                    <View style={[css.row,{marginTop:5,}]}>
                        <View style={{width:"100%"}}>
                            <Text style={{fontSize:14,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                                Total {myYear +" "+ monthNumberToName(myMonth)} Amount: {}
                            </Text>
                            <Text style={{fontSize:14,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                                6 Months Average Amount: {setNumberFormat2(totalAmount)}
                            </Text>
                        </View>
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

export default PreviousBillingScreen;