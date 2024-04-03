import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Dimensions, PermissionsAndroid, Pressable, StyleSheet, Text, View } from 'react-native';
import MainContainer from '../components/MainContainer';
import { css } from '../objects/commonCSS';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Snackbar from 'react-native-snackbar';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import Pdf from 'react-native-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewPDFScreen = ({ route }: { route: any }) => {
    const navigation = useNavigation();
    const [todayDate, setTodayDate] = useState<string | "">(new Date().toISOString().split('T')[0]);
    const [lootData, setLootData] = useState(false);
    const [countItem, setCountItem] = useState<number>(0);
    const [PDFURL, setPDFURL] = useState("");

    useEffect(()=> {
        (async()=> {
            // DownloadPDF();
            LoadPDFData();
        })();
    }, [])

    const LoadPDFData = async() => {
        setLootData(true);
        // var getIPaddress = await AsyncStorage.getItem('IPaddress');
        var getIPaddress = "192.168.1.174:1234";
        var type = "View";
        let passData, runURL;
        var reportType = await AsyncStorage.getItem('reportType');
        var companyID = await AsyncStorage.getItem('companyID');
        var fromDate = await AsyncStorage.getItem('fromDate');
        var toDate = await AsyncStorage.getItem('toDate');

        const customerArr = await AsyncStorage.getItem('customerArr');
        const customerArrtest: string[] = customerArr ? JSON.parse(customerArr) : [];
        const stringWithSlashes: string = customerArrtest.join('/');

        if(reportType=="Summary"){

            if (customerArr !== null) {
                runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/%20/%20/"+stringWithSlashes;
                passData = JSON.parse(customerArr);

                if(passData=="all"){
                    runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/%20/%20/";
                }
            }else{
                runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/%20/%20/";
            }

        }else if(reportType=="Detail"){

            if (customerArr !== null) {
                runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/"+fromDate+"/"+toDate+"/"+stringWithSlashes;
                passData = JSON.parse(customerArr);

                if(passData=="all"){
                    runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/"+fromDate+"/"+toDate+"/";
                }
            }else{
                runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/"+fromDate+"/"+toDate+"/";
            }
        }

        // console.log(runURL);

        try {
            await RNFetchBlob.config({
                trusty: true
            }).fetch('GET', runURL as string).then(async (response) => {
                setPDFURL(response.data);

            }).catch(error => {
                console.log(error.message);
                Snackbar.show({
                    text: error.message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
        setLootData(false);
    }

    const DownloadPDF = async () => {
        try {
            var getIPaddress = "192.168.1.174:1234";
            var type = "Download";
            let passData, runURL;
            var reportType = await AsyncStorage.getItem('reportType');
            var companyID = await AsyncStorage.getItem('companyID');
            var fromDate = await AsyncStorage.getItem('fromDate');
            var toDate = await AsyncStorage.getItem('toDate');

            const customerArr = await AsyncStorage.getItem('customerArr');
            const customerArrtest: string[] = customerArr ? JSON.parse(customerArr) : [];
            const stringWithSlashes: string = customerArrtest.join('/');

            if(reportType=="Summary"){

                if (customerArr !== null) {
                    runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/%20/%20/"+stringWithSlashes;
                    passData = JSON.parse(customerArr);
    
                    if(passData=="all"){
                        runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/%20/%20/";
                    }
                }else{
                    runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/%20/%20/";
                }

            }else if(reportType=="Detail"){

                if (customerArr !== null) {
                    runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/"+fromDate+"/"+toDate+"/"+stringWithSlashes;
                    passData = JSON.parse(customerArr);
    
                    if(passData=="all"){
                        runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/"+fromDate+"/"+toDate+"/";
                    }
                }else{
                    runURL = "http://"+getIPaddress+"/App/GetCustomerStkBalReport/"+type+"/"+reportType+"/"+companyID+"/"+fromDate+"/"+toDate+"/";
                }
            }
            
            await RNFetchBlob.config({
                trusty: true,
                fileCache: true,
                // appendExt: 'pdf',
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: `${RNFetchBlob.fs.dirs.DownloadDir}/CustomerStockBalance-${todayDate}.pdf`,
                },
            }).fetch('GET', runURL as string).then(async (response) => {
                console.log("Completed Download");
                // console.log(response);

            }).catch(error => {
                console.log(error.message);
                Snackbar.show({
                    text: error.message,
                    duration: Snackbar.LENGTH_SHORT,
                });
            });

        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    }

    return (
        <MainContainer>
            <View style={css.mainView}>
                <View style={css.row}>
                    <View style={css.listThing}>
                        <Ionicons
                            name="arrow-back-circle-outline"
                            size={30}
                            color="#FFF"
                            onPress={() => [navigation.goBack()]} />
                    </View>
                </View>
                <View style={css.HeaderView}>
                    <Text numberOfLines={2} style={css.PageName}>Generate PDF</Text>
                </View>
            </View>

            {lootData == true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <View style={styles.container}>
                    <Pressable style={[css.button,{width:"100%",marginVertical: 10, backgroundColor:"#62ACF7"}]} onPress={async () => {DownloadPDF()}}>
                        <Text style={css.buttonText}>Download PDF</Text>
                    </Pressable>
                    <Pdf
                        source={{ uri: `data:application/pdf;base64,${PDFURL}` }}
                        style={styles.pdf}
                    />
                </View>
            )}
        </MainContainer>
        
    );
};

export default ViewPDFScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 0,
    },
    pdf: {
        flex: 1,
    }
});