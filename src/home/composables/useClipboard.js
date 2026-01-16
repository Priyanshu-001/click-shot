import { formatDuration } from "../../utils/formatter"

export default function useClipboard() {

  const buildNoteContent = (note) => {
    const title = note?.video?.title ?? ''
    const videoLink = note?.video?.url
    const timestampLink = note?.timestampUrl
    debugger;
    const description = note?.description ?? ''
    const time = note?.currentTime
    const dataUrl = note?.dataUrl

    const plainText = `
${title}

Time: ${formatDuration(time)}
Timestamp: ${timestampLink}
Video: ${videoLink}

${description}
`.trim()

    const htmlText = `
<b>${title}</b><br/>
<b>Time:</b> ${formatDuration(time)}<br/>
${timestampLink ? `<b>Timestamp:</b> <a href="${timestampLink}">${formatDuration(time)}</a><br/>` : ''}
${videoLink ? `<b>Video:</b> <a href="${videoLink}">Open video</a><br/><br/>` : ''}
${dataUrl ? `<img src="${dataUrl}" style="max-width:100%;"/><br/><br/>` : ''}
${description?.replace(/\n/g, '<br/>')}
`.trim()

    return { plainText, htmlText }
  }

  const copyNotesBulkCore = async (notes = []) => {
    const parts = notes.map(buildNoteContent)

    const plainText = parts
      .map(p => p.plainText)
      .join('\n\n--------------------\n\n')

    const htmlText = parts
      .map(p => p.htmlText)
      .join('<hr style="margin:16px 0;" />')

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([htmlText], { type: 'text/html' })
      })
    ])
  }

  const copyNote = async (note) => {
    try {
      await copyNotesBulkCore([note])
      return true
    } catch {
      return false
    }
  }

  const copyNotesBulk = async (notes) => {
    try {
      if (!notes?.length) return false
      await copyNotesBulkCore(notes)
      return true
    } catch {
      return false
    }
  }

  return { copyNote, copyNotesBulk }
}
