import Image from 'next/image'

interface SiteBrandProps {
  size?: 'default' | 'compact'
}

const logoSrc = '/c6ed42b8-8a65-49d8-b93a-7e8daef81e3f.png'

export function SiteBrand({ size = 'default' }: SiteBrandProps) {
  const isCompact = size === 'compact'
  const imageSize = isCompact ? 48 : 56

  return (
    <div className="flex items-center gap-3">
      <Image
        src={logoSrc}
        alt="PahiraQuiz logo"
        width={imageSize}
        height={imageSize}
        className="rounded-xl border border-border/80 bg-white object-cover shadow-sm"
        priority
      />
      <div>
        <p className={`${isCompact ? 'text-2xl' : 'text-2xl'} font-semibold tracking-tight`}>
          PahiraQuiz
        </p>
        <p className="text-sm text-muted-foreground">
          Gusto mo ba pahirapan (matuto) students mo?
        </p>
      </div>
    </div>
  )
}
