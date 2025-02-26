import SidebarButton from '../../../design/components/organisms/Sidebar/atoms/SidebarButton'
import { MenuTypes } from '../../../design/lib/stores/contextMenu'
import { useModal } from '../../../design/lib/stores/modal'
import { mdiPencilBoxMultipleOutline, mdiPlus } from '@mdi/js'
import React, { useCallback } from 'react'
import { SerializedTeam } from '../../interfaces/db/team'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { useNav } from '../../lib/stores/nav'
import TemplatesModal from '../Modal/contents/TemplatesModal'

const NewDocButton = ({ team }: { team: SerializedTeam }) => {
  const {
    currentWorkspaceId,
    workspacesMap,
    currentPath,
    currentParentFolderId,
  } = useNav()
  const { openNewDocForm } = useCloudResourceModals()
  const { openModal } = useModal()
  const { translate } = useI18n()

  const openNewDocModal = useCallback(() => {
    openNewDocForm(
      {
        team,
        parentFolderId: currentParentFolderId,
        workspaceId: currentWorkspaceId,
      },
      {
        precedingRows: [
          {
            description: `${
              workspacesMap.get(currentWorkspaceId || '')?.name
            }${currentPath}`,
          },
        ],
      }
    )
  }, [
    openNewDocForm,
    workspacesMap,
    currentWorkspaceId,
    team,
    currentParentFolderId,
    currentPath,
  ])

  return (
    <SidebarButton
      variant='primary'
      icon={mdiPlus}
      id='sidebar-newdoc-btn'
      label={translate(lngKeys.CreateNewDoc)}
      labelClick={() => openNewDocModal()}
      contextControls={[
        {
          icon: mdiPencilBoxMultipleOutline,
          type: MenuTypes.Normal,
          label: translate(lngKeys.UseATemplate),
          onClick: () => openModal(<TemplatesModal />, { width: 'large' }),
        },
      ]}
    />
  )
}

export default NewDocButton
