import React, { createContext, useContext, useState } from 'react';
import { Airport, CabinClass, Flight, Passenger } from '../types';

export interface SearchState {
  tripType: 'oneWay' | 'roundTrip' | 'multiCity';
  originAirport: Airport | null;
  destinationAirport: Airport | null;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  cabinClass: CabinClass;
  passengerCount: number;
  adultsCount: number;
  childrenCount: number;
  multiCitySegments?: Array<{
    origin: Airport | null;
    destination: Airport | null;
    date: string;
  }>;
}

interface BookingContextType {
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight | null) => void;
  selectedSeats: string[];
  toggleSeatSelection: (seatNumber: string) => void;
  clearSeats: () => void;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  updatePassenger: (index: number, data: Partial<Passenger>) => void;
  resetBooking: () => void;
  totalPrice: number;
}

const defaultDeparture = new Date();
const defaultReturn = new Date();
defaultReturn.setDate(defaultReturn.getDate() + 7);

const defaultSearchState: SearchState = {
  tripType: 'oneWay',
  originAirport: null,
  destinationAirport: null,
  departureDate: defaultDeparture.toISOString().split('T')[0],
  returnDate: defaultReturn.toISOString().split('T')[0],
  cabinClass: 'first',
  passengerCount: 1,
  adultsCount: 1,
  childrenCount: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { fullName: '', passportNumber: '', seatNumber: '' },
  ]);

  const toggleSeatSelection = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      }
      if (prev.length < searchState.passengerCount) {
        return [...prev, seatNumber];
      }
      // If already reached limit, replace the first one
      const updated = [...prev.slice(1), seatNumber];
      return updated;
    });
  };

  const clearSeats = () => {
    setSelectedSeats([]);
  };

  const updatePassenger = (index: number, data: Partial<Passenger>) => {
    setPassengers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...data };
      }
      return updated;
    });
  };

  const resetBooking = () => {
    setSelectedFlight(null);
    setSelectedSeats([]);
    setPassengers([{ fullName: '', passportNumber: '', seatNumber: '' }]);
  };

  const basePrice = selectedFlight?.classes[searchState.cabinClass]?.price || 0;
  const totalPrice = basePrice * searchState.passengerCount;

  return (
    <BookingContext.Provider
      value={{
        searchState,
        setSearchState,
        selectedFlight,
        setSelectedFlight,
        selectedSeats,
        toggleSeatSelection,
        clearSeats,
        passengers,
        setPassengers,
        updatePassenger,
        resetBooking,
        totalPrice,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

