import React from 'react';
import { VStack, Image, Text, useTheme, Button } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardTitle } from './onboardTitle';
import { StepIndicator } from './StepIndicator';

export function ScreenContent({
  urlImage,
  ScreenTitle,
  BtnText,
  NextPage,
  TextDescription,
  PageActive,
}) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const SaveIfUserAlreadyUsedTheApp = async () => {
    await AsyncStorage.setItem('UserAlreadyUsed', 'true');
  };

  return (
    <VStack flex={1} justifyContent="center" alignItems="center" w="full">
      <VStack w="full" h="4/6" alignSelf="center" justifyContent="center">
        <Image source={urlImage} resizeMode="contain" alt={TextDescription} alignSelf="center" />
        <OnboardTitle title={ScreenTitle} />
        <Text
          fontSize={RFValue(12)}
          mx="2%"
          mt={4}
          color={colors.gray[450]}
          mb={2}
          textAlign="center"
        >
          {TextDescription}
        </Text>
        <StepIndicator quantitySteps={4} active={PageActive} />
      </VStack>
      <VStack w="full" h="2/6" alignSelf="center" justifyContent="center" alignItems="center">
        <Button
          height={RFValue(50)}
          w="80%"
          bgColor={colors.blue[900]}
          _pressed={{ bgColor: colors.blue[700] }}
          borderRadius="xl"
          onPress={() => {
            if (BtnText === 'Iniciar') {
              SaveIfUserAlreadyUsedTheApp();
            }
            navigation.navigate(NextPage);
          }}
        >
          <Text color={colors.gray[100]} fontWeight="semibold">
            {BtnText}
          </Text>
        </Button>
      </VStack>
    </VStack>
  );
}
