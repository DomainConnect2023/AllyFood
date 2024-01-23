
    // const fetchDetailApi = async(goodsID: any) => {
    //     setFetchedData((prevData) =>
    //         prevData.map((item) =>
    //         item.key === goodsID ? { ...item, datasets: [] } : item
    //         )
    //     );

    //     var getIPaddress=await AsyncStorage.getItem('IPaddress');

    //     await RNFetchBlob.config({
    //         trusty: true,
    //     }).fetch('GET', "https://"+getIPaddress+"/App/GetPickingListDetail?goodsIssueId="+goodsID,{
    //         "Content-Type": "application/json",
    //     }).then(async (response) => {
    //         // console.log(response.json());
    //         if(await response.json().isSuccess==true){

    //             setFetchedData((prevData) =>
    //                 prevData.map((item) =>
    //                     item.key === goodsID ? { ...item, datasets: [...item.datasets, ...response.json().pickingListTable] } : item
    //                 )
    //             );
    //         }else{
    //             // console.log(response.json().message);
    //             Snackbar.show({
    //                 text: response.json().message,
    //                 duration: Snackbar.LENGTH_SHORT,
    //             });
    //         }
    //     }).catch(error => {
    //         console.error(error.message);
    //     });
    // }


// if (expandedItems.includes(item.key as never)) {
                //     //reset
                    
                // } else {
                //     await fetchDetailApi(item.key);
                // }
                // toggleItem(item.key);

{/* {expandedItems.includes(item.key as never) && (
                            <View>
                                {item.datasets.map((balance, balanceIndex) => (
                                    <View key={balanceIndex}>
                                        <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row', borderWidth: 1, margin:5 }}>
                                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>Product Name</Text>
                                                    </View>
                                                    <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>: {balance.productName}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>Pick Carton Quantity</Text>
                                                    </View>
                                                    <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>: {balance.toPickCartonQuantity.toString()}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>Pick Pallet Quantity</Text>
                                                    </View>
                                                    <View style={{ width: "50%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>: {balance.toPickPalletQuantity.toString()}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ alignSelf: 'stretch', flexDirection: 'row'}}>
                                                    <View style={{ width: "35%", alignSelf: 'stretch', margin:5}}>
                                                        <Text>Location Stock Balances</Text>
                                                    </View>
                                                    {balance.locationStockBalances.map((detail, detailIndex) => (
                                                        <View key={detailIndex}>
                                                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                                                <Text>: {detail.locationDescription.toString()}</Text>
                                                            </View>
                                                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                                                <Text>: {detail.cartonBalance.toString()}</Text>
                                                            </View>
                                                            <View style={{ alignSelf: 'stretch', flexDirection: 'column' }}>
                                                                <Text>: {detail.palletBalance.toString()}</Text>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                {(item.isDonePicking==true && item.isDoneLoadingOnTruck==false) 
                                ? (<View>
                                    <Pressable style={[css.button,{backgroundColor:"green"}]} onPress={()=>{}}>
                                        <Text style={[css.text,{color:"white"}]}>Done Loading</Text>
                                    </Pressable> 
                                </View>) 
                                : (item.isDonePicking==false && item.isDoneLoadingOnTruck==false) 
                                    ? (<View>
                                        <Pressable style={[css.button,{backgroundColor:"yellow"}]} onPress={()=>{}}>
                                            <Text style={[css.text,{color:"black"}]}>Done Picking</Text>
                                        </Pressable>
                                    </View>)
                                    : ("")
                                }
                            </View>
                        )} */}

                        // const toggleItem = (itemId: any) => {
    //     if (expandedItems.includes(itemId as never)) {
    //       setExpandedItems(expandedItems.filter((id) => id !== itemId));
    //     } else {
    //       setExpandedItems([...expandedItems, itemId as never]);
    //     }
    // };
