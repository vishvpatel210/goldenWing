import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoldenWingTheme } from '../../constants/theme';
import { GoldenButton } from '../common/GoldenButton';

interface DatePickerModalProps {
  visible: boolean;
  title: string;
  selectedDate: string; // YYYY-MM-DD
  minDate?: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  selectedDate,
  minDate,
  onSelectDate,
  onClose,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    selectedDate ? new Date(selectedDate) : new Date()
  );
  const [tempSelectedDate, setTempSelectedDate] = useState<string>(
    selectedDate || new Date().toISOString().split('T')[0]
  );

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const isPastDate = (day: number) => {
    const checkDate = new Date(year, month, day);
    checkDate.setHours(23, 59, 59, 999);
    const compareDate = minDate ? new Date(minDate) : new Date();
    compareDate.setHours(0, 0, 0, 0);
    return checkDate < compareDate;
  };

  const formatDateString = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const setQuickDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const formatted = target.toISOString().split('T')[0];
    setTempSelectedDate(formatted);
    setCurrentMonthDate(target);
  };

  const handleConfirm = () => {
    onSelectDate(tempSelectedDate);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>SELECT FLIGHT DATE</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Date Presets */}
          <View style={styles.presetsRow}>
            {[
              { label: 'Today', days: 0 },
              { label: 'Tomorrow', days: 1 },
              { label: 'In 3 Days', days: 3 },
              { label: 'In 1 Week', days: 7 },
            ].map((p, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setQuickDate(p.days)}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calendar Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navArrow}>
              <Ionicons name="chevron-back" size={20} color={GoldenWingTheme.colors.primaryGold} />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {monthNames[month]} {year}
            </Text>

            <TouchableOpacity onPress={nextMonth} style={styles.navArrow}>
              <Ionicons name="chevron-forward" size={20} color={GoldenWingTheme.colors.primaryGold} />
            </TouchableOpacity>
          </View>

          {/* Days of week */}
          <View style={styles.daysOfWeekRow}>
            {daysOfWeek.map((d, index) => (
              <Text key={index} style={styles.dayOfWeekText}>
                {d}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyDayCell} />
            ))}

            {/* Actual days */}
            {Array.from({ length: totalDays }).map((_, index) => {
              const day = index + 1;
              const dateStr = formatDateString(day);
              const isSelected = tempSelectedDate === dateStr;
              const disabled = isPastDate(day);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  disabled={disabled}
                  onPress={() => setTempSelectedDate(dateStr)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    disabled && styles.dayCellDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Preview & Confirm */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.selectedLabel}>SELECTED DATE</Text>
              <Text style={styles.selectedValue}>{tempSelectedDate}</Text>
            </View>

            <GoldenButton
              title="Confirm Date"
              onPress={handleConfirm}
              size="md"
              style={{ minWidth: 160 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  presetChipText: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 12,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.border,
  },
  monthTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  dayOfWeekText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emptyDayCell: {
    width: 40,
    height: 40,
    marginVertical: 3,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  dayCellSelected: {
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    shadowColor: GoldenWingTheme.colors.primaryGold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  dayCellDisabled: {
    opacity: 0.2,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#080808',
    fontWeight: '900',
  },
  dayTextDisabled: {
    color: '#555555',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: GoldenWingTheme.colors.border,
  },
  selectedLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectedValue: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
});

