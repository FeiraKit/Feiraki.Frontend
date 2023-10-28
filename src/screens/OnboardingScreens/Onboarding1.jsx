import React from 'react'
import { VStack, Image, Text, useTheme, Button, Heading } from 'native-base'
import { useNavigation } from '@react-navigation/native'
import { RFValue } from 'react-native-responsive-fontsize'
import { OnboardTitle } from './components/onboardTitle'

export function Onboarding1() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  return (
    <VStack
      flex={1}
      justifyContent='center'
      alignItems='center'
      w='full'
    >
      <Image
        source={require('./assets/Foto1.png')}
        resizeMode='contain'
        alt='Homem Comprando por aplicativo'
      />
     <OnboardTitle title = 'Bem-Vindo ao FeiraKit!'/>
      <Text
        fontSize={RFValue(12)}
        mx={'2%'}
        mt={4}
        color={colors.gray[450]}
        mb={2}
        textAlign='center'
      >
        Descubra os melhores produtos da sua região, diretamente na palma da sua
        mão.
      </Text>
      <Button
        onPress={() => navigation.navigate('Onboarding2')}
        height={50}
        mt={150}
        w='80%'
        bgColor={colors.blue[900]}
        _pressed={{ bgColor: colors.blue[700] }}
        borderRadius={50}
      >
        <Text
          color={colors.gray[100]}
          fontWeight='semibold'
        >
          Continue
        </Text>
      </Button>
    </VStack>
  )
}
