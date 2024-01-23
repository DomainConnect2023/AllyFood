import { Text, View } from "react-native";
import { css } from "./commonCSS";

export interface showData {
    key: string;
    name: string;
    amount: string;
    color: string;
}

export interface dataDetail {
    key: string;
    name: string;
    amount: number;
    chargesAmount: number;
    electricityCharges: number;
    parkingCharges: number;
    overtimeCharges: number;
    loadingAmount: number;
    transportFee: number;
}

export interface SelectBarData {
    label: string;
    value: string;
}

export interface pickingListData {
    key: string;
    customerID: string;
    customerName: string;
    refNo: string;
    isDoneLoadingOnTruck: boolean;
    isDonePicking: boolean;
    datasets: {
        productCode: string;
        productName: string;
        toPickCartonQuantity: number;
        toPickPalletQuantity: number;
        locationStockBalances: {
            locationDescription: string;
            cartonBalance: number;
            palletBalance: number;
        }[];
    }[];
}

export interface pickingListDetail {
    key: string;
    productName: string;
    toPickCartonQuantity: number;
    toPickPalletQuantity: number;
    locationStockBalances: {
        locationDescription: string;
        cartonBalance: number;
        palletBalance: number;
    }[];
}

export interface PieData {
    name: string;
    value: number;
    totalAmount: number;
    color: string;
    legendFontSize: number;
}

export interface BarData {
    labels: string[];
    datasets: {
        data: number[];
        withDots?: boolean;
    }[];
} 

export interface BarData2 {
    label: string;
    value: number;
    textFontSize: number;
} 

export const CircleColorText = ( {color}: {color: string} ) => {
    return (
      <View style={[css.circle, { backgroundColor: color }]}>
        <Text style={css.text}></Text>
      </View>
    );
}

export function currencyFormat(num: number) {
    return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}