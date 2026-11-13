import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldenWingTheme } from '../../constants/theme';
import { flightsApi } from '../../api/flights.api';
import { adminApi, CreateFlightInput } from '../../api/admin.api';
import { Flight } from '../../types';
import { Header } from '../../components/common/Header';
import { LuxuryCard } from '../../components/common/LuxuryCard';
import { GoldenButton } from '../../components/common/GoldenButton';
import { GoldenInput } from '../../components/common/GoldenInput';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatFlightDate } from '../../utils/formatters';

export default function AdminFlightsScreen() {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  // Flight Form State
  const [flightNumber, setFlightNumber] = useState('');
  const [airline, setAirline] = useState('GoldenWing Airways');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [arrivalTime, setArrivalTime] = useState('14:45');
  const [duration, setDuration] = useState('6h 15m');
  const [price, setPrice] = useState('1800');
  const [departureDate, setDepartureDate] = useState('2026-11-20');
  const [totalSeats, setTotalSeats] = useState('60');
  const [travelClass, setTravelClass] = useState<'Economy' | 'Business' | 'First Class'>('First Class');

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      const data = await flightsApi.searchFlights({ limit: 50, sortBy: 'departure_asc' });
      setFlights(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load flights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFlights();
  };

  const handleOpenAddModal = () => {
    setEditingFlight(null);
    setFlightNumber(`GW-${Math.floor(100 + Math.random() * 899)}`);
    setSource('');
    setDestination('');
    setDepartureTime('08:30');
    setArrivalTime('14:45');
    setDuration('6h 15m');
    setPrice('1800');
    setDepartureDate(new Date().toISOString().split('T')[0]);
    setTotalSeats('60');
    setTravelClass('First Class');
    setModalVisible(true);
  };

  const handleOpenEditModal = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightNumber(flight.flightNumber);
    setAirline(flight.airline);
    setSource(flight.departureAirport?.code || 'DXB');
    setDestination(flight.arrivalAirport?.code || 'LHR');
    setDepartureTime(flight.departureTime || '08:30');
    setArrivalTime(flight.arrivalTime || '14:45');
    setDuration('7h 30m');
    setPrice(String(flight.classes?.first?.price || 1800));
    setDepartureDate(flight.departureTime ? flight.departureTime.split('T')[0] : '2026-11-20');
    setTotalSeats('60');
    setModalVisible(true);
  };

  const handleSaveFlight = async () => {
    if (!flightNumber.trim() || !source.trim() || !destination.trim() || !price) {
      Alert.alert('Validation Error', 'Please complete flight number, source, destination and price.');
      return;
    }

    try {
      const flightData: CreateFlightInput = {
        flightNumber: flightNumber.trim().toUpperCase(),
        airline: airline.trim() || 'GoldenWing Airways',
        source: source.trim().toUpperCase(),
        destination: destination.trim().toUpperCase(),
        departureTime,
        arrivalTime,
        duration,
        departureDate,
        arrivalDate: departureDate,
        price: Number(price),
        totalSeats: Number(totalSeats) || 60,
        availableSeats: Number(totalSeats) || 60,
        travelClass,
        status: 'Scheduled',
      };

      if (editingFlight) {
        await adminApi.updateFlight(editingFlight._id, flightData);
        Alert.alert('Success', `Flight ${flightNumber} has been updated.`);
      } else {
        await adminApi.createFlight(flightData);
        Alert.alert('Success', `Flight ${flightNumber} added to the GoldenWing schedule.`);
      }

      setModalVisible(false);
      fetchFlights();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Unable to save flight record.');
    }
  };

  const handleDeleteFlight = (flight: Flight) => {
    Alert.alert(
      'Cancel Flight Service',
      `Are you sure you want to completely remove flight ${flight.flightNumber} from the inventory?`,
      [
        { text: 'Keep Flight', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deleteFlight(flight._id);
              Alert.alert('Deleted', `Flight ${flight.flightNumber} was removed.`);
              fetchFlights();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Cannot delete flight.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Fleet Management"
        showBack
        onBackPress={() => router.replace('/admin')}
        rightElement={
          <TouchableOpacity onPress={handleOpenAddModal} style={styles.addBtnHeader}>
            <Ionicons name="add" size={22} color="#080808" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <View style={styles.subBar}>
          <Text style={styles.subBarCount}>{flights.length} Scheduled Flights</Text>
          <TouchableOpacity onPress={handleOpenAddModal} style={styles.quickAddRow}>
            <Ionicons name="add-circle" size={18} color={GoldenWingTheme.colors.primaryGold} />
            <Text style={styles.quickAddText}>Add Flight</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={GoldenWingTheme.colors.primaryGold} />
          </View>
        ) : (
          <FlatList
            data={flights}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <LuxuryCard style={styles.flightCard}>
                <View style={styles.flightTop}>
                  <View style={styles.metaBox}>
                    <Text style={styles.fnText}>{item.flightNumber}</Text>
                    <Text style={styles.airlineText}>{item.airline}</Text>
                  </View>
                  <Badge label={item.status} variant="gold" />
                </View>

                <View style={styles.routeRow}>
                  <View>
                    <Text style={styles.airportCode}>{item.departureAirport?.code || 'ORIGIN'}</Text>
                    <Text style={styles.airportCity}>{item.departureAirport?.city || ''}</Text>
                  </View>
                  <View style={styles.arrowBox}>
                    <Ionicons name="airplane" size={18} color={GoldenWingTheme.colors.primaryGold} />
                    <Text style={styles.timeLabel}>{item.departureTime ? formatFlightDate(item.departureTime) : ''}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.airportCode}>{item.arrivalAirport?.code || 'DEST'}</Text>
                    <Text style={styles.airportCity}>{item.arrivalAirport?.city || ''}</Text>
                  </View>
                </View>

                <View style={styles.flightBottom}>
                  <Text style={styles.priceTag}>
                    From {formatCurrency(item.classes?.first?.price || item.classes?.business?.price || 1500)}
                  </Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleOpenEditModal(item)}
                    >
                      <Ionicons name="create-outline" size={18} color={GoldenWingTheme.colors.lightGold} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconActionBtn, { borderColor: '#EF4444' }]}
                      onPress={() => handleDeleteFlight(item)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LuxuryCard>
            )}
          />
        )}
      </View>

      {/* Add / Edit Flight Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingFlight ? 'Edit Flight' : 'Add New Flight'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <GoldenInput
                label="Flight Number (e.g. GW-204)"
                value={flightNumber}
                onChangeText={setFlightNumber}
                placeholder="GW-101"
              />

              <GoldenInput
                label="Airline Partner"
                value={airline}
                onChangeText={setAirline}
                placeholder="GoldenWing Airways"
              />

              <View style={styles.splitInputRow}>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Source Code"
                    value={source}
                    onChangeText={setSource}
                    placeholder="DXB"
                    maxLength={3}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Destination Code"
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="LHR"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.splitInputRow}>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Departure Time"
                    value={departureTime}
                    onChangeText={setDepartureTime}
                    placeholder="08:30"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Arrival Time"
                    value={arrivalTime}
                    onChangeText={setArrivalTime}
                    placeholder="14:45"
                  />
                </View>
              </View>

              <View style={styles.splitInputRow}>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Flight Duration"
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="7h 30m"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Price (USD)"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="1850"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.splitInputRow}>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Departure Date (YYYY-MM-DD)"
                    value={departureDate}
                    onChangeText={setDepartureDate}
                    placeholder="2026-11-20"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <GoldenInput
                    label="Seat Capacity"
                    value={totalSeats}
                    onChangeText={setTotalSeats}
                    placeholder="60"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Class Selection */}
              <Text style={styles.classLabel}>TRAVEL CLASS</Text>
              <View style={styles.classRow}>
                {(['Economy', 'Business', 'First Class'] as const).map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.classChip, travelClass === cls && styles.classChipActive]}
                    onPress={() => setTravelClass(cls)}
                  >
                    <Text style={[styles.classChipText, travelClass === cls && styles.classChipTextActive]}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <GoldenButton
                title={editingFlight ? 'Update Flight Service' : 'Schedule Flight'}
                onPress={handleSaveFlight}
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GoldenWingTheme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnHeader: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GoldenWingTheme.colors.primaryGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  subBarCount: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 13,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickAddText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 30,
    gap: 12,
  },
  flightCard: {
    padding: 16,
  },
  flightTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fnText: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 16,
    fontWeight: '800',
  },
  airlineText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  airportCode: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  airportCity: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  arrowBox: {
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 10,
  },
  flightBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: 12,
  },
  priceTag: {
    color: GoldenWingTheme.colors.lightGold,
    fontSize: 15,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#383838',
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
    marginHorizontal: 12,
    marginVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GoldenWingTheme.colors.primaryGold,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  modalTitle: {
    color: GoldenWingTheme.colors.primaryGold,
    fontSize: 18,
    fontWeight: '800',
  },
  formContent: {
    paddingVertical: 16,
  },
  splitInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  classLabel: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  classRow: {
    flexDirection: 'row',
    gap: 8,
  },
  classChip: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  classChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: GoldenWingTheme.colors.primaryGold,
  },
  classChipText: {
    color: GoldenWingTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  classChipTextActive: {
    color: GoldenWingTheme.colors.primaryGold,
    fontWeight: '700',
  },
});
