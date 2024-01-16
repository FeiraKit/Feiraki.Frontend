import {
  Button,
  HStack,
  KeyboardAvoidingView,
  Progress,
  Text,
  VStack,
  useTheme,
} from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ButtonBack } from '../components/ButtonBack'
import { LogoFeira } from '../components/LogoFeira'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { editProductSchema } from '../validationsSchemes/productValidations'
import { ControlledInput } from '../components/FormComponents/controlledInput'
import { InputLabel } from '../components/FormComponents/InputLabel'
import { ControlledSelect } from '../components/FormComponents/ControlledSelect'
import { Product } from '../services/product'
import { CustonCheckbox } from '../components/FormComponents/CustonCheckbox'
import { ImagePickerSelectedImages } from '../components/FormComponents/ImagePickerSelectedImages'
import BottomSheetBase from './MultistepProductForm/components/BottomSheetBase'
import { CustomImagePickerBottomSheet } from '../components/FormComponents/CustonImagePickerBottomSheet'
import { Alert, TouchableOpacity } from 'react-native'
import { CustonSelectionMany } from '../components/FormComponents/CustonSelectionMany'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import moment from 'moment'
import { uploadImages } from '../utils/UploadImages'
import { useSelector } from 'react-redux'
import { removeMoneyMask } from '../utils/removeMasks'
import { LoadingEditForm } from '../components/Loading'

