import { Image, StyleSheet, Text, View } from 'react-native';
import { imageSource } from '../data/images';
import { colors, fonts } from '../theme';

export default function Avatar({ name, uri, size = 58, tone = 'light' }) {
  const light = tone === 'light';
  return (
    <View style={[s.ring, { width: size + 9, height: size + 9, borderRadius: (size + 9) / 2 }]}>
      <View style={[s.inner, { width: size, height: size, borderRadius: size / 2, backgroundColor: light ? colors.softWhite : colors.navy }]}>
        {uri ? <Image source={imageSource(uri)} style={{ width: size, height: size }} resizeMode="cover" /> : (
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: size * 0.42, color: light ? colors.navy : colors.softWhite }}>
            {(name || '?').slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ring: { borderWidth: 1.5, borderColor: colors.steel, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
