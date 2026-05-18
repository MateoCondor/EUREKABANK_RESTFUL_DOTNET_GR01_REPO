import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme, RefreshControl, useWindowDimensions } from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Divider,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { clientsApi, accountsApi, type ClientResponse, type AccountResponse } from '@/services/api';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { username, role } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const isWide = width >= 768;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setError('');
      const [clients, accounts] = await Promise.all([
        clientsApi.getAll(),
        accountsApi.getAll(),
      ]);

      const totalBalance = accounts.reduce((sum: number, acc: AccountResponse) => sum + (acc.balance || 0), 0);

      setStats({
        totalClients: clients.length,
        activeClients: clients.filter((c: ClientResponse) => c.status === 'ACTIVE').length,
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter((a: AccountResponse) => a.status === 'ACTIVE').length,
        totalBalance,
      });

      setRecentClients(clients.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);

  const statCards = [
    {
      title: 'Clientes Totales',
      value: stats?.totalClients ?? 0,
      icon: 'account-group' as const,
      color: '#0D7377',
      bgColor: isDark ? '#0D737720' : '#0D737712',
    },
    {
      title: 'Clientes Activos',
      value: stats?.activeClients ?? 0,
      icon: 'account-check' as const,
      color: '#2ECC71',
      bgColor: isDark ? '#2ECC7120' : '#2ECC7112',
    },
    {
      title: 'Cuentas Totales',
      value: stats?.totalAccounts ?? 0,
      icon: 'credit-card-multiple' as const,
      color: '#D4A843',
      bgColor: isDark ? '#D4A84320' : '#D4A84312',
    },
    {
      title: 'Balance Total',
      value: formatCurrency(stats?.totalBalance ?? 0),
      icon: 'cash-multiple' as const,
      color: '#14A0A5',
      bgColor: isDark ? '#14A0A520' : '#14A0A512',
    },
  ];

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
        <ActivityIndicator size="large" color="#0D7377" />
        <Text style={{ marginTop: 16, color: isDark ? '#94A3B8' : '#6B7280' }}>
          Cargando dashboard...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
              Bienvenido de vuelta
            </Text>
            <Text variant="headlineSmall" style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}>
              {username ?? 'Usuario'}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: '#0D737720' }]}>
            <Text style={styles.roleText}>{role ?? 'USER'}</Text>
          </View>
        </View>
        <View style={[styles.headerBar, { backgroundColor: '#0D7377' }]}>
          <View style={[styles.headerBarAccent, { backgroundColor: '#D4A843' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0D7377']} />
        }
      >
        {error ? (
          <Surface style={[styles.errorCard, { backgroundColor: isDark ? '#3B1A1A' : '#FEF2F2' }]} elevation={1}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#CF6679" />
            <Text style={{ color: '#CF6679', marginLeft: 8, flex: 1 }}>{error}</Text>
            <IconButton icon="refresh" size={20} onPress={loadDashboard} iconColor="#CF6679" />
          </Surface>
        ) : null}

        {/* Stat Cards Grid */}
        <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
          {statCards.map((card, index) => (
            <Surface
              key={index}
              style={[
                styles.statCard,
                isWide && styles.statCardWide,
                { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' },
              ]}
              elevation={2}
            >
              <View style={[styles.statIconContainer, { backgroundColor: card.bgColor }]}>
                <MaterialCommunityIcons name={card.icon} size={28} color={card.color} />
              </View>
              <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginTop: 12 }}>
                {card.title}
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.statValue, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}
              >
                {card.value}
              </Text>
            </Surface>
          ))}
        </View>

        {/* Recent Clients */}
        <Surface
          style={[styles.sectionCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
          elevation={2}
        >
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600' }}>
              Clientes Recientes
            </Text>
            <MaterialCommunityIcons name="account-group" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </View>
          <Divider style={{ marginBottom: 8, backgroundColor: isDark ? '#2D2D44' : '#E2E8F0' }} />
          {recentClients.length === 0 ? (
            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', textAlign: 'center', paddingVertical: 20 }}>
              No hay clientes registrados
            </Text>
          ) : (
            recentClients.map((client, index) => (
              <View key={client.id}>
                <View style={styles.clientRow}>
                  <View style={[styles.clientAvatar, { backgroundColor: '#0D737720' }]}>
                    <Text style={{ color: '#0D7377', fontWeight: '700', fontSize: 16 }}>
                      {client.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text
                      variant="bodyMedium"
                      style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '500' }}
                    >
                      {client.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                      DNI: {client.dni} • {client.email}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          client.status === 'ACTIVE'
                            ? isDark ? '#2ECC7120' : '#2ECC7115'
                            : isDark ? '#CF667920' : '#CF667915',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: client.status === 'ACTIVE' ? '#2ECC71' : '#CF6679',
                      }}
                    >
                      {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
                {index < recentClients.length - 1 && (
                  <Divider style={{ marginVertical: 4, backgroundColor: isDark ? '#2D2D44' : '#F1F5F9' }} />
                )}
              </View>
            ))
          )}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontWeight: '700',
    marginTop: 2,
  },
  headerBar: {
    height: 3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerBarAccent: {
    width: '25%',
    height: '100%',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: '#0D7377',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statsGridWide: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 20,
  },
  statCardWide: {
    minWidth: '22%',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
