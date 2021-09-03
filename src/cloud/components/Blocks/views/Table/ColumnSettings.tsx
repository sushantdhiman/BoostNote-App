import {
  mdiAccountCircleOutline,
  mdiArrowLeftBold,
  mdiArrowRightBold,
  mdiTrashCanOutline,
} from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import FormInput from '../../../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainerBreak from '../../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../../../design/lib/stores/modal'
import styled from '../../../../../design/lib/styled'
import {
  getPropType,
  isPropKey,
  makePropKey,
  PropKey,
  PropType,
} from '../../../../lib/blocks/props'
import {
  Column,
  getColumnName,
  getDataPropColProp,
  isDataPropCol,
  makeDataPropCol,
} from '../../../../lib/blocks/table'
import { capitalize } from '../../../../lib/utils/string'
import DataTypeMenu from '../../props/DataTypeMenu'

interface ColumnSettingsProps {
  col: Column
  setColName: (col: Column, name: string) => void
  setColDataType: (col: PropKey, type: PropType) => void
  deleteCol: (col: Column) => void
  moveColumn: (col: Column, direction: 'left' | 'right') => void
}

const ColumnSettings = ({
  col,
  setColName,
  setColDataType,
  deleteCol,
  moveColumn,
}: ColumnSettingsProps) => {
  const [colKey, setColKey] = useState(col)
  const [name, setName] = useState(getColumnName(col))
  const { openContextModal, closeAllModals } = useModal()

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      setName(ev.target.value)
      setColName(colKey, ev.target.value)
      setColKey(
        isDataPropCol(colKey)
          ? makeDataPropCol(ev.target.value, getDataPropColProp(colKey))
          : makePropKey(ev.target.value, getPropType(colKey))
      )
    },
    [colKey, setColName]
  )

  useEffect(() => {
    setColKey(col)
  }, [col])

  const openTypeSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      if (isPropKey(colKey)) {
        openContextModal(
          ev,
          <DataTypeMenu
            onSelect={(type) => {
              setColDataType(colKey, type)
              setColKey(makePropKey(name, type))
              closeAllModals()
            }}
          />,
          { width: 300, keepAll: true }
        )
      }
    },
    [name, colKey, closeAllModals, openContextModal, setColDataType]
  )

  const dataType = useMemo(() => {
    return isDataPropCol(colKey) ? 'prop' : getPropType(colKey)
  }, [colKey])

  return (
    <Container>
      <MetadataContainerRow row={{ type: 'header', content: 'NAME' }} />
      <FormInput value={name} onChange={onChange} />
      <MetadataContainerRow
        row={{
          type: 'header',
          content: dataType === 'prop' ? 'GITHUB PARAMETER' : 'PROPERTY TYPE',
        }}
      />
      {dataType !== 'prop' && (
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: capitalize(dataType),
              iconPath: mdiAccountCircleOutline,
              onClick: openTypeSelector,
            },
          }}
        />
      )}
      <MetadataContainerBreak />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Move left',
            iconPath: mdiArrowLeftBold,
            onClick: () => moveColumn(col, 'left'),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Move right',
            iconPath: mdiArrowRightBold,
            onClick: () => moveColumn(col, 'right'),
          },
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Delete',
            iconPath: mdiTrashCanOutline,
            onClick: () => deleteCol(col),
          },
        }}
      />
    </Container>
  )
}

export default ColumnSettings

const Container = styled.div`
  & .table__column__settings__type {
    position: relative;
    & > .table__column__settings__type__wrapper {
      position: absolute;
      left: 100%;
    }
  }
`