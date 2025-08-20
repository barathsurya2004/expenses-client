import { StyleSheet } from "react-native";

export const Styles = StyleSheet.create({
  buttonBlue: {
    width: "100%",
    padding: 10,
    backgroundColor: "#0d78f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    margin: 5,
  },
  buttonWhite: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    margin: 5,
  },
  BlueBText: {
    color: "white",
    fontSize: 16,
  },
  WhiteBText: {
    color: "black",
    fontSize: 16,
  },
  inputBox: {
    width: "100%",
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 7,
  },
  newExpense: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 60, // Set explicit width and height for a perfect circle
    height: 60,
    borderRadius: 30, // Half of width/height for a circle
    backgroundColor: "#0d78f2",
    display: "flex",
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
  },
  newExpenseText: {
    // backgroundColor: "#f3d3f2",
    color: "white",
    fontSize: 40,
    lineHeight: 40,
    textAlign: "center",
    // transform: "translateY(-6.25%)",
  },
});
