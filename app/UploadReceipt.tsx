import { useAuth } from "@/hooks/AuthContext";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Image, Platform, Text, View } from "react-native";

export default function UploadReceipt() {
  const [image, setImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const router = useRouter();
  const auth = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImage(asset.uri);
      setAspect({ width: asset.width ?? 1, height: asset.height ?? 1 });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take a photo."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImage(asset.uri);
      setAspect({ width: asset.width ?? 1, height: asset.height ?? 1 });
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    try {
      const fileName = image.split("/").pop() || "photo.jpg";
      const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
      const formData = new FormData();
      if (Platform.OS === "web") {
        const res = await fetch(image);
        const blob = await res.blob();
        formData.append("file", blob, fileName);
      } else {
        formData.append("file", {
          uri: image,
          name: fileName,
          type: fileType,
        } as any);
      }
      formData.append("testing", "test");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: await auth.getToken(), // Assuming you have a method to get the token
      };
      const response = await axios.post(
        "http://localhost:8080/create-expense",
        formData,
        {
          headers,
        }
      );
      console.log("Upload response:", response.data);
      Alert.alert("Upload", `Success: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      Alert.alert("Upload Error", err.message || String(err));
    }
  };

  let previewWidth = 200;
  let previewHeight = 200;
  if (aspect) {
    const ratio = aspect.width / aspect.height;
    if (ratio > 1) {
      previewWidth = 200;
      previewHeight = 200 / ratio;
    } else {
      previewHeight = 200;
      previewWidth = 200 * ratio;
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginVertical: 20 }}>Upload Receipt</Text>
      <View style={{ marginVertical: 20 }}>
        <Button title="Pick Image from Gallery" onPress={pickImage} />
        <View style={{ height: 10 }} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
      {image && (
        <View style={{ alignItems: "center" }}>
          <Image
            source={{ uri: image }}
            style={{
              width: previewWidth,
              height: previewHeight,
              marginBottom: 10,
            }}
            resizeMode="contain"
          />
          <Button title="Upload Image" onPress={uploadImage} />
        </View>
      )}
    </View>
  );
}
