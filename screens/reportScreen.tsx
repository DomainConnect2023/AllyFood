import * as React from 'react';
import { View, Text, ActivityIndicator, Platform, Pressable, TextInput } from "react-native";
import { useEffect, useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MainContainer from '../components/MainContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAvoidWrapper from '../components/KeyboardAvoidWrapper';
import { css, datepickerCSS, dropdownCSS } from '../objects/commonCSS';
import { customerData, companyData } from '../objects/objects';
import DateTimePicker from '@react-native-community/datetimepicker';

import 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Dropdown, MultiSelect } from 'react-native-searchable-dropdown-kj';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNFetchBlob from 'react-native-blob-util';
import ViewPDFScreen from './generateReportScreen';
import i18n from '../language/i18n';

const ReportScreen = ({ route }: { route: any }) => {

    const navigation = useNavigation();

    const [fetchedCompany, setFetchedCompany] = useState<companyData[]>([]);
    const [fetchedCustomer, setFetchedCustomer] = useState<customerData[]>([]);
    const [reportType, setReportType] = useState("Summary");
    const [dataProcess, setDataProcess] = useState(false);

    const [companyID, setCompanyID] = useState("1");
    const [isCompanyFocus, setIsCompanyFocus] = useState(false);

    const [customerArr, setCustomerArr] = useState(["all"]);
    const [isCustomerFocus, setIsCustomerFocus] = useState(false);

    const [date, setDate] = useState(new Date());
    const [showFDPicker, setShowFDPicker] = useState(false);
    const [showTDPicker, setShowTDPicker] = useState(false);
    
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        (async () => {
            fetchDataApi();
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchDataApi();
        }, [])
    );

    // IOS Date picker modal setup
    const [FromdatePickerVisible, setFromDatePickerVisible] = useState(false);
    const [TodatePickerVisible, setToDatePickerVisible] = useState(false);
    const hideIOSDatePicker = () => {
        setFromDatePickerVisible(false);
        setToDatePickerVisible(false);
    };
    // END IOS Date Picker modal setup

    // Date function 
    const onChangeFromDate = async ({ type }: any, selectedDate: any) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setDate(currentDate);
            if (Platform.OS === "android") {
                tonggleFromDatePicker();
                setFromDate(currentDate.toISOString().split('T')[0]);
                // setFromDate(currentDate.toDateString());
            }
        } else {
            tonggleFromDatePicker();
        }
    }

    const onChangeToDate = async ({ type }: any, selectedDate: any) => {
        if (type == "set") {
            const currentDate = selectedDate;
            setDate(currentDate);
            if (Platform.OS === "android") {
                tonggleToDatePicker();
                setToDate(currentDate.toISOString().split('T')[0]);
                // setToDate(currentDate.toDateString());
            }
        } else {
            tonggleToDatePicker();
        }
    }

    const confirmIOSFromDate = async (date: any) => {
        setFromDate(date.toISOString().split('T')[0]);
        hideIOSDatePicker();
    }

    const confirmIOSToDate = async(date: any) => {
        setToDate(date.toISOString().split('T')[0]);
        hideIOSDatePicker();
    }

    const tonggleFromDatePicker = () => {
        if (Platform.OS === 'android') {
            setShowFDPicker(!showFDPicker);
        }
        else if (Platform.OS === 'ios') {
            setFromDatePickerVisible(true);
        }
    }

    const tonggleToDatePicker = () => {
        if (Platform.OS === 'android') {
            setShowTDPicker(!showTDPicker);
        }
        else if (Platform.OS === 'ios') {
            setToDatePickerVisible(true);
        }
    }
    // ===============================


    const changeReportType = async (reportValue: any) => {
        if(reportValue=="Summary"){
            setReportType("Summary");
            setFromDate("");
            setToDate("");

        }else if(reportValue=="Detail"){
            setReportType("Detail");
        }
    }

    // get data from database
    const fetchDataApi = async () => {
        setDataProcess(true);
        setFetchedCustomer([]);
        var getIPaddress = await AsyncStorage.getItem('IPaddress');

        await RNFetchBlob.config({
            trusty: true
        }).fetch('GET', "https://"+getIPaddress+"/App/GetCompanyCustomerMaster", {
            "Content-Type": "application/json",
        }).then(async (response) => {
            if(response.json().isSuccess==true){
                setFetchedCompany(response.json().companyList.map((item: {
                    id: string;
                    displayName: any;
                }) => ({
                    value: item.id,
                    label: item.displayName, 
                })));

                setFetchedCustomer([{ "label": "All Customer", "value": "all" }]);
                setFetchedCustomer((prevData) => [...prevData, ...response.json().customerList.map((item: { 
                    id: string;
                    displayName: any;
                }) => ({
                    value: item.id,
                    label: item.displayName,
                }))]);
            }else{
                Snackbar.show({
                    text: "Server Error.",
                    duration: Snackbar.LENGTH_SHORT,
                });
            }

        }).catch(error => {
            console.log(error.message);
            Snackbar.show({
                text: error.message,
                duration: Snackbar.LENGTH_SHORT,
            });
        });
        setDataProcess(false);
    };

    return (
        <MainContainer>
            <KeyboardAvoidWrapper>
                {dataProcess == true ? (
                    <View style={[css.container]}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                <View>
                    <View style={[css.row, { paddingTop: 20 }]}>
                        <Text style={css.Title}>{i18n.t("Report-Screen.Report")}</Text>
                        
                            {(reportType == "Summary") ? (
                                <View style={[css.subTitle, css.row]}>
                                    <Pressable
                                        style={[css.typeButton, { backgroundColor: "dimgray" }]}
                                        onPress={async () => {changeReportType("Summary")}}
                                    >
                                        <Text style={css.buttonText}>{i18n.t("Report-Screen.Summary")}</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[css.typeButton, { backgroundColor: "white" }]}
                                        onPress={async () => {changeReportType("Detail")}}
                                    >
                                        <Text style={[css.buttonText, { color: "black" }]}>{i18n.t("Report-Screen.Detail")}</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <View style={[css.subTitle, css.row]}>
                                    <Pressable
                                        style={[css.typeButton, { backgroundColor: "white" }]}
                                        onPress={async () => {changeReportType("Summary")}}
                                    >
                                        <Text style={[css.buttonText, { color: "black" }]}>{i18n.t("Report-Screen.Summary")}</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[css.typeButton, { backgroundColor: "dimgray" }]}
                                        onPress={async () => {changeReportType("Detail")}}
                                    >
                                        <Text style={[css.buttonText, { color: "white" }]}>{i18n.t("Report-Screen.Detail")}</Text>
                                    </Pressable>
                                </View>
                            )}
                    </View>
                    
                    <View style={[css.row, { marginBottom: 10, }]}>
                        <Text style={css.Title}>{i18n.t("Report-Screen.Company")}: </Text>
                        <View style={{ width: "60%" }}>
                        <Dropdown
                            style={dropdownCSS.dropdown}
                            activeColor={"#BFBFBF"}
                            fontFamily={"yes"}
                            placeholderStyle={dropdownCSS.placeholderStyle}
                            iconStyle={dropdownCSS.iconStyle}
                            search
                            data={fetchedCompany}
                            labelField="label"
                            valueField="value"
                            placeholder={i18n.t('Report-Screen.Select-Company')}
                            searchPlaceholder={i18n.t('Report-Screen.Search')}
                            value={companyID}
                            onChange={item => {
                                // console.log(item.value);
                                setCompanyID(item.value);
                            }}
                            renderLeftIcon={() => (
                                <AntDesign
                                    style={{ marginRight: 5, }}
                                    color={isCompanyFocus ? 'blue' : 'black'}
                                    name="Safety"
                                    size={20}
                                />
                            )}
                        />
                        </View>
                    </View>
                    <View style={[css.row, { marginBottom: 10, }]}>
                        <Text style={css.Title}>{i18n.t("Report-Screen.Customer")}: </Text>
                        <View style={{ width: "60%" }}>
                            <MultiSelect
                                style={dropdownCSS.dropdown}
                                activeColor={"#BFBFBF"}
                                placeholderStyle={dropdownCSS.placeholderStyle}
                                selectedTextStyle={dropdownCSS.selectedTextStyle}
                                inputSearchStyle={dropdownCSS.inputSearchStyle}
                                iconStyle={dropdownCSS.iconStyle}
                                search
                                data={fetchedCustomer}
                                labelField="label"
                                valueField="value"
                                placeholder={i18n.t('Report-Screen.Select-Customer')}
                                searchPlaceholder={i18n.t('Report-Screen.Search')}
                                value={customerArr}
                                onChange={item => {
                                    let checkLastArr = item.slice(-1);
                                    let checkFirstArr = item[0];

                                    if (checkLastArr[0] == "all") {
                                        setCustomerArr(["all"]);
                                    } else {
                                        if (checkFirstArr != "all") {
                                            setCustomerArr(item);
                                        } else {
                                            setCustomerArr([checkLastArr[0]]);
                                        }
                                    }
                                }}
                                renderLeftIcon={() => (
                                    <Ionicons
                                        style={{ marginRight: 5, }}
                                        color={isCustomerFocus ? 'blue' : 'black'}
                                        name="person-circle-outline"
                                        size={20}
                                    />
                                )}
                                selectedStyle={dropdownCSS.selectedStyle}
                            />
                        </View>
                    </View>

                    {/* From Date */}
                    {(reportType == "Summary") ? (
                        <></>
                    ) : (
                    <View>
                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Report-Screen.From-Date')}: </Text>
                            {showFDPicker && Platform.OS === "android" && <DateTimePicker
                                mode="date"
                                display="calendar"
                                value={date}
                                onChange={onChangeFromDate}
                                style={datepickerCSS.datePicker}
                            />}

                            <Pressable
                                style={{
                                    width: '60%',
                                    height: 50,
                                    marginBottom: 10,
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 8,
                                    justifyContent:"center",
                                }}
                                onPress={tonggleFromDatePicker}
                            >
                                <TextInput
                                    style={{ color: "#000", fontSize: 18}}
                                    placeholder={i18n.t('Report-Screen.Select') + ' ' + i18n.t('Report-Screen.From-Date')}
                                    value={fromDate}
                                    onChangeText={setFromDate}
                                    placeholderTextColor="#11182744"
                                    editable={false}
                                    onPressIn={tonggleFromDatePicker}
                                />
                            </Pressable>
                        </View>

                        {Platform.OS === "ios" && (<DateTimePickerModal
                            date={date}
                            isVisible={FromdatePickerVisible}
                            mode="date"
                            display='inline'
                            onConfirm={confirmIOSFromDate}
                            onCancel={hideIOSDatePicker}
                            style={{ 
                            width: '60%',
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,}}
                        />)}

                        <View style={css.row}>
                            <Text style={css.Title}>{i18n.t('Report-Screen.To-Date')}: </Text>
                            {showTDPicker && Platform.OS === "android" && <DateTimePicker
                                mode="date"
                                display="calendar"
                                value={date}
                                onChange={onChangeToDate}
                                style={datepickerCSS.datePicker}
                            />}

                            <Pressable
                                style={{
                                    width: '60%',
                                    height:50,
                                    marginBottom: 10,
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 8,
                                    justifyContent:"center",
                                    

                                }}
                                onPress={tonggleToDatePicker}
                            >
                                <TextInput
                                    style={{ color: "#000", fontSize: 18}}
                                    placeholder={i18n.t('Report-Screen.Select') + ' ' + i18n.t('Report-Screen.To-Date')}
                                    value={toDate}
                                    onChangeText={setFromDate}
                                    placeholderTextColor="#11182744"
                                    editable={false}
                                    onPressIn={tonggleToDatePicker}
                                    
                                />
                            </Pressable>
                        </View>

                        {Platform.OS === "ios" && (<DateTimePickerModal
                            date={date}
                            isVisible={TodatePickerVisible}
                            mode="date"
                            display='inline'
                            onConfirm={confirmIOSToDate}
                            onCancel={hideIOSDatePicker}
                            style={{ 
                                width: '60%',
                                marginBottom: 10,
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,}}
                        />)}
                    </View>
                    )}
                    {Platform.OS === "ios" && (<DateTimePickerModal
                        date={date}
                        isVisible={FromdatePickerVisible}
                        mode="date"
                        display='inline'
                        onConfirm={confirmIOSFromDate}
                        onCancel={hideIOSDatePicker}
                        
                    />)}
                    
                    <View style={[css.row, { paddingTop: 20 }]}>
                        <Pressable style={css.button} onPress={async () => {
                            if(fromDate<=toDate){
                                await AsyncStorage.setItem('reportType', reportType);
                                await AsyncStorage.setItem('companyID', companyID);
                                await AsyncStorage.setItem('fromDate', fromDate);
                                await AsyncStorage.setItem('toDate', toDate);

                                (customerArr[0] != undefined) ? (
                                    await AsyncStorage.setItem('customerArr', JSON.stringify(customerArr)),
                                    navigation.navigate(ViewPDFScreen as never)

                                ) : (
                                    await AsyncStorage.setItem('customerArr', "all"),
                                    navigation.navigate(ViewPDFScreen as never)
                                )
                            }else{
                                Snackbar.show({
                                    text: 'Your Date range is illogical!',
                                    duration: Snackbar.LENGTH_SHORT,
                                });
                            }
                        }}>
                            <Text style={css.buttonText}>{i18n.t('Report-Screen.Generate')}</Text>
                        </Pressable>
                    </View>
                </View>
                )}
            </KeyboardAvoidWrapper>
        </MainContainer>
    );
}
export default ReportScreen;
