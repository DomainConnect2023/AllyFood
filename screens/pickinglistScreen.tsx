import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Button, ScrollView, RefreshControl, Linking } from "react-native";
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainContainer from '../components/MainContainer';
import { css } from '../objects/commonCSS';
import RNFetchBlob from 'rn-fetch-blob';
import { WebView } from 'react-native-webview-domain';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const PickingListScreen = () => {
    const [showURL, setShowURL] = useState('');
    const [dataProcess, setDataProcess] = useState(false); // check when loading data

    useEffect(()=> {
        (async()=> {
            await postAPI();
        })();
    }, [])

    const postAPI = async() => {
        setDataProcess(true);
        
        var getIPaddress=await AsyncStorage.getItem('IPaddress');
        var userCode=await AsyncStorage.getItem('userCode');
        var password=await AsyncStorage.getItem('password');
        var loginGradingURL, loadGradingPageURL: any;

        // console.log(getIPaddress+" "+userCode+" "+password);

        if(getIPaddress=="domainconnect.my/domain_app" || getIPaddress=="192.168.1.121:8080"){
            loginGradingURL="https://192.168.1.164:1234/App/LoginWebView";
            loadGradingPageURL="https://192.168.1.164:1234/GoodsIssue/Index";
        }else{
            loginGradingURL="https://"+getIPaddress+"/App/LoginWebView";
            loadGradingPageURL="https://"+getIPaddress+"/GoodsIssue/Index";
        }

        await RNFetchBlob.config({
            trusty: true
            }).fetch('POST', loginGradingURL,{
                "Content-Type": "application/json",
            },
            JSON.stringify({
                "Code": userCode,
                "Password": password,
            }),
        ).then(async (response) => {
            // console.log(response.json());
            if(response.json().isSuccess==true){
                setShowURL(loadGradingPageURL);
            }else{
                console.log(response.json().message);
                Snackbar.show({
                    text: response.json().message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            }
        }).catch(error => {
            console.error(error.message);
            setShowURL("https://senghiap.com/");
        });
        setDataProcess(false);
    }

    const handleDownload = async (event: any) => {
        const { url, contentDisposition, mimeType } = event.nativeEvent;

        console.log(url);
    
        if (url && contentDisposition && mimeType) {
          const fileName = contentDisposition.split('filename=')[1];
          const downloadPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    
          try {
            const result = await RNFS.downloadFile({ fromUrl: url, toFile: downloadPath });
            // if (result.statusCode === 200) {
              // File downloaded successfully
              // You can now use a library like react-native-share to open or share the file
              Share.open({ url: `file://${downloadPath}`, type: mimeType });
            // }
          } catch (error) {
            console.error('Error downloading file:', error);
          }
        }
    };

    const handleShouldStartLoad = (event: any) => {
        const { url } = event;

        console.log(url);
    
        // Check if the URL ends with '.pdf' and open in an external browser
        if (url.endsWith('.pdf')) {
          // Handle PDF download here (e.g., open in an external browser)
          // You can use a library like 'react-native-inappbrowser-reborn' for this purpose.
          // For simplicity, open in the default browser here.
          Linking.openURL(url);
          return false;
        }
    
        // Allow all other requests to load
        return true;
      };

    return (
        <MainContainer>
            {(dataProcess==true || showURL=="") ? (
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
                    <WebView
                        source={{ uri: showURL }}
                        style={{ flex: 1 }}
                        sharedCookiesEnabled = {true}
                        
                        setSupportMultipleWindows={false}
                        onShouldStartLoadWithRequest={handleShouldStartLoad}
                        onDownloadStart={handleDownload}
                        onFileDownload={({ nativeEvent: { downloadUrl } }) => {
                            console.log("run download");
                            if (downloadUrl) {
                                Linking.openURL(downloadUrl)
                            }
                        }}
                    />
                    </ScrollView>
                </View>
            )}
        </MainContainer>
    );
}

export default PickingListScreen;