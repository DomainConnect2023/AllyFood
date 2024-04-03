import { Text, View } from "react-native";
import { css } from "./commonCSS";

export interface showData {
    key: string;
    name: string;
    amount: number;
    currentMonthTotalAmount: number;
    rentalAmount: number;
    palletBalance: string;
    cartonBalance: string;
    grAmount: number;
    giAmount: number;
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
    isPending: boolean;
    isStartPicking: boolean;
    isDonePicking: boolean;
    isStaging: boolean;
    isDelivered: boolean;
    datasets: {
        productCode: string;
        productName: string;
        toPickCartonQuantity: number;
        toPickPalletQuantity: number;
        isDonePicking: boolean;
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
    isDonePicking: boolean;
    locationStockBalances: {
        locationDescription: string;
        cartonBalance: number;
        palletBalance: number;
    }[];
}

export interface forceCastData {
    key: string;
    yesterdayTotalAmount: number;
    todayRental: number;
    todayGR: number;
    todayGI: number;
    todayTotalAmount: number;
    monthEndTotalAmount: number;
}

export interface previousBillingData {
    key: string;
    date: string;
    amount: number;
}

export interface companyData {
    value: string;
    label: string;
}

export interface customerData {
    value: string;
    label: string;
}

export interface generateReportData {
    reportType: string;
    companyID: string;
    customerArr: any;
    fromDate: string;
    toDate: string;
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
    date: string;
    textFontSize: number;
    color: string;
} 

export interface ApiResponse {
    ipAddress: string;
    isSuccess: string;
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

export function setNumberFormat2(num: number) {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export const monthNumberToName = (monthNumber: any) => {
    // Ensure monthNumber is in the range 1-12
    const normalizedMonthNumber = Math.min(Math.max(parseInt(monthNumber, 10), 1), 12);
  
    // Create a Date object with the year and month set
    const date = new Date(2000, normalizedMonthNumber - 1, 1); // Subtract 1 because months are zero-indexed
  
    // Use toLocaleString to get the month name
    const monthName = date.toLocaleString('default', { month: 'short' });
  
    return monthName;
};