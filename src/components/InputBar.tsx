import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';

interface InputBarProps {
  onSubmit: (text: string) => void;
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit }) => {
  const [localQuery, setLocalQuery] = useState('');

  const handleTriggerSubmit = () => {
    if (!localQuery.trim()) return;
    onSubmit(localQuery.trim());
    setLocalQuery('');
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.inputField}
        placeholder="Message OmniChat..."
        placeholderTextColor="#525252"
        value={localQuery}
        onChangeText={setLocalQuery}
        onSubmitEditing={handleTriggerSubmit}
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleTriggerSubmit}>
        <Text style={styles.sendButtonText}>➔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { 
    flexDirection: 'row', 
    paddingVertical: 16, 
    backgroundColor: '#0d0d0d', // Tied into the main dark canvas environment
    alignItems: 'center',
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center'
  },
  inputField: {
    flex: 1,
    height: 48,
    backgroundColor: '#171717',
    borderRadius: 24,
    paddingHorizontal: 20,
    color: '#ececf1',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#262626'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#b4b4b4', // Softer, non-glare send button asset
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: { color: '#0d0d0d', fontSize: 16, fontWeight: 'bold' }
});
