import { Button, HStack, Progress, ScrollView, Text, VStack, useTheme } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Keyboard, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { ButtonBack } from '../components/ButtonBack';
import { LogoFeira } from '../components/LogoFeira';
import { editProductSchema } from '../validationsSchemes/productValidations';
import { ControlledInput } from '../components/FormComponents/controlledInput';
import { InputLabel } from '../components/FormComponents/InputLabel';
import { ControlledSelect } from '../components/FormComponents/ControlledSelect';
import { Product } from '../services/product';
import { CustonCheckbox } from '../components/FormComponents/CustonCheckbox';
import { ImagePickerSelectedImages } from '../components/FormComponents/ImagePickerSelectedImages';
import BottomSheetBase from './MultistepProductForm/components/BottomSheetBase';
import { CustomImagePickerBottomSheet } from '../components/FormComponents/CustonImagePickerBottomSheet';
import { CustonSelectionMany } from '../components/FormComponents/CustonSelectionMany';
import { removeImageInFirebaseStorage, uploadImages } from '../utils/UploadImages';
import { removeMoneyMask } from '../utils/removeMasks';
import { LoadingEditForm, LoadingUploadImages } from '../components/Loading';

export function EditProduct() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const productInstance = new Product();
  const prevProduct = route.params.produto;
  const [categories, setCategories] = useState([]);
  const [unities, setUnities] = useState([]);
  const [FormLoaded, setFormLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState(prevProduct.imagem_url);
  const [error, setCustomError] = useState();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagesToRemove, setImageToRemove] = useState([]);

  const [selectedCities, setSelectedCities] = useState([...prevProduct.cidades]);
  const [allCities, setAllCities] = useState([]);
  const bottomSheetRef = useRef(BottomSheetBase);
  const bottomSheetRefCities = useRef(bottomSheetRefCities);
  const producerId = useSelector((state) => state.AuthReducers.userData.userData).id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: yupResolver(editProductSchema),
    defaultValues: {
      nome: prevProduct.nome,
      preco: prevProduct.preco,
      categoria: prevProduct.categoria,
      descricao: prevProduct.descricao,
      bestbefore: prevProduct.bestbefore,
      unidade: prevProduct.unidade,
      estoque: prevProduct.estoque.toString(),
    },
  });

  const openCitiesBottomSheet = () => {
    bottomSheetRefCities.current?.snapToIndex(1);
  };
  const closeCitiesBottomSheet = () => {
    bottomSheetRefCities.current?.close();
  };
  const closeActionsSheet = () => {
    bottomSheetRef.current?.close();
  };
  const openActionsSheet = useCallback(async () => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSelectCities = (cities) => {
    setSelectedCities(cities);
  };

  const initForm = async () => {
    const cities = await AsyncStorage.getItem('allCities');
    setAllCities(JSON.parse(cities));
    productInstance
      .getUnites()
      .then(({ data }) => {
        setCategories(data[0].categorias);
        setUnities(data[0].unidades);
        setFormLoaded(true);
      })
      .catch((e) => console.log(e));
  };

  const submitForm = (data) => {
    setIsLoading(true);
    if (images.length === 0) {
      setIsLoading(false);
      setCustomError(true);

      return Alert.alert('Erro', 'Adicione uma imagem ao produto', [
        { text: 'ok', onPress: () => setCustomError(false) },
      ]);
    }
    if (selectedCities.length === 0) {
      setIsLoading(false);
      setCustomError(true);
      return Alert.alert('Erro', 'Adicione pelo menos uma cidade', [
        { text: 'ok', onPress: () => setCustomError(false) },
      ]);
    }

    Alert.alert('Editar', 'Deseja realmente alterar esse produto?', [
      {
        text: 'Alterar',
        onPress: () => {
          handleCheckInfo(data);
        },
      },
      {
        text: 'continuar editando',

        onPress: () => {
          setIsLoading(false);
        },
      },
      {
        text: 'cancelar',
        onPress: () => {
          setIsLoading(false);
          setImages(prevProduct.imagem_url);
          reset();
        },
      },
    ]);
  };

  const handleCheckInfo = async (data) => {
    const price = await removeMoneyMask(data.preco);
    if (parseFloat(data.preco) === 0) {
      setIsLoading(false);
      return setError('preco', {
        type: 'custom',
        message: 'O preço deve ser maior que R$ 0,00',
      });
    }
    prevProduct.nome = data.nome;
    prevProduct.categoria = data.categoria;
    prevProduct.descricao = data.descricao;
    prevProduct.unidade = data.unidade;
    prevProduct.estoque = data.estoque;
    prevProduct.produtor_id = producerId;
    prevProduct.cidades = selectedCities;
    prevProduct.bestbefore = data.bestbefore;
    prevProduct.validade = moment().format('YYYY-MM-DD');
    prevProduct.preco = parseFloat(await price.replace(',', '.'));
    const productSlug = data.nome.slice(0, 5);

    await uploadImages(images, productSlug, setUploadedImages);
  };

  useFocusEffect(
    useCallback(() => {
      initForm();
    }, [])
  );

  useEffect(() => {
    const totalProgress = Math.ceil((uploadedImages.length * 100) / images.length);
    // eslint-disable-next-line no-restricted-globals
    setUploadProgress(isNaN(totalProgress) ? 0 : totalProgress);
    if (images.length === uploadedImages.length) {
      prevProduct.imagem_url = uploadedImages;
      imagesToRemove.map((image) => removeImageInFirebaseStorage(image));

      productInstance
        .updateProduct(prevProduct)
        .then(() => {
          showMessage({
            message: 'Produto adicionado com sucesso',
            type: 'success',
          });
          navigation.navigate('MyProducts');
        })
        .catch((e) => {
          showMessage({
            message: 'Um erro inesperado aconteceu,tente novamente',
            type: 'error',
          });
          console.log(e);
          navigation.goBack();
        });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImages]);

  return (
    <TouchableWithoutFeedback touchSoundDisabled onPress={() => Keyboard.dismiss()}>
      <VStack w="full" h="full" px="3%" contentContainerStyle={{ paddingBottom: 30 }}>
        {isLoading && <LoadingUploadImages percent={uploadProgress} />}
        {!FormLoaded && <LoadingEditForm />}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <VStack>
            <ButtonBack />
            <LogoFeira />
          </VStack>
          <VStack h="4/5">
            <InputLabel
              title="Nome"
              pt={0}
              bg={colors.gray[100]}
              borderTopRadius={RFValue(4)}
              color={colors.blue[950]}
            />
            <ControlledInput
              control={control}
              mt={RFValue(-3)}
              zIndex={-1}
              name="nome"
              error={errors.nome}
              placeholder="Nome do produto"
            />
            <HStack alignSelf="center" justifyContent="space-between">
              <VStack w="49%">
                <InputLabel
                  title="Preço"
                  pt={0}
                  bg={colors.gray[100]}
                  borderTopRadius={RFValue(4)}
                  color={colors.blue[950]}
                />
                <ControlledInput
                  control={control}
                  zIndex={-1}
                  mt={RFValue(-3)}
                  name="preco"
                  error={errors.preco}
                  placeholder="R$ 0,00"
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
                />
              </VStack>

              <VStack w="48%">
                <InputLabel
                  title="Estoque"
                  pt={0}
                  bg={colors.gray[100]}
                  borderTopRadius={RFValue(4)}
                  color={colors.blue[950]}
                />
                <ControlledInput
                  control={control}
                  mt={RFValue(-3)}
                  zIndex={-1}
                  name="estoque"
                  error={errors.estoque}
                  keyboardType="numeric"
                />
              </VStack>
            </HStack>

            <HStack alignSelf="center" justifyContent="space-between">
              <VStack w="49%">
                <InputLabel
                  title="Categoria"
                  pt={0}
                  bg={colors.gray[100]}
                  borderTopRadius={RFValue(4)}
                  color={colors.blue[950]}
                />
                <ControlledSelect
                  control={control}
                  zIndex={-1}
                  name="categoria"
                  error={errors.categoria}
                  selectItemsValue={categories}
                  selectLabel="categoria"
                  mt={RFValue(-3)}
                />
              </VStack>

              <VStack w="48%">
                <InputLabel
                  title="Unidade"
                  pt={0}
                  bg={colors.gray[100]}
                  borderTopRadius={RFValue(4)}
                  color={colors.blue[950]}
                />
                <ControlledSelect
                  control={control}
                  mt={RFValue(-3)}
                  zIndex={-1}
                  name="unidade"
                  error={errors.unidade}
                  selectItemsValue={unities}
                  selectLabel="unidade"
                />
              </VStack>
            </HStack>

            <InputLabel
              title="Descrição"
              pt={0}
              bg={colors.gray[100]}
              borderTopRadius={RFValue(4)}
              color={colors.blue[950]}
            />
            <ControlledInput
              control={control}
              zIndex={-1}
              mt={RFValue(-3)}
              h={RFValue(90)}
              multiline
              textAlignVertical="top"
              name="descricao"
              error={errors.descricao}
              placeholder="Descrição"
            />

            <Controller
              name="bestbefore"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustonCheckbox
                  label="O produto será colhido após a compra"
                  onChange={onChange}
                  value={value}
                />
              )}
            />

            <InputLabel title="disponível em:" color={colors.blue[950]} />
            <TouchableOpacity onPress={openCitiesBottomSheet}>
              <HStack
                borderBottomWidth={1}
                borderBottomColor={colors.gray[300]}
                px={RFValue(2)}
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontFamily="heading" fontSize={RFValue(18)} color={colors.blueGray[600]}>
                  {selectedCities.length === 0
                    ? `Selecione uma cidade`
                    : `Disponível em ${selectedCities.length} cidade${
                        selectedCities.length > 1 ? 's' : ''
                      }`}
                </Text>

                <MaterialIcons name="edit" size={RFValue(22)} color={colors.blueGray[600]} />
              </HStack>
            </TouchableOpacity>

            <VStack w="full" alignItems="center">
              <ImagePickerSelectedImages
                editionMode
                setImageToRemove={setImageToRemove}
                images={images}
                handleImage={setImages}
                actionOpenBottomSheet={openActionsSheet}
              />
              <Progress w="full" h={RFValue(0.5)} value={uploadProgress} />
            </VStack>
          </VStack>

          <VStack h="1/6" mt={4}>
            <Button
              alignSelf="center"
              w="98%"
              _pressed={{ bgColor: colors.blue[700] }}
              borderRadius={8}
              onPress={handleSubmit(submitForm)}
              isLoading={!!isLoading}
              disable={error}
            >
              <Text
                color={colors.gray[100]}
                fontWeight="semibold"
                fontFamily="body"
                fontSize={RFValue(18)}
              >
                Salvar alterações
              </Text>
            </Button>
          </VStack>
        </ScrollView>
        <BottomSheetBase ref={bottomSheetRef} PanDownToClose>
          <CustomImagePickerBottomSheet
            images={images}
            handleImage={setImages}
            actionCloseBottonSheet={closeActionsSheet}
          />
        </BottomSheetBase>
        <BottomSheetBase ref={bottomSheetRefCities} PanDownToClose>
          <CustonSelectionMany
            cities={allCities}
            selectedCities={[...selectedCities]}
            handleCities={handleSelectCities}
            actionClose={closeCitiesBottomSheet}
            hideConfirmButton
          />
        </BottomSheetBase>
      </VStack>
    </TouchableWithoutFeedback>
  );
}
