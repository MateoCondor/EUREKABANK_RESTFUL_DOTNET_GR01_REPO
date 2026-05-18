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
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clientsApi, type ClientResponse, type ClientRequest } from '@/services/api';

export default function ClientsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [filtered, setFiltered] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null);
  const [form, setForm] = useState<ClientRequest>({
    name: '',
    dni: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      setError('');
      const data = await clientsApi.getAll();
      setClients(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(clients);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.dni.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        ),
      );
    }
  }, [searchQuery, clients]);

  const openCreate = () => {
    setModalMode('create');
    setEditingClient(null);
    setForm({ name: '', dni: '', email: '', phone: '', username: '', password: '' });
    setFormError('');
    setModalVisible(true);
  };

  const openEdit = (client: ClientResponse) => {
    setModalMode('edit');
    setEditingClient(client);
    setForm({
      name: client.name,
      dni: client.dni,
      email: client.email,
      phone: client.phone,
      username: client.username,
      password: '',
    });
    setFormError('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.dni || !form.email) {
      setFormError('Nombre, DNI y email son obligatorios');
      return;
    }
    if (modalMode === 'create' && (!form.username || !form.password)) {
      setFormError('Usuario y contraseña son obligatorios');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (modalMode === 'create') {
        await clientsApi.create(form);
      } else if (editingClient) {
        await clientsApi.update(editingClient.id, form);
      }
      setModalVisible(false);
      loadClients();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await clientsApi.delete(id);
      loadClients();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
        <ActivityIndicator size="large" color="#0D7377" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}>
          Gestión de Clientes
        </Text>
        <View style={[styles.headerBar, { backgroundColor: '#0D7377' }]}>
          <View style={[styles.headerBarAccent, { backgroundColor: '#D4A843' }]} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por nombre, DNI o email..."
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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadClients(); }} colors={['#0D7377']} />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={64} color={isDark ? '#2D2D44' : '#CBD5E1'} />
            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 12, fontSize: 16 }}>
              No se encontraron clientes
            </Text>
          </View>
        ) : (
          <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
            {filtered.map((client) => (
              <Surface
                key={client.id}
                style={[
                  styles.clientCard,
                  isWide && styles.clientCardWide,
                  { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' },
                ]}
                elevation={2}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: '#0D737720' }]}>
                    <Text style={{ color: '#0D7377', fontWeight: '700', fontSize: 20 }}>
                      {client.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <Text variant="titleMedium" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600' }}>
                      {client.name}
                    </Text>
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
                </View>

                <Divider style={{ marginVertical: 12, backgroundColor: isDark ? '#2D2D44' : '#F1F5F9' }} />

                <View style={styles.cardDetail}>
                  <MaterialCommunityIcons name="card-account-details" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginLeft: 8 }}>
                    DNI: {client.dni}
                  </Text>
                </View>
                <View style={styles.cardDetail}>
                  <MaterialCommunityIcons name="email" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginLeft: 8 }}>
                    {client.email}
                  </Text>
                </View>
                <View style={styles.cardDetail}>
                  <MaterialCommunityIcons name="phone" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginLeft: 8 }}>
                    {client.phone || 'Sin teléfono'}
                  </Text>
                </View>
                <View style={styles.cardDetail}>
                  <MaterialCommunityIcons name="account" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text variant="bodySmall" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginLeft: 8 }}>
                    Usuario: {client.username}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    iconColor="#D4A843"
                    onPress={() => openEdit(client)}
                    style={[styles.actionBtn, { backgroundColor: isDark ? '#D4A84315' : '#D4A84310' }]}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#CF6679"
                    onPress={() => handleDelete(client.id)}
                    style={[styles.actionBtn, { backgroundColor: isDark ? '#CF667915' : '#CF667910' }]}
                  />
                </View>
              </Surface>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        onPress={openCreate}
        style={styles.fab}
        color="#FFFFFF"
        customSize={56}
      />

      {/* Modal Create/Edit */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' },
          ]}
        >
          <ScrollView>
            <Text variant="titleLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginBottom: 20 }}>
              {modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
            </Text>

            <TextInput
              label="Nombre completo"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              mode="outlined"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />
            <TextInput
              label="DNI / Cédula"
              value={form.dni}
              onChangeText={(v) => setForm({ ...form, dni: v })}
              mode="outlined"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />
            <TextInput
              label="Email"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />
            <TextInput
              label="Teléfono"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />

            {modalMode === 'create' && (
              <>
                <Divider style={{ marginVertical: 12, backgroundColor: isDark ? '#2D2D44' : '#E2E8F0' }} />
                <Text variant="bodyMedium" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginBottom: 12 }}>
                  Credenciales de acceso
                </Text>
                <TextInput
                  label="Usuario"
                  value={form.username}
                  onChangeText={(v) => setForm({ ...form, username: v })}
                  mode="outlined"
                  autoCapitalize="none"
                  style={styles.modalInput}
                  outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
                  activeOutlineColor="#0D7377"
                  textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
                />
                <TextInput
                  label="Contraseña"
                  value={form.password}
                  onChangeText={(v) => setForm({ ...form, password: v })}
                  mode="outlined"
                  secureTextEntry
                  style={styles.modalInput}
                  outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
                  activeOutlineColor="#0D7377"
                  textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
                />
              </>
            )}

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
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
                style={styles.modalBtn}
                buttonColor="#0D7377"
                textColor="#FFFFFF"
              >
                {modalMode === 'create' ? 'Crear' : 'Guardar'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
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
  clientCard: { borderRadius: 16, padding: 20 },
  clientCardWide: { width: '48%' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardHeaderInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cardDetail: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 4 },
  actionBtn: { borderRadius: 12 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0D7377', borderRadius: 28 },
  modal: { margin: 20, padding: 24, borderRadius: 16, maxWidth: 500, alignSelf: 'center', width: '90%' },
  modalInput: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalBtn: { borderRadius: 10 },
});
