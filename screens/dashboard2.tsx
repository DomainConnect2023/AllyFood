import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Pressable, TextInput, ProgressBarAndroid, Platform } from "react-native";
import { BarChart,} from "react-native-chart-kit";
import Snackbar from 'react-native-snackbar';
import { useNavigation } from '@react-navigation/native';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { css, datepickerCSS } from '../objects/commonCSS';
import { BarData, currencyFormat, showData } from '../objects/objects';
import RNFetchBlob from 'rn-fetch-blob';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ProgressBar, MD3Colors } from 'react-native-paper';

const DashboardScreen2 = ({route}: {route: any}) => {
    const navigation = useNavigation();

    const getDate = new Date;
    const [todayDate, setTodayDate] = useState<string | "">(getDate.toISOString().split('T')[0]+" 00:00:00"); // for API

    // DatePicker
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(getDate.toDateString());
    const [selectedIOSDate, setSelectedIOSDate] = useState(new Date());

    // IOS Date picker modal setup
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const hideIOSDatePicker = () => {
        setDatePickerVisible(false);
    };
    // END IOS Date Picker modal setup

    const [fetchedData, setFetchedData] = useState<showData[]>([]); // Flatlist
    const [BarData, setBarData] = useState<BarData>({ labels: [], datasets: [{ data: [] }] });
    const [totalWeight, setTotalWeight] = useState<number>(0); // total weight

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    const [stayPage, setStayPage] = useState("product");
    const [itemID, setItemID] = useState("");
    const [itemName, setItemName] = useState("");

    useEffect(()=> { // when starting the page
        (async()=> {
            setDataProcess(true);
            setFetchedData([]);
            setBarData({ labels: [], datasets: [{ data: [] }] });

            if(route.params.stayPage=="product"){
                const productCode = await AsyncStorage.getItem('productCode');
                if(productCode!="" && productCode!=null){
                    setItemID(productCode);
                    setStayPage("product");
                    setTodayDate(await AsyncStorage.getItem('fromDate') ?? "");
                    setSelectedDate(await AsyncStorage.getItem('fromDate') ?? "");
                    await fetchDataApi(todayDate, "product", true, productCode);

                }else{
                    setStayPage("product");
                    setTodayDate(await AsyncStorage.getItem('fromDate') ?? "");
                    setSelectedDate(await AsyncStorage.getItem('fromDate') ?? "");
                    await fetchDataApi(todayDate, "product", false, "");
                }
    
            }else if(route.params.stayPage=="customer"){
                const accode = await AsyncStorage.getItem('accode');
                if(accode!="" && accode!=null){
                    setItemID(accode);
                    setStayPage("customer");
                    setTodayDate(await AsyncStorage.getItem('fromDate') ?? "");
                    setSelectedDate(await AsyncStorage.getItem('fromDate') ?? "");
                    await fetchDataApi(todayDate, "customer", true, accode);
                    
                }else{
                    setStayPage("customer");
                    setTodayDate(await AsyncStorage.getItem('fromDate') ?? "");
                    setSelectedDate(await AsyncStorage.getItem('fromDate') ?? "");
                    await fetchDataApi(todayDate, "customer", false, "");
                }

            }else if(route.params.stayPage=="salesman"){
                const salesmancode = await AsyncStorage.getItem('salesmancode');
                if(salesmancode!="" && salesmancode!=null){
                    // setItemID(salesmancode);
                    // setStayPage("salesman");
                    // setTodayDate(await AsyncStorage.getItem('fromDate') ?? "");
                    // setSelectedDate(await AsyncStorage.getItem('fromDate') ?? "");
                    // await fetchSalesmanDetailDataApi(salesmancode, todayDate);
                    
                }else{
                    setStayPage("salesman");
                    setTodayDate(await AsyncStorage.getItem('fromDate') ?? "");
                    setSelectedDate(await AsyncStorage.getItem('fromDate') ?? "");
                    await fetchDataApi(todayDate, "salesman", false, "");
                }
            }
        })();
    }, []);

    const fetchDataApi = async(theDate: any, type: any, detail: any, code: any) => {
        let params;
        setFetchedData([]);
        setBarData({ labels: [], datasets: [{ data: [] }] });
        var getIPaddress=await AsyncStorage.getItem('IPaddress');

        if(type=="product"){
            if(detail==false){
                params={
                    "read":"1", 
                    "todayDate":theDate
                };
            }else{
                params={
                    "readDetail":"1", 
                    "fromDate":theDate,
                    "toDate":theDate,
                    "productCode":code
                };
            }
            
        }else if(type=="customer"){
            if(detail==false){
                params={
                    "readCustomer":"1", 
                    "todayDate":theDate
                };
            }else{
                params={
                    "readCustomerDetail":"1", 
                    "fromDate":theDate,
                    "toDate":theDate,
                    "accode":code
                };
            }
            
        }else if(type=="salesman"){
            if(detail==false){
                params={
                    "readSalesman":"1", 
                    "todayDate":theDate
                };
            }
        }

        await RNFetchBlob.config({
            trusty: true
        }).fetch('POST', "https://"+getIPaddress+"/senghiap/mobile/report.php",{
                "Content-Type": "application/json",  
            }, JSON.stringify(params),
        ).then(async (response) => {
            // console.log("Today: "+theDate+" TW: "+response.json().totalWeight);
            console.log(getIPaddress)
            if(await response.json().status=="1"){
                setFetchedData(response.json().data.map((item: { weight: string; key: any; name: any; }) => ({
                    key: item.key,
                    name: item.name==null ? "Others" : item.name,
                    weight: item.weight,
                })));

                const convertedData: BarData = {
                    labels: response.json().barData.map((item: { days: any; }) => item.days),
                    datasets: [{
                        data: response.json().barData.map((item: { dayTotalWeight: any; }) => item.dayTotalWeight),
                    },],
                };
                setBarData(convertedData);

                setTotalWeight(response.json().totalWeight);
                setDataProcess(false);
            }else{
                Snackbar.show({
                    text: 'Something is wrong. Can not get the data from server!',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        }).catch(error => {
            Snackbar.show({
                text: error.message,
                duration: Snackbar.LENGTH_SHORT,
            });
        });
    };

    const FlatListItem = ({ item }: { item: showData }) => {
        return (
            <TouchableOpacity onPress={async () => {

                if(stayPage=="product" && itemID!=""){
                    await AsyncStorage.setItem('productCode', "");
                    await AsyncStorage.setItem('accode', item.key);
                    navigation.navigate('Customer' as never);
                }else if(stayPage=="customer" && itemID!=""){
                    await AsyncStorage.setItem('accode', "");
                    await AsyncStorage.setItem('productCode', item.key);
                    navigation.navigate('Product' as never);
                }else if(stayPage=="salesman" && itemID!=""){
                    
                    
                }else{
                    if(stayPage=="product"){
                        setDataProcess(true);
                        setItemName(item.name);
                        setItemID(item.key);
                        await AsyncStorage.setItem('productCode', item.key);
                        await AsyncStorage.setItem('accode', "");
                        
                        await fetchDataApi(todayDate,"product",true,item.key);
                    }else if(stayPage=="customer"){
                        setDataProcess(true);
                        setItemName(item.name);
                        setItemID(item.key);
                        await AsyncStorage.setItem('accode', item.key);
                        await AsyncStorage.setItem('productCode', "");
                        
                        await fetchDataApi(todayDate, "customer",true,item.key);
                    }
                }
            }}>
                <View style={css.listItem} key={parseInt(item.key)}>
                    <View style={[css.cardBody]}>
                        <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.textHeader}>
                                { stayPage=="salesman"
                                ? ("Salesman: ")
                                : stayPage=="product" 
                                    ? itemID=="" 
                                        ? ("Product: ") 
                                        : ("Customer: ") 
                                    : itemID=="" 
                                        ? ("Customer: ")
                                        : ("Product: ")
                                } 
                                {item.key} {item.name!="" ? "("+item.name+")" : ""}</Text>
                                <Text style={css.textDescription}>
                                    Weight: {currencyFormat(parseInt(item.amount))}
                                </Text>
                            </View>
                            <View style={{flexDirection: 'row',}}>
                                {item.amount==null ? (
                                    <ProgressBar
                                        style={{width:250, height: 10}}
                                        progress={0}
                                        color={"#8561c5"}
                                    />
                                ) : (
                                    <ProgressBar
                                        style={{width:250, height: 10}}
                                        progress={Math.round(parseInt(item.amount)/totalWeight*100)/100}
                                        color={"#8561c5"}
                                    />
                                )}
                                <Text style={[css.textDescription,{textAlign:"center"}]}>
                                    { item.amount==null ? (
                                        0
                                    ) : (
                                        Math.round(parseInt(item.amount)/totalWeight*100)
                                    )}%
                                </Text>
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
            const currentDate=selectedDate.toISOString().split('T')[0];
            setSelectedIOSDate(currentDate);
            if(Platform.OS==="android"){
                setSelectedDate(currentDate);
                setTodayDate(currentDate);
                setDataProcess(true);
                if(route.params.stayPage=="product"){
                    if(itemID==""){
                        await fetchDataApi(currentDate,"product",false,"");
                    }else{
                        await fetchDataApi(currentDate,"product",true,itemID);
                    }
                    
                }else{
                    if(itemID==""){
                        await fetchDataApi(currentDate,"customer",false,"");
                    }else{
                        await fetchDataApi(currentDate,"customer",true,itemID);
                    }
                }
            }
        }
    }

    const confirmIOSDate = async(date:any) => {
        const currentDate=date;
        console.log(currentDate);
        setTodayDate(currentDate.toISOString().split('T')[0]);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
        setDataProcess(true);
        setDatePickerVisible(false);
        console.log(currentDate);
        if(route.params.stayPage=="product"){
            if(itemID==""){
                await fetchDataApi(todayDate,"product",false,"");
            }else{
                await fetchDataApi(todayDate,"product",true,itemID);
            }
            
        }else{
            if(itemID==""){
                await fetchDataApi(todayDate,"customer",false,"");
            }else{
                await fetchDataApi(todayDate,"customer",true,itemID);
            }
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

    return (
        <MainContainer>
            {/* <KeyboardAvoidWrapper> */}
            {dataProcess== true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <View>
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
                                value={selectedDate.toString().substring(0,10)}
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
                    {/* End Set Date */}

                    <View style={[{marginTop:5,marginBottom:5}]}>
                        <Text style={[{fontSize:8,color:"red",textAlign:"center",marginBottom:-10}]}>Click to reset*</Text>
                        <TouchableOpacity style={[css.row,{margin:0}]} onPress={async () => {
                            setDataProcess(true);
                            await AsyncStorage.setItem('accode', "");
                            await AsyncStorage.setItem('productCode', "");
                            setItemName("");
                            setItemID("");

                            if(stayPage=="product"){
                                setStayPage("product");
                                await fetchDataApi(todayDate,"product",false,"");
                            }else if(stayPage=="customer"){
                                setStayPage("customer");
                                await fetchDataApi(todayDate,"customer",false,"");
                            }else if(stayPage=="salesman"){
                                setStayPage("salesman");
                                await fetchDataApi(todayDate,"salesman",false,"");
                            }
                        }}>
                            <Text style={[css.pressableCSS,{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic",}]}>
                                {stayPage=="product" 
                                ? itemID=="" 
                                    ? ("All Product") 
                                    : (itemID) 
                                : stayPage=="customer"
                                ? itemID==""
                                    ? ("All Customer")
                                    : itemName=="" ? (itemID) : (itemName)
                                : itemID==""
                                    ? ("All Salesman")
                                    : itemName=="" ? (itemID) : (itemName)
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[css.row]}>
                        <BarChart
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

                    <View style={[css.row,{marginTop:5,marginBottom:5}]}>
                        <Text style={{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                            Total Weight: {currencyFormat(totalWeight)}
                        </Text>
                    </View>
                    
                    <View style={{alignItems: 'center',justifyContent: 'center',}}>
                        {/* <View> */}
                        <View style={{height:Dimensions.get("screen").height/100*50}}>
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
            {/* </KeyboardAvoidWrapper> */}
        </MainContainer>
    );
}

export default DashboardScreen2;