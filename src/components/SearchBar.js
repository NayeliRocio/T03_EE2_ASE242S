import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../constants/colors";

export const SearchBar = ({
  placeholder,
  value,
  onChangeText,
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={COLORS.textTertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder || "Buscar..."}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              onClear && onClear();
            }}
            style={styles.clearButton}
          >
            <Icon name="close" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border + "40",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});
