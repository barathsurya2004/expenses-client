import React from "react";
import { TouchableOpacity } from "react-native";

const ClickButton = ({
  title,
  onPress,
  style,
  children,
}: {
  title: string;
  onPress: () => void;
  style?: object;
  children?: React.ReactNode;
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      {children}
    </TouchableOpacity>
  );
};

export default ClickButton;
