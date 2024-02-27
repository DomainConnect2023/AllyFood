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
import { Checkbox, DataTable, TextInput } from 'react-native-paper';

const DetailPickingListScreen = () => {
    const navigation = useNavigation();

    const [dataProcess, setDataProcess] = useState(false); // check when loading data
    const [customerName, setCustomerName] = useState<string | null>("");
    const [warehouse, setWarehouse] = useState<string | null>("");
    const [status, setStatus] = useState<string | null>("");
    const [fetchedData, setFetchedData] = useState<pickingListDetail[]>([]);
    const [filteredData, setFilteredData] = useState<pickingListDetail[]>([]);

    const [sortAscending, setSortAscending] = React.useState<boolean>(true);
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5, 10]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[0]
    );
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, fetchedData.length);

    const filterByName = (name: string) => {
        if(name === "")
        {
            setFilteredData(fetchedData);
            return;
        }
        const newData = fetchedData.filter((item) => item.productName.toLowerCase().includes(name.toLowerCase()));
        setFilteredData(newData);
    };

    useEffect(() => {
        (async () => {
            // console.log(await AsyncStorage.getItem('goodsID'));
            await fetchDataApi();
        })();
        setPage(0);

    }, [numberOfItemsPerPageList]);

    const fetchDataApi = async () => {
        setDataProcess(true);

        var getIPaddress = await AsyncStorage.getItem('IPaddress');
        var goodsID = await AsyncStorage.getItem('goodsID');

        await RNFetchBlob.config({
            trusty: true
        })
            .fetch('GET', "https://" + getIPaddress + "/App/GetPickingListDetail?goodsIssueId=" + goodsID, {
                "Content-Type": "application/json",
            }).then((response) => {
                if (response.json().isSuccess == true) {
                    setCustomerName(response.json().customerName);
                    setWarehouse(response.json().warehouse);

                    if (response.json().isPending == true && response.json().isStartPicking == false) {
                        setStatus("Pending");
                    } else if (response.json().isStartPicking == true && response.json().isDonePicking == false) {
                        setStatus("Picking");
                    } else if (response.json().isDonePicking == true && response.json().isStaging == false) {
                        setStatus("Picking Done");
                    } else if (response.json().isStaging == true && response.json().isDelivered == false) {
                        setStatus("Staging");
                    } else {
                        setStatus("Delivered");
                    }

                    setFetchedData(response.json().pickingListTable.map((item: { productCode: string; productName: string; toPickCartonQuantity: number; toPickPalletQuantity: number; isDonePicking: boolean; locationStockBalances: object }) => ({
                        key: item.productCode,
                        productName: item.productName,
                        toPickCartonQuantity: item.toPickCartonQuantity,
                        toPickPalletQuantity: item.toPickPalletQuantity,
                        isDonePicking: item.isDonePicking,
                        locationStockBalances: item.locationStockBalances,
                    })));
                    setFilteredData(fetchedData);

                } else {
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

    const changeStatusAPI = async (type: string, productCode: string) => {
        // setDataProcess(true);
        var getIPaddress = await AsyncStorage.getItem('IPaddress');
        var goodsID = await AsyncStorage.getItem('goodsID');
        var userID = await AsyncStorage.getItem('userID');
        let submitType, setURL;

        if (type == "Picking") {
            submitType = "start_picking";
        } else if (type == "Picking Done") {
            submitType = "done_picking";
        } else if (type == "Staging") {
            submitType = "staging";
        } else if (type == "Delivered") {
            submitType = "delivered";
        } else if (type == "Pick Product") {
            submitType = "picked_product";
        } else if (type == "UnPick Product") {
            submitType = "unpicked_product";
        }

        if (type == "Pick Product" || type == "UnPick Product") {
            setURL = "https://" + getIPaddress + "/App/UpdatePickingListStatus?type=" + submitType + "&goodsIssueId=" + goodsID + "&userId=" + userID + "&productCode=" + encodeURIComponent(productCode);
        } else {
            setURL = "https://" + getIPaddress + "/App/UpdatePickingListStatus?type=" + submitType + "&goodsIssueId=" + goodsID + "&userId=" + userID + "&productCode=";
        }

        await RNFetchBlob.config({ trusty: true }).fetch('GET', setURL, {
            "Content-Type": "application/json",
        }).then(async (response) => {
            if (response.json().isSuccess == true) {
                if (type == "Pick Product" || type == "UnPick Product") {
                    handleCheckboxChange(productCode);
                } else {
                    await fetchDataApi();
                }
            } else {
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

    const sortedItems = filteredData
    .slice()
    .sort((item1, item2) =>
      sortAscending
        ? item1.productName.localeCompare(item2.productName)
        : item2.productName.localeCompare(item1.productName)
    );

    return (
        <MainContainer>
            {/* <KeyboardAvoidWrapper> */}
            <View style={css.mainView}>
                <View style={{ flexDirection: 'row', }}>
                    <View style={css.listThing}>
                        <Ionicons
                            name="arrow-back-circle-outline"
                            size={30}
                            color="#FFF"
                            onPress={() => [navigation.goBack()]} />
                    </View>
                </View>
                <View style={css.HeaderView}>
                    <Text numberOfLines={2} style={css.PageName}>Picking Detail: </Text>
                </View>
            </View>

            {dataProcess == true ? (
                <View style={[css.container]}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <View style={[{ height: Dimensions.get("screen").height / 100 * 82, justifyContent: 'flex-start', alignItems: 'center', marginTop: -20 }]}>
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
                            {(status == "Delivered")
                                ? (<Text style={[css.subTitle, { color: "green" }]}>{status}</Text>)
                                : (status == "Staging")
                                    ? (<Text style={[css.subTitle, { color: "#9be52a" }]}>{status}</Text>)
                                    : (status == "Picking Done")
                                        ? (<Text style={[css.subTitle, { color: "#B59410" }]}>{status}</Text>)
                                        : (status == "Picking")
                                            ? (<Text style={[css.subTitle, { color: "orange" }]}>{status}</Text>)
                                            : (<Text style={[css.subTitle, { color: "red" }]}>{status}</Text>)
                            }
                        </View>
                    </View>
                    <TextInput
                        placeholder="Search by name"
                        onChangeText={(text) => filterByName(text)}
                    />
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={{ flex: 1.5 }} >Product</DataTable.Title>
                            <DataTable.Title numberOfLines={2} >Pick Carton</DataTable.Title>
                            <DataTable.Title numberOfLines={2} >Pick Pallet</DataTable.Title>
                            <DataTable.Title numberOfLines={2}>Location</DataTable.Title>
                            <DataTable.Title numberOfLines={2}>Carton balance</DataTable.Title>
                            <DataTable.Title numberOfLines={2}>Pallet balance</DataTable.Title>
                            <DataTable.Title>Done</DataTable.Title>
                        </DataTable.Header>
                        {filteredData.slice(from, to).map(item => {
                            return (
                                <DataTable.Row key={item.key} >
                                    <View style={{ flex: 1.5, justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Text numberOfLines={2}>{item.productName}</Text>
                                    </View>
                                    <DataTable.Cell>{item.toPickCartonQuantity}</DataTable.Cell>
                                    <DataTable.Cell>{item.toPickPalletQuantity}</DataTable.Cell>
                                    <DataTable.Cell>  {item.locationStockBalances.map((detail, detailIndex) => (
                                        <View key={detailIndex}><Text>{detail.locationDescription}</Text></View>
                                    ))}
                                    </DataTable.Cell>
                                    <DataTable.Cell>  {item.locationStockBalances.map((detail, detailIndex) => (
                                        <View key={detailIndex}><Text>{detail.cartonBalance}</Text></View>
                                    ))}
                                    </DataTable.Cell>
                                    <DataTable.Cell>  {item.locationStockBalances.map((detail, detailIndex) => (
                                        <View key={detailIndex}><Text>{detail.palletBalance}</Text></View>
                                    ))}
                                    </DataTable.Cell>
                                    <DataTable.Cell onPress={async () => {
                                        item.isDonePicking == true ? changeStatusAPI("UnPick Product", item.key) : changeStatusAPI("Pick Product", item.key);
                                    }}>
                                        <Checkbox
                                            status={item.isDonePicking == true ? 'checked' : 'unchecked'}
                                        />
                                    </DataTable.Cell>
                                </DataTable.Row>
                            )
                        })}
                        <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(fetchedData.length / itemsPerPage)}
                            onPageChange={(page) => setPage(page)}
                            label={`${from + 1}-${to} of ${fetchedData.length}`}
                            numberOfItemsPerPageList={numberOfItemsPerPageList}
                            numberOfItemsPerPage={itemsPerPage}
                            onItemsPerPageChange={onItemsPerPageChange}
                            showFastPaginationControls
                            selectPageDropdownLabel={'Rows per page'}
                        />

                    </DataTable>

                    <View style={[css.row,]}>
                        {(status == "Pending")
                            ? (<Pressable
                                style={[css.button, { backgroundColor: "orange", width: "50%", }]}
                                onPress={async () => {
                                    changeStatusAPI("Picking", "");
                                }}
                            >
                                <Text style={[css.buttonText, { color: "white" }]}>Picking</Text>
                            </Pressable>)
                            : (status == "Picking")
                                ? (<Pressable
                                    style={[css.button, { backgroundColor: "yellow", width: "50%", }]}
                                    onPress={async () => {
                                        changeStatusAPI("Picking Done", "");
                                    }}
                                >
                                    <Text style={[css.buttonText, { color: "black" }]}>Picking Done</Text>
                                </Pressable>)
                                : (status == "Picking Done")
                                    ? (<Pressable
                                        style={[css.button, { backgroundColor: "#9be52a", width: "50%", }]}
                                        onPress={async () => {
                                            changeStatusAPI("Staging", "");
                                        }}
                                    >
                                        <Text style={[css.buttonText, { color: "white" }]}>Staging</Text>
                                    </Pressable>)
                                    : (status == "Staging")
                                        ? (<Pressable
                                            style={[css.button, { backgroundColor: "green", width: "50%", }]}
                                            onPress={async () => {
                                                changeStatusAPI("Delivered", "");
                                            }}
                                        >
                                            <Text style={[css.buttonText, { color: "white" }]}>Delivered</Text>
                                        </Pressable>)
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