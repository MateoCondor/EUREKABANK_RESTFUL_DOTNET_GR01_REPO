import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Surface,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Divider,
  IconButton,
  ActivityIndicator,
  Searchbar,
  HelperText,
  SegmentedButtons,
  Menu,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  accountsApi,
  clientsApi,
  type AccountResponse,
  type AccountRequest,
  type AccountType,
  type AccountStatus,
  type ClientResponse,
} from '@/services/api';
import { ScreenBackground } from '@/components/screen-background';

export default function AccountsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [filtered, setFiltered] = useState<AccountResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Create modal
  const [modalVisible, setModalVisible] = useState(false);
  const [formClientId, setFormClientId] = useState('');
  const [formType, setFormType] = useState<AccountType>('SAVINGS');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusAccount, setStatusAccount] = useState<AccountResponse | null>(null);
  const [newStatus, setNewStatus] = useState<AccountStatus>('ACTIVE');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [accs, cls] = await Promise.all([
        accountsApi.getAll(),
        clientsApi.getAll(),
      ]);
      setAccounts(accs);
      setFiltered(accs);
      setClients(cls);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cuentas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(accounts);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        accounts.filter(
          (a) =>
            a.accountNumber.toLowerCase().includes(q) ||
            String(a.clientId).includes(q),
        ),
      );
    }
  }, [searchQuery, accounts]);

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name ?? `Cliente #${clientId}`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);

  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE': return '#2ECC71';
      case 'BLOCKED': return '#F39C12';
      case 'CLOSED': return '#CF6679';
      default: return '#94A3B8';
    }
  };

  const getStatusLabel = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'BLOCKED': return 'Bloqueada';
      case 'CLOSED': return 'Cerrada';
      default: return status;
    }
  };

  const getTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'SAVINGS': return 'Ahorros';
      case 'CURRENT': return 'Corriente';
      default: return type;
    }
  };

  const handleCreate = async () => {
    if (!formClientId.trim()) {
      setFormError('Seleccione un cliente');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await accountsApi.create({
        clientId: Number(formClientId),
        type: formType,
      });
      setModalVisible(false);
      setFormClientId('');
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error al crear cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusAccount) return;
    setSubmitting(true);
    try {
      await accountsApi.updateStatus(statusAccount.id, newStatus);
      setStatusModalVisible(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusModal = (account: AccountResponse) => {
    setStatusAccount(account);
    setNewStatus(account.status);
    setStatusModalVisible(true);
  };

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0D7377" />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}>
            Gestión de Cuentas
          </Text>
          <View style={[styles.headerBar, { backgroundColor: '#0D7377' }]}>
            <View style={[styles.headerBarAccent, { backgroundColor: '#D4A843' }]} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar por número de cuenta..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchbar, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
            inputStyle={{ color: isDark ? '#E2E8F0' : '#1A1A2E' }}
            iconColor={isDark ? '#94A3B8' : '#6B7280'}
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          />
        </View>

        {error ? (
          <Surface style={[styles.errorCard, { backgroundColor: isDark ? '#3B1A1A' : '#FEF2F2' }]} elevation={1}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#CF6679" />
            <Text style={{ color: '#CF6679', marginLeft: 8, flex: 1 }}>{error}</Text>
          </Surface>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#0D7377']} />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="credit-card-off" size={64} color={isDark ? '#2D2D44' : '#CBD5E1'} />
              <Text style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 12, fontSize: 16 }}>
                No se encontraron cuentas
              </Text>
            </View>
          ) : (
            <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
              {filtered.map((account) => (
                <Surface
                  key={account.id}
                  style={[
                    styles.accountCard,
                    isWide && styles.accountCardWide,
                    { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' },
                  ]}
                  elevation={2}
                >
                  {/* Card top accent */}
                  <View style={[styles.cardAccent, { backgroundColor: getStatusColor(account.status) }]} />

                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.typeChip, { backgroundColor: isDark ? '#0D737720' : '#0D737710' }]}>
                        <MaterialCommunityIcons
                          name={account.type === 'SAVINGS' ? 'piggy-bank' : 'briefcase'}
                          size={14}
                          color="#0D7377"
                        />
                        <Text style={{ color: '#0D7377', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                          {getTypeLabel(account.type)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(account.status)}20` },
                        ]}
                      >
                        <Text style={{ color: getStatusColor(account.status), fontSize: 11, fontWeight: '600' }}>
                          {getStatusLabel(account.status)}
                        </Text>
                      </View>
                    </View>

                    <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 12 }}>
                      Número de Cuenta
                    </Text>
                    <Text variant="titleMedium" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', letterSpacing: 1 }}>
                      {account.accountNumber}
                    </Text>

                    <Divider style={{ marginVertical: 12, backgroundColor: isDark ? '#2D2D44' : '#F1F5F9' }} />

                    <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                      Saldo disponible
                    </Text>
                    <Text variant="headlineSmall" style={{ color: '#0D7377', fontWeight: '700', marginTop: 2 }}>
                      {formatCurrency(account.balance)}
                    </Text>

                    <View style={styles.cardDetail}>
                      <MaterialCommunityIcons name="account" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                      <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginLeft: 8 }}>
                        {getClientName(account.clientId)}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <IconButton
                        icon="swap-horizontal"
                        size={20}
                        iconColor="#0D7377"
                        onPress={() => openStatusModal(account)}
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#0D737715' : '#0D737710' }]}
                      />
                    </View>
                  </View>
                </Surface>
              ))}
            </View>
          )}
        </ScrollView>

        {/* FAB */}
        <FAB
          icon="plus"
          onPress={() => { setFormError(''); setModalVisible(true); }}
          style={styles.fab}
          color="#FFFFFF"
          customSize={56}
        />

        {/* Create Account Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={[styles.modal, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
          >
            <Text variant="titleLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginBottom: 20 }}>
              Nueva Cuenta
            </Text>

            <Text variant="bodyMedium" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginBottom: 8 }}>
              Seleccionar Cliente (ID)
            </Text>
            <TextInput
              label="ID del Cliente"
              value={formClientId}
              onChangeText={setFormClientId}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />

            {clients.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {clients.slice(0, 10).map((c) => (
                  <Button
                    key={c.id}
                    mode={formClientId === String(c.id) ? 'contained' : 'outlined'}
                    onPress={() => setFormClientId(String(c.id))}
                    style={{ marginRight: 8, borderRadius: 20 }}
                    compact
                    buttonColor={formClientId === String(c.id) ? '#0D7377' : undefined}
                    textColor={formClientId === String(c.id) ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
                  >
                    {c.name}
                  </Button>
                ))}
              </ScrollView>
            )}

            <Text variant="bodyMedium" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginBottom: 8, marginTop: 8 }}>
              Tipo de Cuenta
            </Text>
            <SegmentedButtons
              value={formType}
              onValueChange={(v) => setFormType(v as AccountType)}
              buttons={[
                { value: 'SAVINGS', label: 'Ahorros', icon: 'piggy-bank' },
                { value: 'CURRENT', label: 'Corriente', icon: 'briefcase' },
              ]}
              style={{ marginBottom: 16 }}
            />

            {formError ? (
              <HelperText type="error" visible>
                {formError}
              </HelperText>
            ) : null}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
                textColor={isDark ? '#94A3B8' : '#6B7280'}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleCreate}
                loading={submitting}
                disabled={submitting}
                style={styles.modalBtn}
                buttonColor="#0D7377"
                textColor="#FFFFFF"
              >
                Crear Cuenta
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Update Status Modal */}
        <Portal>
          <Modal
            visible={statusModalVisible}
            onDismiss={() => setStatusModalVisible(false)}
            contentContainerStyle={[styles.modal, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
          >
            <Text variant="titleLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginBottom: 20 }}>
              Cambiar Estado
            </Text>
            {statusAccount && (
              <Text variant="bodyMedium" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginBottom: 16 }}>
                Cuenta: {statusAccount.accountNumber}
              </Text>
            )}

            <SegmentedButtons
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as AccountStatus)}
              buttons={[
                { value: 'ACTIVE', label: 'Activa' },
                { value: 'BLOCKED', label: 'Bloqueada' },
                { value: 'CLOSED', label: 'Cerrada' },
              ]}
              style={{ marginBottom: 20 }}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setStatusModalVisible(false)}
                style={styles.modalBtn}
                textColor={isDark ? '#94A3B8' : '#6B7280'}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateStatus}
                loading={submitting}
                disabled={submitting}
                style={styles.modalBtn}
                buttonColor="#0D7377"
                textColor="#FFFFFF"
              >
                Actualizar
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { fontWeight: '700', marginBottom: 12 },
  headerBar: { height: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  headerBarAccent: { width: '25%', height: '100%' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16 },
  searchbar: { borderRadius: 12, elevation: 2 },
  errorCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginHorizontal: 16, marginTop: 12 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  cardGrid: { gap: 12 },
  cardGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  accountCard: { borderRadius: 16, overflow: 'hidden' },
  accountCardWide: { width: '48%' },
  cardAccent: { height: 4 },
  cardBody: { padding: 20 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  actionBtn: { borderRadius: 12 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0D7377', borderRadius: 28 },
  modal: { margin: 20, padding: 24, borderRadius: 16, maxWidth: 500, alignSelf: 'center', width: '90%' },
  modalInput: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalBtn: { borderRadius: 10 },
});
