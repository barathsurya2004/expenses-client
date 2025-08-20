import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SpendingTypes = () => {
  const spendingTypes = [
    { type: "Food", spent: "$500" },
    {
      type: "Transport",
      spent: "$200",
    },
    { type: "Entertainment", spent: "$300" },
    { type: "Utilities", spent: "$150" },
    { type: "Shopping", spent: "$400" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Types</Text>
      <View style={styles.typesContainer}>
        {spendingTypes.map((item, index) => (
          <View key={index} style={styles.typeBox}>
            <View>
              <Text style={styles.typeText}>{item.type}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#888",
                }}
              >
                {index + 1}st
              </Text>
            </View>
            <Text style={styles.typeText}>{item.spent}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SpendingTypes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "black",
  },
  typesContainer: {
    justifyContent: "space-between",
  },
  typeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    marginBottom: 15,
  },
  typeText: {
    fontSize: 18,
    color: "#000000",
  },
});
