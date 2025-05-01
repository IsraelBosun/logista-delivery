import { Image, StyleSheet, View, TouchableOpacity, Platform, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import { db } from '../../components/firebase';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_CHANNEL_ID = 'location-tracking-channel';

// Setup notification channels for Android
async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    // Check if the Android version is 8.0 or higher (API level 26+)
    if (Platform.Version >= 26) {
      await Notifications.setNotificationChannelAsync(LOCATION_CHANNEL_ID, {
        name: 'Location Services',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007BFF',
        description: 'Notifications for location tracking services',
        enableVibrate: true,
        showBadge: false,
      });
      console.log('Notification channel set up successfully');
    }
  }
}

// Define the background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const riderInfo = await findRiderInfo(user.uid);

        if (riderInfo) {
          await setDoc(
            doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId),
            {
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              currentLat: location.coords.latitude.toString(),
              currentLng: location.coords.longitude.toString(),
              lastLocationUpdate: new Date(),
              isActive: true,
              userId: riderInfo.userId,
            },
            { merge: true }
          );
          console.log("Background location updated:", location.coords);
        }
      } catch (err) {
        console.error('Error updating location in background:', err);
      }
    }
  }
});

// Function to find rider info based on user ID
async function findRiderInfo(userId) {
  try {
    const usersCollection = collection(db, "users");
    const allUsersSnapshot = await getDocs(usersCollection);
    const adminUsers = allUsersSnapshot.docs.filter(doc => doc.data().type === 'admin');

    for (const admin of adminUsers) {
      const adminId = admin.id;
      const ridersRef = collection(db, "users", adminId, "riders");
      const riderQuery = query(ridersRef, where("userId", "==", userId));
      const riderSnapshot = await getDocs(riderQuery);

      if (!riderSnapshot.empty) {
        const riderDoc = riderSnapshot.docs[0];
        const riderData = riderDoc.data();

        return {
          userId: userId,
          riderId: riderDoc.id,
          adminId: adminId,
          isActive: riderData.isActive || false
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding rider info:", error);
    return null;
  }
}

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [riderInfo, setRiderInfo] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const mapRef = useRef(null);
  const locationSubscriberRef = useRef(null);

  // Check and request permissions
  useEffect(() => {
    // Set up notification channels
    setupNotificationChannels();

    const checkAndRequestPermissions = async () => {
      try {
        // Request foreground permission first
        const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (fgStatus !== 'granted') {
          Alert.alert(
            "Permission Denied",
            "Location permission is required for this app to work properly.",
            [{ text: "OK" }]
          );
          setPermissionsGranted(false);
          return;
        }
        
        // Then background permission
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (bgStatus !== 'granted') {
          Alert.alert(
            "Background Permission",
            "Background location permission is needed for tracking while the app is closed. Please enable it in settings.",
            [{ text: "OK" }]
          );
          setPermissionsGranted(false);
          return;
        }

        // For Android 12+ (API level 31+), request exact notifications permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const { status: notifStatus } = await Notifications.requestPermissionsAsync();
          if (notifStatus !== 'granted') {
            console.log('Notification permissions not granted');
          }
        }

        setPermissionsGranted(true);
        console.log("All permissions granted successfully");
      } catch (error) {
        console.error("Error requesting permissions:", error);
        setPermissionsGranted(false);
      }
    };

    checkAndRequestPermissions();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Logged in user ID:", user.uid);
        const info = await findRiderInfo(user.uid);

        if (info) {
          console.log("Admin ID:", info.adminId);
          console.log("Rider Doc ID:", info.riderId);
          console.log("User ID:", info.userId);
          setRiderInfo(info);
          setIsActive(info.isActive);
        } else {
          console.log("No rider info found for user:", user.uid);
        }
      } else {
        console.log("User not logged in");
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (locationSubscriberRef.current) {
        locationSubscriberRef.current.remove();
        locationSubscriberRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const startForegroundTracking = async () => {
      if (!permissionsGranted) {
        console.log("Permissions not granted yet");
        return;
      }

      locationSubscriberRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (loc) => {
          setLocation(loc);

          if (riderInfo?.userId && loc.coords) {
            await setDoc(
              doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId),
              {
                location: {
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                },
                currentLat: loc.coords.latitude.toString(),
                currentLng: loc.coords.longitude.toString(),
                lastLocationUpdate: new Date(),
                isActive: true,
                userId: riderInfo.userId,
              },
              { merge: true }
            );
          }

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
        }
      );
    };

    const startBackgroundTracking = async () => {
      if (!permissionsGranted) {
        console.log("Permissions not granted yet");
        return;
      }

      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        
        if (!hasStarted) {
          console.log("Starting background location tracking");
          
          // Different configuration based on Android version
          const options = {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            // distanceInterval: 5,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'Tracking your location',
              notificationBody: 'Location tracking is active',
              notificationColor: '#007BFF',
            }
          };

          // For Android 12+ (API level 31+), specify additional parameters
          if (Platform.OS === 'android' && Platform.Version >= 31) {
            options.foregroundService = {
              ...options.foregroundService,
              channelId: LOCATION_CHANNEL_ID,
              // Required for Android 12+
              serviceType: 'location',
              // Make notification persistent
              sticky: true,
            };
          }

          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, options);
          console.log("Background location tracking started successfully");
        }
      } catch (error) {
        console.error("Error starting background tracking:", error);
        Alert.alert(
          "Background Tracking Error",
          "There was a problem starting background location tracking. Please check app permissions.",
          [{ text: "OK" }]
        );
      }
    };

    const stopTracking = async () => {
      console.log("Stopping location tracking");
      
      if (locationSubscriberRef.current) {
        locationSubscriberRef.current.remove();
        locationSubscriberRef.current = null;
      }

      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log("Background location tracking stopped");
        }
      } catch (error) {
        console.error("Error stopping background tracking:", error);
      }
    };

    if (isActive && riderInfo && permissionsGranted) {
      startForegroundTracking();
      startBackgroundTracking();
    } else if (!isActive) {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isActive, riderInfo, permissionsGranted]);

  const handleToggleActive = async () => {
    if (!riderInfo) return;
    
    if (!permissionsGranted && !isActive) {
      Alert.alert(
        "Permission Required",
        "Location permissions are required to activate tracking. Please grant permissions in settings.",
        [{ text: "OK" }]
      );
      return;
    }

    const newIsActive = !isActive;
    setIsActive(newIsActive);

    await setDoc(
      doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId),
      {
        isActive: newIsActive,
      },
      { merge: true }
    );

    console.log("Toggled isActive to:", newIsActive);
    
    if (newIsActive) {
      // Check for battery optimization settings on newer Android
      if (Platform.OS === 'android' && Platform.Version >= 28) {
        Alert.alert(
          "Battery Optimization",
          "For reliable tracking, please disable battery optimization for this app in your device settings.",
          [{ text: "OK" }]
        );
      }
    }
  };

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
          showsUserLocation={true}
          followsUserLocation={false}
          showsMyLocationButton={true}
          initialRegion={{
            latitude: location?.coords?.latitude || 6.5244,
            longitude: location?.coords?.longitude || 3.3792,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>

      <View style={styles.infoContainer}>
        <ThemedText>
          Status: {isActive ? 'Active' : 'Inactive'}
        </ThemedText>
        <ThemedText>
          Permissions: {permissionsGranted ? 'Granted' : 'Not Granted'}
        </ThemedText>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            isActive ? styles.activeButton : styles.inactiveButton
          ]} 
          onPress={handleToggleActive}
        >
          <ThemedText style={styles.toggleButtonText}>
            {isActive ? 'Deactivate' : 'Activate'} Rider
          </ThemedText>
        </TouchableOpacity>
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
    height: 300,
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
  infoContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#ff3b30',
  },
  inactiveButton: {
    backgroundColor: '#007BFF',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});