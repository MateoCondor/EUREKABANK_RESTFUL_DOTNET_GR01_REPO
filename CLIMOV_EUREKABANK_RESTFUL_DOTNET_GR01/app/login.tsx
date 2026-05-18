import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useColorScheme } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative top gradient bar */}
        <View style={[styles.topBar, { backgroundColor: '#0D7377' }]}>
          <View style={styles.topBarInner}>
            <View style={[styles.topBarAccent, { backgroundColor: '#D4A843' }]} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Logo / Brand */}
          <View style={styles.brandContainer}>
            <View style={[styles.logoCircle, { backgroundColor: '#0D7377' }]}>
              <MaterialCommunityIcons name="bank" size={48} color="#FFFFFF" />
            </View>
            <Text
              variant="headlineLarge"
              style={[styles.brandTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}
            >
              EurekaBank
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.brandSubtitle, { color: isDark ? '#94A3B8' : '#6B7280' }]}
            >
              {Platform.OS === 'web' ? 'Cliente WEB' : 'Cliente MOVIL'}: RESTFUL - DOTNET 
            </Text>
          </View>

          {/* Login Card */}
          <Surface
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
              },
            ]}
            elevation={3}
          >
            <Text
              variant="titleLarge"
              style={[styles.cardTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}
            >
              Iniciar Sesión
            </Text>

            <TextInput
              label="Usuario"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
              onSubmitEditing={handleLogin}
            />

            {error ? (
              <HelperText type="error" visible style={styles.errorText}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
              buttonColor="#0D7377"
              textColor="#FFFFFF"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Surface>

          {/* Footer */}
          <Text
            variant="bodySmall"
            style={[styles.footer, { color: isDark ? '#64748B' : '#94A3B8' }]}
          >
            © 2026 EurekaBank • Arquitectura GR01
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    height: 6,
    width: '100%',
  },
  topBarInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  topBarAccent: {
    width: '30%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0D7377',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandSubtitle: {
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 28,
  },
  cardTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 4,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  loginButtonContent: {
    paddingVertical: 6,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 32,
    letterSpacing: 0.5,
  },
});
