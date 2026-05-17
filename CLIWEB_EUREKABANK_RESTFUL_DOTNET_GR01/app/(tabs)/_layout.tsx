import React from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  StyleSheet,
  useColorScheme,
  Platform,
  useWindowDimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';

const TAB_ITEMS = [
  { name: 'index', path: '/', title: 'Inicio', icon: 'view-dashboard' as const },
  { name: 'clients', path: '/clients', title: 'Clientes', icon: 'account-group' as const },
  { name: 'accounts', path: '/accounts', title: 'Cuentas', icon: 'credit-card-multiple' as const },
  { name: 'transactions', path: '/transactions', title: 'Operaciones', icon: 'swap-horizontal-bold' as const },
  { name: 'settings', path: '/settings', title: 'Ajustes', icon: 'cog' as const },
];

/**
 * On Web with wide viewport: renders a vertical sidebar on the left.
 * On Mobile (or narrow web): renders the standard bottom tab bar.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 768;

  if (isDesktop) {
    return <DesktopLayout isDark={isDark} />;
  }

  // Mobile layout — default bottom tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D7377',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        tabBarStyle: {
          backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D44' : '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 64 : 80,
          paddingBottom: Platform.OS === 'web' ? 8 : 20,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Cuentas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Operaciones',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal-bold" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * Desktop/Web layout: vertical sidebar on the left + content area on the right.
 * Uses expo-router Tabs but hides the default tabBar, rendering a custom sidebar instead.
 */
function DesktopLayout({ isDark }: { isDark: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isExpanded = width >= 1024;

  const getIsActive = (item: typeof TAB_ITEMS[number]) => {
    if (item.name === 'index') {
      return pathname === '/' || pathname === '';
    }
    return pathname === `/${item.name}` || pathname.startsWith(`/${item.name}/`);
  };

  return (
    <View style={[styles.desktopContainer, { backgroundColor: isDark ? '#0F0F23' : '#F0F4F8' }]}>
      {/* Sidebar */}
      <View
        style={[
          styles.sidebar,
          isExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed,
          {
            backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
            borderRightColor: isDark ? '#2D2D44' : '#E2E8F0',
          },
        ]}
      >
        {/* Logo / Brand */}
        <View style={styles.sidebarBrand}>
          <View style={styles.brandIcon}>
            <MaterialCommunityIcons name="bank" size={28} color="#FFFFFF" />
          </View>
          {isExpanded && (
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandTitle}>EurekaBank</Text>
              <Text style={[styles.brandSubtitle, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                Panel Admin
              </Text>
            </View>
          )}
        </View>

        {/* Accent bar below brand */}
        <View style={styles.sidebarAccent}>
          <View style={styles.sidebarAccentBar} />
          <View style={styles.sidebarAccentGold} />
        </View>

        {/* Nav Items */}
        <ScrollView
          style={styles.navScroll}
          contentContainerStyle={styles.navContent}
          showsVerticalScrollIndicator={false}
        >
          {TAB_ITEMS.map((item) => {
            const isActive = getIsActive(item);
            return (
              <Pressable
                key={item.name}
                onPress={() => {
                  if (item.name === 'index') {
                    router.push('/(tabs)');
                  } else {
                    router.push(`/(tabs)/${item.name}` as any);
                  }
                }}
                style={({ hovered }: any) => [
                  styles.navItem,
                  isExpanded ? styles.navItemExpanded : styles.navItemCollapsed,
                  isActive && [
                    styles.navItemActive,
                    { backgroundColor: isDark ? '#0D737725' : '#0D737712' },
                  ],
                  !isActive && hovered && [
                    styles.navItemHovered,
                    { backgroundColor: isDark ? '#FFFFFF08' : '#00000006' },
                  ],
                ]}
              >
                {/* Active indicator bar */}
                {isActive && <View style={styles.activeIndicator} />}

                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={isActive ? '#0D7377' : isDark ? '#64748B' : '#94A3B8'}
                />
                {isExpanded && (
                  <Text
                    style={[
                      styles.navLabel,
                      {
                        color: isActive
                          ? '#0D7377'
                          : isDark
                          ? '#94A3B8'
                          : '#6B7280',
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bottom info */}
        {isExpanded && (
          <View style={[styles.sidebarFooter, { borderTopColor: isDark ? '#2D2D44' : '#E2E8F0' }]}>
            <Text style={[styles.footerText, { color: isDark ? '#475569' : '#CBD5E1' }]}>
              v1.0.0
            </Text>
            <Text style={[styles.footerText, { color: isDark ? '#334155' : '#E2E8F0' }]}>
              Arquitectura GR01
            </Text>
          </View>
        )}
      </View>

      {/* Content area — the actual Tab screens render here */}
      <View style={styles.contentArea}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // hide the default bottom tab bar
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="clients" />
          <Tabs.Screen name="accounts" />
          <Tabs.Screen name="transactions" />
          <Tabs.Screen name="settings" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Desktop Container ──
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Sidebar ──
  sidebar: {
    borderRightWidth: 1,
    justifyContent: 'flex-start',
  },
  sidebarExpanded: {
    width: 260,
  },
  sidebarCollapsed: {
    width: 72,
    alignItems: 'center',
  },

  // ── Brand ──
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0D7377',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTextContainer: {
    marginLeft: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D7377',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },

  // ── Accent Bar ──
  sidebarAccent: {
    height: 3,
    flexDirection: 'row',
    marginBottom: 8,
  },
  sidebarAccentBar: {
    flex: 3,
    backgroundColor: '#0D7377',
  },
  sidebarAccentGold: {
    flex: 1,
    backgroundColor: '#D4A843',
  },

  // ── Nav ──
  navScroll: {
    flex: 1,
  },
  navContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemExpanded: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navItemCollapsed: {
    paddingHorizontal: 0,
    paddingVertical: 14,
    justifyContent: 'center',
    width: 48,
  },
  navItemActive: {
    // background set dynamically
  },
  navItemHovered: {
    // background set dynamically
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#0D7377',
  },
  navLabel: {
    fontSize: 14,
    marginLeft: 14,
    letterSpacing: 0.2,
  },

  // ── Footer ──
  sidebarFooter: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },

  // ── Content Area ──
  contentArea: {
    flex: 1,
  },
});
