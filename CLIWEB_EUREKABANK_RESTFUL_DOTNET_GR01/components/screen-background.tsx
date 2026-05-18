import React from 'react';
import { ImageBackground, StyleSheet, useColorScheme } from 'react-native';

const backgroundImage = require('../assets/images/sulivan.png');

type ScreenBackgroundProps = {
  children: React.ReactNode;
};

export function ScreenBackground({ children }: ScreenBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseColor = isDark ? '#0F0F23' : '#F0F4F8';
  const imageOpacity = isDark ? 0.14 : 0.5;
  const blurRadius = isDark ? 0 : 0;

  return (
    <ImageBackground
      source={backgroundImage}
      blurRadius={blurRadius}
      style={[styles.root, { backgroundColor: baseColor }]}
      imageStyle={[styles.image, { opacity: imageOpacity }]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  image: {
    transform: [{ scale: 1.05 }],
  },
});
