import { formatDate } from '@/utils/formatTime'

export interface PrintField {
  label: string
  value: any
}

const formatPrintValue = (value: any) => {
  if (value === undefined || value === null || value === '') {
    return '-'
  }
  if (value instanceof Date) {
    return formatDate(value, 'YYYY-MM-DD HH:mm:ss')
  }
  return String(value)
}

export const printRecord = (title: string, fields: PrintField[]) => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) {
    return false
  }
  const rows = fields
    .map(
      (field) => `
        <tr>
          <th>${field.label}</th>
          <td>${formatPrintValue(field.value)}</td>
        </tr>
      `
    )
    .join('')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; padding: 24px; color: #1f2937; }
          h1 { margin: 0 0 20px; font-size: 24px; text-align: center; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #dcdfe6; padding: 10px 12px; font-size: 14px; vertical-align: top; }
          th { width: 180px; background: #f8fafc; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>${rows}</table>
      </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }, 200)
  return true
}
