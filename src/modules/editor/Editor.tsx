import Bugsnag from '@bugsnag/js'
import EditorJS from '@editorjs/editorjs'
import { useEffect, useState } from 'react'

const Editor = ({ data, editorRef, onChange = null, readOnly = false }) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!editorRef?.current) {
      const newEditor = new EditorJS({
        holder: 'editorJS',
        onReady: () => {
          editorRef.current = newEditor
          setIsReady(true)
        },
      })
    }

    return () => {
      if (editorRef?.current?.destroy) {
        editorRef.current.isReady
          .then(() => {
            editorRef.current.destroy()
            editorRef.current = null
          })
          .catch((e: any) => {
            Bugsnag.notify(e)
          })
      }
    }
  }, [editorRef])

  useEffect(() => {
    if (editorRef?.current?.isReady && isReady) {
      editorRef.current.isReady
        .then(() => {
          editorRef.current.render(data)
          editorRef.current.readOnly.toggle(readOnly)
          editorRef.current.on(editorRef.current, 'change', onChange)
        })
        .catch(e => {
          Bugsnag.notify(e)
        })
    }
  }, [data, readOnly, onChange, isReady, editorRef])

  return <div className="h-full w-full text-white" id="editorJS" />
}

export default Editor
