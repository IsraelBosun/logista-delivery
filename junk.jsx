// import { Image, StyleSheet, View } from 'react-native';
// import MapView from 'react-native-maps';
// import { useEffect, useState, useRef } from 'react';
// import * as Location from 'expo-location'; 
// import { db } from '../../components/firebase'; 
// import { doc, setDoc } from 'firebase/firestore'; 
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { HelloWave } from '@/components/HelloWave';

// // Example: Get these from your auth context or props ideally
// const adminId = "G3iksKDjglZwHUoHqh8cxzoi4eu1"; // Your admin's document ID
// const riderDocId = "UbupKh2jc70IyPuOfo4a"; // Rider's document ID under admin/riders
// const userId = "exwzPv9rEtOBoE0tUUg8Vrd9jNm2"; // Rider's own userId

// export default function HomeScreen() {
//   const [location, setLocation] = useState(null);
//   const mapRef = useRef(null);

//   useEffect(() => {
//     let subscriber;

//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Permission to access location was denied');
//         return;
//       }

//       subscriber = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 1000, 
//           distanceInterval: 1, 
//         },
//         async (loc) => {
//           setLocation(loc);

//           if (userId && loc.coords) {
//             await setDoc(
//               doc(db, 'users', adminId, 'riders', riderDocId),
//               {
//                 location: {
//                   latitude: loc.coords.latitude,
//                   longitude: loc.coords.longitude,
//                 },
//                 currentLat: loc.coords.latitude.toString(),
//                 currentLng: loc.coords.longitude.toString(),
//                 lastLocationUpdate: new Date(),
//                 isActive: true,
//                 userId: userId,
//               },
//               { merge: true } // Merge so you don't overwrite rider's other info
//             );
//           }

//           if (mapRef.current) {
//             mapRef.current.animateToRegion({
//               latitude: loc.coords.latitude,
//               longitude: loc.coords.longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }, 1000);
//           }
//         }
//       );
//     })();

//     return () => {
//       if (subscriber) {
//         subscriber.remove();
//       }
//     };
//   }, []);

//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }
//     >
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Tracking Rider!</ThemedText>
//         <HelloWave />
//       </ThemedView>

//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           showsUserLocation={true}
//           followsUserLocation={false}
//           showsMyLocationButton={true}
//           initialRegion={{
//             latitude: location?.coords.latitude || 6.5244,
//             longitude: location?.coords.longitude || 3.3792,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//         />
//       </View>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   mapContainer: {
//     height: 300,
//     marginTop: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });



































// import { Image, StyleSheet, View, Switch, TouchableOpacity } from 'react-native';
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import { useEffect, useState, useRef } from 'react';
// import * as Location from 'expo-location';
// import * as TaskManager from 'expo-task-manager';
// import { db } from '../../components/firebase';
// import { getAuth } from "firebase/auth";
// import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
// import Constants from 'expo-constants';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { HelloWave } from '@/components/HelloWave';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Constants
// const LOCATION_TASK_NAME = 'ACCESS_BACKGROUND_LOCATION';
// const RIDER_DATA_KEY = 'rider_data';

// // Modified location update function for TaskManager
// async function updateRiderLocation(locations, riderInfo, isActive = true) {
//   if (!riderInfo || !riderInfo.adminId || !riderInfo.riderId) {
//     console.error('Missing rider info for location update');
//     return;
//   }

//   const loc = locations[0];
//   if (loc && loc.coords) {
//     try {
//       await setDoc(
//         doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId),
//         {
//           location: {
//             latitude: loc.coords.latitude,
//             longitude: loc.coords.longitude,
//           },
//           currentLat: loc.coords.latitude.toString(),
//           currentLng: loc.coords.longitude.toString(),
//           lastLocationUpdate: new Date(),
//           isActive: isActive,
//           userId: riderInfo.userId,
//         },
//         { merge: true }
//       );
//       console.log('Location updated successfully, active status:', isActive);
//     } catch (e) {
//       console.error('Error updating location:', e);
//     }
//   }
// }

