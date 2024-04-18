import { Dimensions, StyleSheet } from "react-native";
import { colorThemeDB } from "./colors";

export const css = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        padding: 20,
    },
    mainView:{
        width: '100%',
        height: Dimensions.get("screen").height/100*8, 
        flexDirection: 'row',
        alignItems: 'center', 
        backgroundColor: colorThemeDB.colors.primary,
    },
    HeaderView :{
        flex: 1, 
        padding: 10,
        gap: 4, 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        marginHorizontal: 4,
    },
    PageName: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    listThing: {
        width: 30,
        height: 40, 
        backgroundColor: colorThemeDB.colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20,
        margin: 10,
    },
    listItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6E8EA',
        padding: 10,
        borderRadius: 10,
        marginVertical: 2,
        marginHorizontal: 5,
    },
    cardBody: {
        flexGrow: 1,
        paddingHorizontal: 12,
        width: "95%",
    },
    textHeader: { 
        fontStyle: "italic",
        flex: 1,
        fontSize: 16,
        color: '#000000',
        fontWeight: 'bold',
        marginBottom: 4,
        width: "60%",
    },
    text2ndHeader: { 
        fontStyle: "italic",
        flex: 1,
        fontSize: 12,
        color: '#000000',
        marginBottom: 4,
        width: "60%",
    },
    textDescription: {
        fontStyle: "italic",
        fontSize: 12,
        marginBottom: 6,
        width: "30%",
        textAlign: "center",
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 50, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
    },
    button: {
        width: "85%",
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'black',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    typeButton: {
        margin:5,
        width:"50%",
        height:30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        elevation: 3,
    },
    Title: {
        width: "30%",
        color:"#404040",
        padding:10,
        fontSize:14,
    },
    subTitle: {
        width: "60%",
        color:"#404040",
        padding:10,
        fontWeight:"bold",
        fontSize: 14,
    },
    animatedview: {
        width: Dimensions.get("window").width,
        backgroundcolor: "#0a5386",
        elevation: 2,
        position: "absolute",
        bottom: 0,
        padding: 10,
        justifycontent: "center",
        alignitems: "center",
        flexdirection: "row",
    },
    exittitletext: {
        textalign: "center",
        color: "#ffffff",
        marginright: 10,
    },
    exittext: {
        color: "#e5933a",
        paddinghorizontal: 10,
        paddingvertical: 3
    },
    row: {
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressableCSS: {
        width: '40%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 10,
    },
    basicTextHeader: {
        fontStyle: "italic",
        fontSize: 14,
        color: '#000000',
        fontWeight: 'bold',
    },
    basicTextDiscription: {
        fontStyle: "italic",
        fontSize: 12,
    },
    firstContainer: {
        height: '8%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondContainer: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContainer: {
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export const datepickerCSS = StyleSheet.create({
    cancelButton: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: "#075985"
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#FFF",
    },
    datePicker: {
        height: 120,
        marginTop: -10,
    },
    textInput: {
        color: "#000", 
        textAlign: "center", 
        fontSize:14, 
        fontWeight:"bold", 
        height:25,
        padding:0,
    }
});


export const dropdownCSS = StyleSheet.create({
    dropdown: {
        width: "100%",
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 12,
        color:"red",
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    selectedStyle: {
        borderRadius: 16,
    },
});
