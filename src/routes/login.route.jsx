import { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { isUndefined } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Login } from '../screens/Login';
import { Loading } from '../components/Loading';
import { PasswordRecovery } from '../screens/PasswordRecovery';
import { PolicyScreen } from '../screens/PolicyScreen';
import { OnboardingRoutes } from './onboarding.route';
import { UserData } from '../screens/RegisterForm/UserData';
import { UserAdress } from '../screens/RegisterForm/UserAdress';
import { UserContact } from '../screens/RegisterForm/userContact';

const { Navigator, Screen } = createNativeStackNavigator();

export function LoginRoutes() {
  const [AlreadyUsed, setAlreadyUsed] = useState();
  async function VerifyIfUserAlreadyUsedTheApp() {
    const userAlreadyUsed = await AsyncStorage.getItem('UserAlreadyUsed');
    setAlreadyUsed(userAlreadyUsed);
  }
  useEffect(() => {
    VerifyIfUserAlreadyUsedTheApp();
  }, []);
  console.log(AlreadyUsed);
  return (
    <>
      {isUndefined(AlreadyUsed) && <Loading />}
      <Navigator screenOptions={{ headerShown: false }}>
        {!AlreadyUsed && <Screen name="OnboardingRoutes" component={OnboardingRoutes} />}

        <Screen name="SignIn" component={Login} />
        <Screen name="Register" component={UserData} />
        <Screen name="AddAdress" component={UserAdress} />
        <Screen name="AddContact" component={UserContact} />
        <Screen name="PasswordRecovery" component={PasswordRecovery} />
        <Screen name="PolicyAndTerms" component={PolicyScreen} />
      </Navigator>
    </>
  );
}
