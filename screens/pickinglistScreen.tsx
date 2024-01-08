import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Button, ScrollView, RefreshControl, Linking, Text } from "react-native";
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainContainer from '../components/MainContainer';
import { css } from '../objects/commonCSS';
import RNFetchBlob from 'rn-fetch-blob';
import { WebView } from 'react-native-webview-domain';


const PickingListScreen = () => {
    const [dataProcess, setDataProcess] = useState(false);

    useEffect(()=> {
        (async()=> {
            await postAPI();
        })();
    }, []);

    const postAPI = async() => {
        setDataProcess(true);
        
        var getIPaddress=await AsyncStorage.getItem('IPaddress');

        // await RNFetchBlob.config({
        //     trusty: true,
        //     }).fetch('GET', "https://"+getIPaddress+"/App/filename",{
        //         "Content-Type": "application/json",
        //     },
        //     JSON.stringify({
        //         "Code": "aaa",
        //     }),
        // ).then(async (response) => {
        //     if(await response.json().isSuccess==true){
                
        //     }else{
        //         // console.log(response.json().message);
        //         Snackbar.show({
        //             text: response.json().message,
        //             duration: Snackbar.LENGTH_SHORT,
        //         });
        //     }
        // }).catch(error => {
        //     // console.error(error.message);
        // });
        setDataProcess(false);
    }

    return (
        <MainContainer>
            {(dataProcess==true) ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={{flexGrow:1}}
                        refreshControl={
                            <RefreshControl
                                refreshing={dataProcess}
                                onRefresh={postAPI}
                            />}
                    >


                    </ScrollView>
                </View>
            )}
        </MainContainer>
    );
}

export default PickingListScreen;