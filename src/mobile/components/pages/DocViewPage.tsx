import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SerializedDocWithSupplemental,
  SerializedDoc,
} from '../../../cloud/interfaces/db/doc'
import { usePreferences } from '../../lib/preferences'
import { SerializedUser } from '../../../cloud/interfaces/db/user'
import useRealtime from '../../../cloud/lib/editor/hooks/useRealtime'
import { buildIconUrl } from '../../../cloud/api/files'
import { getColorFromString } from '../../../cloud/lib/utils/string'
import { createAbsolutePositionFromRelativePosition } from 'yjs'
import useCommentManagerState from '../../../cloud/lib/hooks/useCommentManagerState'
import { HighlightRange } from '../../../cloud/lib/rehypeHighlight'
import Spinner from '../../../design/components/atoms/Spinner'
import AppLayout from '../layouts/AppLayout'
import NavigationBarButton from '../atoms/NavigationBarButton'
import Icon from '../../../design/components/atoms/Icon'
import { mdiDotsHorizontal } from '@mdi/js'
import DocInfoModal from '../organisms/modals/DocInfoModal'
import { useModal } from '../../../design/lib/stores/modal'
import { SerializedTeam } from '../../../cloud/interfaces/db/team'
import styled from '../../../design/lib/styled'
import { rightSidePageLayout } from '../../../design/lib/styled/styleFunctions'
import { rightSideTopBarHeight } from '../../../design/components/organisms/Topbar'
import CustomizedMarkdownPreviewer from '../../../cloud/components/MarkdownView/CustomizedMarkdownPreviewer'

interface ViewPageProps {
  team: SerializedTeam
  contributors: SerializedUser[]
  backLinks: SerializedDoc[]
  doc: SerializedDocWithSupplemental
  user: SerializedUser
}

const ViewPage = ({
  doc,
  user,
  team,
  contributors,
  backLinks,
}: ViewPageProps) => {
  const { setPreferences } = usePreferences()
  const { openModal } = useModal()
  const initialRenderDone = useRef(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [realtimeContent, setRealtimeContent] = useState('')
  const [color] = useState(() => getColorFromString(user.id))
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const userInfo = useMemo(() => {
    return {
      id: user.id,
      name: user.displayName,
      color: color,
      icon: user.icon != null ? buildIconUrl(user.icon.location) : undefined,
    }
  }, [user, color])

  const [realtime, connState] = useRealtime({
    token: doc.collaborationToken || doc.id,
    id: doc.id,
    userInfo,
  })

  const onRender = useRef(() => {
    if (!initialRenderDone.current && window.location.hash) {
      const ele = document.getElementById(window.location.hash.substr(1))
      if (ele != null) {
        ele.scrollIntoView(true)
      }
      initialRenderDone.current = true
    }
  })

  const [commentState, commentActions] = useCommentManagerState(doc.id)

  const [viewComments, setViewComments] = useState<HighlightRange[]>([])
  const calculatePositions = useCallback(() => {
    if (commentState.mode === 'list_loading' || realtime == null) {
      return
    }

    const comments: HighlightRange[] = []
    for (const thread of commentState.threads) {
      if (thread.selection != null && thread.status.type !== 'outdated') {
        const absoluteAnchor = createAbsolutePositionFromRelativePosition(
          thread.selection.anchor,
          realtime.doc
        )
        const absoluteHead = createAbsolutePositionFromRelativePosition(
          thread.selection.head,
          realtime.doc
        )

        if (
          absoluteAnchor != null &&
          absoluteHead != null &&
          absoluteAnchor.index !== absoluteHead.index
        ) {
          if (thread.status.type === 'open') {
            comments.push({
              id: thread.id,
              start: absoluteAnchor.index,
              end: absoluteHead.index,
              active:
                commentState.mode === 'thread' &&
                thread.id === commentState.thread.id,
            })
          }
        } else if (connState === 'synced') {
          commentActions.threadOutdated(thread)
        }
      }
    }
    setViewComments(comments)
  }, [commentState, realtime, commentActions, connState])

  useEffect(() => {
    calculatePositions()
  }, [calculatePositions])

  const updateContent = useCallback(() => {
    if (realtime == null) {
      return
    }
    setRealtimeContent(realtime.doc.getText('content').toString())
  }, [realtime])

  useEffect(() => {
    updateContent()
  }, [updateContent])

  useEffect(() => {
    if (realtime != null) {
      realtime.doc.on('update', () => {
        calculatePositions()
        updateContent()
      })
      return () =>
        realtime.doc.off('update', () => {
          calculatePositions
          updateContent()
        })
    }
    return undefined
  }, [realtime, calculatePositions, updateContent])

  const commentClick = useCallback(
    (ids: string[]) => {
      if (commentState.mode !== 'list_loading') {
        const idSet = new Set(ids)
        setPreferences({ docContextMode: 'comment' })
        commentActions.setMode({
          mode: 'list',
          filter: (thread) => idSet.has(thread.id),
        })
      }
    },
    [commentState, commentActions, setPreferences]
  )

  useEffect(() => {
    if (connState === 'synced' || connState === 'loaded') {
      setInitialLoadDone(true)
    }
  }, [connState])

  const openDocInfoModal = useCallback(() => {
    openModal(
      <DocInfoModal
        team={team}
        currentDoc={doc}
        contributors={contributors}
        backLinks={backLinks}
      />
    )
  }, [openModal, team, doc, contributors, backLinks])

  if (!initialLoadDone) {
    return (
      <AppLayout>
        <StyledLoadingView>
          <h3>Loading..</h3>
          <span>
            <Spinner />
          </span>
        </StyledLoadingView>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={doc.title}
      navigatorBarRight={
        <>
          <NavigationBarButton onClick={openDocInfoModal}>
            <Icon size={20} path={mdiDotsHorizontal} />
          </NavigationBarButton>
        </>
      }
    >
      <Container>
        <div className='view__wrapper'>
          <div className='view__content'>
            {realtimeContent !== '' ? (
              <CustomizedMarkdownPreviewer
                content={realtimeContent}
                headerLinks={true}
                onRender={onRender.current}
                className='scroller'
                scrollerRef={previewRef}
                comments={viewComments}
                commentClick={commentClick}
              />
            ) : (
              <>
                <StyledPlaceholderContent>
                  The document is empty
                </StyledPlaceholderContent>
              </>
            )}
          </div>
        </div>
      </Container>
    </AppLayout>
  )
}

const StyledLoadingView = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  & span {
    width: 100%;
    height: 38px;
    position: relative;
  }
`

const StyledPlaceholderContent = styled.div`
  color: ${({ theme }) => theme.colors.text.subtle};
`

const Container = styled.div`
  margin: 0;
  padding: 0;
  padding-top: ${rightSideTopBarHeight}px;
  min-height: calc(100vh - ${rightSideTopBarHeight}px);
  height: auto;
  display: flex;

  .cm-link {
    text-decoration: none;
  }

  .view__wrapper {
    display: flex;
    justify-content: center;
    flex-grow: 1;
    position: relative;
    top: 0;
    bottom: 0px;
    width: 100%;
    height: auto;
    min-height: calc(
      100vh - ${rightSideTopBarHeight}px -
        ${({ theme }) => theme.sizes.spaces.xl}px
    );
    font-size: 15px;
    ${rightSidePageLayout}
    margin: auto;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xl}px;
  }

  .view__content {
    height: 100%;
    width: 50%;
    padding-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin: 0 auto;
    width: 100%;

    & .inline-comment.active,
    .inline-comment.hv-active {
      background-color: rgba(112, 84, 0, 0.8);
    }
  }
`

export default ViewPage
