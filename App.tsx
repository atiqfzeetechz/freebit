// App.js
import {PermissionStatus, Platform, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext';
import {PaperProvider} from 'react-native-paper';
import {WebViewProvider} from './src/context/WebviewContext';
import AuthLayout from './src/Pages/Layout/AuthLayout';
import {LoaderProvider} from './src/context/LoaderContext';
import GlobalLoader from './src/components/Loader';
import {DataProvider} from './src/context/DataContext';
import {SidebarProvider} from './src/context/SidebarContext';
  import {PermissionsAndroid} from 'react-native';
import { useEffect } from 'react';

export default function App() {



  return (
    <DataProvider>
      <LoaderProvider>
        <GlobalLoader></GlobalLoader>
        <AuthProvider>
          <WebViewProvider>
            <SidebarProvider>
              <PaperProvider>
                <NavigationContainer>
                  <AuthLayout />
                </NavigationContainer>
              </PaperProvider>
            </SidebarProvider>
          </WebViewProvider>
        </AuthProvider>
      </LoaderProvider>
    </DataProvider>
  );
}

const styles = StyleSheet.create({});
