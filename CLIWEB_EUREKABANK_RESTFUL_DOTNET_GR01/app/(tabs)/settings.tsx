import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Divider,
  ActivityIndicator,
  IconButton,
  Portal,
  Modal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { parametersApi, type ParameterResponse } from '@/services/api';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { username, role, logout } = useAuth();

  const [parameters, setParameters] = useState<ParameterResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Parameter modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editParam, setEditParam] = useState<ParameterResponse | null>(null);
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadParameters = useCallback(async () => {
    try {
      setError('');
      const data = await parametersApi.getAll();
      setParameters(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar parámetros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadParameters();
  }, [loadParameters]);

  const openCreate = () => {
    setModalMode('create');
    setEditParam(null);
    setFormKey('');
    setFormValue('');
    setFormDesc('');
    setFormError('');
    setModalVisible(true);
  };

  const openEdit = (param: ParameterResponse) => {
    setModalMode('edit');
    setEditParam(param);
    setFormKey(param.key);
    setFormValue(param.value);
    setFormDesc(param.description);
    setFormError('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formKey.trim() || !formValue.trim()) {
      setFormError('Clave y valor son obligatorios');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (modalMode === 'create') {
        await parametersApi.create({
          key: formKey,
          value: formValue,
          description: formDesc,
        });
      } else if (editParam) {
        await parametersApi.update(editParam.id, {
          key: formKey,
          value: formValue,
          description: formDesc,
        });
      }
      setModalVisible(false);
      loadParameters();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar parámetro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}>
          Ajustes y Parámetros
        </Text>
        <View style={[styles.headerBar, { backgroundColor: '#0D7377' }]}>
          <View style={[styles.headerBarAccent, { backgroundColor: '#D4A843' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadParameters(); }} colors={['#0D7377']} />
        }
      >
        {/* User Info Card */}
        <Surface
          style={[styles.card, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
          elevation={2}
        >
          <View style={styles.userSection}>
            <View style={[styles.userAvatar, { backgroundColor: '#0D737720' }]}>
              <MaterialCommunityIcons name="account-circle" size={40} color="#0D7377" />
            </View>
            <View style={styles.userInfo}>
              <Text variant="titleMedium" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600' }}>
                {username ?? 'Usuario'}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: '#0D737720' }]}>
                <Text style={{ color: '#0D7377', fontSize: 11, fontWeight: '600' }}>
                  {role ?? 'USER'}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={{ marginVertical: 16, backgroundColor: isDark ? '#2D2D44' : '#E2E8F0' }} />

          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogout}
            textColor="#CF6679"
            style={[styles.logoutBtn, { borderColor: '#CF667940' }]}
          >
            Cerrar Sesión
          </Button>
        </Surface>

        {/* System Parameters */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleMedium" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600' }}>
            Parámetros del Sistema
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={openCreate}
            compact
            buttonColor="#0D7377"
            textColor="#FFFFFF"
            style={{ borderRadius: 10 }}
          >
            Nuevo
          </Button>
        </View>

        {error ? (
          <Surface style={[styles.errorCard, { backgroundColor: isDark ? '#3B1A1A' : '#FEF2F2' }]} elevation={1}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#CF6679" />
            <Text style={{ color: '#CF6679', marginLeft: 8, flex: 1 }}>{error}</Text>
          </Surface>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#0D7377" style={{ marginTop: 32 }} />
        ) : parameters.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cog-off" size={48} color={isDark ? '#2D2D44' : '#CBD5E1'} />
            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 12 }}>
              No hay parámetros configurados
            </Text>
          </View>
        ) : (
          parameters.map((param) => (
            <Surface
              key={param.id}
              style={[styles.paramCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
              elevation={1}
            >
              <View style={styles.paramRow}>
                <View style={[styles.paramIcon, { backgroundColor: isDark ? '#D4A84315' : '#D4A84310' }]}>
                  <MaterialCommunityIcons name="key-variant" size={20} color="#D4A843" />
                </View>
                <View style={styles.paramInfo}>
                  <Text variant="bodyLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600' }}>
                    {param.key}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: '#0D7377', fontWeight: '500', marginTop: 2 }}>
                    {param.value}
                  </Text>
                  {param.description ? (
                    <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 4 }}>
                      {param.description}
                    </Text>
                  ) : null}
                </View>
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor="#D4A843"
                  onPress={() => openEdit(param)}
                  style={[styles.editBtn, { backgroundColor: isDark ? '#D4A84315' : '#D4A84310' }]}
                />
              </View>
            </Surface>
          ))
        )}

        {/* App Info */}
        <Surface
          style={[styles.card, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF', marginTop: 24 }]}
          elevation={1}
        >
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="bank" size={32} color="#0D7377" />
            <Text variant="bodyLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginTop: 8 }}>
              EurekaBank Mobile & Web
            </Text>
            <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 4 }}>
              Versión 1.0.0 • Arquitectura GR01
            </Text>
            <Text variant="bodySmall" style={{ color: isDark ? '#475569' : '#CBD5E1', marginTop: 2 }}>
              Powered by Jakarta EE + React Native
            </Text>
          </View>
        </Surface>
      </ScrollView>

      {/* Parameter Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
        >
          <Text variant="titleLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginBottom: 20 }}>
            {modalMode === 'create' ? 'Nuevo Parámetro' : 'Editar Parámetro'}
          </Text>

          <TextInput
            label="Clave"
            value={formKey}
            onChangeText={setFormKey}
            mode="outlined"
            style={styles.modalInput}
            outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
            activeOutlineColor="#0D7377"
            textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            disabled={modalMode === 'edit'}
          />
          <TextInput
            label="Valor"
            value={formValue}
            onChangeText={setFormValue}
            mode="outlined"
            style={styles.modalInput}
            outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
            activeOutlineColor="#0D7377"
            textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
          />
          <TextInput
            label="Descripción (opcional)"
            value={formDesc}
            onChangeText={setFormDesc}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.modalInput}
            outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
            activeOutlineColor="#0D7377"
            textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
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
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { fontWeight: '700', marginBottom: 12 },
  headerBar: { height: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  headerBarAccent: { width: '25%', height: '100%' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 20, marginBottom: 16 },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  userInfo: { flex: 1 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  logoutBtn: { borderRadius: 12, borderWidth: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  errorCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  paramCard: { borderRadius: 12, padding: 16, marginBottom: 8 },
  paramRow: { flexDirection: 'row', alignItems: 'center' },
  paramIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  paramInfo: { flex: 1 },
  editBtn: { borderRadius: 12 },
  modal: { margin: 20, padding: 24, borderRadius: 16, maxWidth: 500, alignSelf: 'center', width: '90%' },
  modalInput: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalBtn: { borderRadius: 10 },
});
