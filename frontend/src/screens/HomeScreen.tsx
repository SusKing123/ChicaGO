import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface Location {
  id: number;
  name: string;
  description: string;
}

export const HomeScreen: React.FC = () => {
  const [locations, setLocations] = React.useState<Location[]>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chicago Locations</Text>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.locationCard}>
            <Text style={styles.locationName}>{item.name}</Text>
            <Text style={styles.locationDesc}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No locations available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  locationCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationDesc: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 16,
  },
});

export default HomeScreen;
