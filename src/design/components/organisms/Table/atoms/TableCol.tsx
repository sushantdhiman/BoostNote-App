import React, { useMemo, CSSProperties } from 'react'
import styled from '../../../../lib/styled'
import { TableColProps } from '../tableInterfaces'
import TableSlider from './TableSlider'

interface InternalTableColProps extends TableColProps {
  width?: number
}

const TableCol = ({
  name,
  width = 80,
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDrop,
}: InternalTableColProps) => {
  const style = useMemo(() => {
    const style: CSSProperties = {}

    style.width = `${width}px`

    return style
  }, [width])

  return (
    <>
      <Container
        style={style}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
      >
        {name}
      </Container>
      <TableSlider />
    </>
  )
}

export default TableCol

const Container = styled.div`
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  &:last-child {
    border-right: none;
  }
  min-width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`