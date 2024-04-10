/* eslint-disable react/jsx-curly-brace-presence */
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, KeyboardAvoidingView, Text, VStack, useTheme } from 'native-base';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { RFValue } from 'react-native-responsive-fontsize';
import { useForm } from 'react-hook-form';
import { ProgressBar } from './components/ProgressBar';
import { ButtonBack } from '../../components/ButtonBack';
import { LogoFeira } from '../../components/LogoFeira';
import { ControlledInput } from '../../components/FormComponents/controlledInput';
import { descriptionSchema } from '../../validationsSchemes/productValidations';
import { CustonCheckbox } from '../../components/FormComponents/CustonCheckbox';

import { InputLabel } from '../../components/FormComponents/InputLabel';

export function DescriptionProduct() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const prevProduct = route.params.produto;
  const [isBestBeforeAvaliable, setIsBestBeforeAvailable] = useState(false);
  const [bestBefore, setBestBefore] = useState(false);

  const handleCheckBestBefore = () => {
    setBestBefore(!bestBefore);
  };
  const handleCheckInfo = (data) => {
    prevProduct.descricao = data.descricao;
    prevProduct.estoque = parseInt(data.estoque, 10);
    prevProduct.bestbefore = bestBefore;
    navigation.navigate('AddCities', { produto: prevProduct });
  };

  useEffect(() => {
    const notAvaliableCategories = ['artesanato', 'laticínios', 'produtos naturais'];
    if (!notAvaliableCategories.includes(prevProduct.categoria)) {
      setIsBestBeforeAvailable(true);
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(descriptionSchema),
  });

  return (
    <TouchableWithoutFeedback touchSoundDisabled onPress={() => Keyboard.dismiss()}>
      <VStack w="full" h="full" px="3%">
        <VStack h="1/6">
          <ButtonBack />
          <LogoFeira />
          <ProgressBar percent="50" />

          <Text fontFamily={'body'} fontSize={RFValue(22)}>
            Fale mais sobre o produto
          </Text>
        </VStack>
        <KeyboardAvoidingView
          behavior="height"
          h="4/6"
          pt={10}
          keyboardVerticalOffset={RFValue(10)}
        >
          <ControlledInput
            control={control}
            multiline
            name="descricao"
            mt={RFValue(8)}
            placeholder="Descrição"
            bgColor={colors.gray[250]}
            h={'2/5'}
            textAlignVertical="top"
            error={errors.descricao}
          />
          <InputLabel title={'Quantidade disponível'} mt={errors.descricao ? -2 : 2} />
          <ControlledInput
            control={control}
            name="estoque"
            mt={errors.descricao ? RFValue(-1) : RFValue(1)}
            placeholder={'estoque'}
            bgColor={colors.gray[250]}
            error={errors.estoque}
            keyboardType={'numeric'}
          />
          {isBestBeforeAvaliable && (
            <CustonCheckbox
              label={'O produto será colhido após a compra'}
              mt={(errors.descricao || errors.estoque) && RFValue(-5)}
              onChange={handleCheckBestBefore}
            />
          )}
        </KeyboardAvoidingView>
        <VStack h={'1/6'}>
          <Button
            alignSelf={'center'}
            w="98%"
            mt={8}
            _pressed={{ bgColor: colors.blue[700] }}
            borderRadius={8}
            onPress={handleSubmit(handleCheckInfo)}
          >
            <Text
              color={colors.gray[100]}
              fontWeight="semibold"
              fontFamily={'body'}
              fontSize={RFValue(18)}
            >
              Continuar
            </Text>
          </Button>
        </VStack>
      </VStack>
    </TouchableWithoutFeedback>
  );
}
