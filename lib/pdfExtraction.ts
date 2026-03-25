// Extract text from PDF and TXT files

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return extractFromText(file)
  } else if (file.type === 'application/pdf') {
    return extractFromPDF(file)
  } else {
    throw new Error('Unsupported file type. Please use PDF or TXT files.')
  }
}

async function extractFromText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      resolve(text)
    }
    reader.onerror = () => reject(new Error('Failed to read text file'))
    reader.readAsText(file)
  })
}

async function extractFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import of pdfjs-dist
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf')
    
    // Set worker source
    const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.entry')
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise

    let fullText = ''

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF. Please ensure it contains readable text.')
  }
}
