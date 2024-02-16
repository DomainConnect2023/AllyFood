import * as React from 'react';
import { View, Text, ActivityIndicator, Dimensions, FlatList } from "react-native";
import MainContainer from '../components/MainContainer';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import { css } from '../objects/commonCSS';
import RNFetchBlob from 'rn-fetch-blob';
import { previousBillingData, setNumberFormat2, BarData2 } from '../objects/objects';
import { LineChart } from 'react-native-gifted-charts';
import { colorThemeDB } from '../objects/colors';
import { parse, format } from 'date-fns';

const DetailPreviousBillingScreen = () => {
    const navigation = useNavigation();

    const [theDate, setTheDate] = useState<string | "">("");

    // data information
    const [customerName, setCustomerName] = useState<string | null>("");
    const [fetchedData, setFetchedData] = useState<previousBillingData[]>([]);
    const [BarData2, setBarData2] = useState<BarData2[]>([]);

    const [maxChartValue, setMaxChartValue] = useState<number>(100);

    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    useEffect(()=> {
        (async()=> {
            await fetchDataApi();
        })();
    }, [])

    const fetchDataApi = async() => {
        setDataProcess(true);
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var customerID=await AsyncStorage.getItem('customerID');
        var setYearMonth=await AsyncStorage.getItem('setYearMonth');
        
        setTheDate(setYearMonth ?? "");

        await RNFetchBlob.config({
            trusty: true
        })
        .fetch('GET', "https://"+getIPaddress+"/App/GetPreviousBillingDetail?todayDate="+setYearMonth+"&customerId="+customerID,{
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

                setBarData2(response.json().previousBillingDetail.map((item: { amount: any; month: any; date: any; }) => ({
                    label: item.month,
                    value: item.amount,
                    date: item.date,
                })));
                
                const AmountArray=(response.json().previousBillingDetail.map((item: { amount: any; }) => item.amount));
                const MaxAmount = Math.max.apply(Math, AmountArray);
                const MaxAmount_Rounded = Math.ceil(MaxAmount/5000) * 5000;

                if(MaxAmount_Rounded==0){
                    setMaxChartValue(10);
                }else{
                    setMaxChartValue(MaxAmount_Rounded);
                }

            }else{
                console.log(response.json().message);
                Snackbar.show({
                    text: response.json().message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        }).catch(error => {
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
                    <View style={[{height:Dimensions.get("screen").height/100*82,justifyContent: 'flex-start',alignItems: 'center'}]}>
                        <View style={[css.firstContainer,{marginTop:15}]}>
                            <View style={css.row}>
                                <Text style={css.Title}>Date:</Text>
                                <Text style={css.subTitle}>{theDate}</Text>
                            </View>  
                            <View style={css.row}>
                                <Text style={css.Title}>Customer Name:</Text>
                                <Text style={css.subTitle}>{customerName}</Text>
                            </View>
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
                                    setTheDate(getYear+"-"+monthNumber);
                                    await AsyncStorage.setItem('setYearMonth', getYear+"-"+monthNumber);
                                    fetchDataApi();
                                }}
                            />
                        </View>
                    
                        <FlatList
                            data={fetchedData}
                            renderItem={FlatListItem}
                            keyExtractor={(item) => item.key}
                            style={{marginTop:-10}}
                        />
                    </View>
                )}
            
            {/* </KeyboardAvoidWrapper> */}
        </MainContainer>
    );
}

export default DetailPreviousBillingScreen;