import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Textarea,
} from '@chakra-ui/react'
import type { InputProps, SelectProps, TextareaProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { FieldValues, Path, UseFormRegister, Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'

interface FieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  register: UseFormRegister<T>
  error?: string
  isRequired?: boolean
}

export function TextField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  isRequired,
  type,
  ...rest
}: FieldProps<T> & InputProps) {
  const id = String(name)
  const isNumber = type === 'number'
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Input
        id={id}
        type={type}
        {...register(name, isNumber ? { valueAsNumber: true } : undefined)}
        {...rest}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  isRequired,
  children,
  valueAsNumber,
  ...rest
}: FieldProps<T> & SelectProps & { children: ReactNode; valueAsNumber?: boolean }) {
  const id = String(name)
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Select
        id={id}
        {...register(name, valueAsNumber ? { valueAsNumber: true } : undefined)}
        {...rest}
      >
        {children}
      </Select>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  isRequired,
  ...rest
}: FieldProps<T> & TextareaProps) {
  const id = String(name)
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Textarea id={id} {...register(name)} {...rest} />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

export function NumberField<T extends FieldValues>({
  name,
  label,
  control,
  error,
  isRequired,
  min,
}: {
  name: Path<T>
  label: string
  control: Control<T>
  error?: string
  isRequired?: boolean
  min?: number
}) {
  const id = String(name)
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <NumberInput
            id={id}
            min={min}
            value={field.value === undefined || field.value === null ? '' : String(field.value)}
            onChange={(_, valueAsNumber) =>
              field.onChange(Number.isNaN(valueAsNumber) ? undefined : valueAsNumber)
            }
          >
            <NumberInputField />
          </NumberInput>
        )}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

export function FormStack({ children }: { children: ReactNode }) {
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {children}
    </Box>
  )
}