// // Function to toggle rider's active status
// async function toggleRiderActiveStatus(riderInfo, newActiveStatus) {
//   if (!riderInfo || !riderInfo.adminId || !riderInfo.riderId) {
//     console.error('Missing rider info for status update');
//     return false;
//   }

//   try {
//     const riderRef = doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId);
    
//     await setDoc(
//       riderRef,
//       {
//         isActive: newActiveStatus,
//         lastStatusUpdate: new Date()
//       },
//       { merge: true }
//     );
    
//     console.log('Rider active status updated to:', newActiveStatus);
//     return true;
//   } catch (e) {
//     console.error('Error updating rider status:', e);
//     return false;
//   }
// }

// // Define the task with rider info passed through options
// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
//   if (error) {
//     console.error('Background location task error:', error);
//     return;
//   }
  
//   if (data) {
//     try {
//       // Get stored rider data from AsyncStorage
//       const riderDataString = await AsyncStorage.getItem(RIDER_DATA_KEY);
//       if (!riderDataString) {
//         console.error('No rider data found in storage');
//         return;
//       }
      
//       const riderInfo = JSON.parse(riderDataString);
      
//       // Check current active status from Firestore
//       const riderRef = doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId);
//       const riderDoc = await getDoc(riderRef);
//       const isActive = riderDoc.exists() ? riderDoc.data().isActive : false;
      
//       // Only update location if rider is active
//       if (isActive) {
//         const { locations } = data;
//         await updateRiderLocation(locations, riderInfo, isActive);
//       } else {
//         console.log('Rider is not active, skipping location update');
//       }
//     } catch (e) {
//       console.error('Error in background task:', e);
//     }
//   }
// });

// // Function to find rider info based on user ID
// async function findRiderInfo(userId) {
//   try {
//     // Get all admin users
//     const usersCollection = collection(db, "users");
//     const allUsersSnapshot = await getDocs(usersCollection);
    
//     // Filter to only get admin users
//     const adminUsers = allUsersSnapshot.docs.filter(doc => 
//       doc.data().type === 'admin'
//     );
    
//     // Search each admin for this rider
//     for (const admin of adminUsers) {
//       const adminId = admin.id;
      
//       // Query riders subcollection
//       const ridersRef = collection(db, "users", adminId, "riders");
//       const riderQuery = query(ridersRef, where("userId", "==", userId));
//       const riderSnapshot = await getDocs(riderQuery);
      
//       if (!riderSnapshot.empty) {
//         const riderDoc = riderSnapshot.docs[0];
//         const riderData = riderDoc.data();
        
//         return {
//           userId: userId,
//           riderId: riderDoc.id,
//           adminId: adminId,
//           isActive: riderData.isActive || false
//         };
//       }
//     }
//     return null;
//   } catch (error) {
//     console.error("Error finding rider info:", error);
//     return null;
//   }
// }

// export default function HomeScreen() {
//   const [location, setLocation] = useState(null);
//   const [riderInfo, setRiderInfo] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isActive, setIsActive] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const mapRef = useRef(null);

//   useEffect(() => {
//     async function initializeRiderInfo() {
//       setIsLoading(true);
//       try {
//         // First try to get from AsyncStorage
//         const storedData = await AsyncStorage.getItem(RIDER_DATA_KEY);
        
//         if (storedData) {
//           const parsedData = JSON.parse(storedData);
//           setRiderInfo(parsedData);
          
//           // Fetch the current active status from Firestore
//           const riderRef = doc(db, 'users', parsedData.adminId, 'riders', parsedData.riderId);
//           const riderDoc = await getDoc(riderRef);
          
//           if (riderDoc.exists()) {
//             setIsActive(riderDoc.data().isActive || false);
//           }
          
//           setIsLoading(false);
//           console.log('Loaded rider info from storage:', parsedData);
//           return parsedData;
//         }
        
//         // If not in storage, get from Firebase
//         const auth = getAuth();
//         const user = auth.currentUser;
        
//         if (!user) {
//           console.error('User not authenticated');
//           setIsLoading(false);
//           return null;
//         }
        
