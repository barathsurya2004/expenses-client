import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SpendingHeatmap = () => {
  // Hardcoded data for the weekly spending bars.
  // The 'height' value represents the percentage fill of the bar.
  const spendingData = [
    { day: "Mon", height: 90 },
    { day: "Tue", height: 100 },
    { day: "Wed", height: 90 },
    { day: "Thu", height: 80 },
    { day: "Fri", height: 80 },
    { day: "Sat", height: 30 },
    { day: "Sun", height: 30 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Spending Heatmap</Text>
        <Text style={styles.totalAmount}>$2,345</Text>
        <View style={styles.statsRow}>
          <Text style={styles.monthText}>This Month</Text>
          <Text style={styles.percentageText}>+12%</Text>
        </View>
      </View>
      <View style={styles.mapContainer}>
        {spendingData.map((data, index) => (
          <View key={index} style={styles.barContainer}>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: `${data.height}%`,
                    backgroundColor: data.height > 80 ? "#0d78f2" : "#b0c4de",
                  },
                ]}
              />
            </View>
            <Text style={styles.label}>{data.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Adjusted to be a flex container to hold both the header and the chart
    paddingVertical: 24,
  },
  headerSection: {
    // Combines the header elements
    flexDirection: "column",
    gap: 8,
    marginBottom: 20, // Add some space below the header
  },
  title: {
    color: "#111418",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  totalAmount: {
    color: "#111418",
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 36,
  },
  statsRow: {
    flexDirection: "row",
    gap: 4,
  },
  monthText: {
    color: "#60748a",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  percentageText: {
    color: "#07883b",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  mapContainer: {
    // Styles for the heatmap chart area
    flexDirection: "row",
    justifyContent: "space-between", // Ensures even spacing between bars
    minHeight: 200,
    alignItems: "flex-end", // Aligns the bars to the bottom
  },
  barContainer: {
    height: "100%", // Ensures each bar takes full height of the container
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 5,
  },
  bar: {
    width: 30,
    borderRadius: 5,
  },
  label: {
    textAlign: "center",
    color: "#60748a",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
  },
});

export default SpendingHeatmap;
