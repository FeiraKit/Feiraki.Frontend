import * as yup from 'yup'

export const mainInfoSchema = yup.object({
  nome: yup.string().required('Informe o nome do produto'),
  categoria: yup.string().required('Selecione a categoria do produto'),
  unidade: yup.string().required('Selecione o tipo de unidade'),
  preco: yup.string().required('Informe o preço do produto'),
})

export const descriptionSchema = yup.object({
  descricao: yup.string().required('Nos fale um pouco sobre o produto'),
})
export const imagesSchema = yup.object({
  imagem_url: yup.array().required('Adicione uma imagem'),
})
