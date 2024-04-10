import React from 'react';
import { Checkbox, HStack, Text, useTheme } from 'native-base';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function AcceptCheck({ action, contentTextType, title }) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleNavigate = () => {
    navigation.navigate('PolicyAndTerms', { contentTextType });
  };
  return (
    <HStack w="full" my={1} paddingX="4%" alignContent="center" alignItems="center">
      <Checkbox
        onChange={() => {
          action();
        }}
        accessibilityLabel={`caixa de seleção para aceitar ${title}`}
        mr={0}
      >
        <Text>Aceito </Text>
      </Checkbox>
      <TouchableOpacity onPress={handleNavigate} ml={0}>
        <Text underline color={colors.blue[800]}>
          {title}
        </Text>
      </TouchableOpacity>
    </HStack>
  );
}
