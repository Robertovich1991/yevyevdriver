import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

interface Props {
  value: string[];
  onChange: (uris: string[]) => void;
}

export const CarPhotosUploader: React.FC<Props> = ({ value, onChange }) => {
  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.length) {
      return;
    }

    const uri = result.assets[0]?.uri;
    if (uri && value.length < 3) {
      onChange([...value, uri]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Car photos (2–3)</Text>
      <View style={styles.row}>
        {value.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.photo} />
        ))}
        {value.length < 3 && (
          <TouchableOpacity style={styles.add} onPress={pickImage}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: { fontWeight: '500', marginBottom: 6, color: '#333' },
  row: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 72, height: 72, borderRadius: 8, marginRight: 8 },
  add: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  addText: { fontSize: 28, color: '#2563EB' },
});


