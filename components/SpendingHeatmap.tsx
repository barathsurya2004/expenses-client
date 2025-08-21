import { useDataFetching } from "@/hooks/DataFetching";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const SpendingHeatmap = () => {
  // Hardcoded data for the weekly spending bars.
  // The 'height' value represents the percentage fill of the bar.
  interface SpendingData {
    day: string;
    height: number; // Percentage height of the bar
  }

  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [animatedHeights, setAnimatedHeights] = useState<Animated.Value[]>([]);
  const { getHeatMapData } = useDataFetching();
  const fetchSpendingData = async () => {
    try {
      const data = await getHeatMapData();
      if (!data) {
        console.error("No data received from the server");
        return;
      }

      let totalAmount = 0;
      let maxHeight = 0;
      data.forEach((item: any) => {
        totalAmount += parseFloat(item.amount);
        maxHeight = Math.max(maxHeight, parseFloat(item.amount));
      });
      const formattedData = data.map((item: any) => {
        const height = (parseFloat(item.amount) / maxHeight) * 100; // Calculate height as a percentage
        return {
          day: item.day,
          height: height,
        };
      });
      console.log(formattedData);
      setSpendingData(formattedData);
    } catch (error) {
      console.error("Error fetching spending data:", error);
    }
  };
  useEffect(() => {
    fetchSpendingData();
  }, [getHeatMapData]);

  useEffect(() => {
    // Initialize animated values for each bar
    const initialHeights = spendingData.map(() => new Animated.Value(0));
    setAnimatedHeights(initialHeights);

    // Animate each bar to its respective height
    Animated.stagger(
      100, // Delay between animations
      initialHeights.map((animatedValue, index) =>
        Animated.timing(animatedValue, {
          toValue: spendingData[index]?.height || 0,
          duration: 500,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [spendingData]);

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
                style={{
                  ...styles.bar,
                  height: `${data.height}%`, // Set height as a percentage
                  backgroundColor: data.height > 80 ? "#0d78f2" : "#b0c4de", // Color based on height
                }}
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
    width: "100%",
    aspectRatio: 1, // Maintains a square aspect ratio
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
