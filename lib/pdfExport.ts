import jsPDF from 'jspdf'
import {
  Quiz,
  AnyQuizItem,
  SirDongStyleItem,
  MultipleChoiceItem,
  IdentificationItem,
  FillInBlankItem,
} from './types'

export async function generatePDF(
  quiz: Quiz,
  includeAnswerKey: boolean = false
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add text with word wrapping
  function addWrappedText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10
  ) {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return y + lines.length * (fontSize / 3)
  }

  // Add title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  yPosition = addWrappedText(quiz.title, margin, yPosition, contentWidth, 20) + 5

  // Add date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString()
  yPosition = addWrappedText(`Generated: ${dateStr}`, margin, yPosition, contentWidth, 10) + 5

  // Add horizontal line
  doc.setDrawColor(100, 100, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  // Group items by type
  const itemsByType = new Map<string, AnyQuizItem[]>()
  quiz.items.forEach((item) => {
    if (!itemsByType.has(item.type)) {
      itemsByType.set(item.type, [])
    }
    itemsByType.get(item.type)!.push(item)
  })

  // Helper to check if we need a new page
  function checkPageBreak(spaceNeeded: number) {
    if (yPosition + spaceNeeded > pageHeight - 10) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Render items by type
  itemsByType.forEach((items, type) => {
    checkPageBreak(15)

    // Type header
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 100, 200)
    yPosition = addWrappedText(formatQuizTypeName(type), margin, yPosition, contentWidth, 14) + 3
    doc.setTextColor(0, 0, 0)

    // Items
    items.forEach((item) => {
      checkPageBreak(20)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      yPosition = addWrappedText(
        `${item.number}. `,
        margin,
        yPosition,
        contentWidth,
        10
      )

      if (type === 'sir-dong-style') {
        const sItem = item as SirDongStyleItem
        doc.setFont('helvetica', 'normal')
        yPosition = addWrappedText(`Statement 1: ${sItem.statement1}`, margin + 5, yPosition, contentWidth - 5, 9)
        yPosition += 2
        yPosition = addWrappedText(`Statement 2: ${sItem.statement2}`, margin + 5, yPosition, contentWidth - 5, 9)
        yPosition += 3

        doc.setFont('helvetica', 'normal')
        sItem.choices.forEach((choice, i) => {
          const letters = ['A', 'B', 'C', 'D']
          yPosition = addWrappedText(
            `${letters[i]}: ${choice.replace(/^[A-D]:\s*/, '')}`,
            margin + 10,
            yPosition,
            contentWidth - 10,
            9
          )
        })
      } else if (type === 'multiple-choice') {
        const mItem = item as MultipleChoiceItem
        doc.setFont('helvetica', 'normal')
        yPosition = addWrappedText(mItem.question, margin + 5, yPosition, contentWidth - 5, 9)
        yPosition += 2

        mItem.choices.forEach((choice, i) => {
          const letters = ['A', 'B', 'C', 'D']
          yPosition = addWrappedText(
            `${letters[i]}: ${choice.replace(/^[A-D]:\s*/, '')}`,
            margin + 10,
            yPosition,
            contentWidth - 10,
            9
          )
        })
      } else if (type === 'identification') {
        const iItem = item as IdentificationItem
        doc.setFont('helvetica', 'normal')
        yPosition = addWrappedText(iItem.question, margin + 5, yPosition, contentWidth - 5, 9)
      } else if (type === 'fill-in-blank') {
        const fItem = item as FillInBlankItem
        doc.setFont('helvetica', 'normal')
        yPosition = addWrappedText(fItem.sentence, margin + 5, yPosition, contentWidth - 5, 9)
      }

      yPosition += 5
    })

    yPosition += 3
  })

  // Add answer key if requested
  if (includeAnswerKey) {
    checkPageBreak(20)
    doc.addPage()
    yPosition = margin

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 100, 200)
    yPosition = addWrappedText('Answer Key', margin, yPosition, contentWidth, 16) + 5
    doc.setTextColor(0, 0, 0)

    itemsByType.forEach((items, type) => {
      checkPageBreak(10)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 100, 200)
      yPosition = addWrappedText(formatQuizTypeName(type), margin, yPosition, contentWidth, 12) + 3
      doc.setTextColor(0, 0, 0)

      items.forEach((item) => {
        checkPageBreak(8)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        if (type === 'sir-dong-style' || type === 'multiple-choice') {
          const answer = (item as SirDongStyleItem | MultipleChoiceItem).correctAnswer
          yPosition = addWrappedText(
            `${item.number}. ${answer}`,
            margin + 5,
            yPosition,
            contentWidth - 5,
            10
          )
        } else if (type === 'identification' || type === 'fill-in-blank') {
          const answer = (item as IdentificationItem | FillInBlankItem).correctAnswer
          yPosition = addWrappedText(
            `${item.number}. ${answer}`,
            margin + 5,
            yPosition,
            contentWidth - 5,
            10
          )
        }

        yPosition += 2
      })

      yPosition += 3
    })
  }

  // Save the PDF
  const filename = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

function formatQuizTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    'sir-dong-style': 'Sir Dong Style',
    'multiple-choice': 'Multiple Choice',
    identification: 'Identification',
    'fill-in-blank': 'Fill in the Blank',
  }
  return typeNames[type] || type
}
