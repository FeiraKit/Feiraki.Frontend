import React from 'react';
import { Heading, HStack, VStack, useTheme } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export function CustomBottomSheet({ actionGallery, actionCamera }) {
  const { colors } = useTheme();
  return (
    <HStack justifyContent="center" mt={4}>
      <TouchableOpacity style={{ width: '45%', height: '100%' }} onPress={actionCamera}>
        <VStack alignItems="center" justifyContent="center">
          <MaterialIcons name="camera-alt" size={RFValue(70)} color={colors.gray[500]} />
          <Heading color={colors.gray[500]} fontSize={RFValue(16)}>
            Câmera
          </Heading>
        </VStack>
      </TouchableOpacity>

      <TouchableOpacity style={{ width: '45%', height: '100%' }} onPress={actionGallery}>
        <VStack alignItems="center" justifyContent="center">
          <MaterialIcons name="photo-library" size={RFValue(70)} color={colors.gray[500]} />
          <Heading color={colors.gray[500]} fontSize={RFValue(16)}>
            Galeria
          </Heading>
        </VStack>
      </TouchableOpacity>
    </HStack>
  );
}
