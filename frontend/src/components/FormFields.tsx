import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  Select,
  Textarea,
} from '@chakra-ui/react'
import type { InputProps, SelectProps, TextareaProps } from '@chakra-ui/react'
import { useState, type ReactNode } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
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

/** Password input with show / hide toggle. */
export function PasswordField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  isRequired,
  ...rest
}: FieldProps<T> & Omit<InputProps, 'type'>) {
  const id = String(name)
  const [visible, setVisible] = useState(false)

  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <InputGroup>
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          pr="3rem"
          {...register(name)}
          {...rest}
        />
        <InputRightElement h="full" width="3rem">
          <IconButton
            aria-label={visible ? 'Hide password' : 'Show password'}
            icon={visible ? <FiEyeOff /> : <FiEye />}
            variant="ghost"
            size="sm"
            onClick={() => setVisible((v) => !v)}
            tabIndex={0}
          />
        </InputRightElement>
      </InputGroup>
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
