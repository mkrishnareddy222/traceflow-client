import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface HeaderBarProps {
  provider: string;
  isMobile: boolean;
  onToggleMenu: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ provider, isMobile, onToggleMenu }) => {
  return (
    <View style={styles.topbar}>
      <View style={styles.brandContainer}>
        {isMobile && (
          <TouchableOpacity style={styles.hamburgerButton} onPress={onToggleMenu}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
        )}
        <View style={styles.mark}><Text style={styles.markText}>T</Text></View>
        <Text style={styles.brandText}>Trace<Text style={styles.brandSpan}>Flow</Text></Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{provider.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#171717', zIndex: 10 },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  hamburgerButton: { flexDirection: 'column', justifyContent: 'space-between', width: 20, height: 13, marginRight: 12 },
  hamburgerLine: { width: '100%', height: 2, backgroundColor: '#737373', borderRadius: 1 },
  mark: { width: 22, height: 22, borderRadius: 5, backgroundColor: '#a3a3a3', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  markText: { color: '#0d0d0d', fontWeight: '900', fontSize: 12 },
  brandText: { color: '#ececf1', fontSize: 15, fontWeight: '800' },
  brandSpan: { color: '#737373', fontWeight: '500' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 6 },
  statusText: { color: '#525252', fontSize: 11, fontWeight: '600' },
});