//         console.log('Finding rider info for user ID:', user.uid);
//         const info = await findRiderInfo(user.uid);
        
//         if (info) {
//           // Save to AsyncStorage for future use
//           await AsyncStorage.setItem(RIDER_DATA_KEY, JSON.stringify(info));
//           setRiderInfo(info);
//           setIsActive(info.isActive || false);
//           console.log('Found and saved rider info:', info);
//         } else {
//           console.error('No rider profile found for this user');
//         }
        
//         setIsLoading(false);
//         return info;
//       } catch (error) {
//         console.error('Error initializing rider info:', error);
//         setIsLoading(false);
//         return null;
//       }
//     }
    
//     initializeRiderInfo();
//   }, []);

//   useEffect(() => {
//     async function setupLocationTracking() {
//       if (!riderInfo) return;
      
//       const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
//       const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

//       if (fgStatus !== 'granted' || bgStatus !== 'granted') {
//         console.log('Permission to access location was denied');
//         return;
//       }

//       const isTaskRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
//       if (!isTaskRunning) {
//         await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 5,
//           showsBackgroundLocationIndicator: true,
//           foregroundService: {
//             notificationTitle: 'Tracking Rider',
//             notificationBody: 'We are tracking your location',
//             notificationColor: '#FF0000',
//           },
//         });
//       }

//       const currentLoc = await Location.getCurrentPositionAsync({});
//       setLocation(currentLoc);
      
//       // Update location immediately after getting it
//       if (currentLoc && currentLoc.coords) {
//         updateRiderLocation([currentLoc], riderInfo, isActive);
//       }
//     }
    
//     if (riderInfo && !isLoading) {
//       setupLocationTracking();
//     }
//   }, [riderInfo, isLoading]);

//   useEffect(() => {
//     if (location && mapRef.current) {
//       mapRef.current.animateToRegion({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }, 1000);
//     }
//   }, [location]);

//   const handleToggleActive = async () => {
//     if (!riderInfo || isUpdating) return;
    
//     setIsUpdating(true);
//     const newActiveStatus = !isActive;
    
//     const success = await toggleRiderActiveStatus(riderInfo, newActiveStatus);
//     if (success) {
//       setIsActive(newActiveStatus);
      
//       // If we just got a new location and changed status, update with the new status
//       if (location && location.coords) {
//         updateRiderLocation([location], riderInfo, newActiveStatus);
//       }
//     }
    
//     setIsUpdating(false);
//   };

//   if (isLoading) {
//     return (
//       <ThemedView style={styles.loadingContainer}>
//         <ThemedText>Loading rider information...</ThemedText>
//       </ThemedView>
//     );
//   }

//   if (!riderInfo) {
//     return (
//       <ThemedView style={styles.errorContainer}>
//         <ThemedText>No rider profile found for your account. Please contact your administrator.</ThemedText>
//       </ThemedView>
//     );
//   }

//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }
//     >
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Tracking Rider!</ThemedText>
//         <HelloWave />
//       </ThemedView>

//       <ThemedView style={styles.infoContainer}>        
//         <ThemedView style={styles.statusContainer}>
//           <ThemedText>Active Status: </ThemedText>
//           <TouchableOpacity 
//             onPress={handleToggleActive}
//             disabled={isUpdating}
//             style={[
//               styles.statusBadge, 
//               { backgroundColor: isActive ? '#4CAF50' : '#F44336' }
//             ]}
//           >
//             <ThemedText style={styles.statusText}>
//               {isActive ? 'Active' : 'Inactive'}
//             </ThemedText>
//           </TouchableOpacity>
          
//           <Switch
//             value={isActive}
//             onValueChange={handleToggleActive}
//             disabled={isUpdating}
//             trackColor={{ false: '#767577', true: '#81b0ff' }}
//             thumbColor={isActive ? '#f5dd4b' : '#f4f3f4'}
//           />
//         </ThemedView>
//       </ThemedView>

