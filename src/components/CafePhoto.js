// Shows a café's photo if it has one, otherwise the placeholder illustration.
import { Image, View } from 'react-native';
import { imageSource } from '../data/images';
import CafeArt from './CafeArt';

export default function CafePhoto({ cafe, index = 0, style, mirror }) {
  const url = cafe?.photos?.[index];
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: '#2A2320' }, style]}>
      {url ? (
        <Image source={imageSource(url)} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <CafeArt palette={cafe?.art?.palette} mirror={mirror ?? (index % 2 === 1 ? !cafe?.art?.mirror : cafe?.art?.mirror)} />
      )}
    </View>
  );
}
