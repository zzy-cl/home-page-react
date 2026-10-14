import './index.css'

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large' | number
  color?: string
}

const sizeMap = { small: 16, medium: 24, large: 32 }

const rings = [
  { opacity: 0.9, duration: 1, size: 1 },
  { opacity: 0.6, duration: 0.8, size: 0.75 },
  { opacity: 0.3, duration: 0.6, size: 0.5 },
]

export default function Spinner({ size = 'medium', color = '#fff' }: SpinnerProps) {
  const actualSize = typeof size === 'string' ? sizeMap[size] : size

  return (
    <div
      className="spinner-wrapper"
      style={{ width: `${actualSize}px`, height: `${actualSize}px` }}
    >
      {rings.map((ring, index) => {
        const ringSize = actualSize * ring.size
        const offset = (actualSize - ringSize) / 2
        return (
          <div
            key={index}
            className={index === 1 ? 'spinner-ring reverse' : 'spinner-ring'}
            style={{
              width: `${ringSize}px`,
              height: `${ringSize}px`,
              top: `${offset}px`,
              left: `${offset}px`,
              borderTopColor: color,
              borderWidth: `${Math.max(2, actualSize / 12)}px`,
              animationDuration: `${ring.duration}s`,
              opacity: ring.opacity,
            }}
          />
        )
      })}
    </div>
  )
}
