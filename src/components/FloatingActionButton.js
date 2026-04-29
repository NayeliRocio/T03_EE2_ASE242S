import React from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";

export const FloatingActionButton = ({ onPress, icon = "add" }) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Icon name={icon} size={28} color={COLORS.dark} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + "30",
  },
});
