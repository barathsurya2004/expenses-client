import axios from "axios";
import React, { createContext, ReactNode, useContext } from "react";
import { useAuth } from "./AuthContext";

interface SpendingData {
  day: string;
  amount: string;
  currency: string;
}

interface DataFetchingContextType {
  getHeatMapData: () => Promise<SpendingData[] | null>;
}

const DataFetchingContext = createContext<DataFetchingContextType | undefined>(
  undefined
);

export const DataFetchingProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const getHeatMapData = async (): Promise<SpendingData[] | null> => {
    const token = await auth.getToken();
    if (!token) {
      console.error("No token found, cannot fetch heatmap data");
      return null;
    }
    const response = await axios.get("http://localhost:8080/get-heatmap-data", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    console.log("Heatmap data fetched:", response.data);

    const data: SpendingData[] = response.data.map((item: any) => ({
      day: item.day,
      amount: item.amount,
      currency: item.currency,
    }));
    return data;
  };

  return (
    <DataFetchingContext.Provider value={{ getHeatMapData }}>
      {children}
    </DataFetchingContext.Provider>
  );
};

export const useDataFetching = () => {
  const context = useContext(DataFetchingContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
