import * as React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { useEffect, useState } from 'react';
import { PieChart, } from "react-native-chart-kit";
import Snackbar from 'react-native-snackbar';
import { URLAccess } from '../objects/URLAccess';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import DetailScreen from './detailScreen';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorDB } from '../objects/colors';
import { css } from '../objects/commonCSS';

import { showData, PieData, CircleColorText, currencyFormat } from '../objects/objects';
import RNFetchBlob from 'rn-fetch-blob';

const SearchCustomerDetail = () => {

    const navigation = useNavigation();

    const [fromDate, setFromDate] = useState<string|null>("");
    const [toDate, setToDate] = useState<string|null>("");
    const [dummyfromDate, setDummyFromDate] = useState<string|null>("");
    const [dummytoDate, setDummyToDate] = useState<string|null>("");

    const [fetchedData, setFetchedData] = useState<showData[]>([]);
    const [PieData, setPieData] = useState<PieData[]>([]);
    const [dataProcess, setDataProcess] = useState(false);
    const [totalWeight, setTotalWeight] = useState<number>(0);
    let colorSelected = 0;

    useEffect(()=> {
        (async()=> { 
            setFromDate(await AsyncStorage.getItem('fromDate'));
            setToDate(await AsyncStorage.getItem('toDate'));
            setDataProcess(true);
            await fetchDataApi();
        })();
      }, [])

    const fetchDataApi = async() => {
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var fromDate = await AsyncStorage.getItem('fromDate');
        var toDate = await AsyncStorage.getItem('toDate');

        var type = await AsyncStorage.getItem('type');
        let passData;

        const dataArr = await AsyncStorage.getItem('dataArr');

        if (dataArr !== null) {
            passData = ""+JSON.parse(dataArr);
        }else{
            passData = "";
        }

        // axios.post(URLAccess.reportFunction, {
        // axios.post("https://"+getIPaddress+"/senghiap/mobile/report.php", {
        //     "generateReport":"1", 
        //     "fromDate":fromDate,
        //     "toDate":toDate,
        //     "typeCatch":type,
        //     "typeData":passData
        // })
        // .then(async response => {
        await RNFetchBlob.config({
            trusty: true
        })
        .fetch('POST', "https://"+getIPaddress+"/senghiap/mobile/report.php",{
                "Content-Type": "application/json",  
            }, JSON.stringify({
                "generateReport":"1", 
                "fromDate":fromDate,
                "toDate":toDate,
                "typeCatch":type,
                "typeData":passData
            }),
        ).then((response) => {
            if(response.json().status=="1"){
                setFetchedData(response.json().data.map((item: { weight: string; productCode: any; productName: any; }) => ({
                    value: parseInt(item.weight, 10),
                    key: item.productCode,
                    name: item.productName,
                    weight: item.weight,
                    color: colorDB.colors[colorSelected<5 ? colorSelected+=1 : colorSelected]["hex"],
                })));
                
                colorSelected=0;
                setPieData(response.json().pieData.map((item: { weight: any; productCode: any; }) => ({
                    value: Math.round(item.weight/response.json().totalWeight*100*100)/100,
                    name: "%",
                    color: colorDB.colors[colorSelected<5 ? colorSelected+=1 : colorSelected]["hex"],
                    legendFontSize: 14,
                })));

                setTotalWeight(response.json().totalWeight);
                setDataProcess(false);
            }else{
                Snackbar.show({
                    text: 'Something is wrong. Can not get the data from server!',
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        })
        .catch(error => {
            Snackbar.show({
                text: error,
                duration: Snackbar.LENGTH_SHORT,
            });
        });
    };

    const pieChartItem = ({ item }: { item: showData }) => {
        return (
            <TouchableOpacity onPress={() => {
                AsyncStorage.setItem('productCode', item.key);
                AsyncStorage.setItem('productName', item.name);
                navigation.navigate(DetailScreen as never);
            }}>
                <View style={css.listItem} key={parseInt(item.key)}>
                    <View style={[css.cardBody,{height:70}]}>
                        <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={[css.textHeader,{width:"70%"}]}>Product: {item.key} {item.name!="" ? "("+item.name+")" : ""}</Text>
                                <Text style={css.textDescription}>
                                    <CircleColorText color={item.color} />
                                </Text>
                            </View>
                            <Text style={css.textHeader}>Weight: {currencyFormat(parseInt(item.amount))}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <MainContainer>
            <View style={[css.mainView,{alignItems: 'center',justifyContent: 'center'}]}>
            <View style={{flexDirection: 'row',}}>
                    <View style={css.listThing}>
                        <Ionicons name="arrow-back-circle-outline" size={30} color="#FFF" onPress={()=>navigation.goBack()} />
                    </View>
                </View>
                <View style={css.HeaderView}>
                    <Text numberOfLines={2} style={css.PageName}>Daily Receiving</Text>
                </View>
            </View>

            <View style={{flexDirection: "row",margin:10,alignItems: 'center',justifyContent: 'center'}}>
                <Text style={{fontSize:14,}}>From </Text>
                <Text style={{fontSize:14,fontWeight:'bold',color:"darkred"}}>{fromDate} </Text>
                <Text style={{fontSize:14,}}>To </Text>
                <Text style={{fontSize:14,fontWeight:'bold',color:"darkred"}}>{toDate}</Text>
            </View>
            {dataProcess== true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
            <View>
                <View style={{alignItems: 'center',justifyContent: 'center'}}>
                    <View>
                    <PieChart
                        data={PieData}
                        width={Dimensions.get("window").width}
                        height={250}
                        accessor={"value"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[5, 0]}
                        absolute
                        chartConfig={{
                            backgroundColor: "#e26a00",
                            backgroundGradientFrom: "#fb8c00",
                            backgroundGradientTo: "#ffa726",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16,
                                width: Dimensions.get("window").width
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                            }
                        }}
                    />
                    </View>
                    <View style={{margin:10,alignItems: 'center',justifyContent: 'center'}}>
                        <Text style={{fontSize:18,fontWeight:'bold'}}>Total Weight: {currencyFormat(totalWeight)}</Text>
                    </View>
                </View>
                <View style={{alignItems: 'center',justifyContent: 'center'}}>
                    <View style={{width:"85%",alignItems: 'flex-start',justifyContent: 'flex-start',}}>
                        <Text style={{fontSize:20,fontWeight:'bold'}}>Net Weight List:</Text>
                    </View>
                    <View style={{height:Dimensions.get("screen").height/100*34}}>
                        <FlatList
                            data={fetchedData}
                            renderItem={pieChartItem}
                            keyExtractor={(item) => item.key}
                        />
                    </View>
                </View>
            </View>
            )}
        </MainContainer>
    );
}

export default SearchCustomerDetail;