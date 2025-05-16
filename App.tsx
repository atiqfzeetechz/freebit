// App.js
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { WebViewProvider } from './src/context/WebviewContext';
import AuthLayout from './src/Pages/Layout/AuthLayout';
import { LoaderProvider } from './src/context/LoaderContext';
import GlobalLoader from './src/components/Loader';

export default function App() {
  return (
    <LoaderProvider>
      <GlobalLoader></GlobalLoader>

    <AuthProvider>
      <WebViewProvider>
        <PaperProvider>
          <NavigationContainer>
            <AuthLayout />
          </NavigationContainer>
        </PaperProvider>
      </WebViewProvider>
    </AuthProvider>
    </LoaderProvider>
  );
}

const styles = StyleSheet.create({});