import React, { useState, useCallback } from 'react'
import { useModal } from '../../../../../design/lib/stores/modal'
import {
  CreateSmartViewRequestBody,
  CreateSmartViewResponseBody,
} from '../../../../api/teams/smartViews'
import { usePage } from '../../../../lib/stores/pageStore'
import SmartViewForm from './SmartViewForm'
import { SerializedSmartView } from '../../../../interfaces/db/smartView'
import { useCloudApi } from '../../../../lib/hooks/useCloudApi'

interface CreateSmartViewModalProps {
  onCreate?: (smartView: SerializedSmartView) => void
}

const CreateSmartViewModal = ({ onCreate }: CreateSmartViewModalProps) => {
  const { closeLastModal: closeModal } = useModal()
  const { team } = usePage()
  const { createSmartViewApi } = useCloudApi()
  const [sending, setSending] = useState(false)

  const submit = useCallback(
    async (body: CreateSmartViewRequestBody) => {
      if (team == null) {
        return
      }
      setSending(true)
      const res = await createSmartViewApi(team.id, body)

      if (!res.err) {
        const { data: smartView } = res.data as CreateSmartViewResponseBody
        closeModal()
        if (onCreate != null) {
          return onCreate(smartView)
        }
      }
      setSending(false)
    },
    [team, onCreate, closeModal, createSmartViewApi]
  )

  if (team == null) {
    return null
  }

  return (
    <SmartViewForm
      teamId={team.id}
      action='Create'
      onCancel={closeModal}
      onSubmit={submit}
      buttonsAreDisabled={sending}
      defaultConditions={[]}
    />
  )
}

export default CreateSmartViewModal
