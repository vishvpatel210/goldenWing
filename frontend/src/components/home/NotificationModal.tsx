import React from 'react';
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
import { LuxuryCard } from '../common/LuxuryCard';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const NOTIFICATIONS = [
    {
      id: '1',
      title: 'First Class Suite Confirmed',
      desc: 'Your private suite 1A on flight GW-101 (Dubai to London) has been prepared.',
      time: '15m ago',
      icon: 'airplane',
      unread: true,
    },
    {
      id: '2',
      title: '25,000 Tier Miles Credited',
      desc: 'Annual Elite Club membership renewal bonus has been added to your vault.',
      time: '2h ago',
      icon: 'sparkles',
      unread: true,
    },
    {
      id: '3',
      title: 'Chauffeur Confirmed',
      desc: 'Mercedes-Maybach limousine driver assigned for Heathrow Terminal 5 arrival.',
      time: '1d ago',
      icon: 'car-sport',
      unread: false,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color={GoldenWingTheme.colors.primaryGold} />
              <Text style={styles.title}>VIP Notifications</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {NOTIFICATIONS.map((n) => (
              <LuxuryCard key={n.id} style={styles.notifCard}>
                <View style={styles.notifRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name={n.icon as any}
                      size={18}
                      color={GoldenWingTheme.colors.primaryGold}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      {n.unread ? <View style={styles.unreadDot} /> : null}
                    </View>
                    <Text style={styles.notifDesc}>{n.desc}</Text>
                    <Text style={styles.notifTime}>{n.time}</Text>
                  </View>
                </View>
              </LuxuryCard>
            ))}
          </ScrollView>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: {
    marginVertical: 6,
    padding: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.borderGold,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
  },
  notifDesc: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  notifTime: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
});