//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           provider={PROVIDER_GOOGLE}
//           showsUserLocation={true}
//           followsUserLocation={false}
//           showsMyLocationButton={true}
//           initialRegion={{
//             latitude: location?.coords.latitude || 6.5244,
//             longitude: location?.coords.longitude || 3.3792,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//         />
//       </View>
      
//       <ThemedView style={styles.statusMessage}>
//         <ThemedText>
//           {isActive 
//             ? 'You are visible and receiving deliveries' 
//             : 'You are offline and not receiving deliveries'}
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   infoContainer: {
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 6,
//     borderColor: 'black'
//   },
//   statusContainer: {
//     marginTop: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 10,
//   },
//   statusText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   mapContainer: {
//     height: 400,
//     marginTop: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
//   statusMessage: {
//     marginTop: 16,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.03)',
//   },
// });







import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location'; 
import { db } from '../../components/firebase'; 
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'; 
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Function to find rider info based on user ID
async function findRiderInfo(userId) {
  try {
    const usersCollection = collection(db, "users");
    const allUsersSnapshot = await getDocs(usersCollection);
    
    const adminUsers = allUsersSnapshot.docs.filter(doc => 
      doc.data().type === 'admin'
    );
    
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
  const mapRef = useRef(null);

  useEffect(() => {
    let subscriber;
    const auth = getAuth();
    let locationSubscriber;

    const startLocationTracking = async (adminId, riderId, userId) => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      locationSubscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (loc) => {
          setLocation(loc);

          if (userId && loc.coords) {
            await setDoc(
              doc(db, 'users', adminId, 'riders', riderId),
              {
                location: {
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                },
                currentLat: loc.coords.latitude.toString(),
                currentLng: loc.coords.longitude.toString(),
                lastLocationUpdate: new Date(),
                isActive: isActive, // Update the current isActive state
                userId: userId,
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

    subscriber = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Logged in user ID:", user.uid);

        const info = await findRiderInfo(user.uid);
        if (info) {
          console.log("Admin ID:", info.adminId);
          console.log("Rider Doc ID:", info.riderId);
          console.log("User ID:", info.userId);

          setRiderInfo(info);
          setIsActive(info.isActive);
          startLocationTracking(info.adminId, info.riderId, info.userId);
        } else {
          console.log("No rider info found for user:", user.uid);
        }
      } else {
        console.log("User not logged in");
      }
    });

    return () => {
      if (subscriber) subscriber();
      if (locationSubscriber) locationSubscriber.remove();
    };
  }, [isActive]);

  const handleToggleActive = async () => {
    if (riderInfo) {
      const newIsActive = !isActive;
      setIsActive(newIsActive); // Update local state

      await setDoc(
        doc(db, 'users', riderInfo.adminId, 'riders', riderInfo.riderId),
        {
          isActive: newIsActive,
        },
        { merge: true } // Merge to avoid overwriting other data
      );
      console.log("Toggled isActive to:", newIsActive);
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
            latitude: location?.coords.latitude || 6.5244,
            longitude: location?.coords.longitude || 3.3792,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>

      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={styles.toggleButton} onPress={handleToggleActive}>
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
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

































import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { db } from '../../components/firebase';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HelloWave } from '@/components/HelloWave';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const LOCATION_TASK_NAME = 'background-location-task';

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
  const mapRef = useRef(null);
  const locationSubscriberRef = useRef(null);

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
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
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.log('Permission for background location denied');
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          // distanceInterval: 5,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Tracking your location',
            notificationBody: 'Location tracking active',
            notificationColor: '#007BFF',
          },
        });
      }
    };

    const stopTracking = async () => {
      if (locationSubscriberRef.current) {
        locationSubscriberRef.current.remove();
        locationSubscriberRef.current = null;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    };

    if (isActive && riderInfo) {
      startForegroundTracking();
      startBackgroundTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isActive, riderInfo]);

  const handleToggleActive = async () => {
    if (!riderInfo) return;

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
            latitude: location?.coords.latitude || 6.5244,
            longitude: location?.coords.longitude || 3.3792,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity style={styles.toggleButton} onPress={handleToggleActive}>
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
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
