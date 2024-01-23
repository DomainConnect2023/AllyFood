import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Platform, Pressable, TextInput, Dimensions, Image, FlatList, TouchableOpacity } from "react-native";
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainContainer from '../components/MainContainer';
import { css, datepickerCSS } from '../objects/commonCSS';
import RNFetchBlob from 'rn-fetch-blob';
import { BarData, BarData2, pickingListData } from '../objects/objects';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { LineChart } from 'react-native-chart-kit';
import { ImagesAssets } from '../objects/images';
import { LineChart } from 'react-native-gifted-charts';
import { colorThemeDB } from '../objects/colors';
import DetailPickingListScreen from './detailPickingList';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PickingListScreen = () => {
    const navigation = useNavigation();
    
    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00");

    // DatePicker
    const [showPicker, setShowPicker] = useState(false);
    const [selectedIOSDate, setSelectedIOSDate] = useState(new Date());

    const [fetchedData, setFetchedData] = useState<pickingListData[]>([]); // Flatlist with Pie
    const [BarData, setBarData] = useState<BarData>({ labels: [], datasets: [{ data: [] }] });
    const [BarData2, setBarData2] = useState<BarData2[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0); // total

    const [maxChartValue, setMaxChartValue] = useState<number>(100);
    
    const [dataProcess, setDataProcess] = useState(false);
    const [expandedItems, setExpandedItems] = useState([]);

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
            setBarData({ labels: [], datasets: [{ data: [] }] });
            if(await AsyncStorage.getItem('setDate')==null){
                setTodayDate(await AsyncStorage.getItem('setDate') ?? todayDate);
                
            }else{
                setTodayDate(await AsyncStorage.getItem('setDate') ?? todayDate);
            }
            fetchDataApi();
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchDataApi();       
        }, [])
    );

    const fetchDataApi = async() => {
        setDataProcess(true);
        
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var todayDate=await AsyncStorage.getItem('setDate');

        await RNFetchBlob.config({
            trusty: true,
        }).fetch('GET', "https://"+getIPaddress+"/App/GetPickingList?todayDate="+todayDate,{
            "Content-Type": "application/json",
        }).then(async (response) => {
            if(await response.json().isSuccess==true){
                setFetchedData(response.json().customerData.map((item: { 
                    customerId: string; 
                    customerName: string; 
                    goodsIssueId: number;
                    refNo: string;
                    isDoneLoadingOnTruck: boolean;
                    isDonePicking: boolean;

                }) => ({
                    key: item.goodsIssueId,
                    customerID: item.customerId,
                    customerName: item.customerName,
                    refNo: item.refNo,
                    isDoneLoadingOnTruck: item.isDoneLoadingOnTruck,
                    isDonePicking: item.isDonePicking,

                    datasets: [],
                })));

                setBarData2(response.json().barChart.map((item: { goodsIssueCount: any; days: any; }) => ({
                    label: item.days.slice(0,-3),
                    value: item.goodsIssueCount,
                    // textFontSize: 10
                })));
                
                const WeightArray=(response.json().barChart.map((item: { goodsIssueCount: any; }) => item.goodsIssueCount));
                const MaxWeight = Math.max.apply(Math, WeightArray);
                const MaxWeight_Rounded = Math.ceil(MaxWeight/5) * 5;

                setMaxChartValue(MaxWeight_Rounded);

                const convertedData: BarData = {
                    labels: response.json().barChart.map((item: { days: any; }) => item.days),
                    datasets: [
                        {
                            data: response.json().barChart.map((item: { goodsIssueCount: any; }) => item.goodsIssueCount),
                        },
                        {
                            data: [MaxWeight_Rounded],
                            withDots: false,
                        },
                    ],
                };
                setBarData(convertedData);
                setTotalAmount(response.json().todayIssueAmount);
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

    const FlatListItem = ({ item }: { item: pickingListData }) => {
        return (
            <TouchableOpacity onPress={async () => {
                // console.log(todayDate.split(' ')[0]);
                await AsyncStorage.setItem('goodsID', item.key.toString());
                await AsyncStorage.setItem('setDate', todayDate.split(' ')[0]);

                navigation.navigate(DetailPickingListScreen as never);
            }}>
                <View style={[css.listItem,{padding:5}]} key={parseInt(item.key)}>
                    <View style={[css.cardBody]}>
                        <View style={{alignItems:'flex-start',justifyContent:'center',}}>
                            <View style={{flexDirection:'row'}}>
                                <View style={{flexDirection:'column',width:"70%"}}>
                                    <View>
                                        <Text style={css.basicTextHeader} numberOfLines={2}>Customer: {item.customerName}</Text>
                                    </View>
                                    <View>
                                        <Text style={css.basicTextDiscription}>RefNo: {item.refNo}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection:'column',width:"30%"}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={[css.basicTextHeader,{verticalAlign:"middle"}]}>Status:</Text>
                                        {(item.isDonePicking==true && item.isDoneLoadingOnTruck==true) ? 
                                        (
                                            <Pressable
                                                style={[css.typeButton, { backgroundColor: "green",margin:2, }]}
                                                onPress={async () => []}
                                            ></Pressable>
                                        ) : (item.isDonePicking==true && item.isDoneLoadingOnTruck==false) ? (
                                            <Pressable
                                                style={[css.typeButton, { backgroundColor: "yellow",margin:2, }]}
                                                onPress={async () => []}
                                            ></Pressable>
                                        ) : (
                                            <Pressable
                                                style={[css.typeButton, { backgroundColor: "red",margin:2, }]}
                                                onPress={async () => []}
                                            ></Pressable>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                
            </TouchableOpacity>
        );
    };

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
                await fetchDataApi();
            }
        }
    } 

    const confirmIOSDate = async(date:any) => {
        const currentDate=date;
        setTodayDate(currentDate.toISOString().split('T')[0]);
        await AsyncStorage.setItem('setDate', currentDate.toISOString().split('T')[0]+" 00:00:00");
        setDatePickerVisible(false);
        await fetchDataApi();
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
                        noOfSections={2}
                        maxValue={maxChartValue}
                        areaChart
                        startFillColor={colorThemeDB.colors.onPrimary}
                        showValuesAsDataPointsText
                        spacing={65}
                        initialSpacing={25}
                        color1={colorThemeDB.colors.onPrimary}
                        textColor1="black"
                        dataPointsHeight={4}
                        dataPointsWidth={6}
                        dataPointsColor1={colorThemeDB.colors.onPrimary}
                        textShiftY={0}
                        textShiftX={10}
                        textFontSize={10}
                        adjustToWidth={true}
                        // curved
                        // showArrow1
                        onPress={async (item: any) => {
                            console.log(item);
                            Snackbar.show({
                                text: item.label+": "+item.value.toString(),
                                duration: Snackbar.LENGTH_SHORT,
                            });
                        }}
                    />
                    <View style={[css.row,{marginTop:5,marginBottom:5,}]}>
                        <View style={{width:"80%"}}>
                            <Text style={{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                                Today Issue Amount: {totalAmount}
                            </Text>
                        </View>
                        <View style={{width:"20%",alignItems:'flex-start',justifyContent:'center',margin:5}}>
                            <View style={css.row}>
                                <View style={[css.circle, { backgroundColor: "red" }]}>
                                </View>
                                <Text style={{fontSize:10,fontWeight:'bold',textAlign:"left",fontStyle:"italic"}}>
                                    Pending
                                </Text>
                            </View>
                            <View style={css.row}>
                                <View style={[css.circle, { backgroundColor: "yellow" }]}>
                                </View>
                                <Text style={{fontSize:10,fontWeight:'bold',textAlign:"left",fontStyle:"italic"}}>
                                    Picking
                                </Text>
                            </View>
                            <View style={css.row}>
                                <View style={[css.circle, { backgroundColor: "green" }]}>
                                </View>
                                <Text style={{fontSize:10,fontWeight:'bold',textAlign:"left",fontStyle:"italic"}}>
                                    Completed
                                </Text>
                            </View>
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

export default PickingListScreen;