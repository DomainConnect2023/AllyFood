import * as React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Pressable, Dimensions, FlatList } from "react-native";
import MainContainer from '../components/MainContainer';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import { css } from '../objects/commonCSS';
import RNFetchBlob from 'rn-fetch-blob';
import { pickingListDetail } from '../objects/objects';
import { colorThemeDB } from '../objects/colors';

const DetailPickingListScreen = () => {
    const navigation = useNavigation();

    const [settingDate, setSettingDate] = useState("");

    const [dataProcess, setDataProcess] = useState(false); // check when loading data
    const [customerName, setCustomerName] = useState<string | null>("");
    const [warehouse, setWarehouse] = useState<string | null>("");
    const [status, setStatus] = useState<string | null>("");
    const [fetchedData, setFetchedData] = useState<pickingListDetail[]>([]);

    useEffect(()=> {
        (async()=> {
            // console.log(await AsyncStorage.getItem('goodsID'));
            await fetchDataApi();
        })();
    }, []);

    const fetchDataApi = async() => {
        setDataProcess(true);

        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var goodsID=await AsyncStorage.getItem('goodsID');

        await RNFetchBlob.config({
            trusty: true
        })
        .fetch('GET', "https://"+getIPaddress+"/App/GetPickingListDetail?goodsIssueId="+goodsID,{
            "Content-Type": "application/json",  
        }).then((response) => {
            // console.log(response.json().pickingListTable[0]);
            if(response.json().isSuccess==true){
                setCustomerName(response.json().customerName);
                setWarehouse(response.json().warehouse);
                if(response.json().isDonePicking==true && response.json().isDoneLoadingOnTruck==true){
                    setStatus("Completed");
                }else if(response.json().isDonePicking==true && response.json().isDoneLoadingOnTruck==false){
                    setStatus("Picking");
                }else{
                    setStatus("Pending");
                }

                setFetchedData(response.json().pickingListTable.map((item: { productCode: string; productName: string; toPickCartonQuantity: number; toPickPalletQuantity: number; locationStockBalances: object}) => ({
                    key: item.productCode,
                    productName: item.productName,
                    toPickCartonQuantity: item.toPickCartonQuantity,
                    toPickPalletQuantity: item.toPickPalletQuantity,
                    locationStockBalances: item.locationStockBalances,
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

    const changeStatusAPI = async(type: string) => {
        setDataProcess(true);

        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var goodsID=await AsyncStorage.getItem('goodsID');
        var userID=await AsyncStorage.getItem('userID');

        await RNFetchBlob.config({
            trusty: true
        })
        .fetch('GET', "https://"+getIPaddress+"/App/UpdatePickingLoading?type="+type+"&goodsIssueId="+goodsID+"&userId="+userID,{
            "Content-Type": "application/json",  
        }).then(async (response) => {
            // console.log(response.json().pickingListTable[0]);
            if(response.json().isSuccess==true){
                await fetchDataApi();

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

    const FlatListItem = ({ item }: { item: pickingListDetail }) => {
        return (
            <View style={[css.listItem,{padding:5}]} key={parseInt(item.key)}>
                <View style={[css.cardBody]}>
                    <View style={{alignItems:'flex-start',justifyContent:'center',}}>
                        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', borderWidth: 1, margin:5 }}>
                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                        <Text>Product Name</Text>
                                    </View>
                                    <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                        <Text>: {item.productName}</Text>
                                    </View>
                                </View>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                        <Text>Pick Carton Quantity</Text>
                                    </View>
                                    <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                        <Text>: {item.toPickCartonQuantity.toString()}</Text>
                                    </View>
                                </View>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                        <Text>Pick Pallet Quantity</Text>
                                    </View>
                                    <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                        <Text>: {item.toPickPalletQuantity.toString()}</Text>
                                    </View>
                                </View>
                                {item.locationStockBalances.map((detail, detailIndex) => (
                                    <View key={detailIndex} style={{padding:5,margin:5,borderWidth:1}}>
                                        <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                            <Text>Location Description: {detail.locationDescription.toString()}</Text>
                                        </View>
                                        <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                            <Text>Carton Balance: {detail.cartonBalance.toString()}</Text>
                                        </View>
                                        <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                            <Text>Pallet Balance: {detail.palletBalance.toString()}</Text>
                                        </View>
                                    </View>
                                ))}
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
                    <Text numberOfLines={2} style={css.PageName}>Picking Detail: </Text>
                </View>
            </View>

            {dataProcess== true ? (
            <View style={[css.container]}>
                <ActivityIndicator size="large" />
            </View>
            ) : (
                <View style={[{height:Dimensions.get("screen").height/100*82,justifyContent: 'center',alignItems: 'center', marginTop:-20}]}>
                    <View style={css.detailContainer}>
                        <View style={css.row}>
                            <Text style={css.Title}>Customer Name:</Text>
                            <TouchableOpacity style={[css.subTitle]} onPress={async () => {
                                // console.log(customerCode);
                            }}>
                                <Text style={css.subTitle}>{customerName}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Warehouse:</Text>
                            <Text style={css.subTitle}>{warehouse}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Status:</Text>
                            {(status=="Completed") 
                            ? (<Text style={[css.subTitle,{color:"green"}]}>{status}</Text>) 
                            : (status=="Picking") 
                                ? (<Text style={[css.subTitle,{color:"#DAA520"}]}>{status}</Text>)
                                : (<Text style={[css.subTitle,{color:"red"}]}>{status}</Text>)
                            }
                        </View>
                    </View>
                    <FlatList
                        data={fetchedData}
                        renderItem={FlatListItem}
                        keyExtractor={(item) => item.key}
                        style={{padding: 0}}
                    />
                    <View style={[css.row,]}>
                        {status=="Pending" 
                        ? (<Pressable
                            style={[css.button,{backgroundColor:"yellow",width:"50%",}]} 
                            onPress={async () => {
                                changeStatusAPI("picking");
                                // Snackbar.show({
                                //     text: "Go to Picking API",
                                //     duration: Snackbar.LENGTH_SHORT,
                                // });
                            }}
                        >
                            <Text style={[css.buttonText,{color:"black"}]}>Picking</Text>
                        </Pressable> )
                        : (
                            status=="Picking" 
                                ?  (<Pressable
                                    style={[css.button,{backgroundColor:colorThemeDB.colors.primaryContainer,width:"50%",}]} 
                                    onPress={async () => {
                                        changeStatusAPI("loading");
                                        // Snackbar.show({
                                        //     text: "Go to Completed API",
                                        //     duration: Snackbar.LENGTH_SHORT,
                                        // });
                                    }}
                                >
                                    <Text style={[css.buttonText,{color:"white"}]}>Completed</Text>
                                </Pressable> )
                                : (<></>)
                        )}
                    </View>
                </View>
            )}

            {/* </KeyboardAvoidWrapper> */}
            
        </MainContainer>
    );
}

export default DetailPickingListScreen;