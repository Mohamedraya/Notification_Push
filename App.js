import { StatusBar } from 'expo-status-bar';
import React ,{useEffect,useState} from 'react';
import { Button,StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions   from 'expo-permissions';

// How to notifications displayed when running app
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    };
  }
});

export default function App() {

  const [pushToken,setPushToken] = useState();

  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS).then((statusObj) => {
      if(statusObj.status !== 'granted') {
         return Permissions.askAsync(Permissions.NOTIFICATIONS);
      }
      return statusObj;
    }).then((statusObj) => {
      if(statusObj.status !== 'granted') {
        throw new Error("Permision not granted");
      }
    })
    .then(() => {    //this method will talk to expo server
       return Notifications.getExpoPushTokenAsync();
    }).then(response => {
      const token = response.data;
      setPushToken(token);
    })
    .catch(err => {
      return err;
    });
  } ,[]);

  // Reacting to foreground Notifications for handle notif if app open
  useEffect(() => {
    const subscription =  Notifications.addNotificationReceivedListener(notifications => {
      console.log(notifications);
    });

    return () => {
      subscription.remove();
    }
  } ,[]);

  //Reacting to notifications if the app closed
  useEffect(() => {
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
    const foregroundSubscription =  Notifications.addNotificationReceivedListener(notifications => {
      console.log(notifications);
    });

    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    }
  } ,[]);

  const triggerNotificationsHandler = () => {
    //Notifications.scheduleNotificationAsync({
    //  content: {
    //    title: "my first local notifications",
    //    body: "this is local notifications we are sending",
    //    data: {mySpecialData: 'Some text'},
    //  },
    //  trigger: {
    //    seconds: 10
    //  }
   //});
   fetch("https://expo.host/--/api/v2/push/send",{
        method: "POST",
        headers: {
          'Accept' : "application/json",
          'Accept-Encoding' : "gzip, deflate",
          'Content-Type' : "application/json"
        },
        body: JSON.stringify({
          to: pushToken,
          data: {extraData: 'some data'},
          title: "sent via app",
          body: "this push notification was sent via the app"
        })
   });;
  };

  return (
    <View style={styles.container}>
      <Button title="Trigger Notifications" onPress={triggerNotificationsHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
