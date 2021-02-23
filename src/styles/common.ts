import { EthHashInfo, TextField } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

interface SEthHashInfoProps {
  noMargin?: boolean
}

export const SEthHashInfo = styled(EthHashInfo)<SEthHashInfoProps>`
  display: inline-block;
  background: #fafafa;
  margin: ${(p: SEthHashInfoProps) => (p.noMargin ? '0' : '0 5px')};
  padding: 5px;
  border-radius: 5px;
`

export const STextField = styled(TextField)`
  width: 100% !important;
  margin: 20px 0 5px !important;
`
