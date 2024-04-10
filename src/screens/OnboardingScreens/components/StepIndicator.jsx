import React from 'react';
import { HStack, View } from 'native-base';

export function StepIndicator({ quantitySteps = 4, active, ...rest }) {
  const steps = Array.from({ length: quantitySteps }, (_, index) => index + 1);

  return (
    <HStack width="100%" h={10} my="4" justifyContent="center" alignItems="center" {...rest}>
      {steps.map((step) => (
        <View
          key={`step ${step}`}
          w={active === step ? 6 : 3}
          h={3}
          bgColor={active === step ? 'blue.900' : 'gray.300'}
          borderRadius="full"
          mx={1}
        />
      ))}
    </HStack>
  );
}
