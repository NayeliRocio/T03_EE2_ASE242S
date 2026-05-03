import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';

export const CardItem = ({
  title,
  subtitle,
  data,
  status,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  deleteIcon = 'delete',
  opacity = 1,
}) => {
  return (
    <View style={[styles.container, { opacity }]}>
      <View
        style={[
          styles.leftBorder,
          { backgroundColor: status ? '#10b981' : '#ef4444' }
        ]}
      />
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.75}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {data && (
          <View style={styles.dataContainer}>
            {Array.isArray(data)
              ? data.map((item, index) => (
                  item && (
                    <View key={index} style={styles.dataRow}>
                      <Icon
                        name="circle"
                        size={8}
                        color={COLORS.primary + '70'}
                        style={{ marginRight: 10, marginTop: 2 }}
                      />
                      <Text style={styles.dataText} numberOfLines={1}>
                        {item}
                      </Text>
                    </View>
                  )
                ))
              : <Text style={styles.dataText}>{data}</Text>}
          </View>
        )}
      </TouchableOpacity>

      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Icon name="edit" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[
                deleteIcon === 'restore' ? styles.restoreButton : styles.deleteButton
              ]}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Icon
                name={deleteIcon}
                size={18}
                color={deleteIcon === 'restore' ? COLORS.success : COLORS.error}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    marginHorizontal: 14,
    marginVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 11,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  leftBorder: {
    width: 5,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  dataContainer: {
    marginTop: 10,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  dataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '400',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight + '22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '38',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.error + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.error + '38',
  },
  restoreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.success + '38',
  },
});
