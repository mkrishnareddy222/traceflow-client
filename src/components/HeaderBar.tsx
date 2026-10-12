import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { WorkspaceTab } from '../types/chat';

interface HeaderBarProps {
  provider: string;
  isMobile: boolean;
  onToggleMenu: () => void;
  theme: 'light' | 'dark';
  onNewChat: () => void;
  activeTab?: WorkspaceTab;
  onTabChange?: (tab: WorkspaceTab) => void;
}

const workspaceTabs: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: 'knowledge', label: 'Knowledge', icon: '▣' },
  { id: 'processing', label: 'Processing', icon: '⚙' },
  { id: 'chat', label: 'Chat', icon: '✦' },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  provider,
  isMobile,
  onToggleMenu,
  theme,
  onNewChat,
  activeTab,
  onTabChange,
}) => {
  const isDark = theme === 'dark';
  const renderWorkspaceTabs = (mobile = false) => (
    <View style={[
      styles.workspaceTabs,
      mobile && styles.workspaceTabsMobile,
      { backgroundColor: isDark ? '#101215' : '#f4f4f5', borderColor: isDark ? '#24272c' : '#e4e4e7' },
    ]}>
      {workspaceTabs.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onTabChange?.(tab.id)}
            style={[
              styles.workspaceTab,
              mobile && styles.workspaceTabMobile,
              selected && { backgroundColor: isDark ? '#22252a' : '#ffffff' },
            ]}
          >
            <Text style={[styles.workspaceTabIcon, { color: selected ? '#10b981' : isDark ? '#858991' : '#71717a' }]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.workspaceTabText,
              { color: selected ? (isDark ? '#e4e4e7' : '#27272a') : isDark ? '#858991' : '#71717a' },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.header}>
      <View style={[
        styles.topbar,
        isMobile && styles.topbarMobile,
        { backgroundColor: isDark ? '#090a0c' : '#ffffff', borderBottomColor: isDark ? '#202226' : '#e5e7eb' },
      ]}>
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
        {activeTab && onTabChange && !isMobile && renderWorkspaceTabs()}
        <View style={styles.headerIconsRow}>
          <View style={styles.engineBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{provider.toUpperCase()}</Text>
          </View>
          {!isMobile && (
            <>
              <Text accessibilityLabel="Search" style={[styles.iconGhost, { color: isDark ? '#8b8d92' : '#71717a' }]}>⌕</Text>
              <Text accessibilityLabel="Conversation history" style={[styles.iconGhost, { color: isDark ? '#8b8d92' : '#71717a' }]}>◴</Text>
            </>
          )}
          {isMobile ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open settings" onPress={onToggleMenu} style={styles.iconButton}>
              <Text style={[styles.iconGhost, { color: isDark ? '#a1a1aa' : '#52525b' }]}>⚙</Text>
            </TouchableOpacity>
          ) : (
            <Text accessibilityLabel="Settings" style={[styles.iconGhost, { color: isDark ? '#a1a1aa' : '#52525b' }]}>⚙</Text>
          )}
        </View>
      </View>
      {activeTab && onTabChange && isMobile && renderWorkspaceTabs(true)}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { width: '100%' },
  topbar: { height: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26, borderBottomWidth: 1, zIndex: 10, width: '100%', position: 'relative' },
  topbarMobile: { height: 56, paddingHorizontal: 14 },
  mobileBrandRow: { flexDirection: 'row', alignItems: 'center' },
  mobileBrandText: { fontSize: 16, fontWeight: '700' },
  hamburgerButton: { marginRight: 12 },
  newChatButton: { height: 34, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  newChatIcon: { fontSize: 16, marginRight: 6 },
  newChatText: { fontSize: 11, fontWeight: '500' },
  workspaceTabs: { height: 36, position: 'absolute', left: '50%', marginLeft: -120, top: 16, flexDirection: 'row', alignItems: 'center', padding: 4, borderRadius: 9, borderWidth: 1 },
  workspaceTabsMobile: { position: 'relative', left: 0, marginLeft: 0, top: 0, height: 40, width: '100%', alignSelf: 'stretch', marginVertical: 7, paddingHorizontal: 5, justifyContent: 'space-around' },
  workspaceTab: { height: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 6 },
  workspaceTabMobile: { flex: 1, height: 30, paddingHorizontal: 4 },
  workspaceTabIcon: { fontSize: 10 },
  workspaceTabText: { fontSize: 9, fontWeight: '600' },
  engineBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 3, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#10b981', marginRight: 6 },
  statusText: { color: '#71717a', fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
  headerIconsRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  iconButton: { minWidth: 22, minHeight: 28, justifyContent: 'center', alignItems: 'center' },
  iconGhost: { fontSize: 17, lineHeight: 24, fontWeight: '400' }
});
