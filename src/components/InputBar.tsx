import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';

interface InputBarProps {
  onSubmit: (text: string) => void;
  theme: 'light' | 'dark'; // Injects dynamic design tokens tracking layer
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit, theme }) => {
  const [localQuery, setLocalQuery] = useState('');
  const isDark = theme === 'dark';

  const handleTriggerSubmit = () => {
    if (!localQuery.trim()) return;
    onSubmit(localQuery.trim());
    setLocalQuery('');
  };

  return (
    <View style={[styles.inputContainer, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
      <TextInput
        style={[
          styles.inputField,
          { 
            backgroundColor: isDark ? '#171717' : '#f4f4f4', 
            borderColor: isDark ? '#262626' : '#e5e5e5',
            color: isDark ? '#ececf1' : '#0d0d0d'
          }
        ]}
        placeholder="Message TraceFlow..."
        placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
        value={localQuery}
        onChangeText={setLocalQuery}
        onSubmitEditing={handleTriggerSubmit}
      />
      <TouchableOpacity 
        style={[styles.sendButton, { backgroundColor: isDark ? '#b4b4b4' : '#000000' }]} 
        onPress={handleTriggerSubmit}
      >
        <Text style={[styles.sendButtonText, { color: isDark ? '#0d0d0d' : '#ffffff' }]}>➔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { 
    flexDirection: 'row', 
    paddingVertical: 16, 
    alignItems: 'center',
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center'
  },
  inputField: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: { fontSize: 16, fontWeight: 'bold' }
});
