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
import { Checkbox } from 'react-native-paper';

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
            if(response.json().isSuccess==true){
                setCustomerName(response.json().customerName);
                setWarehouse(response.json().warehouse);

                if(response.json().isPending==true && response.json().isStartPicking==false){
                    setStatus("Pending");
                }else if(response.json().isStartPicking==true && response.json().isDonePicking==false){
                    setStatus("Picking");
                }else if(response.json().isDonePicking==true && response.json().isStaging==false){
                    setStatus("Picking Done");
                }else if(response.json().isStaging==true && response.json().isDelivered==false){
                    setStatus("Staging");
                }else{
                    setStatus("Delivered");
                }

                setFetchedData(response.json().pickingListTable.map((item: { productCode: string; productName: string; toPickCartonQuantity: number; toPickPalletQuantity: number; isDonePicking: boolean; locationStockBalances: object}) => ({
                    key: item.productCode,
                    productName: item.productName,
                    toPickCartonQuantity: item.toPickCartonQuantity,
                    toPickPalletQuantity: item.toPickPalletQuantity,
                    isDonePicking: item.isDonePicking,
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

    const changeStatusAPI = async(type: string, productCode: string) => {
        // setDataProcess(true);
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var goodsID=await AsyncStorage.getItem('goodsID');
        var userID=await AsyncStorage.getItem('userID');
        let submitType;
        let setURL;

        if(type=="Picking"){
            submitType="start_picking";
        }else if(type=="Picking Done"){
            submitType="done_picking";
        }else if(type=="Staging"){
            submitType="staging";
        }else if(type=="Delivered"){
            submitType="delivered";
        }else if(type=="Pick Product"){
            submitType="picked_product";
        }

        if(type=="Pick Product"){
            setURL="https://"+getIPaddress+"/App/UpdatePickingListStatus?type="+submitType+"&goodsIssueId="+goodsID+"&userId="+userID+"&productCode="+ encodeURIComponent(productCode);
        }else{
            setURL="https://"+getIPaddress+"/App/UpdatePickingListStatus?type="+submitType+"&goodsIssueId="+goodsID+"&userId="+userID+"&productCode=";
        }

        await RNFetchBlob.config({trusty: true}).fetch('GET', setURL,{
            "Content-Type": "application/json",  
        }).then(async (response) => {
            if(response.json().isSuccess==true){
                if(type!="Pick Product"){
                    await fetchDataApi();
                }else{
                    handleCheckboxChange(productCode);
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
        // setDataProcess(false);
    };

    const handleCheckboxChange = (key: string) => {
        setFetchedData((prevData: any) =>
          prevData.map((item: any) =>
            item.key === key ? { ...item, isDonePicking: !item.isDonePicking } : item
          )
        );
    };

    const FlatListItem = ({ item }: { item: pickingListDetail }) => {
        return (
            <TouchableOpacity onPress={async () => {
                // console.log(item.key+": "+item.isDonePicking.toString());
                if(status=="Picking" && item.isDonePicking==false){
                    changeStatusAPI("Pick Product",item.key);
                }
            }}>
            <View style={[css.listItem,{padding:5}]} key={parseInt(item.key)}>
                <View style={[css.cardBody]}>
                    <View style={{alignItems:'flex-start',justifyContent:'center',}}>
                        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', borderWidth: 1, margin:5 }}>
                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                        <Text>Product Name</Text>
                                    </View>
                                    {status=="Picking" ? (
                                        <View style={{alignSelf: 'stretch', flexDirection: 'row',width: "50%"}}>
                                            <View style={{alignSelf: 'stretch', margin:5, width:"90%"}}>
                                                <Text numberOfLines={2}>: {item.productName}</Text>
                                            </View>
                                            <View style={{alignSelf: 'stretch', margin:5, width:"10%"}}>
                                                <Checkbox
                                                    status={item.isDonePicking==true ? 'checked' : 'unchecked'}
                                                    // onPress={() => {
                                                        
                                                    // }}
                                                />
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                            <Text numberOfLines={2}>: {item.productName}</Text>
                                        </View>
                                    )}
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
            </TouchableOpacity>
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
                            {/* <TouchableOpacity style={[css.subTitle]} onPress={async () => {
                                // console.log(customerCode);
                            }}> */}
                                <Text style={css.subTitle} numberOfLines={2}>{customerName}</Text>
                            {/* </TouchableOpacity> */}
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Warehouse:</Text>
                            <Text style={css.subTitle}>{warehouse}</Text>
                        </View>
                        <View style={css.row}>
                            <Text style={css.Title}>Status:</Text>
                            {(status=="Delivered") 
                            ? (<Text style={[css.subTitle,{color:"green"}]}>{status}</Text>) 
                            : (status=="Staging") 
                            ? (<Text style={[css.subTitle,{color:"#9be52a"}]}>{status}</Text>)
                            : (status=="Picking Done") 
                            ? (<Text style={[css.subTitle,{color:"#B59410"}]}>{status}</Text>)
                            : (status=="Picking") 
                            ? (<Text style={[css.subTitle,{color:"orange"}]}>{status}</Text>)
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
                        {(status=="Pending") 
                        ? (<Pressable
                            style={[css.button,{backgroundColor:"orange",width:"50%",}]} 
                            onPress={async () => {
                                changeStatusAPI("Picking","");
                            }}
                        >
                            <Text style={[css.buttonText,{color:"black"}]}>Picking</Text>
                        </Pressable> )
                        : (status=="Picking") 
                        ? (<Pressable
                            style={[css.button,{backgroundColor:"yellow",width:"50%",}]} 
                            onPress={async () => {
                                changeStatusAPI("Picking Done","");
                            }}
                        >
                            <Text style={[css.buttonText,{color:"black"}]}>Picking Done</Text>
                        </Pressable> ) 
                        : (status=="Picking Done") 
                        ? (<Pressable
                            style={[css.button,{backgroundColor:"#9be52a",width:"50%",}]} 
                            onPress={async () => {
                                changeStatusAPI("Staging","");
                            }}
                        >
                            <Text style={[css.buttonText,{color:"black"}]}>Staging</Text>
                        </Pressable> ) 
                        : (status=="Staging") 
                        ? (<Pressable
                            style={[css.button,{backgroundColor:"green",width:"50%",}]} 
                            onPress={async () => {
                                changeStatusAPI("Delivered","");
                            }}
                        >
                            <Text style={[css.buttonText,{color:"black"}]}>Delivered</Text>
                        </Pressable> ) 
                        : (
                           <></>
                        )}
                    </View>
                </View>
            )}

            {/* </KeyboardAvoidWrapper> */}
            
        </MainContainer>
    );
}

export default DetailPickingListScreen;