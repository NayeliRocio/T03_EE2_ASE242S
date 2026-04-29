import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const StatusFilter = ({ activeStatus, onStatusChange }) => {
  const statuses = [
    { key: 'active', label: 'Activos' },
    { key: 'inactive', label: 'Inactivos' },
    { key: 'all', label: 'Todos' },
  ];

  return (
    <View style={styles.container}>
      {statuses.map((status) => (
        <TouchableOpacity
          key={status.key}
          style={[
            styles.button,
            activeStatus === status.key && styles.buttonActive,
          ]}
          onPress={() => onStatusChange(status.key)}
        >
          <Text
            style={[
              styles.buttonText,
              activeStatus === status.key && styles.buttonTextActive,
            ]}
          >
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border || '#ddd',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  buttonTextActive: {
    color: '#fff',
  },
});
