import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface HeaderBarProps {
  provider: string;
  isMobile: boolean;
  onToggleMenu: () => void;
  theme: 'light' | 'dark';
  onNewChat: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ provider, isMobile, onToggleMenu, theme, onNewChat }) => {
  const isDark = theme === 'dark';

  return (
    <View style={[styles.topbar, { backgroundColor: isDark ? '#090a0c' : '#ffffff', borderBottomColor: isDark ? '#202226' : '#e5e7eb' }]}>
      {isMobile ? (
        <View style={styles.mobileBrandRow}>
          <TouchableOpacity style={styles.hamburgerButton} onPress={onToggleMenu} accessibilityLabel="Open settings">
            <Text style={{ color: isDark ? '#a1a1aa' : '#52525b', fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
          <Text style={[styles.mobileBrandText, { color: isDark ? '#f4f4f5' : '#18181b' }]}>TraceFlow</Text>
        </View>
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onNewChat}
          style={[styles.newChatButton, { backgroundColor: isDark ? '#0d0f12' : '#ffffff', borderColor: isDark ? '#24272c' : '#e4e4e7' }]}
        >
          <Text style={[styles.newChatIcon, { color: isDark ? '#a1a1aa' : '#52525b' }]}>＋</Text>
          <Text style={[styles.newChatText, { color: isDark ? '#a1a1aa' : '#52525b' }]}>New conversation</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerIconsRow}>
        <View style={styles.engineBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{provider.toUpperCase()}</Text>
        </View>
        <Text accessibilityLabel="Search" style={[styles.iconGhost, { color: isDark ? '#8b8d92' : '#71717a' }]}>⌕</Text>
        <Text accessibilityLabel="Conversation history" style={[styles.iconGhost, { color: isDark ? '#8b8d92' : '#71717a' }]}>◴</Text>
        {isMobile ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open settings" onPress={onToggleMenu} style={styles.iconButton}>
            <Text style={[styles.iconGhost, { color: isDark ? '#a1a1aa' : '#52525b' }]}>⚙</Text>
          </TouchableOpacity>
        ) : (
          <Text accessibilityLabel="Settings" style={[styles.iconGhost, { color: isDark ? '#a1a1aa' : '#52525b' }]}>⚙</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbar: { height: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26, borderBottomWidth: 1, zIndex: 10, width: '100%' },
  mobileBrandRow: { flexDirection: 'row', alignItems: 'center' },
  mobileBrandText: { fontSize: 16, fontWeight: '700' },
  hamburgerButton: { marginRight: 12 },
  newChatButton: { height: 34, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  newChatIcon: { fontSize: 16, marginRight: 6 },
  newChatText: { fontSize: 11, fontWeight: '500' },
  engineBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 3, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#10b981', marginRight: 6 },
  statusText: { color: '#71717a', fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
  headerIconsRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  iconButton: { minWidth: 22, minHeight: 28, justifyContent: 'center', alignItems: 'center' },
  iconGhost: { fontSize: 17, lineHeight: 24, fontWeight: '400' }
});
