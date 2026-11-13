import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoldenWingTheme } from '../../constants/theme';
import { CabinClass } from '../../types';
import { GoldenButton } from '../common/GoldenButton';

interface PassengerSelectorModalProps {
  visible: boolean;
  cabinClass: CabinClass;
  adultsCount: number;
  childrenCount: number;
  onApply: (params: {
    cabinClass: CabinClass;
    adultsCount: number;
    childrenCount: number;
    totalCount: number;
  }) => void;
  onClose: () => void;
}

export const PassengerSelectorModal: React.FC<PassengerSelectorModalProps> = ({
  visible,
  cabinClass: initialClass,
  adultsCount: initialAdults,
  childrenCount: initialChildren,
  onApply,
  onClose,
}) => {
  const [selectedClass, setSelectedClass] = useState<CabinClass>(initialClass || 'first');
  const [adults, setAdults] = useState<number>(initialAdults || 1);
  const [children, setChildren] = useState<number>(initialChildren || 0);

  const totalCount = adults + children;

  const handleConfirm = () => {
    onApply({
      cabinClass: selectedClass,
      adultsCount: adults,
      childrenCount: children,
      totalCount,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Guests & Cabin Suite</Text>
              <Text style={styles.subtitle}>CHOOSE CLASS & PASSENGERS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Cabin Class Selection */}
          <Text style={styles.sectionHeader}>CABIN CLASS</Text>
          <View style={styles.classesRow}>
            {[
              { id: 'first', label: 'First Class', subtitle: 'Private Suite & Caviar' },
              { id: 'business', label: 'Business', subtitle: 'Lie-flat Bed & Lounge' },
              { id: 'economy', label: 'Economy Privé', subtitle: 'Premium Recline' },
            ].map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedClass(c.id as CabinClass)}
                style={[
                  styles.classCard,
                  selectedClass === c.id && styles.classCardActive,
                ]}
              >
                <View style={styles.classCheckRow}>
                  <Text
                    style={[
                      styles.classTitle,
                      selectedClass === c.id && styles.classTitleActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                  {selectedClass === c.id ? (
                    <Ionicons name="checkmark-circle" size={16} color={GoldenWingTheme.colors.primaryGold} />
                  ) : null}
                </View>
                <Text style={styles.classSubtitle}>{c.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Passenger Counters */}
          <Text style={styles.sectionHeader}>NUMBER OF TRAVELERS</Text>

          {/* Adults */}
          <View style={styles.counterRow}>
            <View>
              <Text style={styles.counterTitle}>Adults</Text>
              <Text style={styles.counterSubtitle}>Age 12 and above</Text>
            </View>

            <View style={styles.counterControl}>
              <TouchableOpacity
                disabled={adults <= 1}
                onPress={() => setAdults(Math.max(1, adults - 1))}
                style={[styles.counterBtn, adults <= 1 && styles.counterBtnDisabled]}
              >
                <Ionicons name="remove" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.counterNum}>{adults}</Text>

              <TouchableOpacity
                disabled={totalCount >= 6}
                onPress={() => setAdults(adults + 1)}
                style={[styles.counterBtn, totalCount >= 6 && styles.counterBtnDisabled]}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Children */}
          <View style={styles.counterRow}>
            <View>
              <Text style={styles.counterTitle}>Children</Text>
              <Text style={styles.counterSubtitle}>Age 2 – 11 years</Text>
            </View>

            <View style={styles.counterControl}>
              <TouchableOpacity
                disabled={children <= 0}
                onPress={() => setChildren(Math.max(0, children - 1))}
                style={[styles.counterBtn, children <= 0 && styles.counterBtnDisabled]}
              >
                <Ionicons name="remove" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.counterNum}>{children}</Text>

              <TouchableOpacity
                disabled={totalCount >= 6}
                onPress={() => setChildren(children + 1)}
                style={[styles.counterBtn, totalCount >= 6 && styles.counterBtnDisabled]}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Apply Button */}
          <GoldenButton
            title={`Apply Selection (${totalCount} ${totalCount === 1 ? 'Guest' : 'Guests'})`}
            onPress={handleConfirm}
            size="lg"
            style={{ marginTop: 24 }}
          />
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
  sectionHeader: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 10,
  },
  classesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  classCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  classCardActive: {
    borderColor: GoldenWingTheme.colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  classCheckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  classTitleActive: {
    color: GoldenWingTheme.colors.primaryGold,
  },
  classSubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  counterTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  counterSubtitle: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.3,
  },
  counterNum: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: GoldenWingTheme.colors.border,
    marginVertical: 4,
  },
});