export function EditProduct() {
  const route = useRoute()
  const { colors } = useTheme()
  const productInstance = new Product()
  const prevProduct = route.params.produto
  const [categories, setCategories] = useState([])
  const [unities, setUnities] = useState([])
  const [FormLoaded, setFormLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState()
  const [images, setImages] = useState(prevProduct.imagem_url)
  const [error, setCustomError] = useState()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState([])

  const [selectedCities, setSelectedCities] = useState([prevProduct.cidades])
  const allCities = [
    { nome: 'buriti' },
    { nome: 'gangorra' },
    { nome: 'Abaeté' },
    { nome: 'Bocaiúva' },
    { nome: 'Carangola' },
    { nome: 'Dores do Indaiá' },
    { nome: 'Espera Feliz' },
    { nome: 'Francisco Sá' },
    { nome: 'Guaxupé' },
    { nome: 'Itabirito' },
    { nome: 'Janaúba' },
    { nome: 'Lavras' },
    { nome: 'Muzambinho' },
    { nome: 'Nanuque' },
    { nome: 'Oliveira' },
    { nome: 'Piumhi' },
    { nome: 'São Gotardo' },
  ]
  const bottomSheetRef = useRef(BottomSheetBase)
  const bottomSheetRefCities = useRef(bottomSheetRefCities)
  const producerId = useSelector(
    (state) => state.AuthReducers.userData.userData
  ).id

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
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
  })

  const openCitiesBottomSheet = () => {
    bottomSheetRefCities.current?.snapToIndex(1)
  }
  const closeCitiesBottomSheet = () => {
    bottomSheetRefCities.current?.close()
  }
  const closeActionsSheet = () => {
    bottomSheetRef.current?.close()
  }
  const openActionsSheet = useCallback(async () => {
    bottomSheetRef.current?.snapToIndex(0)
  }, [])

  const handleSelectCities = (cities) => {
    setSelectedCities(cities)
  }

  const initForm = () => {
    productInstance
      .getUnites()
      .then(({ data }) => {
        setCategories(data[0].categorias)
        setUnities(data[0].unidades)
        setFormLoaded(true)
      })
      .catch((error) => console.log(error))
  }

  const submitForm = (data) => {
    if (images.length === 0) {
      setIsLoading(false)
      setCustomError(true)

      return Alert.alert('Erro', 'Adicione uma imagem ao produto', [
        { text: 'ok', onPress: () => setCustomError(false) },
      ])
    }
    if (selectedCities.length === 0) {
      setIsLoading(false)
      setCustomError(true)
      return Alert.alert('Erro', 'Adicione pelo menos uma cidade', [
        { text: 'ok', onPress: () => setCustomError(false) },
      ])
    }

    Alert.alert('Editar', 'Deseja realmente alterar esse produto?', [
      {
        text: 'Alterar',
        onPress: () => {
          handleCheckInfo(data)
        },
      },
      {
        text: 'continuar editando',
        onPress: () => {
          return
        },
      },
      {
        text: 'cancelar',
        onPress: () => {
          reset()
        },
      },
    ])
  }

  const handleCheckInfo = async (data) => {
    setIsLoading(true)

    let price = await removeMoneyMask(data.preco)
    if (parseFloat(data.preco) === 0) {
      setIsLoading(false)
      return setError('preco', {
        type: 'custom',
        message: 'O preço deve ser maior que R$ 0,00',
      })
    }
    prevProduct.nome = data.nome
    prevProduct.categoria = data.categoria
    prevProduct.descricao = data.descricao
    prevProduct.unidade = data.unidade
    prevProduct.estoque = data.estoque
    prevProduct.produtor_id = producerId
    prevProduct.cidades = selectedCities
    prevProduct.bestbefore = data.bestbefore
    prevProduct.validade = moment().format('YYYY-MM-DD')
    prevProduct.preco = parseFloat(await price.replace(',', '.')).toFixed(2)
    let productSlug = data.nome.slice(0, 5)
    await uploadImages(images, productSlug, setUploadedImages)
  }

  useFocusEffect(useCallback(initForm, []))

  useEffect(() => {
    let totalProgress = Math.ceil((uploadedImages.length * 100) / images.length)
    setUploadProgress(isNaN(totalProgress) ? 0 : totalProgress)
    if (images.length === uploadedImages.length) {
      prevProduct.imagem_url = uploadedImages
      console.log(JSON.stringify(prevProduct))
      console.log('enviar produto ao banco para editar')
      setIsLoading(false)
    }
  }, [uploadedImages])

  return (
    <VStack
      w='full'
      h='full'
      px={'3%'}
    >
      {!FormLoaded && <LoadingEditForm />}
      <KeyboardAvoidingView
        behavior='height'
        w='full'
        h='full'
        keyboardVerticalOffset={10}
      >
        <VStack>
          <ButtonBack />
          <LogoFeira />
        </VStack>
        <VStack h='4/5'>
          <InputLabel
            title={'Nome'}
            pt={0}
            bg={colors.gray[100]}
            borderTopRadius={RFValue(4)}
            color={colors.blue[950]}
          />
          <ControlledInput
            control={control}
            mt={RFValue(-3)}
            zIndex={-1}
            name={'nome'}
            error={errors.nome}
            placeholder={'Nome do produto'}
          />
          <HStack
            alignSelf={'center'}
            justifyContent={'space-between'}
          >
            <VStack w='49%'>
              <InputLabel
                title={'Preço'}
                pt={0}
                bg={colors.gray[100]}
                borderTopRadius={RFValue(4)}
                color={colors.blue[950]}
              />
              <ControlledInput
                control={control}
                zIndex={-1}
                mt={RFValue(-3)}
                name={'preco'}
                error={errors.preco}
                placeholder={'R$ 0,00'}
                isMasked
                type={'money'}
                keyboardType={'numeric'}
                options={{
                  precision: 2,
                  separator: ',',
                  delimiter: '.',
                  unit: 'R$ ',
                  suffixUnit: '',
                }}
              />
            </VStack>

            <VStack w='48%'>
              <InputLabel
                title={'Estoque'}
                pt={0}
                bg={colors.gray[100]}
                borderTopRadius={RFValue(4)}
                color={colors.blue[950]}
              />
              <ControlledInput
                control={control}
                mt={RFValue(-3)}
                zIndex={-1}
                name={'estoque'}
                error={errors.estoque}
                keyboardType={'numeric'}
              />
            </VStack>
          </HStack>

          <HStack
            alignSelf={'center'}
            justifyContent={'space-between'}
          >
            <VStack w='49%'>
              <InputLabel
                title={'Categoria'}
                pt={0}
                bg={colors.gray[100]}
                borderTopRadius={RFValue(4)}
                color={colors.blue[950]}
              />
              <ControlledSelect
                control={control}
                zIndex={-1}
                name='categoria'
                error={errors.categoria}
                selectItemsValue={categories}
                selectLabel={'categoria'}
                mt={RFValue(-3)}
              />
            </VStack>

            <VStack w='48%'>
              <InputLabel
                title={'Unidade'}
                pt={0}
                bg={colors.gray[100]}
                borderTopRadius={RFValue(4)}
                color={colors.blue[950]}
              />
              <ControlledSelect
                control={control}
                mt={RFValue(-3)}
                zIndex={-1}
                name='unidade'
                error={errors.unidade}
                selectItemsValue={unities}
                selectLabel={'unidade'}
              />
            </VStack>
          </HStack>

          <InputLabel
            title={'Descrição'}
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
            textAlignVertical='top'
            name={'descricao'}
            error={errors.descricao}
            placeholder={'Descrição'}
          />

          <Controller
            name='bestbefore'
            control={control}
            render={({ field: { onChange, value } }) => (
              <CustonCheckbox
                label={'O produto será colhido após a compra'}
                onChange={onChange}
                value={value}
              />
            )}
          />
          <InputLabel
            title={'disponível em:'}
            color={colors.blue[950]}
          />
          <TouchableOpacity onPress={openCitiesBottomSheet}>
            <HStack
              borderBottomWidth={1}
              borderBottomColor={colors.gray[300]}
              px={RFValue(2)}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Text
                fontFamily={'heading'}
                fontSize={RFValue(18)}
                color={colors.blueGray[600]}
              >
                {selectedCities.length === 0
                  ? `Selecione uma cidade`
                  : `Disponível em ${selectedCities.length} cidade${
                      selectedCities.length > 1 ? 's' : ''
                    }`}
              </Text>

              <MaterialIcons
                name='edit'
                size={RFValue(22)}
                color={colors.blueGray[600]}
              />
            </HStack>
          </TouchableOpacity>

          <VStack
            w='full'
            alignItems={'center'}
          >
            <ImagePickerSelectedImages
              editionMode
              images={images}
              handleImage={setImages}
              actionOpenBottomSheet={openActionsSheet}
            />
            <Progress
              w='full'
              h={RFValue(0.5)}
              value={uploadProgress}
            />
          </VStack>
        </VStack>

        <VStack h='1/6'>
          <Button
            alignSelf={'center'}
            w='98%'
            _pressed={{ bgColor: colors.blue[700] }}
            borderRadius={8}
            onPress={handleSubmit(submitForm)}
            isLoading={isLoading ? true : false}
            disable={error}
          >
            <Text
              color={colors.gray[100]}
              fontWeight='semibold'
              fontFamily={'body'}
              fontSize={RFValue(18)}
            >
              Salvar alterações
            </Text>
          </Button>
        </VStack>
        <BottomSheetBase
          ref={bottomSheetRef}
          PanDownToClose
        >
          <CustomImagePickerBottomSheet
            images={images}
            handleImage={setImages}
            actionCloseBottonSheet={closeActionsSheet}
          />
        </BottomSheetBase>
        <BottomSheetBase
          ref={bottomSheetRefCities}
          PanDownToClose={true}
        >
          <CustonSelectionMany
            cities={allCities}
            selectedCities={[...selectedCities]}
            handleCities={handleSelectCities}
            actionClose={closeCitiesBottomSheet}
            hideConfirmButton
          />
        </BottomSheetBase>
      </KeyboardAvoidingView>
    </VStack>
  )
}
