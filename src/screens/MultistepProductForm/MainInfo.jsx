import React, { useState, useCallback } from 'react';
import { Text, VStack, useTheme, Button, ScrollView } from 'native-base';
import { useSelector } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { ButtonBack } from '../../components/ButtonBack';
import { ProgressBar } from './components/ProgressBar';
import { LogoFeira } from '../../components/LogoFeira';

import { ControlledInput } from '../../components/FormComponents/controlledInput';
import { ControlledSelect } from '../../components/FormComponents/ControlledSelect';
import { InputLabel } from '../../components/FormComponents/InputLabel';
import { Product } from '../../services/product';
import { LoadingForm } from '../../components/Loading';
import { mainInfoSchema } from '../../validationsSchemes/productValidations';
import { removeMoneyMask } from '../../utils/removeMasks';

export function MainInfo() {
  const navigation = useNavigation();
  const productInstance = new Product();
  const user = useSelector((state) => state.AuthReducers.userData.userData);

  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(mainInfoSchema),
  });
  const [categories, setCategories] = useState([]);
  const [unities, setUnities] = useState([]);
  const [FormLoaded, setFormLoaded] = useState(false);

  const handleCheckInfo = async (data) => {
    const price = await removeMoneyMask(data.preco);
    data.produtor_id = user.id;
    data.preco = parseFloat(await price.replace(',', '.')).toFixed(2);
    if (parseFloat(data.preco) === 0) {
      return setError('preco', {
        type: 'custom',
        message: 'O preço deve ser maior que R$ 0,00',
      });
    }

    navigation.navigate('DescriptionProduct', { produto: data });
  };

  const initForm = () => {
    productInstance
      .getUnites()
      .then(({ data }) => {
        setCategories(data[0].categorias);
        setUnities(data[0].unidades);
        setFormLoaded(true);
      })
      .catch(() => {
        showMessage({
          message: 'um erro inesperado aconteceu',
          type: 'danger',
        });
        navigation.goBack();
      });
  };

  useFocusEffect(useCallback(initForm, []));

  return (
    <TouchableWithoutFeedback touchSoundDisabled onPress={() => Keyboard.dismiss()}>
      {!FormLoaded ? (
        <LoadingForm />
      ) : (
        <ScrollView w="full" h="full" px="3%" _contentContainerStyle={{ paddingBottom: 10 }}>
          <VStack>
            <ButtonBack />
            <LogoFeira />
            <ProgressBar percent="25" />
            <Text fontFamily="body" fontSize={RFValue(22)}>
              Olá, {user.nome}!
            </Text>
            <Text
              fontFamily="body"
              fontSize={RFValue(22)}
              textAlign="left"
              textBreakStrategy="highQuality"
            >
              O que você está vendendo hoje?
            </Text>
          </VStack>

          <VStack py={0}>
            <InputLabel mt={errors.nome ? 0 : RFValue(4)} title="Nome do Produto" />
            <ControlledInput
              control={control}
              error={errors.nome}
              w="98%"
              name="nome"
              placeholder="Nome do Produto"
              mt={1}
            />

            <InputLabel mt={errors.preco ? 0 : RFValue(4)} title="Preço do Produto" />
            <ControlledInput
              control={control}
              error={errors.preco}
              placeholder="R$ 0,00"
              w="98%"
              name="preco"
              isMasked
              type="money"
              keyboardType="numeric"
              options={{
                precision: 2,
                separator: ',',
                delimiter: '.',
                unit: 'R$ ',
                suffixUnit: '',
              }}
              mt={1}
            />
            <InputLabel mt={errors.categoria ? 0 : RFValue(4)} title="Categoria do produto" />
            <ControlledSelect
              control={control}
              w="98%"
              name="categoria"
              error={errors.categoria}
              selectItemsValue={categories}
              selectLabel="Selecione a categoria"
              mt={1}
            />
            <InputLabel mt={errors.unidade ? 0 : RFValue(4)} title="Tipo da unidade" />
            <ControlledSelect
              control={control}
              w="98%"
              name="unidade"
              error={errors.unidade}
              selectItemsValue={unities}
              selectLabel="Selecione a unidade"
              mt={1}
            />
          </VStack>

          <VStack>
            <Button
              alignSelf="center"
              w="98%"
              mt={8}
              _pressed={{ bgColor: colors.blue[700] }}
              borderRadius={8}
              onPress={handleSubmit(handleCheckInfo)}
            >
              <Text
                color={colors.gray[100]}
                fontWeight="semibold"
                fontFamily="body"
                fontSize={RFValue(18)}
              >
                Continuar
              </Text>
            </Button>
          </VStack>
        </ScrollView>
      )}
    </TouchableWithoutFeedback>
  );
}
