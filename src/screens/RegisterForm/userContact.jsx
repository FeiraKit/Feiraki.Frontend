import React, { useState } from 'react';
import { Button, VStack, useTheme } from 'native-base';
import { Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { showMessage } from 'react-native-flash-message';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ButtonBack } from '../../components/ButtonBack';
import { removeNumberMask } from '../../utils/removeMasks';
import { LogoFeira } from '../../components/LogoFeira';
import { User } from '../../services/user';
import { InputLabel } from '../../components/FormComponents/InputLabel';
import { AcceptCheck } from '../../components/FormComponents/AcceptCheck';
import { UserContactSchema } from '../../validationsSchemes/userValidations';
import { ControlledInput } from '../../components/FormComponents/controlledInput';
import { StepIndicator } from '../OnboardingScreens/components/StepIndicator';

export function UserContact() {
  const user = new User();
  const route = useRoute();
  const navigation = useNavigation();
  const prevUser = route.params.user;
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const handleAcceptPolicy = () => {
    setAcceptPolicy(!acceptPolicy);
  };
  const handleAcceptTerms = () => {
    setAcceptTerms(!acceptTerms);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(UserContactSchema),
  });
  const Login = async (email, password) => {
    const userAuth = await (await user.checkPassword(email, password)).data;
    if (!userAuth.resultado) {
      setIsLoading(false);
      showMessage({
        message: 'Erro ao efetuar Login',
        type: 'danger',
      });
      return navigation.navigate('SignIn');
    }

    const jwtToken = userAuth.token;
    user.getUserByEmail(email, jwtToken);
    setIsLoading(false);
  };

  const handleCreateUser = async (data) => {
    setIsLoading(true);
    const telefone = await removeNumberMask(data.telefone);
    const objUser = {
      ...prevUser,
      telefone,
    };
    try {
      const createdUser = await user.createUser(objUser);
      if (!createdUser.data.resultado) {
        setIsLoading(false);
        return showMessage({
          message: 'Erro ao cadastrar usuário',
          type: 'danger',
        });
      }

      if (createdUser.data.resultado) {
        showMessage({ message: 'Bem Vindo ao Feira Kit', type: 'success' });
        Login(objUser.email, objUser.senha);
      }
    } catch (error) {
      setIsLoading(false);
      return Alert.alert('Erro', 'Tivemos um problema ao cadastrar o usuário');
    }
  };

  return (
    <TouchableWithoutFeedback touchSoundDisabled onPress={() => Keyboard.dismiss()}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          minHeight: '100%',
          justifyContent: 'center',
          paddingBottom: 100,
        }}
      >
        <VStack w="full" h="1/6">
          <ButtonBack />
          <LogoFeira />
          <StepIndicator quantitySteps={3} active={3} mt={-5} />
        </VStack>

        <VStack w="full" h="4/6" justifyContent="space-evenly">
          <VStack>
            <InputLabel mt={RFValue(2)} title="Informe o seu WhatsApp" />
            <ControlledInput
              mt={RFValue(1)}
              isMasked
              control={control}
              name="telefone"
              error={errors.telefone}
              type="cel-phone"
              placeholder="(00) 0000-0000"
              iconName="whatsapp"
              options={{
                maskType: 'BRL',
                withDDD: true,
                dddMask: '(99) ',
              }}
              keyboardType="numeric"
              infoText="Este número deve ser o seu WhatsApp"
            />
          </VStack>
          <VStack justifyItems="center">
            <InputLabel title="Política de privacidade" />
            <AcceptCheck
              title="os termos e condições"
              contentTextType="termos"
              action={handleAcceptTerms}
            />
            <AcceptCheck
              title="a política de privacidade"
              contentTextType="política"
              action={handleAcceptPolicy}
            />
          </VStack>
        </VStack>
        <Button
          bgColor={colors.blue[600]}
          height={54}
          isDisabled={!(acceptPolicy && acceptTerms)}
          width="90%"
          _pressed={{ bgColor: colors.blue[700] }}
          _disabled={{}}
          mt={4}
          borderRadius={15}
          alignSelf="center"
          onPress={handleSubmit(handleCreateUser)}
          isLoading={isLoading}
        >
          Cadastrar
        </Button>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
