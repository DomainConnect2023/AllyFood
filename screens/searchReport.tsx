import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Pressable, TextInput, ProgressBarAndroid, Platform } from "react-native";
import { BarChart, PieChart,} from "react-native-chart-kit";
import Snackbar from 'react-native-snackbar';
import { useNavigation } from '@react-navigation/native';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { css, datepickerCSS } from '../objects/commonCSS';
import { CircleColorText, PieData, currencyFormat, showData } from '../objects/objects';
import RNFetchBlob from 'rn-fetch-blob';
import { ProgressBar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colorDB } from '../objects/colors';
import DetailCustomerScreen from './detailCustomer';
import DetailScreen from './detailScreen';

const SearchReport = () => {
    const navigation = useNavigation();

    const [dataProcess, setDataProcess] = useState(false); // check when loading data
    const [PieData, setPieData] = useState<PieData[]>([]);
    const [totalWeight, setTotalWeight] = useState<number>(0); // total weight
    const [fetchedData, setFetchedData] = useState<showData[]>([]); // Flatlist
    let colorSelected = 0;

    const [fromDate, setFromDate] = useState<string|null>("");
    const [toDate, setToDate] = useState<string|null>("");
    const [type, setType] = useState<string|null>("");

    useEffect(()=> {
        (async()=> {
            setPieData([]);
            setFetchedData([]);
            setFromDate(await AsyncStorage.getItem('fromDate'));
            setToDate(await AsyncStorage.getItem('toDate'));
            setType(await AsyncStorage.getItem('type'));
            await fetchDataApi();
        })();
    }, [])

    const fetchDataApi = async() => {
        let passData;
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var fromDate = await AsyncStorage.getItem('fromDate');
        var toDate = await AsyncStorage.getItem('toDate');
        var type = await AsyncStorage.getItem('type');  
        const dataArr = await AsyncStorage.getItem('dataArr');
        if (dataArr !== null) {
            passData = ""+JSON.parse(dataArr);
        }else{
            passData = "";
        }
        
        setDataProcess(true);
        await RNFetchBlob.config({
            trusty: true
        }).fetch('POST', "https://"+getIPaddress+"/senghiap/mobile/report.php",{
            "Content-Type": "application/json",  
        }, JSON.stringify({
            "generateReport":"1", 
            "fromDate":fromDate,
            "toDate":toDate,
            "typeCatch":type,
            "typeData":passData
        }),).then((response) => {
            if(response.json().status=="1"){
                setFetchedData(response.json().data.map((item: { weight: string; key: any; name: any; }) => ({
                    key: item.key,
                    value: parseInt(item.weight, 10),
                    name: item.name,
                    weight: item.weight,
                    color: colorDB.colors[colorSelected<5 ? colorSelected+=1 : colorSelected]["hex"],
                })));

                colorSelected=0;
                setPieData(response.json().pieData.map((item: { weight: any; key: any; name: any; }) => ({
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
        }).catch(error => {
            Snackbar.show({
                text: error,
                duration: Snackbar.LENGTH_SHORT,
            });
        });
    };

    const FlatListItem = ({ item }: { item: showData }) => {
        return (
            <TouchableOpacity onPress={async () => {}}>
                <View style={css.listItem} key={parseInt(item.key)}>
                    <View style={[css.cardBody]}>
                        <View style={{alignItems: 'flex-start',justifyContent: 'center',flex: 1,flexGrow: 1,}}>
                            <View style={{flexDirection: 'row',}}>
                                <Text style={css.textHeader}>
                                    Name:{item.key} {item.name!="" ? "("+item.name+")" : ""}
                                </Text>
                                <Text style={css.textDescription}>
                                    <CircleColorText color={item.color} />
                                </Text>
                            </View>
                            <Text style={css.textDescription}>Weight: {currencyFormat(parseInt(item.amount))}</Text>
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
                    <Text numberOfLines={2} style={css.PageName}>Receiving Report</Text>
                </View>
            </View>

            <View style={{alignItems: 'center',justifyContent: 'center', width:Dimensions.get("screen").width}}>
                <View style={{flexDirection: "row",margin:10,alignItems: 'center',justifyContent: 'center'}}>
                    <Text style={{fontSize:14,fontWeight:'bold'}}>From </Text>
                    <Text style={{fontSize:14,fontWeight:'bold',color:"darkred"}}>{fromDate} </Text>
                    <Text style={{fontSize:14,fontWeight:'bold'}}>To </Text>
                    <Text style={{fontSize:14,fontWeight:'bold',color:"darkred"}}>{toDate}</Text>
                </View>
            </View>
            {/* <KeyboardAvoidWrapper> */}
            {dataProcess== true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <View>
                    <View style={[css.row]}>
                    <PieChart
                        data={PieData}
                        width={Dimensions.get("window").width}
                        height={160}
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

                    <View style={[css.row,{marginTop:5,marginBottom:5}]}>
                        <Text style={{fontSize:20,fontWeight:'bold',textAlign:"center",fontStyle:"italic"}}>
                            Total Weight: {currencyFormat(totalWeight)}
                        </Text>
                    </View>
                    
                    <View style={{alignItems: 'center',justifyContent: 'center',}}>
                        {/* <View> */}
                        <View style={{height:Dimensions.get("screen").height/100*53}}>
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

export default SearchReport;