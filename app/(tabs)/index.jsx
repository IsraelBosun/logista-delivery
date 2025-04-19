import { Image, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { db } from '../../components/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Constants from 'expo-constants'; // <-- Add this
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';

// Constants
const LOCATION_TASK_NAME = 'ACCESS_BACKGROUND_LOCATION';
const adminId = "G3iksKDjglZwHUoHqh8cxzoi4eu1";
const riderDocId = "UbupKh2jc70IyPuOfo4a";
const userId = "exwzPv9rEtOBoE0tUUg8Vrd9jNm2";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const loc = locations[0];

    if (loc && loc.coords) {
      try {
        await setDoc(
          doc(db, 'users', adminId, 'riders', riderDocId),
          {
            location: {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            },
            currentLat: loc.coords.latitude.toString(),
            currentLng: loc.coords.longitude.toString(),
            lastLocationUpdate: new Date(),
            isActive: true,
            userId: userId,
          },
          { merge: true }
        );
      } catch (e) {
        console.error('Error updating location:', e);
      }
    }
  }
});

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

      if (fgStatus !== 'granted' || bgStatus !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const isTaskRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (!isTaskRunning) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Tracking Rider',
            notificationBody: 'We are tracking your location',
            notificationColor: '#FF0000',
          },
        });
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc);
    })();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [location]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Tracking Rider!</ThemedText>
        <HelloWave />
      </ThemedView>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE} // <-- Force Google Maps provider
          showsUserLocation={true}
          followsUserLocation={false}
          showsMyLocationButton={true}
          initialRegion={{
            latitude: location?.coords.latitude || 6.5244,
            longitude: location?.coords.longitude || 3.3792,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapContainer: {
    height: 400,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
