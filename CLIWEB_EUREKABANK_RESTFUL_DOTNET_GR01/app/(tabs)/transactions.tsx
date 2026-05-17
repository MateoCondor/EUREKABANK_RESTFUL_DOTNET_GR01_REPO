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
  Portal,
  Modal,
  TextInput,
  Button,
  Divider,
  ActivityIndicator,
  SegmentedButtons,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  transactionsApi,
  accountsApi,
  type TransactionResponse,
  type AccountResponse,
  type TransferType,
} from '@/services/api';

type OperationType = 'deposit' | 'withdraw' | 'transfer';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search by account
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Operation modal
  const [modalVisible, setModalVisible] = useState(false);
  const [opType, setOpType] = useState<OperationType>('deposit');
  const [formAccountId, setFormAccountId] = useState('');
  const [formTargetAccountId, setFormTargetAccountId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTransferType, setFormTransferType] = useState<TransferType>('CREDIT');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const accs = await accountsApi.getAll();
      setAccounts(accs);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cuentas');
    }
  }, []);

  const loadTransactions = useCallback(async (accountId?: string) => {
    try {
      setError('');
      if (accountId && accountId.trim()) {
        const txns = await transactionsApi.getByAccount(Number(accountId));
        setTransactions(txns);
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar transacciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts().then(() => setLoading(false));
  }, [loadAccounts]);

  const handleSearchAccount = () => {
    if (selectedAccountId.trim()) {
      setLoading(true);
      loadTransactions(selectedAccountId);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'arrow-down-bold';
      case 'WITHDRAW': return 'arrow-up-bold';
      case 'TRANSFER': return 'swap-horizontal-bold';
      default: return 'help-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return '#2ECC71';
      case 'WITHDRAW': return '#CF6679';
      case 'TRANSFER': return '#D4A843';
      default: return '#94A3B8';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'Depósito';
      case 'WITHDRAW': return 'Retiro';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  };

  const openModal = (type: OperationType) => {
    setOpType(type);
    setFormAccountId('');
    setFormTargetAccountId('');
    setFormAmount('');
    setFormDescription('');
    setFormTransferType('CREDIT');
    setFormError('');
    setModalVisible(true);
  };

  const handleSubmitOperation = async () => {
    if (!formAccountId.trim() || !formAmount.trim()) {
      setFormError('Cuenta y monto son obligatorios');
      return;
    }
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Ingrese un monto válido');
      return;
    }
    if (opType === 'transfer' && !formTargetAccountId.trim()) {
      setFormError('Cuenta destino es obligatoria');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (opType === 'deposit') {
        await transactionsApi.deposit({
          accountId: Number(formAccountId),
          amount,
          description: formDescription || 'Depósito',
        });
      } else if (opType === 'withdraw') {
        await transactionsApi.withdraw({
          accountId: Number(formAccountId),
          amount,
          description: formDescription || 'Retiro',
        });
      } else {
        await transactionsApi.transfer({
          sourceAccountId: Number(formAccountId),
          targetAccountId: Number(formTargetAccountId),
          amount,
          description: formDescription || 'Transferencia',
          transferType: formTransferType,
        });
      }
      setModalVisible(false);
      // Reload transactions for the selected account
      if (selectedAccountId.trim()) {
        loadTransactions(selectedAccountId);
      }
      loadAccounts();
    } catch (err: any) {
      setFormError(err.message || 'Error al realizar operación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: isDark ? '#E2E8F0' : '#1A1A2E' }]}>
          Operaciones Bancarias
        </Text>
        <View style={[styles.headerBar, { backgroundColor: '#0D7377' }]}>
          <View style={[styles.headerBarAccent, { backgroundColor: '#D4A843' }]} />
        </View>
      </View>

      {/* Operation Buttons */}
      <View style={styles.opButtonsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.opButtons}>
          <Button
            mode="contained"
            icon="arrow-down-bold"
            onPress={() => openModal('deposit')}
            style={[styles.opButton, { backgroundColor: '#2ECC71' }]}
            textColor="#FFFFFF"
            compact
          >
            Depositar
          </Button>
          <Button
            mode="contained"
            icon="arrow-up-bold"
            onPress={() => openModal('withdraw')}
            style={[styles.opButton, { backgroundColor: '#CF6679' }]}
            textColor="#FFFFFF"
            compact
          >
            Retirar
          </Button>
          <Button
            mode="contained"
            icon="swap-horizontal-bold"
            onPress={() => openModal('transfer')}
            style={[styles.opButton, { backgroundColor: '#D4A843' }]}
            textColor="#FFFFFF"
            compact
          >
            Transferir
          </Button>
        </ScrollView>
      </View>

      {/* Account selector */}
      <View style={styles.accountSelector}>
        <TextInput
          label="ID de Cuenta"
          value={selectedAccountId}
          onChangeText={setSelectedAccountId}
          mode="outlined"
          keyboardType="numeric"
          style={{ flex: 1, marginRight: 8 }}
          outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
          activeOutlineColor="#0D7377"
          textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
          dense
        />
        <Button
          mode="contained"
          onPress={handleSearchAccount}
          buttonColor="#0D7377"
          textColor="#FFFFFF"
          style={{ borderRadius: 10, alignSelf: 'center' }}
        >
          Buscar
        </Button>
      </View>

      {/* Quick account chips */}
      {accounts.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {accounts.slice(0, 8).map((acc) => (
            <Button
              key={acc.id}
              mode={selectedAccountId === String(acc.id) ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedAccountId(String(acc.id));
                setLoading(true);
                loadTransactions(String(acc.id));
              }}
              style={{ marginRight: 8, borderRadius: 20 }}
              compact
              buttonColor={selectedAccountId === String(acc.id) ? '#0D7377' : undefined}
              textColor={selectedAccountId === String(acc.id) ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
            >
              {acc.accountNumber}
            </Button>
          ))}
        </ScrollView>
      )}

      {error ? (
        <Surface style={[styles.errorCard, { backgroundColor: isDark ? '#3B1A1A' : '#FEF2F2' }]} elevation={1}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#CF6679" />
          <Text style={{ color: '#CF6679', marginLeft: 8, flex: 1 }}>{error}</Text>
        </Surface>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTransactions(selectedAccountId);
            }}
            colors={['#0D7377']}
          />
        }
      >
        {!selectedAccountId.trim() ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={64} color={isDark ? '#2D2D44' : '#CBD5E1'} />
            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 12, fontSize: 16, textAlign: 'center' }}>
              Seleccione una cuenta para ver su historial de transacciones
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt" size={64} color={isDark ? '#2D2D44' : '#CBD5E1'} />
            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', marginTop: 12, fontSize: 16 }}>
              No hay transacciones para esta cuenta
            </Text>
          </View>
        ) : (
          <View>
            <Text variant="titleMedium" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginBottom: 16 }}>
              Historial de Transacciones
            </Text>
            {transactions.map((txn, index) => (
              <Surface
                key={txn.id}
                style={[styles.txnCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
                elevation={1}
              >
                <View style={styles.txnRow}>
                  <View style={[styles.txnIcon, { backgroundColor: `${getTypeColor(txn.type)}20` }]}>
                    <MaterialCommunityIcons
                      name={getTypeIcon(txn.type)}
                      size={24}
                      color={getTypeColor(txn.type)}
                    />
                  </View>
                  <View style={styles.txnInfo}>
                    <Text variant="bodyLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600' }}>
                      {getTypeLabel(txn.type)}
                    </Text>
                    <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                      {txn.description}
                    </Text>
                    <Text variant="bodySmall" style={{ color: isDark ? '#475569' : '#CBD5E1', marginTop: 2 }}>
                      {formatDate(txn.date)}
                    </Text>
                  </View>
                  <View style={styles.txnAmountContainer}>
                    <Text
                      variant="titleMedium"
                      style={{
                        color: txn.type === 'DEPOSIT' ? '#2ECC71' : txn.type === 'WITHDRAW' ? '#CF6679' : '#D4A843',
                        fontWeight: '700',
                      }}
                    >
                      {txn.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </Text>
                    {txn.fee > 0 && (
                      <Text variant="bodySmall" style={{ color: '#CF6679', fontSize: 10 }}>
                        Comisión: {formatCurrency(txn.fee)}
                      </Text>
                    )}
                  </View>
                </View>
                {txn.type === 'TRANSFER' && (
                  <View style={[styles.transferInfo, { borderTopColor: isDark ? '#2D2D44' : '#F1F5F9' }]}>
                    <Text variant="bodySmall" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                      Origen: #{txn.sourceAccountId} → Destino: #{txn.targetAccountId}
                      {txn.transferType ? ` • ${txn.transferType === 'CREDIT' ? 'Crédito' : 'Débito'}` : ''}
                    </Text>
                  </View>
                )}
              </Surface>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Operation Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
        >
          <ScrollView>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name={
                  opType === 'deposit'
                    ? 'arrow-down-bold'
                    : opType === 'withdraw'
                    ? 'arrow-up-bold'
                    : 'swap-horizontal-bold'
                }
                size={28}
                color={
                  opType === 'deposit' ? '#2ECC71' : opType === 'withdraw' ? '#CF6679' : '#D4A843'
                }
              />
              <Text variant="titleLarge" style={{ color: isDark ? '#E2E8F0' : '#1A1A2E', fontWeight: '600', marginLeft: 12 }}>
                {opType === 'deposit'
                  ? 'Nuevo Depósito'
                  : opType === 'withdraw'
                  ? 'Nuevo Retiro'
                  : 'Nueva Transferencia'}
              </Text>
            </View>

            <TextInput
              label={opType === 'transfer' ? 'Cuenta Origen (ID)' : 'Cuenta (ID)'}
              value={formAccountId}
              onChangeText={setFormAccountId}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
            />

            {/* Quick account chips in modal */}
            {accounts.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {accounts.filter((a) => a.status === 'ACTIVE').slice(0, 6).map((acc) => (
                  <Button
                    key={acc.id}
                    mode={formAccountId === String(acc.id) ? 'contained' : 'outlined'}
                    onPress={() => setFormAccountId(String(acc.id))}
                    style={{ marginRight: 6, borderRadius: 20 }}
                    compact
                    buttonColor={formAccountId === String(acc.id) ? '#0D7377' : undefined}
                    textColor={formAccountId === String(acc.id) ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
                  >
                    {acc.accountNumber}
                  </Button>
                ))}
              </ScrollView>
            )}

            {opType === 'transfer' && (
              <>
                <TextInput
                  label="Cuenta Destino (ID)"
                  value={formTargetAccountId}
                  onChangeText={setFormTargetAccountId}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
                  activeOutlineColor="#0D7377"
                  textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
                />

                <Text variant="bodyMedium" style={{ color: isDark ? '#94A3B8' : '#6B7280', marginBottom: 8 }}>
                  Tipo de Transferencia
                </Text>
                <SegmentedButtons
                  value={formTransferType}
                  onValueChange={(v) => setFormTransferType(v as TransferType)}
                  buttons={[
                    { value: 'CREDIT', label: 'Crédito' },
                    { value: 'DEBIT', label: 'Débito' },
                  ]}
                  style={{ marginBottom: 16 }}
                />
              </>
            )}

            <TextInput
              label="Monto ($)"
              value={formAmount}
              onChangeText={setFormAmount}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.modalInput}
              outlineColor={isDark ? '#2D2D44' : '#E2E8F0'}
              activeOutlineColor="#0D7377"
              textColor={isDark ? '#E2E8F0' : '#1A1A2E'}
              left={<TextInput.Affix text="$" />}
            />

            <TextInput
              label="Descripción (opcional)"
              value={formDescription}
              onChangeText={setFormDescription}
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
                onPress={handleSubmitOperation}
                loading={submitting}
                disabled={submitting}
                style={styles.modalBtn}
                buttonColor={
                  opType === 'deposit' ? '#2ECC71' : opType === 'withdraw' ? '#CF6679' : '#D4A843'
                }
                textColor="#FFFFFF"
              >
                Confirmar
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
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { fontWeight: '700', marginBottom: 12 },
  headerBar: { height: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  headerBarAccent: { width: '25%', height: '100%' },
  opButtonsContainer: { paddingTop: 16 },
  opButtons: { paddingHorizontal: 16, gap: 8 },
  opButton: { borderRadius: 12 },
  accountSelector: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-end' },
  chipsScroll: { paddingHorizontal: 16, paddingTop: 12, maxHeight: 48 },
  errorCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginHorizontal: 16, marginTop: 12 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  txnCard: { borderRadius: 12, padding: 16, marginBottom: 10 },
  txnRow: { flexDirection: 'row', alignItems: 'center' },
  txnIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txnInfo: { flex: 1 },
  txnAmountContainer: { alignItems: 'flex-end' },
  transferInfo: { borderTopWidth: 1, marginTop: 12, paddingTop: 8 },
  modal: { margin: 20, padding: 24, borderRadius: 16, maxWidth: 500, alignSelf: 'center', width: '90%', maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalInput: { marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalBtn: { borderRadius: 10 },
});
