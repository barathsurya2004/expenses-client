import ClickButton from "@/components/Button";
import { Styles } from "@/components/Styles";
import { useAuth } from "@/hooks/AuthContext";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Platform, Text, View } from "react-native";

export default function UploadReceipt() {
  const [image, setImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.user) {
      router.replace("/");
    }
  }, [auth.user]);

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
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 24, marginVertical: 20, textAlign: "center" }}>
        How would you like to add your expenses ?
      </Text>
      <View
        style={{
          width: "100%",
          paddingHorizontal: 20,
        }}
      >
        <ClickButton
          title="Pick an Image"
          onPress={pickImage}
          style={Styles.buttonBlue}
        >
          <Text style={Styles.BlueBText}>Pick an Image</Text>
        </ClickButton>
        <ClickButton
          title="Take a Photo"
          onPress={takePhoto}
          style={Styles.buttonWhite}
        >
          <Text style={Styles.WhiteBText}>Take a Photo</Text>
        </ClickButton>
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
          <ClickButton
            title="Upload"
            style={Styles.buttonBlue}
            onPress={uploadImage}
          >
            <Text style={Styles.BlueBText}>Upload Reciept</Text>
          </ClickButton>
        </View>
      )}
    </View>
  );
}
